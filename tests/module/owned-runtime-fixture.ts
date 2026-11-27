import assert from "node:assert/strict";
import { closeSync, fstatSync, mkdtempSync, openSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assemblyFor, declareModule, defineContract, group, implement, type CapabilitiesOf } from "@get-modular/assembly";
import { required } from "@get-modular/core";
import { createScope, scoped, type CloseReport, type Resources, type Scope } from "@get-modular/resources";
import {
  createUpdateRuntime, type CloseSnapshot, type InvocationOutcome, type PreparationCustody,
  type PreparationPort, type UpdateAuthority, type UpdateHandle, type UpdateRuntime,
} from "../../src/index.ts";
import { createResourcesPreparation } from "../../src/resources.ts";
import { candidate, createBarriers, type Command, type GenerationEnvironment, type Reply } from "./host-contract.ts";
import { createNodeAuthority } from "./native-node-authority.ts";
import { prepareGeneration } from "./generation-composition.ts";

type Runtime = UpdateRuntime<readonly [Command], Reply>;
type Custody = PreparationCustody<readonly [Command], Reply>;
interface DocumentInvocation { readonly invoke: (command: Command) => Promise<InvocationOutcome<Reply>> }
const Invocation = defineContract<DocumentInvocation>()({ id: "qualification/owned-runtime/invocation", revision: 1 });
const Consumer = defineContract<DocumentInvocation>()({ id: "qualification/owned-runtime/consumer", revision: 1 });
interface OwnerCapabilities extends CapabilitiesOf<typeof Invocation> {}
interface ConsumerCapabilities extends CapabilitiesOf<typeof Invocation | typeof Consumer> {}

interface NativeLease {
  readonly descriptor: number;
  readonly signal: AbortSignal;
  active: boolean;
  releases: number;
  cleanupCalls: number;
}
interface OwnerCell { initial?: Custody | undefined; runtime?: Runtime; failure?: { readonly cause: unknown } }
export interface OwnedRuntimeOptions {
  readonly domain: string;
  readonly constructorRefusal?: boolean;
  readonly dependentFailure?: boolean;
  readonly initialBarrier?: string;
  readonly publicationBarrier?: string;
  /** Deliberately wrong native topology; a discriminator, never an offered integration. */
  readonly unsafeParentGenerations?: boolean;
}

function nativeOwners(options: OwnedRuntimeOptions, parent: Scope, barriers: ReturnType<typeof createBarriers>) {
  const directory = mkdtempSync(join(tmpdir(), "lmu-owned-runtime-"));
  const borrowed = createScope({ name: "borrowed-infrastructure" });
  const descriptor = openSync(join(directory, "authority"), "wx+");
  let borrowedActive = true;
  borrowed.resources.use({ [Symbol.dispose]: () => { closeSync(descriptor); borrowedActive = false; } }, "authority-fd");
  const authority = createNodeAuthority(options.domain);
  const leases = new Map<string, NativeLease>();
  const preparationGates = new Map<string, string>();
  const cleanupGates = new Map<string, string>();
  const cleanupFailures = new Set<string>();
  if (options.initialBarrier !== undefined) { preparationGates.set("A", options.initialBarrier); }
  const publicationObserved = Promise.withResolvers<void>();
  let lookups = 0;
  let lookupGate: string | undefined;
  function useBorrowed(): void { assert.ok(borrowedActive); fstatSync(descriptor); }
  const publicationAuthority: UpdateAuthority = {
    read: () => { useBorrowed(); return authority.read(); },
    publish: request => {
      useBorrowed();
      try { return authority.publish(request); }
      finally { publicationObserved.resolve(); }
    },
    lookup: request => {
      useBorrowed(); lookups += 1;
      if (lookupGate !== undefined) {
        return barriers.wait(lookupGate).then(() => { useBorrowed(); return authority.lookup(request); });
      }
      return authority.lookup(request);
    },
  };
  async function prepare(generation: string, resources: Resources) {
    const lease = await resources.setup({ name: "generation-fd/" + generation,
      setup: () => {
        const value: NativeLease = { descriptor: openSync(join(directory, generation), "wx+"),
          signal: resources.signal, active: true, releases: 0, cleanupCalls: 0 };
        leases.set(generation, value); return value;
      },
      cleanup: async value => {
        value.cleanupCalls += 1;
        const cleanupGate = cleanupGates.get(generation);
        if (cleanupGate !== undefined) { await barriers.wait(cleanupGate); }
        if (cleanupFailures.has(generation)) { throw new Error("actual owned FD cleanup debt: " + generation); }
        closeSync(value.descriptor); value.active = false; value.releases += 1;
      },
    });
    const preparationGate = preparationGates.get(generation);
    if (preparationGate !== undefined) { await barriers.wait(preparationGate); }
    const environment: GenerationEnvironment = {
      generation: () => generation, read: authority.document,
      write: (expected, text) => authority.write(generation, expected, text), wait: barriers.wait,
      use: () => { useBorrowed(); resources.signal.throwIfAborted(); fstatSync(lease.descriptor); assert.ok(lease.active); },
    };
    return prepareGeneration(resources, environment);
  }
  const detached = createResourcesPreparation<readonly [Command], Reply>((context, resources) => prepare(context.request.candidate.generationId, resources));
  const preparation: PreparationPort<readonly [Command], Reply> = options.unsafeParentGenerations === true ? {
    open: context => {
      const scope = parent.resources.child({ name: "deliberately-premature-generation" });
      return { prepare: () => prepare(context.request.candidate.generationId, scope.resources), close: () => scope.control.close() };
    },
  } : detached;
  function nativeLease(generation: string): NativeLease {
    const value = leases.get(generation);
    assert.ok(value, "generation was never acquired: " + generation);
    return value;
  }
  return {
    authority, publicationAuthority, preparation, publicationObserved: publicationObserved.promise,
    lookups: () => lookups, useBorrowed, lease: nativeLease,
    lookupAfter: (barrier: string) => { lookupGate = barrier; },
    prepareAfter: (generation: string, barrier: string) => { preparationGates.set(generation, barrier); },
    cleanupAfter: (generation: string, barrier: string) => { cleanupGates.set(generation, barrier); },
    failCleanup: (generation: string, enabled: boolean) => {
      if (enabled) { cleanupFailures.add(generation); } else { cleanupFailures.delete(generation); }
    },
    clearFailures: () => { cleanupFailures.clear(); },
    dispose: async () => {
      try {
        assert.ok([...leases.values()].every(value => !value.active), "fixture teardown found an unreleased native generation");
        useBorrowed();
        assert.equal((await borrowed.control.close()).complete, true);
      } finally {
        for (const value of leases.values()) { if (value.active) { closeSync(value.descriptor); value.active = false; } }
        await borrowed.control.close(); authority.dispose(); rmSync(directory, { recursive: true, force: true });
      }
    },
  };
}

/** This is only a native setup/transfer cell, not a second generation manager. */
async function closeCell(cell: OwnerCell): Promise<void> {
  const report = cell.runtime ? await cell.runtime.close() : await cell.initial?.close();
  if (report && !report.complete) { throw new Error("c2.original-owner-close-incomplete", { cause: report }); }
}

async function constructCell(resources: Resources, cell: OwnerCell, native: ReturnType<typeof nativeOwners>,
  options: OwnedRuntimeOptions, barriers: ReturnType<typeof createBarriers>): Promise<DocumentInvocation> {
  // Resources records the pending setup before any initial evaluation. Even
  // construction refusal returns its owned cell to native cleanup before GM fails.
  const built = await resources.setup({ name: "owned-lmu-runtime", setup: async () => {
    try {
      const context = { domainId: options.domain, request: { attemptId: "initial", candidate: candidate("A") },
        baseline: native.publicationAuthority.read() };
      const initial = native.preparation.open(context);
      cell.initial = initial;
      const prepared = await initial.prepare();
      resources.signal.throwIfAborted();
      const runtime = createUpdateRuntime<readonly [Command], Reply>({
        domainId: options.domain, authority: native.publicationAuthority,
        initial: { candidate: candidate(options.constructorRefusal === true ? "different-initial" : "A"), invoke: prepared.invoke, release: initial.close },
        preparation: native.preparation, compatibility: { check: () => ({ status: "compatible" }) },
        limits: { maxActiveWork: 16, maxAttempts: 32, maxCandidates: 2, maxRetainedPredecessors: 2 },
      });
      // Successful constructor return is the sole transfer point; no await intervenes.
      cell.runtime = runtime; cell.initial = undefined;
      if (options.publicationBarrier !== undefined) { await barriers.wait(options.publicationBarrier); }
    } catch (cause) { cell.failure = { cause }; }
    return cell;
  }, cleanup: closeCell });
  if (built.failure) { throw built.failure.cause; }
  assert.ok(built.runtime);
  return Object.freeze({ invoke: built.runtime.invoke });
}

function composition(acquire: (resources: Resources) => Promise<DocumentInvocation>, dependentFailure: boolean) {
  const ownerDeclaration = declareModule({ moduleId: "qualification/owned-runtime", implementationId: "qualification/owned-runtime/default",
    owner: { authority: "qualification", path: ["owned-runtime"] }, provides: [Invocation.provide()], slots: [] });
  const owner = implement<OwnerCapabilities>()(ownerDeclaration, scoped("owned-runtime", async (_dependencies, { resources }) => {
    const value = await acquire(resources);
    return { instance: value, capabilities: { "qualification/owned-runtime/invocation": value } };
  }));
  const consumerDeclaration = declareModule({ moduleId: "qualification/owned-consumer", implementationId: "qualification/owned-consumer/default",
    owner: { authority: "qualification", path: ["owned-consumer"] }, provides: [Consumer.provide()],
    slots: [Invocation.slot("document", required())] });
  const consumer = implement<ConsumerCapabilities>()(consumerDeclaration, async dependencies => {
    if (dependentFailure) { throw new Error("actual dependent GM factory failure"); }
    const value = Object.freeze<DocumentInvocation>({ invoke: command => dependencies.document.invoke(command) });
    return { instance: value, capabilities: { "qualification/owned-runtime/consumer": value } };
  });
  return { profileId: "qualification/owned-runtime", modules: [group("owned-runtime", [owner]), group("consumer", [consumer])] as const,
    roots: { consumer } };
}

export function createOwnedRuntimeFixture(options: OwnedRuntimeOptions) {
  const parent = createScope({ name: "outer-gm-host" });
  const constructionCancellation = new AbortController();
  const barriers = createBarriers();
  const native = nativeOwners(options, parent, barriers);
  const cell: OwnerCell = {};
  const attempts: UpdateHandle[] = [];
  const abortInvocation = Promise.withResolvers<InvocationOutcome<Reply> | undefined>();
  let root: DocumentInvocation | undefined;
  let originalRuntimeClose: Promise<CloseSnapshot> | undefined;
  // Intentionally registered BEFORE constructing the owner module.
  parent.resources.signal.addEventListener("abort", () => { abortInvocation.resolve(root?.invoke({ kind: "view" })); }, { once: true });
  const composed = composition(resources => constructCell(resources, cell, native, options, barriers), options.dependentFailure ?? false);
  async function construct() {
    const prepared = await assemblyFor<ConsumerCapabilities>().prepare(composed);
    if (prepared.status !== "prepared") { throw new Error("outer GM preparation failed", { cause: prepared }); }
    const result = await prepared.prepared.run({ scope: parent.resources, signal: constructionCancellation.signal });
    if (result.status === "succeeded") { root = result.roots.consumer; }
    return result;
  }
  let constructing: ReturnType<typeof construct> | undefined;
  function sealRuntime(): void { if (cell.runtime) { originalRuntimeClose ??= cell.runtime.close(); } }
  function closeParent(unsafeAbortFirst = false): Promise<CloseReport> {
    if (!unsafeAbortFirst) { sealRuntime(); }
    const closing = parent.control.close();
    if (unsafeAbortFirst) { sealRuntime(); }
    return closing;
  }
  function runtime(): Runtime { assert.ok(cell.runtime, "no runtime ownership transfer occurred"); return cell.runtime; }
  return {
    ...native, entered: barriers.entered, resume: barriers.resume, abortInvocation: abortInvocation.promise,
    construct: () => { constructing ??= construct(); return constructing; }, runtime,
    transferred: () => cell.runtime !== undefined,
    hasPublishedRoot: () => root !== undefined,
    invoke: (command: Command) => { assert.ok(root, "no successful GM root exists"); return root.invoke(command); },
    closeParent, originalRuntimeClose: () => originalRuntimeClose,
    cancelConstruction: () => { sealRuntime(); constructionCancellation.abort(new Error("actual GM run cancellation")); },
    start: (generation: string) => {
      const started = runtime().startUpdate({ attemptId: "attempt/" + generation, candidate: candidate(generation) });
      assert.notEqual(started.status, "refused");
      if (started.status === "refused") { throw new Error(started.reason); }
      attempts.push(started.handle); return started.handle;
    },
    dispose: async () => {
      barriers.releaseAll(); native.clearFailures(); native.authority.finishPending();
      await constructing;
      for (const attempt of attempts) { await attempt.reconcile(); await attempt.retryCleanup(); }
      sealRuntime(); await originalRuntimeClose; await cell.runtime?.retryCleanup();
      // A diagnostic may deliberately retain the parent's original logical debt.
      // This reset does not claim that debt was discharged; native FDs are checked independently.
      await parent.control.close(); await native.dispose();
    },
  };
}

export type OwnedRuntimeFixture = ReturnType<typeof createOwnedRuntimeFixture>;
