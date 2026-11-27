import assert from "node:assert/strict";
import { setImmediate as turn } from "node:timers/promises";
import test from "node:test";
import { createScope, type Resources } from "@get-modular/resources";
import { createResourcesPreparation } from "../../../src/features/update-operation/adapters/resources.ts";
import {
  createUpdateRuntime, type UpdateRuntime, type UpdateRuntimeOptions,
} from "../../../src/features/update-operation/composition/create-update-runtime.ts";
import type {
  CandidateDescription, PublicationRequest, PublicationResult, UpdateHandle, UpdateRequest,
} from "../../../src/features/update-operation/application/models.ts";
import type { ModuleEntry } from "../../../src/features/update-operation/application/ports/invocation.ts";
import type { PreparedGeneration, PreparationContext } from "../../../src/features/update-operation/application/ports/preparation.ts";
import { createOperationAuthority } from "./operation-authority.ts";

type Command = { readonly kind: "read" }
  | { readonly kind: "held"; readonly release: Promise<void>; readonly write?: string }
  | { readonly kind: "write"; readonly revision: number; readonly text: string };
type Args = readonly [Command];
interface Result {
  readonly generationId: string;
  readonly text: string;
  readonly revision: number;
  readonly nestedGeneration?: string;
  readonly effect?: string;
}

function candidate(generationId: string): CandidateDescription {
  return { generationId, closureId: `closure:${generationId}`, contract: { id: "document", revision: "1" }, profile: "cooperative-operation-v1" };
}

function request(generationId: string, attemptId = `to-${generationId}`): UpdateRequest {
  return { attemptId, candidate: candidate(generationId) };
}

function started(runtime: UpdateRuntime<Args, Result>, input: UpdateRequest): UpdateHandle {
  const result = runtime.startUpdate(input);
  assert.equal(result.status, "started");
  return result.handle;
}

interface FixtureOptions {
  readonly domainId?: string;
  readonly failCleanup?: ReadonlySet<string>;
  readonly heldCleanup?: ReadonlyMap<string, Promise<void>>;
  readonly limits?: Partial<UpdateRuntimeOptions<Args, Result>["limits"]>;
  readonly prepare?: (
    context: PreparationContext,
    resources: Resources,
    normal: () => Promise<PreparedGeneration<Args, Result>>,
  ) => PreparedGeneration<Args, Result> | PromiseLike<PreparedGeneration<Args, Result>>;
  readonly publish?: (request: PublicationRequest, commit: () => PublicationResult) => PublicationResult | PromiseLike<PublicationResult>;
  readonly compatibility?: UpdateRuntimeOptions<Args, Result>["compatibility"];
}

async function fixture(options: FixtureOptions = {}) {
  const state = createOperationAuthority(options.domainId);
  const registrations = new Map<string, object>();
  const released: string[] = [];
  const cleanupCalls = new Map<string, number>();
  const prepared: string[] = [];
  const initial = createScope({ name: "initial-A" });
  async function own(resources: Resources, generationId: string): Promise<void> {
    await resources.setup({
      name: `registration:${generationId}`,
      setup: () => {
        const exact = { generationId };
        registrations.set(generationId, exact);
        registrations.set("shared-name", exact);
        return exact;
      },
      async cleanup(exact) {
        const count = (cleanupCalls.get(generationId) ?? 0) + 1;
        cleanupCalls.set(generationId, count);
        if (options.failCleanup?.has(generationId) === true && count === 1) {throw new Error(`native cleanup debt:${generationId}`);}
        const held = options.heldCleanup?.get(generationId);
        if (held) {await held;}
        registrations.delete(generationId);
        if (registrations.get("shared-name") === exact) {registrations.delete("shared-name");}
        released.push(generationId);
      },
    });
  }
  function entry(generationId: string): ModuleEntry<Args, Result> {
    return async (context, command) => {
      assert.equal(context.generationId, generationId);
      if (!registrations.has(generationId)) {throw new Error(`Provider resource was reclaimed:${generationId}`);}
      if (command.kind === "held") {
        await command.release;
        assert.ok(registrations.has(generationId), `Held ${generationId} lost its native resource`);
        const nested = await context.invoke({ kind: "read" });
        assert.equal(nested.status, "returned");
        const effect = command.write === undefined ? undefined : state.write(generationId, state.document().revision, command.write);
        return { generationId, ...state.document(), nestedGeneration: nested.generationId, ...(effect ? { effect } : {}) };
      }
      if (command.kind === "write") {return { generationId, ...state.document(), effect: state.write(generationId, command.revision, command.text) };}
      return { generationId, ...state.document() };
    };
  }
  await own(initial.resources, "A");
  const authority = {
    ...state.authority,
    publish: (publication: PublicationRequest) => options.publish
      ? options.publish(publication, () => state.publish(publication))
      : state.publish(publication),
  };
  let transferred = false;
  try {
    const runtime = createUpdateRuntime<Args, Result>({
      domainId: options.domainId ?? "document",
      authority,
      compatibility: options.compatibility ?? { check: ({ candidate: value }) => value.contract.id === "document" && value.contract.revision === "1"
        ? { status: "compatible" } : { status: "refused", reason: "incompatible-contract" } },
      preparation: createResourcesPreparation<Args, Result>((context, resources) => {
        prepared.push(context.request.candidate.generationId);
        const normal = async () => {
          await own(resources, context.request.candidate.generationId);
          return { invoke: entry(context.request.candidate.generationId) };
        };
        return options.prepare ? options.prepare(context, resources, normal) : normal();
      }),
      initial: { candidate: candidate("A"), invoke: entry("A"), release: () => initial.control.close() },
      limits: { maxAttempts: 32, maxCandidates: 2, maxRetainedPredecessors: 2, maxActiveWork: 16, ...options.limits },
      adoption: { args: [{ kind: "read" }], accept: value => value.text === state.document().text },
    });
    transferred = true;
    return { runtime, state, registrations, released, cleanupCalls, prepared };
  } finally {
    if (!transferred) {await initial.control.close();}
  }
}

await test("complete useful replacement preserves retained nested A and exact native B resources", async () => {
  const held = Promise.withResolvers<void>();
  const host = await fixture();
  try {
    const original = host.runtime.invoke({ kind: "held", release: held.promise, write: "stale A effect" });
    const update = started(host.runtime, request("B"));
    await turn();
    assert.equal(update.inspect().publication.status, "committed");
    assert.equal(update.inspect().adoption.status, "observed");
    assert.equal(update.inspect().settled, false);
    assert.deepEqual(host.released, []);
    const useful = await host.runtime.invoke({ kind: "write", revision: 0, text: "useful B" });
    assert.equal(useful.status, "returned");
    assert.equal(useful.value.effect, "written");
    held.resolve();
    const old = await original;
    assert.equal(old.status, "returned");
    assert.equal(old.generationId, "A");
    assert.equal(old.value.nestedGeneration, "A");
    assert.equal(old.value.effect, "stale-generation");
    const final = await update.completion;
    assert.equal(final.settled, true);
    assert.equal(final.predecessorLifetime?.cleanup.original.status, "settled");
    assert.deepEqual(host.released, ["A"]);
    assert.ok(host.registrations.has("B"));
    assert.deepEqual(host.registrations.get("shared-name"), { generationId: "B" });
    assert.deepEqual(host.state.document(), { revision: 1, text: "useful B" });
  } finally { held.resolve(); assert.equal((await host.runtime.close()).complete, true); }
});

await test("preflight refusal never evaluates or acquires a candidate", async () => {
  const host = await fixture();
  try {
    const update = started(host.runtime, { ...request("B"), candidate: { ...candidate("B"), contract: { id: "other", revision: "1" } } });
    const final = await update.completion;
    assert.deepEqual(final.planning, { status: "refused", reason: "incompatible-contract" });
    assert.equal(final.candidateLifetime, undefined);
    assert.equal(final.unregisteredCleanup, undefined);
    assert.deepEqual(host.prepared, []);
    assert.deepEqual(host.released, []);
    assert.equal((await host.runtime.invoke({ kind: "read" })).status, "returned");
  } finally { await host.runtime.close(); }
});

await test("same attempt binds full candidate and replays the same owner without evaluation", async () => {
  const host = await fixture();
  try {
    const original = request("B", "one-attempt");
    const update = started(host.runtime, original);
    const replay = host.runtime.startUpdate(original);
    assert.equal(replay.status, "replayed");
    assert.equal(replay.handle, update);
    assert.deepEqual(host.runtime.startUpdate({ ...original, candidate: { ...original.candidate, contract: { id: "document", revision: "2" } } }),
      { status: "refused", reason: "attempt-payload-mismatch" });
    await update.completion;
    await host.runtime.close();
    const afterClose = host.runtime.startUpdate(original);
    assert.equal(afterClose.status, "replayed");
    assert.equal(afterClose.handle, update);
    assert.deepEqual(host.prepared, ["B"]);
  } finally { await host.runtime.close(); }
});

await test("failed partial preparation closes the actual native owner and leaves A useful", async () => {
  const host = await fixture({ prepare: async (_context, _resources, normal) => { await normal(); throw new Error("failure after acquisition"); } });
  try {
    const final = await started(host.runtime, request("B")).completion;
    assert.equal(final.preparation.status, "failed");
    assert.equal(final.publication.status, "not-requested");
    assert.equal(final.candidateLifetime?.retained, false);
    assert.deepEqual(host.released, ["B"]);
    assert.equal(host.state.read().head.generationId, "A");
    const current = await host.runtime.invoke({ kind: "read" });
    assert.equal(current.status, "returned");
    assert.equal(current.generationId, "A");
  } finally { await host.runtime.close(); }
});

await test("late native setup stays owned after preparation fails", async () => {
  const release = Promise.withResolvers<void>();
  let acquired = false;
  let cleaned = false;
  const host = await fixture({ prepare: (_context, resources) => {
    const late = resources.setup({
      name: "late acquisition",
      setup: async () => { await release.promise; acquired = true; return "late resource"; },
      cleanup: value => { assert.equal(value, "late resource"); cleaned = true; },
    });
    void late.catch(() => {});
    throw new Error("prepare rejected before setup settled");
  } });
  try {
    const update = started(host.runtime, request("B"));
    await turn();
    assert.equal(update.inspect().settled, false);
    assert.equal(update.inspect().candidateLifetime?.cleanup.original.status, "pending");
    assert.equal(cleaned, false);
    release.resolve();
    const final = await update.completion;
    assert.equal(acquired, true);
    assert.equal(cleaned, true);
    assert.equal(final.candidateLifetime?.retained, false);
  } finally { release.resolve(); await host.runtime.close(); }
});

await test("publication checks a changed owner basis after preparation", async () => {
  const ready = Promise.withResolvers<void>();
  const allow = Promise.withResolvers<void>();
  const host = await fixture({ prepare: async (_context, _resources, normal) => {
    const value = await normal(); ready.resolve(); await allow.promise; return value;
  } });
  try {
    const update = started(host.runtime, request("B"));
    await ready.promise;
    host.state.changeGrant(false);
    host.state.changeGrant(true);
    allow.resolve();
    const final = await update.completion;
    assert.equal(final.publication.status, "rejected");
    assert.equal(final.publication.receipt.reason, "basis-conflict");
    assert.equal(host.state.read().head.generationId, "A");
    assert.deepEqual(host.released, ["B"]);
  } finally { allow.resolve(); await host.runtime.close(); }
});

await test("lost acknowledgement serves B immediately and only the original receipt resolves it", async () => {
  const host = await fixture({ publish: (_request, commit) => { commit(); throw new Error("acknowledgement lost after mutation"); } });
  try {
    const update = started(host.runtime, request("B"));
    await turn();
    assert.equal(update.inspect().publication.status, "unknown");
    assert.equal(update.inspect().settled, false);
    assert.deepEqual(host.released, []);
    const useful = await host.runtime.invoke({ kind: "read" });
    assert.equal(useful.status, "returned");
    assert.equal(useful.generationId, "B");
    await update.reconcile();
    const final = await update.completion;
    assert.equal(final.publication.status, "committed");
    assert.equal(final.adoption.status, "observed");
    assert.deepEqual(host.released, ["A"]);
    assert.deepEqual(host.prepared, ["B"]);
  } finally { await host.runtime.close(); }
});

await test("an unknown lookup does not release a candidate whose original request can still commit", async () => {
  const allow = Promise.withResolvers<void>();
  const sent = Promise.withResolvers<void>();
  const host = await fixture({ publish: async (_request, commit) => { sent.resolve(); await allow.promise; return commit(); } });
  try {
    const update = started(host.runtime, request("B"));
    await sent.promise;
    const early = await update.reconcile();
    assert.equal(early.publication.status, "unknown");
    assert.equal(early.settled, false);
    assert.ok(host.registrations.has("B"));
    assert.deepEqual(host.released, []);
    allow.resolve();
    const final = await update.completion;
    assert.equal(final.publication.status, "committed");
    assert.equal(host.state.read().head.generationId, "B");
  } finally { allow.resolve(); await host.runtime.close(); }
});

await test("an unknown B candidate is retained through B to C until B's own receipt resolves", async () => {
  const host = await fixture({ publish: (value, commit) => {
    const result = commit();
    if (value.candidate.generationId === "B") {throw new Error("lost B acknowledgement");}
    return result;
  } });
  try {
    const b = started(host.runtime, request("B"));
    await turn();
    assert.equal(b.inspect().publication.status, "unknown");
    const c = started(host.runtime, request("C"));
    await turn();
    assert.equal(c.inspect().publication.status, "committed");
    assert.equal(c.inspect().settled, false);
    assert.deepEqual(host.released, []);
    assert.ok(host.registrations.has("B"));
    await b.reconcile();
    const [resultB, resultC] = await Promise.all([b.completion, c.completion]);
    assert.equal(resultB.publication.status, "committed");
    assert.equal(resultB.publication.receipt.head.generationId, "B");
    assert.equal(resultB.adoption.status, "superseded");
    assert.equal(resultC.adoption.status, "observed");
    assert.equal(host.state.read().head.generationId, "C");
    assert.deepEqual(new Set(host.released), new Set(["A", "B"]));
    assert.ok(host.registrations.has("C"));
  } finally { await host.runtime.close(); }
});

await test("original cleanup debt remains immutable after an explicit successful retry", async () => {
  const host = await fixture({ failCleanup: new Set(["A"]) });
  try {
    const update = started(host.runtime, request("B"));
    const original = await update.completion;
    assert.equal(original.publication.status, "committed");
    const originalCleanup = original.predecessorLifetime?.cleanup.original;
    assert.equal(originalCleanup?.status, "settled");
    assert.equal(originalCleanup.report.complete, false);
    assert.ok(host.registrations.has("A"));
    const retried = await update.retryCleanup();
    const latest = retried.predecessorLifetime?.cleanup.latest;
    assert.equal(latest?.status, "settled");
    assert.equal(latest.report.complete, true);
    assert.equal(retried.predecessorLifetime?.retained, false);
    assert.equal(await update.completion, original);
    assert.equal(host.cleanupCalls.get("A"), 2);
    assert.equal(originalCleanup.report.complete, false);
  } finally { await host.runtime.close(); }
});
