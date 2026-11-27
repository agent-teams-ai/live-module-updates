import type { UpdateHandle } from "live-module-updates";
import type { DocumentCommand, DocumentReply } from "@fixture/composed-document";
import { requireFact } from "./environment.js";
import type { ComposedRuntime, RuntimeOptions } from "./runtime-host.js";

export interface LiveCase {
  readonly name: string;
  readonly options?: Pick<RuntimeOptions, "samePlan" | "limits" | "receiverCustody" | "failDependent">;
  readonly deferConstruction?: boolean;
  readonly run: (host: ComposedRuntime) => Promise<object>;
}

export async function invoke(host: ComposedRuntime, command: DocumentCommand, oracle = "c.useful-invocation"): Promise<DocumentReply> {
  const result = await host.document.invoke(command);
  if (result.status !== "returned") { throw new Error(oracle, { cause: result }); }
  return result.value;
}

export async function baseline(host: ComposedRuntime): Promise<void> {
  const result = await invoke(host, { kind: "view" });
  requireFact(result.kind === "document" && result.snapshot.revision === 0 && result.snapshot.text === "seed", "c.baseline-document");
  requireFact(host.environment.alive("A") && !host.runtime.inspect().ownershipReleased, "c.initial-owner");
}

export async function summary(host: ComposedRuntime, generation: string, content: string, oracle = "c.useful-summary"): Promise<void> {
  const result = await invoke(host, { kind: "summary" }, oracle);
  requireFact(result.kind === "summary" && result.result.status === "published"
    && result.result.revision === 0 && result.result.contentLength === content.length, oracle);
  const delivered = host.environment.deliveries().findLast(value => value.generation === generation);
  requireFact(delivered?.content === content && delivered.revision === 0, oracle);
}

export async function published(host: ComposedRuntime, generation: string): Promise<UpdateHandle> {
  const observed = Promise.withResolvers<void>();
  host.environment.authority.beforeMutation(() => { observed.resolve(); });
  const attempt = host.start(generation);
  await Promise.race([observed.promise, attempt.completion.then(result => {
    if (result.publication.status !== "committed" && result.publication.status !== "unknown") {
      throw new Error("c.expected-canonical-publication", { cause: result });
    }
    return result;
  })]);
  requireFact(host.environment.authority.observeHead().generationId === generation, "c.canonical-publication");
  return attempt;
}

function originalRetired(host: ComposedRuntime, generation: string): void {
  requireFact(!host.environment.alive(generation) && host.environment.releases(generation) === 1, "c.original-retirement");
  requireFact(host.environment.foreignIntact(), "c.foreign-survival");
}

const useful: LiveCase = { name: "whole-closure-transitions", run: async host => {
  await baseline(host);
  await summary(host, "A", "Document r0\nseed");
  requireFact((await (await published(host, "B")).completion).publication.status === "committed", "c.first-update");
  await summary(host, "B", "[Document r0]\n> seed"); originalRetired(host, "A");
  requireFact((await (await published(host, "C")).completion).publication.status === "committed", "c.authored-update");
  await summary(host, "C", "Author revision 0\nBy author: seed"); originalRetired(host, "B");
  return { deliveries: host.environment.deliveries(), plans: host.generations.plans(), externalProvider: "unchanged author-format source" };
} };

const heldClosure: LiveCase = { name: "held-whole-closure", run: async host => {
  await baseline(host);
  host.environment.holdDelivery("A", "held-export");
  const held = invoke(host, { kind: "summary" });
  await host.environment.entered("held-export");
  const update = await published(host, "B");
  await summary(host, "B", "[Document r0]\n> seed");
  requireFact(host.environment.alive("A") && !host.environment.aborted("A") && host.environment.releases("A") === 0, "c.held-native-closure");
  host.environment.resume("held-export");
  const old = await held;
  requireFact(old.kind === "summary" && old.result.status === "rejected" && old.result.reason === "closed", "c.old-effect-fence");
  requireFact(JSON.stringify(host.generations.traces().filter(value => value.generation === "A")) === JSON.stringify([
    { generation: "A", member: "title", input: 0, output: "Document r0" },
    { generation: "A", member: "body", input: "seed", output: "seed" },
  ]), "c.whole-closure-affinity");
  await update.completion; originalRetired(host, "A");
  requireFact(host.environment.alive("B") && host.environment.registered() === "B", "c.registration-identity");
  await summary(host, "B", "[Document r0]\n> seed", "c.registration-identity");
  requireFact(host.environment.deliveries().length === 2, "c.old-effect-fence");
  return { traces: host.generations.traces(), deliveries: host.environment.deliveries(), oldResult: old };
} };

const nested: LiveCase = { name: "retained-nested-summary", run: async host => {
  await baseline(host);
  const held = invoke(host, { kind: "nested-summary", barrier: "nested-A" });
  await host.environment.entered("nested-A");
  const update = await published(host, "B");
  await summary(host, "B", "[Document r0]\n> seed");
  requireFact(host.environment.alive("A") && !host.environment.aborted("A"), "c.nested-native-retention");
  host.environment.resume("nested-A");
  const old = await held;
  requireFact(old.kind === "summary" && old.result.status === "rejected" && old.result.reason === "closed", "c.bound-nested-generation");
  requireFact(host.generations.traces().filter(value => value.generation === "A").map(value => value.output).join("\n") === "Document r0\nseed", "c.bound-nested-generation");
  await update.completion; originalRetired(host, "A");
  return { oldResult: old, traces: host.generations.traces(), releases: host.environment.releases("A") };
} };

function effectCase(kind: "edit" | "grant" | "schema"): LiveCase {
  return { name: "receiver-" + kind, run: async host => {
    await baseline(host);
    host.environment.holdDelivery("A", "receiver-check");
    const held = invoke(host, { kind: "summary" });
    await host.environment.entered("receiver-check");
    if (kind === "edit") { requireFact(host.environment.authority.write("A", 0, "owner edit").status === "written", "c.actual-owner-edit"); }
    if (kind === "grant") { host.environment.authority.grant(false); }
    if (kind === "schema") { host.environment.authority.schema("schema/2"); }
    host.environment.resume("receiver-check");
    const result = await held;
    requireFact(result.kind === "summary" && result.result.status === "rejected"
      && result.result.reason === (kind === "grant" ? "denied" : "conflict"), "c.effect-permission");
    requireFact(host.environment.deliveries().length === 0, "c.effect-permission");
    return { result, nativeDeliveries: 0, actualDocument: host.environment.authority.document() };
  } };
}

const factoryIdentity: LiveCase = { name: "same-plan-distinct-factories", options: { samePlan: true }, run: async host => {
  await baseline(host); await summary(host, "A", "Document r0\nseed");
  await (await published(host, "B")).completion;
  requireFact(host.generations.plans()["A"] === host.generations.plans()["B"], "c.actual-same-plan");
  requireFact(host.generations.candidate("A").closureId !== host.generations.candidate("B").closureId, "c.distinct-original-closure");
  await summary(host, "B", "[Document r0]\n> seed", "c.original-factory-binding");
  return { plan: host.generations.plans()["A"], differentClosures: true, deliveries: host.environment.deliveries() };
} };

const partialPreparation: LiveCase = { name: "partial-native-preparation", run: async host => {
  await baseline(host); host.generations.failPreparation("B");
  const result = await host.start("B").completion;
  requireFact(result.preparation.status === "failed" && result.publication.status === "not-requested", "c.failed-preparation-no-publication");
  originalRetired(host, "B");
  requireFact(host.environment.authority.observeHead().generationId === "A", "c.failed-preparation-keeps-A");
  await summary(host, "A", "Document r0\nseed");
  return { preparation: result.preparation.status, candidateReleases: host.environment.releases("B"), actualHead: "A" };
} };

const latePreparation: LiveCase = { name: "parent-close-during-preparation", run: async host => {
  await baseline(host); host.generations.holdPreparation("B", "late-B");
  const attempt = host.start("B"); await host.environment.entered("late-B");
  const closing = host.closeParent();
  requireFact(host.environment.alive("B") && !host.environment.aborted("B") && !host.runtime.inspect().ownershipReleased, "c.late-native-custody");
  host.environment.resume("late-B");
  const result = await attempt.completion;
  const parent = await closing;
  requireFact(result.publication.status === "not-requested" && parent.complete && parent.settled, "c.late-no-publication");
  originalRetired(host, "B"); originalRetired(host, "A");
  return { publication: result.publication.status, parentComplete: parent.complete, ownershipReleased: host.runtime.inspect().ownershipReleased };
} };

const lostAcknowledgement: LiveCase = { name: "lost-ack-through-successor", run: async host => {
  await baseline(host); host.environment.authority.publicationMode("lost-ack");
  const original = await published(host, "B"); const lost = original.inspect();
  requireFact(lost.publication.status === "unknown" && host.environment.alive("A"), "c.original-unknown-custody");
  const originalPublication = JSON.stringify(lost.publication);
  await summary(host, "B", "[Document r0]\n> seed");
  host.environment.authority.publicationMode("normal");
  const successor = await published(host, "C");
  await summary(host, "C", "Author revision 0\nBy author: seed");
  requireFact(host.environment.alive("B"), "c.original-unknown-custody");
  const recovered = await original.reconcile();
  requireFact(recovered.publication.status === "committed" && JSON.stringify(lost.publication) === originalPublication, "c.original-receipt-recovery");
  await original.completion; await successor.completion; originalRetired(host, "A"); originalRetired(host, "B");
  requireFact(host.environment.authority.publicationCalls() === 2, "c.no-republication");
  return { original: lost.publication.status, recovered: recovered.publication.status, current: host.environment.authority.observeHead(), publications: 2 };
} };

const externalShutdown: LiveCase = { name: "external-parent-held-shutdown", run: async host => {
  await baseline(host);
  const held = invoke(host, { kind: "nested-summary", barrier: "external-close" });
  await host.environment.entered("external-close");
  const closing = host.closeParent(); const fresh = await host.abortInvocation;
  requireFact(fresh?.status === "refused" && fresh.reason === "boundary-closed", "c.external-admission-cutoff");
  requireFact(host.environment.alive("A") && !host.environment.aborted("A") && host.environment.foreignIntact(), "c.parent-borrowed-lifetime");
  host.environment.resume("external-close");
  const old = await held;
  requireFact(old.kind === "summary" && old.result.status === "published" && old.result.contentLength === 16, "c.closed-bound-continuation");
  const parent = await closing;
  requireFact(parent.complete && parent.settled && host.runtime.inspect().ownershipReleased, "c.parent-owned-drain");
  originalRetired(host, "A");
  return { oldResult: old, fresh: fresh.status, parentComplete: parent.complete, nativeReleases: 1 };
} };

const cleanupDebt: LiveCase = { name: "external-parent-cleanup-debt", run: async host => {
  await baseline(host); host.environment.failCleanup("A", true);
  const parent = await host.closeParent(); const original = await host.originalClose();
  requireFact(!parent.complete && parent.settled && original?.complete === false
    && !host.runtime.inspect().ownershipReleased && host.environment.alive("A"), "c.original-cleanup-debt");
  const originalReports = JSON.stringify([parent.complete, original.complete]);
  host.environment.failCleanup("A", false);
  requireFact((await host.runtime.retryCleanup()).ownershipReleased, "c.current-ownership-release");
  const retry = await host.closeParent();
  requireFact(retry.complete && retry.settled && JSON.stringify([parent.complete, original.complete]) === originalReports, "c.native-parent-debt-recovery");
  originalRetired(host, "A");
  return { originalRuntimeComplete: original.complete, originalParentComplete: parent.complete, retryParentComplete: retry.complete };
} };

const capturedOwner: LiveCase = { name: "captured-original-native-owner", options: { receiverCustody: true }, run: async host => {
  await baseline(host); await summary(host, "A", "Document r0\nseed");
  await (await published(host, "B")).completion;
  originalRetired(host, "A"); await summary(host, "B", "[Document r0]\n> seed");
  requireFact((await host.closeParent()).complete, "c.original-owner-receiver");
  originalRetired(host, "B");
  return { initialAndCandidateReceiversPreserved: true, replacementCloseNeverSelected: true, nativeReleases: 2 };
} };

const failedRootDebt: LiveCase = { name: "failed-root-retains-recovery", deferConstruction: true, options: { failDependent: true }, run: async host => {
  host.environment.failCleanup("A", true);
  const construction = await host.construct().then(() => null, (cause: unknown) => cause);
  requireFact(construction instanceof Error && typeof construction.cause === "object" && construction.cause !== null
    && "code" in construction.cause && construction.cause.code === "assembly.run.factory-rejected", "c.structured-dependent-failure");
  requireFact(!host.hasRoot() && host.environment.alive("A"), "c.failed-root-original-custody");
  const parent = await host.closeParent(); const original = await host.originalClose();
  requireFact(!parent.complete && parent.settled && original?.complete === false && !host.recovery().inspect().ownershipReleased, "c.failed-root-native-debt");
  const originalReports = JSON.stringify([parent.complete, original.complete]);
  host.environment.failCleanup("A", false);
  requireFact((await host.recovery().retryCleanup()).ownershipReleased, "c.failed-root-explicit-recovery");
  const recovered = await host.closeParent();
  requireFact(recovered.complete && recovered.settled && JSON.stringify([parent.complete, original.complete]) === originalReports
    && !host.hasRoot(), "c.failed-root-owner-retained");
  originalRetired(host, "A");
  return { gmCode: construction.cause.code, originalParentComplete: false, recoveredParentComplete: true, publishedRoot: false };
} };

const initialCompatibility: LiveCase = { name: "initial-schema-before-acquisition", deferConstruction: true, run: async host => {
  host.environment.authority.schema("schema/2");
  const construction = await host.construct().then(() => null, (cause: unknown) => cause);
  requireFact(construction instanceof Error && !host.hasRoot() && host.environment.acquired().length === 0, "c.initial-compatibility-before-acquisition");
  requireFact((await host.closeParent()).complete, "c.initial-refusal-native-owner");
  return { publishedRoot: false, acquisitions: 0, nativeParentComplete: true };
} };

const initialRevalidation: LiveCase = { name: "initial-schema-during-preparation", deferConstruction: true, run: async host => {
  host.generations.holdPreparation("A", "initial-schema");
  const constructing = host.construct().then(() => null, (cause: unknown) => cause);
  await host.environment.entered("initial-schema");
  requireFact(host.environment.alive("A"), "c.initial-owner-before-transfer");
  host.environment.authority.schema("schema/2"); host.environment.resume("initial-schema");
  const failure = await constructing;
  requireFact(failure instanceof Error && !host.hasRoot(), "c.initial-current-compatibility");
  requireFact((await host.closeParent()).complete, "c.initial-revalidation-cleanup"); originalRetired(host, "A");
  return { publishedRoot: false, initialReleases: 1, schemaChangedDuringActualPreparation: true };
} };

const unknownFactory: LiveCase = { name: "unknown-original-factory", run: async host => {
  await baseline(host);
  const candidate = host.generations.candidate("B");
  const started = host.runtime.startUpdate({ attemptId: "unknown-original", candidate: { ...candidate, closureId: "not-a-selected-original-factory" } });
  requireFact(started.status !== "refused", "c.factory-preflight-request");
  const result = await started.handle.completion;
  requireFact(result.planning.status === "refused" && result.preparation.status === "not-started"
    && host.generations.evaluations("B") === 0 && !host.environment.alive("B")
    && host.environment.authority.publicationCalls() === 0, "c.factory-before-evaluation");
  await summary(host, "A", "Document r0\nseed");
  return { planning: result.planning.status, candidateEvaluations: 0, publications: 0 };
} };

const boundedWork: LiveCase = { name: "bounded-work", run: async host => {
  await baseline(host);
  const held = Array.from({ length: 16 }, (_, index) => invoke(host, { kind: "held-view", barrier: "work/" + String(index) }));
  await Promise.all(held.map((_, index) => host.environment.entered("work/" + String(index))));
  const overflow = await host.document.invoke({ kind: "view" });
  requireFact(overflow.status === "refused" && overflow.reason === "work-capacity", "c.work-budget");
  const update = await published(host, "B");
  const acrossGeneration = await host.document.invoke({ kind: "view" });
  requireFact(acrossGeneration.status === "refused" && acrossGeneration.reason === "work-capacity"
    && host.environment.alive("A") && !host.environment.aborted("A"), "c.domain-work-budget");
  for (let index = 0; index < held.length; index += 1) { host.environment.resume("work/" + String(index)); }
  const completed = await Promise.all(held);
  requireFact(completed.every(result => result.kind === "document" && result.snapshot.text === "seed"), "c.bounded-work-drain");
  await update.completion; originalRetired(host, "A"); await summary(host, "B", "[Document r0]\n> seed");
  return { held: 16, overflow: overflow.reason, acrossGeneration: acrossGeneration.reason, nativeActiveAfterDrain: 1 };
} };

const boundedCandidates: LiveCase = { name: "bounded-candidates", run: async host => {
  await baseline(host); host.generations.holdPreparation("B", "candidate-B"); host.generations.holdPreparation("C", "candidate-C");
  const first = host.start("B"); const second = host.start("C");
  await host.environment.entered("candidate-B"); await host.environment.entered("candidate-C");
  const overflow = host.runtime.startUpdate({ attemptId: "candidate-overflow", candidate: host.generations.candidate("R0") });
  requireFact(overflow.status === "refused" && overflow.reason === "candidate-capacity" && !host.environment.alive("R0"), "c.candidate-budget");
  const observed = Promise.withResolvers<void>(); host.environment.authority.beforeMutation(() => { observed.resolve(); });
  host.environment.resume("candidate-B"); await observed.promise;
  await summary(host, "B", "[Document r0]\n> seed"); host.environment.resume("candidate-C");
  const accepted = await first.completion; const rejected = await second.completion;
  requireFact(accepted.publication.status === "committed" && rejected.publication.status === "rejected"
    && rejected.publication.receipt.reason === "head-conflict", "c.racing-original-candidates");
  originalRetired(host, "A"); originalRetired(host, "C");
  requireFact(host.environment.alive("B") && host.environment.registered() === "B", "c.candidate-registration-identity");
  return { candidates: 2, overflow: overflow.reason, lostRace: rejected.publication.receipt.reason, nativeActive: 1 };
} };

const boundedRetention: LiveCase = { name: "bounded-retention", run: async host => {
  await baseline(host);
  const heldA = invoke(host, { kind: "held-view", barrier: "retained-A" }); await host.environment.entered("retained-A");
  const first = await published(host, "B");
  const heldB = invoke(host, { kind: "held-view", barrier: "retained-B" }); await host.environment.entered("retained-B");
  const second = await published(host, "C");
  await summary(host, "C", "Author revision 0\nBy author: seed");
  const overflow = host.runtime.startUpdate({ attemptId: "retained-overflow", candidate: host.generations.candidate("R0") });
  requireFact(overflow.status === "refused" && overflow.reason === "retention-capacity" && !host.environment.alive("R0")
    && host.environment.alive("A") && host.environment.alive("B"), "c.retention-budget");
  host.environment.resume("retained-A"); await heldA; await first.completion; originalRetired(host, "A");
  const resumed = await published(host, "R0"); await resumed.completion;
  await summary(host, "R0", "Document r0\nseed");
  host.environment.resume("retained-B"); await heldB; await second.completion;
  originalRetired(host, "B"); originalRetired(host, "C");
  return { retained: 2, overflow: overflow.reason, resumedAfterActualRelease: true, nativeActive: 1 };
} };

const finiteSession: LiveCase = { name: "finite-session-history", run: async host => {
  await baseline(host);
  for (let index = 0; index < 32; index += 1) {
    const generation = "R" + String(index);
    const result = await host.start(generation).completion;
    requireFact(result.publication.status === "committed", "c.finite-session-update");
    await summary(host, generation, "Document r0\nseed");
    const acquired = host.environment.acquired();
    requireFact(acquired.filter(value => host.environment.alive(value)).length === 1
      && acquired.filter(value => value !== generation).every(value => host.environment.releases(value) === 1)
      && host.environment.foreignIntact(), "c.native-counts-after-settlement");
  }
  const overflow = host.runtime.startUpdate({ attemptId: "history-overflow", candidate: host.generations.candidate("R32") });
  requireFact(overflow.status === "refused" && overflow.reason === "attempt-capacity" && !host.environment.alive("R32")
    && host.environment.authority.receipts().length === 32 && host.environment.authority.publicationCalls() === 32, "c.finite-session-budget");
  const original = host.environment.authority.receipts()[0]; requireFact(original !== undefined, "c.first-receipt-retained");
  const recovered = await host.environment.authority.lookup(original.request);
  requireFact(recovered.status === "known" && JSON.stringify(recovered.receipt) === JSON.stringify(original), "c.history-not-evicted");
  return { acceptedUpdates: 32, retainedOriginalReceipts: 32, nativeAcquisitions: 33, nativeActive: 1, overflow: overflow.reason };
} };

export const liveCases: readonly LiveCase[] = [useful, heldClosure, nested, effectCase("edit"), effectCase("grant"), effectCase("schema"),
  factoryIdentity, partialPreparation, latePreparation, lostAcknowledgement, externalShutdown, cleanupDebt, capturedOwner,
  failedRootDebt, initialCompatibility, initialRevalidation, unknownFactory, boundedWork, boundedCandidates, boundedRetention, finiteSession];
