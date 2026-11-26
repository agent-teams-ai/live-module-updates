import assert from "node:assert/strict";
import { createScope, type Resources } from "@get-modular/resources";
import { createResourcesPreparation } from "../../../src/features/update-operation/adapters/resources.ts";
import { createUpdateRuntime, type UpdateRuntimeOptions } from "../../../src/features/update-operation/composition/create-update-runtime.ts";
import type { CandidateDescription, PublicationRequest, PublicationResult, ReceiptLookup, UpdateHandle, UpdateRequest } from "../../../src/features/update-operation/application/models.ts";
import type { ModuleEntry } from "../../../src/features/update-operation/application/ports/invocation.ts";
import type { PreparedGeneration, PreparationContext } from "../../../src/features/update-operation/application/ports/preparation.ts";
import { createOperationAuthority } from "./operation-authority.ts";

export type RecoveryArgs = readonly [{ readonly held: Promise<void>; readonly nested?: boolean }?];

export function description(generationId: string): CandidateDescription {
  return { generationId, closureId: `owned:${generationId}`, contract: { id: "document", revision: "1" }, profile: "cooperative-operation-v1" };
}

export function updateRequest(generationId: string, attemptId = `update:${generationId}`): UpdateRequest {
  return { attemptId, candidate: description(generationId) };
}

export interface RecoveryOptions {
  readonly domainId?: string;
  readonly failCleanup?: ReadonlySet<string>;
  readonly cleanupGates?: ReadonlyMap<string, Promise<void>>;
  readonly limits?: Partial<UpdateRuntimeOptions<RecoveryArgs, string>["limits"]>;
  readonly compatibility?: UpdateRuntimeOptions<RecoveryArgs, string>["compatibility"];
  readonly prepare?: (context: PreparationContext, resources: Resources, normal: () => Promise<PreparedGeneration<RecoveryArgs, string>>) => PreparedGeneration<RecoveryArgs, string> | PromiseLike<PreparedGeneration<RecoveryArgs, string>>;
  readonly publish?: (request: PublicationRequest, commit: () => PublicationResult) => PublicationResult | PromiseLike<PublicationResult>;
  readonly lookup?: (request: PublicationRequest, original: () => ReceiptLookup | PromiseLike<ReceiptLookup>) => ReceiptLookup | PromiseLike<ReceiptLookup>;
}

export async function recoveryHost(options: RecoveryOptions = {}) {
  const domainId = options.domainId ?? "document";
  const state = createOperationAuthority(domainId);
  const present = new Set<string>();
  const cleanupCalls = new Map<string, number>();
  const evaluations: string[] = [];
  async function acquire(resources: Resources, generationId: string): Promise<void> {
    await resources.setup({
      name: generationId,
      setup: () => { present.add(generationId); return generationId; },
      async cleanup(exact) {
        const count = (cleanupCalls.get(exact) ?? 0) + 1;
        cleanupCalls.set(exact, count);
        if (options.failCleanup?.has(exact) === true && count === 1) { throw new Error(`Native cleanup failed:${exact}`); }
        const gate = options.cleanupGates?.get(exact);
        if (gate) { await gate; }
        present.delete(exact);
      },
    });
  }
  function entry(generationId: string): ModuleEntry<RecoveryArgs, string> {
    return async (context, command) => {
      assert.ok(present.has(generationId), `Missing admitted native resource:${generationId}`);
      if (command) {
        await command.held;
        assert.ok(present.has(generationId), `Premature native reclamation:${generationId}`);
        if (command.nested === true) {
          const nested = await context.invoke();
          assert.equal(nested.status, "returned");
          assert.equal(nested.generationId, generationId);
        }
      }
      return generationId;
    };
  }
  const initialScope = createScope({ name: `initial:${domainId}` });
  await acquire(initialScope.resources, "A");
  const initial = {
    candidate: description("A"), scope: initialScope, invoke: entry("A"),
    release() { return this.scope.control.close(); },
  };
  let transferred = false;
  try {
    const runtime = createUpdateRuntime<RecoveryArgs, string>({
      domainId, initial,
      authority: {
        read: state.read,
        publish: request => options.publish ? options.publish(request, () => state.publish(request)) : state.publish(request),
        lookup: request => options.lookup ? options.lookup(request, () => state.authority.lookup(request)) : state.authority.lookup(request),
      },
      compatibility: options.compatibility ?? { check: () => ({ status: "compatible" }) },
      preparation: createResourcesPreparation<RecoveryArgs, string>((context, resources) => {
        const generationId = context.request.candidate.generationId;
        evaluations.push(generationId);
        const normal = async () => { await acquire(resources, generationId); return { invoke: entry(generationId) }; };
        return options.prepare ? options.prepare(context, resources, normal) : normal();
      }),
      limits: { maxAttempts: 32, maxCandidates: 2, maxRetainedPredecessors: 2, maxActiveWork: 16, ...options.limits },
      adoption: { args: [], accept: value => present.has(value) },
    });
    transferred = true;
    return {
      runtime, state, present, cleanupCalls, evaluations,
      start(generationId: string, attemptId?: string): UpdateHandle {
        const result = runtime.startUpdate(updateRequest(generationId, attemptId));
        assert.equal(result.status, "started");
        return result.handle;
      },
    };
  } finally { if (!transferred) { await initialScope.control.close(); } }
}
