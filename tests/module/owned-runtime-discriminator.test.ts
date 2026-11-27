import assert from "node:assert/strict";
import { fstatSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import test, { type TestContext } from "node:test";
import { fileURLToPath } from "node:url";
import type { InvocationOutcome } from "../../src/index.ts";
import type { Reply } from "./host-contract.ts";
import { createOwnedRuntimeFixture, type OwnedRuntimeFixture, type OwnedRuntimeOptions } from "./owned-runtime-fixture.ts";

interface Observation {
  readonly name: string;
  readonly classification: "native-positive" | "rejected-integration";
  readonly facts: Readonly<Record<string, unknown>>;
}
type Case = (fixture: OwnedRuntimeFixture) => Promise<Readonly<Record<string, unknown>>>;

function view(outcome: InvocationOutcome<Reply>, generation: string): void {
  assert.equal(outcome.status, "returned");
  assert.deepEqual(outcome.value, { kind: "view", generation, revision: 0, text: generation === "B" ? "B:SEED" : "A:seed" });
}
async function ready(fixture: OwnedRuntimeFixture): Promise<void> {
  assert.equal((await fixture.construct()).status, "succeeded");
  assert.equal(fixture.transferred(), true);
  assert.equal(fixture.hasPublishedRoot(), true);
  assert.equal(fixture.runtime().inspect().ownershipReleased, false);
  view(await fixture.invoke({ kind: "view" }), "A");
}
function retained(fixture: OwnedRuntimeFixture, generation: string): void {
  const lease = fixture.lease(generation);
  fstatSync(lease.descriptor);
  assert.equal(lease.active, true);
  assert.equal(lease.signal.aborted, false);
  assert.equal(lease.releases, 0);
  fixture.useBorrowed();
}
function released(fixture: OwnedRuntimeFixture, generation: string): void {
  const lease = fixture.lease(generation);
  assert.equal(lease.active, false);
  assert.equal(lease.releases, 1);
  assert.throws(() => fstatSync(lease.descriptor), { code: "EBADF" });
  fixture.useBorrowed();
}

const heldContinuation: Case = async fixture => {
  await ready(fixture);
  const held = fixture.invoke({ kind: "nested", barrier: "held-A" });
  await fixture.entered("held-A");
  const closing = fixture.closeParent();
  assert.deepEqual(await fixture.abortInvocation, { status: "refused", reason: "boundary-closed" });
  assert.equal(fixture.runtime().inspect().ownershipReleased, false);
  retained(fixture, "A");
  fixture.resume("held-A");
  view(await held, "A");
  assert.equal((await closing).complete, true);
  assert.equal((await fixture.originalRuntimeClose())?.complete, true);
  assert.equal(fixture.runtime().inspect().ownershipReleased, true);
  released(fixture, "A");
  return { abortListenerRegisteredBeforeConstruction: true, freshCall: "refused", postAwaitBoundCall: "A:seed", nativeReleases: 1 };
};
const abortFirstCounterexample: Case = async fixture => {
  await ready(fixture);
  const closing = fixture.closeParent(true);
  const early = await fixture.abortInvocation;
  assert.ok(early);
  view(early, "A");
  assert.equal((await closing).complete, true);
  released(fixture, "A");
  return { oracle: "fresh invocation admitted after owner shutdown began", actualUsefulResult: "A:seed", unsafeOrderingRejected: true };
};
const childScopeCounterexample: Case = async fixture => {
  await ready(fixture);
  const held = fixture.invoke({ kind: "nested", barrier: "wrong-tree" });
  await fixture.entered("wrong-tree");
  const closing = fixture.closeParent();
  assert.equal(fixture.lease("A").signal.aborted, true);
  fixture.resume("wrong-tree");
  assert.equal((await held).status, "failed");
  assert.equal((await closing).complete, true);
  released(fixture, "A");
  return { oracle: "real ancestor abort breaks admitted post-await operation", unsafeNativeTopologyRejected: true };
};
const constructorRefusal: Case = async fixture => {
  const construction = await fixture.construct();
  assert.equal(construction.status, "failed");
  assert.equal(construction.code, "assembly.run.factory-rejected");
  assert.ok(construction.cause instanceof TypeError);
  assert.equal(fixture.transferred(), false);
  assert.equal(fixture.hasPublishedRoot(), false);
  retained(fixture, "A");
  assert.equal((await fixture.closeParent()).complete, true);
  released(fixture, "A");
  return { gmCode: construction.code, owner: "untransferred native setup cell", initialReleases: 1, publishedRoot: false };
};
const dependentFailure: Case = async fixture => {
  const construction = await fixture.construct();
  assert.equal(construction.status, "failed");
  assert.equal(construction.code, "assembly.run.factory-rejected");
  assert.ok(construction.cause instanceof Error);
  assert.equal(construction.cause.message, "actual dependent GM factory failure");
  assert.equal(fixture.transferred(), true);
  assert.equal(fixture.hasPublishedRoot(), false);
  retained(fixture, "A");
  assert.equal((await fixture.closeParent()).complete, true);
  released(fixture, "A");
  return { gmCode: construction.code, initialTransferredBeforeFailure: true, initialReleases: 1, publishedRoot: false };
};
const lateInitial: Case = async fixture => {
  const construction = fixture.construct();
  await fixture.entered("initial-preparation");
  const closing = fixture.closeParent();
  assert.equal(fixture.transferred(), false);
  retained(fixture, "A");
  fixture.resume("initial-preparation");
  const result = await construction;
  assert.notEqual(result.status, "succeeded");
  assert.equal(fixture.transferred(), false);
  assert.equal(fixture.hasPublishedRoot(), false);
  assert.equal((await closing).complete, true);
  released(fixture, "A");
  return { lateInitialNativeCustody: true, actualGmStatus: result.status, runtimeConstructed: false, initialReleases: 1 };
};
const cancelledPublication: Case = async fixture => {
  const construction = fixture.construct();
  await fixture.entered("before-root-publication");
  assert.equal(fixture.transferred(), true);
  assert.equal(fixture.hasPublishedRoot(), false);
  retained(fixture, "A");
  fixture.cancelConstruction();
  assert.deepEqual(await fixture.runtime().invoke({ kind: "view" }), { status: "refused", reason: "boundary-closed" });
  fixture.resume("before-root-publication");
  const result = await construction;
  assert.equal(result.status, "cancelled");
  assert.equal(fixture.hasPublishedRoot(), false);
  assert.equal((await fixture.closeParent()).complete, true);
  released(fixture, "A");
  return { transferredBeforeCancellation: true, actualGmStatus: result.status, publishedRoot: false, initialReleases: 1 };
};
const heldCandidate: Case = async fixture => {
  await ready(fixture);
  fixture.prepareAfter("B", "candidate-preparation");
  const update = fixture.start("B");
  await fixture.entered("candidate-preparation");
  const closing = fixture.closeParent();
  retained(fixture, "B");
  assert.equal(update.inspect().preparation.status, "pending");
  assert.equal(fixture.runtime().inspect().ownershipReleased, false);
  await fixture.runtime().retryCleanup();
  assert.equal(fixture.lease("B").cleanupCalls, 0);
  fixture.resume("candidate-preparation");
  const result = await update.completion;
  assert.equal(result.preparation.status, "failed");
  assert.equal(result.publication.status, "not-requested");
  assert.equal(fixture.authority.publicationCalls(), 0);
  assert.equal((await closing).complete, true);
  released(fixture, "A"); released(fixture, "B");
  return { originalPreparationHeldAfterParentClose: true, lateCandidatePublications: 0, nativeReleases: { A: 1, B: 1 } };
};
const unknownPublication: Case = async fixture => {
  await ready(fixture);
  fixture.authority.publicationMode("lost-ack");
  const update = fixture.start("B");
  await fixture.publicationObserved;
  assert.equal(update.inspect().publication.status, "unknown");
  assert.equal(fixture.authority.read().head.generationId, "B");
  view(await fixture.invoke({ kind: "view" }), "B");
  const closing = fixture.closeParent();
  let parentSettled = false;
  void closing.then(() => { parentSettled = true; return null; });
  fixture.lookupAfter("original-receipt");
  const reconciliation = update.reconcile();
  await fixture.entered("original-receipt");
  assert.equal(parentSettled, false);
  assert.equal(fixture.runtime().inspect().ownershipReleased, false);
  // A has no remaining admitted work; only the still-uncertain B must remain.
  released(fixture, "A"); retained(fixture, "B");
  fixture.resume("original-receipt");
  const result = await reconciliation;
  assert.equal(result.publication.status, "committed");
  await update.completion;
  assert.equal((await closing).complete, true);
  assert.equal(fixture.authority.publicationCalls(), 1);
  assert.equal(fixture.lookups(), 1);
  released(fixture, "A"); released(fixture, "B");
  return { actualHeadAfterLostAck: "B", usefulB: "B:SEED", borrowedAuthorityUsableDuringClose: true,
    originalPublicationCalls: 1, originalReceiptLookups: 1, noParentCompletionBeforeResolution: true };
};
const pendingCleanup: Case = async fixture => {
  await ready(fixture);
  fixture.cleanupAfter("A", "native-close");
  const closing = fixture.closeParent();
  await fixture.entered("native-close");
  const original = fixture.originalRuntimeClose();
  assert.ok(original);
  assert.equal(fixture.runtime().close(), original);
  assert.equal(fixture.closeParent(), closing);
  assert.equal(fixture.lease("A").cleanupCalls, 1);
  assert.equal(fixture.lease("A").active, true);
  fstatSync(fixture.lease("A").descriptor);
  const current = await fixture.runtime().retryCleanup();
  assert.equal(current.ownershipReleased, false);
  assert.equal(current.generations[0]?.cleanup.original.status, "pending");
  assert.equal(fixture.lease("A").cleanupCalls, 1);
  fixture.resume("native-close");
  assert.equal((await closing).complete, true);
  assert.equal((await original).complete, true);
  released(fixture, "A");
  return { concurrentNativeCleanupAttempts: 1, originalRuntimePromisePreserved: true, parentFlightCoalesced: true };
};
async function originalNativeDebt(fixture: OwnedRuntimeFixture) {
  await ready(fixture);
  fixture.failCleanup("A", true);
  const parentOriginal = await fixture.closeParent();
  const runtimeFlight = fixture.originalRuntimeClose();
  assert.ok(runtimeFlight);
  const runtimeOriginal = await runtimeFlight;
  assert.equal(parentOriginal.complete, false);
  assert.equal(parentOriginal.settled, true);
  assert.equal(runtimeOriginal.complete, false);
  assert.equal(fixture.runtime().inspect().ownershipReleased, false);
  assert.equal(fixture.lease("A").cleanupCalls, 1);
  fstatSync(fixture.lease("A").descriptor);
  const failedParentDebt = parentOriginal.debts.find(debt => debt.state === "failed");
  assert.ok(failedParentDebt?.state === "failed" && failedParentDebt.cause instanceof Error);
  assert.equal(failedParentDebt.cause.cause, runtimeOriginal);
  return { parentOriginal, runtimeFlight, runtimeOriginal };
}
const originalCloseOnlyCounterexample: Case = async fixture => {
  const { parentOriginal, runtimeFlight, runtimeOriginal } = await originalNativeDebt(fixture);
  fixture.failCleanup("A", false);
  const current = await fixture.runtime().retryCleanup();
  assert.equal(current.ownershipReleased, true);
  released(fixture, "A");
  assert.equal(fixture.lease("A").cleanupCalls, 2);
  assert.equal(fixture.runtime().close(), runtimeFlight);
  assert.equal(await fixture.runtime().close(), runtimeOriginal);
  const parentRetry = await fixture.closeParent();
  // The old callback deliberately ignores the now-available current fact.
  // Preserve this as a rejected integration, not an unresolved API gap.
  assert.equal(parentRetry.complete, false);
  assert.equal(parentOriginal.complete, false);
  assert.equal(runtimeOriginal.complete, false);
  assert.equal(fixture.lease("A").cleanupCalls, 2);
  return { actualNativeRecovery: true, originalRuntimeComplete: false, originalParentComplete: false,
    parentRetryComplete: false, nativeCleanupAttempts: 2,
    currentOwnershipReleased: true, rejectedAdapter: "original-close-only" };
};
const currentOwnershipRecovery: Case = async fixture => {
  const { parentOriginal, runtimeFlight, runtimeOriginal } = await originalNativeDebt(fixture);
  fixture.failCleanup("A", false);
  const current = await fixture.runtime().retryCleanup();
  assert.equal(current.ownershipReleased, true);
  released(fixture, "A");
  assert.equal(fixture.lease("A").cleanupCalls, 2);
  assert.equal(fixture.runtime().close(), runtimeFlight);
  assert.equal(await runtimeFlight, runtimeOriginal);
  assert.equal(runtimeOriginal.complete, false);
  assert.equal(runtimeOriginal.snapshot.ownershipReleased, false);
  const parentRetry = await fixture.closeParent();
  assert.equal(parentRetry.complete, true);
  assert.equal(parentRetry.settled, true);
  assert.equal(parentOriginal.complete, false);
  assert.equal(parentOriginal.debts.length, 1);
  assert.equal(runtimeOriginal.complete, false);
  assert.equal(fixture.lease("A").cleanupCalls, 2);
  return { originalRuntimeComplete: false, originalParentComplete: false, currentOwnershipReleased: true,
    parentRetryComplete: true, nativeCleanupAttempts: 2, nativeReleases: 1, originalReportsUnchanged: true };
};

async function run(context: TestContext, observations: Observation[], name: string, body: Case,
  configuration: { readonly options?: Omit<OwnedRuntimeOptions, "domain">; readonly classification?: Observation["classification"] } = {}): Promise<void> {
  await context.test(name, async scenario => {
    const fixture = createOwnedRuntimeFixture({ domain: "c2/" + name, ...configuration.options });
    scenario.after(async () => { await fixture.dispose(); });
    const facts = await body(fixture);
    observations.push({ name, classification: configuration.classification ?? "native-positive", facts });
  });
}

await test("C2 native GM owner discriminates admission, initial transfer and original cleanup recovery", { timeout: 30_000 }, async context => {
  const observations: Observation[] = [];
  const directory = fileURLToPath(new URL("../../.qualification/evidence/owned-runtime/", import.meta.url));
  await mkdir(directory, { recursive: true });
  await rm(directory + "node.json", { force: true });
  await run(context, observations, "held-bound-continuation", heldContinuation);
  await run(context, observations, "abort-before-cutoff", abortFirstCounterexample, { classification: "rejected-integration" });
  await run(context, observations, "premature-parent-generation", childScopeCounterexample,
    { options: { unsafeParentGenerations: true }, classification: "rejected-integration" });
  await run(context, observations, "constructor-refusal", constructorRefusal, { options: { constructorRefusal: true } });
  await run(context, observations, "dependent-factory-failure", dependentFailure, { options: { dependentFailure: true } });
  await run(context, observations, "late-initial-preparation", lateInitial, { options: { initialBarrier: "initial-preparation" } });
  await run(context, observations, "cancel-before-root-publication", cancelledPublication,
    { options: { publicationBarrier: "before-root-publication" } });
  await run(context, observations, "held-candidate-preparation", heldCandidate);
  await run(context, observations, "lost-ack-during-parent-close", unknownPublication);
  await run(context, observations, "pending-native-cleanup", pendingCleanup);
  await run(context, observations, "original-close-only-adapter", originalCloseOnlyCounterexample,
    { options: { originalCloseOnly: true }, classification: "rejected-integration" });
  await run(context, observations, "current-ownership-explicit-recovery", currentOwnershipRecovery);
  assert.equal(observations.length, 12, "every named discriminator must reach its final native assertions");
  await writeFile(directory + "node.json", JSON.stringify({ schema: 1, source: process.env.QUALIFICATION_SOURCE_SHA ?? "local-unpublished",
    node: process.version, target: "actual-native-node", scope: "ADR-0003 native GM handoff; explicit current ownership and unchanged original reports", observations }, null, 2) + "\n");
});
