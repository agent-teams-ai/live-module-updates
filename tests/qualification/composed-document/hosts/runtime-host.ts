import { assemblyFor, declareModule, entriesOf, group, implement } from "@get-modular/assembly";
import { required } from "@get-modular/core";
import { checkNamespaces, checkWiring } from "@get-modular/conformance";
import { createScope } from "@get-modular/resources";
import type { CleanupReport, CloseSnapshot, InvocationOutcome, ModuleEntry, PreparationCustody, PreparationPort,
  PreparedGeneration, UpdateHandle, UpdateLimits, UpdateRuntime } from "live-module-updates";
import { Invocation, prepareRuntime, runtimeComposition, type DocumentCommand, type DocumentInvocation,
  type DocumentReply, type DocumentRuntimeRecovery, type RuntimeCapabilities } from "@fixture/composed-document";
import { createGenerationOwner } from "./generation-owner.js";
import { requireFact, type ArtifactInputs, type NativeEnvironment } from "./environment.js";

export interface RuntimeOptions {
  readonly artifacts: ArtifactInputs;
  readonly samePlan?: boolean;
  readonly limits?: UpdateLimits;
  readonly unsafeParentFirst?: boolean;
  readonly receiverCustody?: boolean;
  readonly failDependent?: boolean;
}

/** A TEST owner whose original callable needs its receiver and changes during evaluation. */
function receiverSensitive(original: PreparationPort<readonly [DocumentCommand], DocumentReply>): PreparationPort<readonly [DocumentCommand], DocumentReply> {
  interface Prepared {
    readonly original: PreparedGeneration<readonly [DocumentCommand], DocumentReply>;
    readonly invoke: ModuleEntry<readonly [DocumentCommand], DocumentReply>;
  }
  interface Custody {
    readonly native: PreparationCustody<readonly [DocumentCommand], DocumentReply>;
    readonly prepare: () => Promise<Prepared>;
    close: () => Promise<CleanupReport>;
  }
  return { open: context => {
    const owner: Custody = { native: original.open(context),
      async prepare() {
        const prepared = await this.native.prepare();
        this.close = () => Promise.reject(new Error("c.replacement-close-selected"));
        const value: Prepared = { original: prepared, invoke(invocation, command) { return this.original.invoke(invocation, command); } };
        return value;
      },
      close() { return this.native.close(); },
    };
    return owner;
  } };
}

function composition(failDependent: boolean) {
  if (!failDependent) { return { definition: runtimeComposition, prepare: prepareRuntime }; }
  const declaration = declareModule({ moduleId: "reference/failing-client", implementationId: "reference/failing-client/default",
    owner: { authority: "reference", path: ["failing-client"] }, provides: [], slots: [Invocation.slot("document", required())] });
  const failing = implement<RuntimeCapabilities>()(declaration, async dependencies => {
    const proof = await dependencies.document.invoke({ kind: "view" });
    requireFact(proof.status === "returned" && proof.value.kind === "document", "c.failed-root-used-actual-owner");
    throw new Error("deliberate dependent failure after actual A invocation");
  });
  const definition = { ...runtimeComposition, modules: [...runtimeComposition.modules, group("failing-client", [failing])] as const,
    roots: { ...runtimeComposition.roots, failing } };
  return { definition, prepare: () => assemblyFor<RuntimeCapabilities>().prepare(definition) };
}

/** An inert Host owns its parent before any construction or acquisition can fail. */
export function createComposedRuntime(environment: NativeEnvironment, options: RuntimeOptions) {
  const parent = createScope({ name: "composed-document-host" });
  const generations = createGenerationOwner(environment, options.artifacts, options.samePlan);
  let document: DocumentInvocation | undefined;
  let runtime: UpdateRuntime<readonly [DocumentCommand], DocumentReply> | undefined;
  let recovery: DocumentRuntimeRecovery | undefined;
  let originalClose: Promise<CloseSnapshot> | undefined;
  const attempts: UpdateHandle[] = [];
  const abortInvocation = Promise.withResolvers<InvocationOutcome<DocumentReply> | undefined>();
  parent.resources.signal.addEventListener("abort", () => { abortInvocation.resolve(document?.invoke({ kind: "view" })); }, { once: true });
  async function construct(): Promise<void> {
    const selected = composition(options.failDependent === true);
    const declarations = [...entriesOf(selected.definition.modules).map(entry => entry.declaration),
      ...Object.values(selected.definition.inputs).map(entry => entry.declaration)];
    checkNamespaces({ namespace: "reference", declarations });
    const prepared = await selected.prepare();
    requireFact(prepared.status === "prepared", "c.runtime-prepare");
    checkWiring(prepared.composition, [{ providers: {
      "reference/document-runtime/invocation": "reference/document-runtime/default",
      "reference/document-runtime/authority": "reference/document-runtime/authority/host",
      "reference/document-runtime/compatibility": "reference/document-runtime/compatibility/host",
      "reference/document-runtime/preparation": "reference/document-runtime/preparation/host",
      "reference/document-runtime/settings": "reference/document-runtime/settings/host",
    }, roots: ["reference/document-runtime/default", "reference/document-runtime/client/default",
      ...(options.failDependent === true ? ["reference/failing-client/default"] : [])] }], { declarations });
    const built = await prepared.prepared.run({ scope: parent.resources, inputs: {
      authority: { "reference/document-runtime/authority": environment.authority },
      compatibility: { "reference/document-runtime/compatibility": generations.compatibility },
      preparation: { "reference/document-runtime/preparation": options.receiverCustody === true ? receiverSensitive(generations.preparation) : generations.preparation },
      settings: { "reference/document-runtime/settings": { domainId: environment.authority.read().domainId, initialCandidate: generations.candidate("A"),
        limits: options.limits ?? { maxActiveWork: 16, maxAttempts: 32, maxCandidates: 2, maxRetainedPredecessors: 2 },
        captureOwner: owner => { requireFact(recovery === undefined, "c.one-runtime-owner"); recovery = owner; } } },
    } });
    if (built.status !== "succeeded") { throw new Error("actual GM runtime construction failed", { cause: built }); }
    runtime = built.roots.owner; document = built.roots.document;
    requireFact(recovery !== undefined && recovery.close === runtime.close, "c.original-runtime-owner-captured");
  }
  let construction: Promise<void> | undefined;
  function closeParent() {
    if (options.unsafeParentFirst !== true && recovery !== undefined) { originalClose ??= recovery.close(); }
    const closing = parent.control.close();
    if (options.unsafeParentFirst === true && recovery !== undefined) { originalClose ??= recovery.close(); }
    return closing;
  }
  return {
    environment, generations, abortInvocation: abortInvocation.promise,
    construct: () => { construction ??= construct(); return construction; },
    get runtime() { requireFact(runtime !== undefined, "c.runtime-root-not-published"); return runtime; },
    get document() { requireFact(document !== undefined, "c.invocation-root-not-published"); return document; },
    recovery: () => { requireFact(recovery !== undefined, "c.no-owner-transferred"); return recovery; },
    hasRoot: () => document !== undefined,
    closeParent, originalClose: () => originalClose,
    start: (generation: string) => {
      requireFact(runtime !== undefined, "c.runtime-root-not-published");
      const started = runtime.startUpdate({ attemptId: "replace/" + generation, candidate: generations.candidate(generation) });
      requireFact(started.status !== "refused", "c.update-admission"); attempts.push(started.handle); return started.handle;
    },
    dispose: async () => {
      environment.releaseBarriers();
      for (const generation of environment.acquired()) { environment.failCleanup(generation, false); }
      environment.authority.finishPending();
      await construction?.catch(() => {});
      for (const attempt of attempts) { await attempt.reconcile(); await attempt.retryCleanup(); }
      await closeParent(); await recovery?.retryCleanup();
      const native = await parent.control.close();
      requireFact(native.complete && native.settled && (recovery === undefined || recovery.inspect().ownershipReleased), "c.external-owner-final-cleanup");
      requireFact(environment.foreignIntact(), "c.foreign-survival");
    },
  };
}

export type ComposedRuntime = ReturnType<typeof createComposedRuntime>;
