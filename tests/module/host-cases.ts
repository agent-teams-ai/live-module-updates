import type { CloseSnapshot, InvocationOutcome, UpdateHandle, UpdateRequest } from "../../src/index.ts";
import { candidate, equal, expect, type HostFactory, type HostOptions, type NativeHost, type Reply } from "./host-contract.ts";
import { qualifyComposition } from "./generation-composition.ts";

type Faults = Pick<HostOptions, "unsafeEffects" | "unsafeRemoval">;
interface Scenario {
  readonly host: NativeHost;
  readonly handles: UpdateHandle[];
  readonly start: (generation: string, attempt?: string) => UpdateHandle;
}
type Case = (scenario: Scenario) => Promise<void>;
let sequence = 0;

export async function until(predicate: () => boolean, code: string): Promise<void> {
  for (let turn = 0; turn < 500; turn += 1) {
    if (predicate()) { return; }
    await new Promise<void>(resolve => { setTimeout(resolve, 0); });
  }
  throw new Error(code);
}
async function turns(): Promise<void> { for (let index = 0; index < 3; index += 1) { await new Promise<void>(resolve => { setTimeout(resolve, 0); }); } }
function returned(outcome: InvocationOutcome<Reply>, code: string): Reply {
  if (outcome.status !== "returned") { throw new Error(code); }
  return outcome.value;
}
async function view(host: NativeHost, expected: string): Promise<void> {
  const value = returned(await host.runtime.invoke({ kind: "view" }), "b6.useful-invocation");
  expect(value.kind === "view" && value.text === expected, "b6.useful-output");
}
function track(handles: UpdateHandle[], result: ReturnType<NativeHost["runtime"]["startUpdate"]>): UpdateHandle {
  if (result.status === "refused") { throw new Error("unexpected start refusal: " + result.reason); }
  if (!handles.includes(result.handle)) { handles.push(result.handle); }
  return result.handle;
}
async function using(factory: HostFactory, name: string, run: Case, faults: Faults): Promise<void> {
  const host = await factory({ domain: "b6/" + name + "/" + String(sequence++), ...faults,
    ...(name === "cleanup-debt" || name === "retention-capacity" ? { retained: 1 } : {}) });
  const handles: UpdateHandle[] = [];
  const start = (generation: string, attempt = "attempt/" + generation): UpdateHandle =>
    track(handles, host.runtime.startUpdate({ attemptId: attempt, candidate: candidate(generation) }));
  try {
    await view(host, "A:seed");
    await run({ host, handles, start });
  } catch (cause) {
    try { await host.dispose(handles); }
    catch (cleanup) { throw new AggregateError([cause, cleanup], cause instanceof Error ? cause.message : "scenario failed", { cause: cleanup }); }
    throw cause;
  }
  await host.dispose(handles);
}
const selectionRace: Case = async ({ host }) => {
  const call = host.runtime.invoke({ kind: "held-view", barrier: "selection" });
  const closing = host.runtime.close();
  host.resume("selection");
  const value = returned(await call, "b6.selection-affinity");
  expect(value.kind === "view" && value.generation === "A" && value.text === "A:seed", "b6.selection-affinity");
  await closing;
};
const normal: Case = async ({ host, start }) => {
  const update = start("B");
  const completed = await update.completion;
  expect(completed.publication.status === "committed" && completed.adoption.status === "observed", "b6.useful-adoption");
  await view(host, "B:SEED");
  equal(host.authority.document(), { revision: 0, text: "seed" }, "b6.borrowed-state");
  expect(host.releases("A") === 1 && !host.alive("A") && host.alive("B"), "b6.original-retirement");
  expect(host.registered() === "B" && host.foreignIntact(), "b6.registration-identity");
  const result = returned(await host.runtime.invoke({ kind: "edit", expected: 0, text: "edited" }), "b6.edit-invocation");
  equal(result, { kind: "effect", effect: { status: "written", revision: 1 } }, "b6.useful-write");
  await view(host, "B:EDITED");
};
const heldCohort: Case = async ({ host, start }) => {
  const previous = host.runtime.invoke({ kind: "nested", barrier: "old-work" });
  await host.entered("old-work");
  const update = start("B");
  await until(() => update.inspect().publication.status === "committed", "b6.update-did-not-publish");
  await turns();
  expect(host.alive("A") && host.releases("A") === 0, "b6.held-native-owner");
  await view(host, "B:SEED");
  host.resume("old-work");
  const value = returned(await previous, "b6.held-native-owner");
  expect(value.kind === "view" && value.generation === "A" && value.text === "A:seed", "b6.selection-affinity");
  await update.completion;
  expect(!host.alive("A") && host.releases("A") === 1 && host.alive("B"), "b6.retirement-after-work");
  expect(host.registered() === "B" && host.foreignIntact(), "b6.registration-identity");
};
const receiverFence: Case = async ({ host, start }) => {
  const oldWrite = host.runtime.invoke({ kind: "held-edit", barrier: "old-write", expected: 0, text: "stale" });
  await host.entered("old-write");
  const update = start("B");
  await until(() => update.inspect().publication.status === "committed", "b6.update-did-not-publish");
  host.resume("old-write");
  const value = returned(await oldWrite, "b6.receiver-invocation");
  equal(value, { kind: "effect", effect: { status: "refused", reason: "stale-generation" } }, "b6.receiver-fence");
  equal(host.authority.document(), { revision: 0, text: "seed" }, "b6.receiver-fence");
  await update.completion;
};
const revokedGrant: Case = async ({ host }) => {
  const oldWrite = host.runtime.invoke({ kind: "held-edit", barrier: "grant", expected: 0, text: "unauthorized" });
  await host.entered("grant"); host.authority.grant(false); host.resume("grant");
  const value = returned(await oldWrite, "b6.receiver-invocation");
  equal(value, { kind: "effect", effect: { status: "refused", reason: "grant-denied" } }, "b6.receiver-grant");
  equal(host.authority.document(), { revision: 0, text: "seed" }, "b6.receiver-grant");
};
const lostPublication: Case = async ({ host, start }) => {
  host.authority.publicationMode("lost-ack");
  const update = start("B");
  await until(() => update.inspect().publication.status !== "not-requested", "b6.publication-not-observed");
  await turns();
  expect(update.inspect().publication.status === "unknown" && host.alive("A") && host.alive("B"), "b6.unknown-custody");
  expect(host.authority.read().head.generationId === "B", "b6.actual-owner-committed");
  await view(host, "B:SEED");
  expect(host.authority.publicationCalls() === 1, "b6.no-duplicate-publication");
  await update.reconcile(); await update.completion;
  expect(update.inspect().publication.status === "committed" && !host.alive("A") && host.alive("B"), "b6.original-attempt-resolution");
  expect(host.authority.publicationCalls() === 1, "b6.no-duplicate-publication");
};
const latePublication: Case = async ({ host, start }) => {
  host.authority.publicationMode("delayed");
  const update = start("B");
  await until(() => update.inspect().publication.status === "unknown", "b6.publication-not-observed");
  const unknown = await update.reconcile();
  expect(unknown.publication.status === "unknown" && host.alive("A") && host.alive("B"), "b6.pending-original-request");
  await view(host, "A:seed");
  host.authority.finishPending(); await update.reconcile(); await update.completion;
  await view(host, "B:SEED");
  expect(host.authority.publicationCalls() === 1, "b6.no-duplicate-publication");
};
const unknownSuperseded: Case = async ({ host, start }) => {
  host.authority.publicationMode("lost-ack");
  const first = start("B");
  await until(() => first.inspect().publication.status === "unknown", "b6.publication-not-observed");
  host.authority.publicationMode("normal");
  const second = start("C");
  await until(() => second.inspect().publication.status === "committed", "b6.second-publication-not-observed");
  await view(host, "C:seed!");
  expect(host.alive("A") && host.alive("B") && host.alive("C"), "b6.superseded-unknown-held");
  await first.reconcile(); await first.completion; await second.completion;
  expect(!host.alive("A") && !host.alive("B") && host.alive("C"), "b6.superseded-original-resolution");
};
const failedPreparation: Case = async ({ host, start }) => {
  host.failPreparation("B");
  const update = start("B");
  const result = await update.completion;
  expect(result.preparation.status === "failed" && result.publication.status === "not-requested", "b6.partial-preparation-result");
  expect(host.releases("B") === 1 && !host.alive("B") && host.alive("A"), "b6.partial-preparation-owner");
  expect(host.authority.publicationCalls() === 0, "b6.failed-preparation-published");
  await view(host, "A:seed");
};
const latePreparation: Case = async ({ host, start }) => {
  host.prepareAfter("B", "late-preparation");
  const update = start("B");
  await host.entered("late-preparation");
  const closing = host.runtime.close();
  await turns();
  expect(host.alive("B"), "b6.late-preparation-owner");
  const refused = await host.runtime.invoke({ kind: "view" });
  expect(refused.status === "refused", "b6.closed-admission");
  host.resume("late-preparation"); await update.completion; await closing;
  expect(host.authority.publicationCalls() === 0 && !host.alive("B") && host.releases("B") === 1, "b6.late-preparation-cleanup");
};
const unsupported: Case = async ({ host, handles, start }) => {
  const unsupportedRequest: UpdateRequest = { attemptId: "unsupported", candidate: { ...candidate("B"), contract: { id: "document-operation", revision: "2" } } };
  const update = track(handles, host.runtime.startUpdate(unsupportedRequest));
  const result = await update.completion;
  expect(result.planning.status === "refused" && result.preparation.status === "not-started", "b6.compatibility-before-evaluation");
  expect(!host.alive("B") && host.authority.publicationCalls() === 0, "b6.compatibility-before-evaluation");
  await start("C").completion;
  const reversal = host.runtime.startUpdate({ attemptId: "return-A", candidate: candidate("A") });
  expect(reversal.status === "refused" && reversal.reason === "generation-reused", "b6.no-invented-rollback");
  await view(host, "C:seed!");
};
function basisChange(change: (host: NativeHost) => void): Case {
  return async ({ host, start }) => {
    host.authority.beforeMutation(() => { change(host); });
    const update = start("B");
    const result = await update.completion;
    expect(result.publication.status === "rejected" && result.publication.receipt.reason === "basis-conflict", "b6.owner-final-basis-check");
    expect(host.authority.read().head.generationId === "A" && !host.alive("B") && host.alive("A"), "b6.stale-candidate-cleanup");
  };
}
const replay: Case = async ({ host, handles, start }) => {
  const update = start("B"); await update.completion;
  const repeated = host.runtime.startUpdate({ attemptId: "attempt/B", candidate: candidate("B") });
  expect(repeated.status === "replayed" && track(handles, repeated) === update, "b6.same-handle-replay");
  for (const description of [{ ...candidate("B"), closureId: "different" },
    { ...candidate("B"), contract: { id: "document-operation", revision: "different" } }]) {
    const different = host.runtime.startUpdate({ attemptId: "attempt/B", candidate: description });
    expect(different.status === "refused" && different.reason === "attempt-payload-mismatch", "b6.full-candidate-binding");
  }
  const receipt = host.authority.receipts()[0];
  if (receipt === undefined) { throw new Error("b6.original-receipt-missing"); }
  const canonical = host.authority.read();
  equal(await host.authority.publish(receipt.request), receipt, "b6.authority-replay");
  equal(host.authority.read(), canonical, "b6.authority-replay-moved-head");
  const changed = { ...receipt.request, candidate: { ...receipt.request.candidate, closureId: "different" } };
  const mismatch = await host.authority.publish(changed);
  expect(mismatch.status === "refused" && mismatch.reason === "attempt-payload-mismatch", "b6.owner-full-candidate-binding");
  expect((await host.authority.lookup(changed)).status === "unknown", "b6.owner-full-candidate-binding");
};
const racing: Case = async ({ host, start }) => {
  host.prepareAfter("B", "race-B"); host.prepareAfter("C", "race-C");
  const first = start("B"); const second = start("C");
  await host.entered("race-B"); await host.entered("race-C");
  host.resume("race-B");
  await until(() => first.inspect().publication.status === "committed", "b6.race-winner");
  host.resume("race-C");
  await first.completion; const losing = await second.completion;
  expect(losing.publication.status === "rejected" && losing.publication.receipt.reason === "head-conflict", "b6.canonical-race-decision");
  expect(host.alive("B") && !host.alive("C") && host.releases("C") === 1, "b6.racing-candidate-cleanup");
  expect(host.registered() === "B" && host.foreignIntact(), "b6.racing-registration-identity");
  await view(host, "B:SEED");
};
const cleanupDebt: Case = async ({ host, start }) => {
  host.failCleanup("A", true);
  const update = start("B");
  const original = await update.completion;
  const cleanup = original.predecessorLifetime?.cleanup.original;
  expect(cleanup?.status === "settled" && !cleanup.report.complete && cleanup.report.debts.length === 1, "b6.original-cleanup-debt");
  expect(host.alive("A") && host.alive("B"), "b6.cleanup-debt-retention");
  await view(host, "B:SEED");
  const refused = host.runtime.startUpdate({ attemptId: "attempt/C", candidate: candidate("C") });
  expect(refused.status === "refused" && refused.reason === "retention-capacity", "b6.cleanup-debt-budget");
  host.failCleanup("A", false);
  await update.retryCleanup();
  const again = await update.completion;
  const afterRetry = update.inspect().predecessorLifetime?.cleanup.original;
  expect(again === original && afterRetry?.status === "settled" && !afterRetry.report.complete && afterRetry.report.debts.length === 1, "b6.original-cleanup-debt");
  expect(!host.alive("A") && host.registered() === "B" && host.foreignIntact(), "b6.registration-identity");
  await start("C").completion; await view(host, "C:seed!");
};
const retention: Case = async ({ host, start }) => {
  const previous = host.runtime.invoke({ kind: "held-view", barrier: "retention" });
  await host.entered("retention");
  const update = start("B");
  await until(() => update.inspect().publication.status === "committed", "b6.retention-publication");
  const refused = host.runtime.startUpdate({ attemptId: "attempt/C", candidate: candidate("C") });
  expect(refused.status === "refused" && refused.reason === "retention-capacity", "b6.work-retention-budget");
  host.resume("retention"); await previous; await update.completion;
  await start("C").completion; await view(host, "C:seed!");
};

const cases: Readonly<Record<string, Case>> = {
  "normal-update": normal, "selection-race": selectionRace, "reentrant-close": reentrantClose, "held-cohort": heldCohort,
  "receiver-fence": receiverFence, "revoked-grant": revokedGrant,
  "lost-publication": lostPublication, "late-publication": latePublication, "unknown-superseded": unknownSuperseded,
  "failed-preparation": failedPreparation, "late-preparation": latePreparation, "unsupported-contract": unsupported,
  "state-basis-change": basisChange(host => { host.authority.write("A", 0, "changed-before-mutation"); }),
  "schema-basis-change": basisChange(host => { host.authority.schema("schema/2"); }),
  "grant-basis-change": basisChange(host => { host.authority.grant(false); }),
  "attempt-replay": replay, "racing-updates": racing, "cleanup-debt": cleanupDebt, "retention-capacity": retention,
  "registration-identity": registrationIdentity, "abandoned-waiter": abandonedWaiter,
  "incompatible-state": incompatibleState, "unknown-closure": unknownClosure,
  "multiple-delayed-attempts": multipleDelayed, "receipt-capacity": receiptCapacity,
  "pending-receipt-capacity": pendingReceiptCapacity, "attempt-capacity": attemptCapacity,
};
export async function runHostCase(factory: HostFactory, name: string, faults: Faults = {}): Promise<void> {
  const scenario = cases[name];
  if (scenario === undefined) { throw new Error("unknown qualification case: " + name); }
  await using(factory, name, scenario, faults);
}
export async function runHostCases(factory: HostFactory): Promise<readonly { readonly name: string; readonly outcome: "passed" }[]> {
  const rows: { name: string; outcome: "passed" }[] = [];
  const smokeSteps = await qualifyComposition();
  expect(smokeSteps === 3, "b6.actual-gm-conformance");
  rows.push({ name: "actual-gm-conformance", outcome: "passed" });
  for (const name of Object.keys(cases)) { await runHostCase(factory, name); rows.push({ name, outcome: "passed" }); }
  await independentDomains(factory);
  rows.push({ name: "independent-domains-both-orders", outcome: "passed" });
  return rows;
}

async function registrationIdentity({ host, start }: Scenario): Promise<void> {
  const pending = host.runtime.invoke({ kind: "held-view", barrier: "registered-A" });
  await host.entered("registered-A");
  const update = start("B");
  await until(() => update.inspect().publication.status === "committed", "b6.registration-publication");
  await view(host, "B:SEED");
  host.resume("registered-A"); await pending; await update.completion;
  const actual = returned(await host.runtime.invoke({ kind: "view" }), "b6.registration-identity");
  expect(actual.kind === "view" && actual.text === "B:SEED" && host.registered() === "B" && host.foreignIntact(), "b6.registration-identity");
}
async function abandonedWaiter({ host, start }: Scenario): Promise<void> {
  const work = host.runtime.invoke({ kind: "held-view", barrier: "abandoned" });
  await host.entered("abandoned");
  const observation = await Promise.race([work.then(() => "returned"), Promise.resolve("caller-stopped-waiting")]);
  expect(observation === "caller-stopped-waiting", "b6.separate-observer");
  const update = start("B");
  await until(() => update.inspect().publication.status === "committed", "b6.abandoned-publication");
  await view(host, "B:SEED");
  expect(host.alive("A") && host.releases("A") === 0, "b6.abandoned-owned-work");
  host.resume("abandoned");
  const actual = returned(await work, "b6.abandoned-owned-work");
  expect(actual.kind === "view" && actual.text === "A:seed", "b6.abandoned-owned-work");
  await update.completion;
  expect(host.releases("A") === 1, "b6.abandoned-original-cleanup");
}
async function incompatibleState({ host, start }: Scenario): Promise<void> {
  host.authority.schema("schema/2");
  const result = await start("B").completion;
  expect(result.planning.status === "refused" && result.planning.reason === "unsupported-state"
    && result.preparation.status === "not-started" && !host.alive("B"), "b6.incompatible-state-before-evaluation");
  const effect = returned(await host.runtime.invoke({ kind: "edit", expected: 0, text: "wrong-schema" }), "b6.schema-receiver");
  equal(effect, { kind: "effect", effect: { status: "refused", reason: "schema-conflict" } }, "b6.schema-receiver");
}
async function unknownClosure({ host, handles }: Scenario): Promise<void> {
  const update = track(handles, host.runtime.startUpdate({ attemptId: "wrong-closure", candidate: { ...candidate("B"), closureId: "unmapped-bytes" } }));
  const result = await update.completion;
  expect(result.planning.status === "refused" && result.planning.reason === "unknown-fixture-closure"
    && result.preparation.status === "not-started" && !host.alive("B"), "b6.exact-fixture-catalog");
}
async function multipleDelayed({ host, start }: Scenario): Promise<void> {
  host.authority.publicationMode("delayed");
  const first = start("B"); const second = start("C");
  await until(() => first.inspect().publication.status === "unknown" && second.inspect().publication.status === "unknown", "b6.two-original-requests");
  host.authority.finishPending();
  await first.reconcile(); await second.reconcile();
  const left = await first.completion; const right = await second.completion;
  expect(left.publication.status === "committed" && right.publication.status === "rejected", "b6.original-request-custody");
  expect(host.authority.receipts().length === 2 && host.authority.publicationCalls() === 2, "b6.original-request-custody");
  await view(host, "B:SEED");
}
async function independentDomains(factory: HostFactory): Promise<void> {
  for (const order of [0, 1]) {
    const first = await factory({ domain: "independent-first/" + String(sequence++), retained: 1 });
    const firstHandles: UpdateHandle[] = [];
    let second: NativeHost;
    try { second = await factory({ domain: "independent-second/" + String(sequence++), retained: 1 }); }
    catch (cause) {
      try { await first.dispose(firstHandles); }
      catch (cleanup) { throw new AggregateError([cause, cleanup], "second Host construction failed", { cause: cleanup }); }
      throw cause;
    }
    const secondHandles: UpdateHandle[] = [];
    const held = order === 0 ? first : second;
    const heldHandles = order === 0 ? firstHandles : secondHandles;
    const free = order === 0 ? second : first;
    const freeHandles = order === 0 ? secondHandles : firstHandles;
    try {
      const work = held.runtime.invoke({ kind: "held-view", barrier: "independent" });
      await held.entered("independent");
      const heldUpdate = track(heldHandles, held.runtime.startUpdate({ attemptId: "same-attempt", candidate: candidate("B") }));
      await until(() => heldUpdate.inspect().publication.status === "committed", "b6.independent-held");
      const freeUpdate = track(freeHandles, free.runtime.startUpdate({ attemptId: "same-attempt", candidate: candidate("B") }));
      await freeUpdate.completion;
      await track(freeHandles, free.runtime.startUpdate({ attemptId: "next", candidate: candidate("C") })).completion;
      await view(free, "C:seed!"); await view(held, "B:SEED");
      expect(held.alive("A") && !free.alive("A"), "b6.independent-domain-ownership");
      held.resume("independent"); await work; await heldUpdate.completion;
    } catch (cause) {
      const settled = await Promise.allSettled([first.dispose(firstHandles), second.dispose(secondHandles)]);
      const cleanup = settled.filter(value => value.status === "rejected").map((value): unknown => value.reason);
      if (cleanup.length > 0) { throw new AggregateError([cause, ...cleanup], cause instanceof Error ? cause.message : "independent domains failed", { cause }); }
      throw cause;
    }
    const settled = await Promise.allSettled([first.dispose(firstHandles), second.dispose(secondHandles)]);
    const cleanup = settled.filter(value => value.status === "rejected").map((value): unknown => value.reason);
    if (cleanup.length > 0) { throw new AggregateError(cleanup, "independent domain cleanup failed"); }
  }
}

async function receiptCapacity({ host }: Scenario): Promise<void> {
  const baseline = host.authority.read();
  const requests = Array.from({ length: 32 }, (_, index) => ({ domainId: baseline.domainId, attemptId: "rejected/" + String(index),
    candidate: candidate("B"), expectedHead: baseline.head, basis: "stale" }));
  for (const request of requests) {
    expect((await host.authority.publish(request)).status === "rejected", "b6.receipt-budget-setup");
  }
  const first = requests[0];
  if (first === undefined) { throw new Error("b6.receipt-budget-setup"); }
  const overflow = await host.authority.publish({ ...first, attemptId: "overflow" });
  expect(overflow.status === "refused" && overflow.reason === "receipt-capacity", "b6.receipt-capacity");
  host.authority.publicationMode("delayed");
  expect((await host.authority.publish(first)).status === "rejected", "b6.terminal-replay-preserved");
  expect((await host.authority.lookup(first)).status === "known", "b6.terminal-receipt-preserved");
  expect(host.authority.receipts().length === 32, "b6.receipt-capacity");
  equal(host.authority.read(), baseline, "b6.receipt-budget-moved-head");
}
async function pendingReceiptCapacity({ host }: Scenario): Promise<void> {
  const baseline = host.authority.read();
  const requests = Array.from({ length: 32 }, (_, index) => ({ domainId: baseline.domainId, attemptId: "reserved/" + String(index),
    candidate: candidate("B"), expectedHead: baseline.head, basis: index < 16 ? "stale" : baseline.basis }));
  for (const request of requests.slice(0, 16)) {
    expect((await host.authority.publish(request)).status === "rejected", "b6.pending-budget-history-setup");
  }
  host.authority.publicationMode("delayed");
  for (const request of requests.slice(16)) { expect((await host.authority.publish(request)).status === "unknown", "b6.pending-budget-setup"); }
  const first = requests[16];
  if (first === undefined) { throw new Error("b6.pending-budget-setup"); }
  expect((await host.authority.publish(first)).status === "unknown", "b6.pending-replay-identity");
  const mismatch = await host.authority.publish({ ...first, candidate: { ...first.candidate, closureId: "changed" } });
  expect(mismatch.status === "refused" && mismatch.reason === "attempt-payload-mismatch", "b6.pending-replay-binding");
  const overflow = await host.authority.publish({ ...first, attemptId: "overflow" });
  expect(overflow.status === "refused" && overflow.reason === "receipt-capacity", "b6.pending-receipt-capacity");
  host.authority.finishPending();
  expect(host.authority.receipts().length === 32, "b6.pending-receipt-custody");
  for (const request of requests) { expect((await host.authority.lookup(request)).status === "known", "b6.pending-receipt-custody"); }
}
async function attemptCapacity({ host, handles }: Scenario): Promise<void> {
  const requests: UpdateRequest[] = Array.from({ length: 32 }, (_, index) => ({ attemptId: "unsupported/" + String(index),
    candidate: { ...candidate("generation/" + String(index)), contract: { id: "document-operation", revision: "2" } } }));
  for (const request of requests) {
    const update = track(handles, host.runtime.startUpdate(request));
    expect((await update.completion).planning.status === "refused", "b6.attempt-budget-setup");
  }
  const overflow = host.runtime.startUpdate({ attemptId: "overflow", candidate: candidate("B") });
  expect(overflow.status === "refused" && overflow.reason === "attempt-capacity", "b6.attempt-capacity");
  const first = requests[0];
  if (first === undefined) { throw new Error("b6.attempt-budget-setup"); }
  const replayed = host.runtime.startUpdate(first);
  expect(replayed.status === "replayed" && replayed.handle === handles[0], "b6.attempt-budget-replay");
  expect(host.authority.publicationCalls() === 0 && !host.alive("B"), "b6.attempt-budget-no-evaluation");
}

async function reentrantClose({ host }: Scenario): Promise<void> {
  const closes: Promise<CloseSnapshot>[] = [];
  host.onNextUse(() => {
    closes.push(host.runtime.close());
    expect(host.alive("A"), "b6.reentrant-native-custody");
  });
  const work = host.runtime.invoke({ kind: "nested", barrier: "reentrant-held" });
  await host.entered("reentrant-held");
  await turns();
  expect(host.alive("A") && host.releases("A") === 0, "b6.reentrant-native-custody");
  host.resume("reentrant-held");
  const actual = returned(await work, "b6.reentrant-call-result");
  expect(actual.kind === "view" && actual.text === "A:seed" && closes.length === 1, "b6.reentrant-call-result");
  const closing = closes[0];
  if (closing === undefined) { throw new Error("b6.reentrant-close-not-observed"); }
  expect((await closing).complete && host.releases("A") === 1, "b6.reentrant-original-cleanup");
}
