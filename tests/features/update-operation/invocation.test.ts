import assert from "node:assert/strict";
import test from "node:test";
import { createScope } from "@get-modular/resources";
import { createInvocationBoundary } from "../../../src/features/update-operation/application/invocation.ts";
import type { Head } from "../../../src/features/update-operation/application/models.ts";
import type { BoundInvocation, InvocationOutcome } from "../../../src/features/update-operation/application/ports/invocation.ts";
import type { CleanupReport, GenerationControl, GenerationReservation } from "../../../src/features/update-operation/application/ports/lifetime.ts";

const complete = (): CleanupReport => ({ complete: true, settled: true, debts: [] });

function control<Args extends readonly unknown[], Result>(reservation: GenerationReservation<Args, Result>) {
  if (reservation.status !== "reserved") { throw new Error(reservation.reason); }
  return reservation.control;
}

function value<Result>(outcome: InvocationOutcome<Result>): Result {
  if (outcome.status !== "returned") { throw new Error("expected admitted result"); }
  return outcome.value;
}

await test("one generation provides useful work, preserves borrowed state and owns exact native cleanup", async () => {
  const state = { count: 0 };
  const target = new EventTarget();
  let ownedEvents = 0;
  let foreignEvents = 0;
  let released = false;
  const foreign = () => { foreignEvents += 1; };
  target.addEventListener("increment", foreign);
  const scope = createScope({ name: "initial-A" });
  await scope.resources.setup({ name: "owned-listener", setup: () => {
    const listener = () => { ownedEvents += 1; };
    target.addEventListener("increment", listener);
    return listener;
  }, cleanup: (listener) => { released = true; target.removeEventListener("increment", listener); } });
  const boundary = createInvocationBoundary<readonly [number], number>({
    readCanonicalHead: () => ({ generationId: "A", revision: "head/initial" }), maxActiveWork: 16, maxGenerationIdentities: 33,
  });
  let native: Promise<CleanupReport> | undefined;
  const generation = control(boundary.attachGeneration({ generationId: "A", invoke: (_context, by) => {
    assert.equal(released, false);
    state.count += by;
    target.dispatchEvent(new Event("increment"));
    return state.count;
  }, release: () => { native = scope.control.close(); return native; } }));
  try {
    const outcome = await boundary.invoke(3);
    assert.deepEqual(outcome, { status: "returned", generationId: "A", value: 3 });
    assert.equal(state.count, 3);
    assert.equal(ownedEvents, 1);
    assert.equal(foreignEvents, 1);
    const close = generation.close();
    assert.equal(generation.close(), close);
    assert.equal((await close).complete, true);
    assert.equal(generation.originalCleanup(), native);
    assert.deepEqual(await boundary.invoke(4), { status: "refused", reason: "admission-closed" });
    assert.equal(state.count, 3);
    target.dispatchEvent(new Event("increment"));
    assert.equal(ownedEvents, 1);
    assert.equal(foreignEvents, 2);
    assert.deepEqual(generation.forget(), { status: "forgotten" });
    assert.equal(boundary.generations().length, 0);
    assert.equal(boundary.hasGenerationIdentity("A"), true);
    assert.deepEqual(boundary.reserveGeneration({ generationId: "A", release: async () => complete() }), { status: "refused", reason: "generation-reused" });
    assert.equal(generation.snapshot().retained, false);
    assert.equal(generation.close(), close);
  } finally { await generation.close(); target.removeEventListener("increment", foreign); }
});

await test("retained nested work stays A across await; conditional adoption cannot accidentally invoke B", async () => {
  let head: Head = { generationId: "A", revision: "r/A" };
  const boundary = createInvocationBoundary<readonly ["hold" | "read"], string>({ readCanonicalHead: () => head, maxActiveWork: 16, maxGenerationIdentities: 33 });
  const entered = Promise.withResolvers<void>();
  const resume = Promise.withResolvers<void>();
  const scopeA = createScope({ name: "affinity-A" });
  let releasedA = false;
  await scopeA.resources.setup({ name: "lifetime", setup: () => ({}), cleanup: () => { releasedA = true; } });
  let escaped: BoundInvocation<readonly ["hold" | "read"], string> | undefined;
  const nested: string[] = [];
  const a = control(boundary.attachGeneration({ generationId: "A", invoke: async (context, operation) => {
    assert.equal(releasedA, false);
    if (operation === "read") { return "A"; }
    escaped = context;
    nested.push(value(await context.invoke("read")));
    entered.resolve();
    await resume.promise;
    await scopeA.resources.setup({ name: "late-valid-acquisition", setup: () => ({}), cleanup: () => {} });
    nested.push(value(await context.invoke("read")));
    return "A";
  }, release: () => scopeA.control.close() }));
  let bCalls = 0;
  const b = control(boundary.attachGeneration({ generationId: "B", invoke: () => { bCalls += 1; return "B"; }, release: async () => complete() }));
  try {
    const retained = boundary.invoke("hold");
    await entered.promise;
    head = { generationId: "B", revision: "r/B" };
    const closeA = a.close();
    assert.deepEqual(await boundary.invokeExpected("A", "read"), { status: "refused", reason: "generation-changed" });
    assert.equal(bCalls, 0);
    assert.deepEqual(await boundary.invokeExpected("B", "read"), { status: "returned", generationId: "B", value: "B" });
    assert.equal(releasedA, false);
    assert.equal(a.originalCleanup(), undefined);
    resume.resolve();
    assert.equal(value(await retained), "A");
    assert.deepEqual(nested, ["A", "A"]);
    assert.equal((await closeA).complete, true);
    assert.ok(escaped);
    assert.deepEqual(await escaped.invoke("read"), { status: "refused", reason: "continuation-closed" });
  } finally { resume.resolve(); await Promise.all([a.close(), b.close()]); }
});

await test("observer abandonment cannot release raw work or a registered unawaited descendant", async () => {
  const entered = Promise.withResolvers<void>();
  const resume = Promise.withResolvers<void>();
  const abandoned = Promise.withResolvers<"abandoned">();
  let released = false;
  let usefulEffects = 0;
  const boundary = createInvocationBoundary<readonly ["root" | "child"], number>({
    readCanonicalHead: () => ({ generationId: "A", revision: "r/A" }), maxActiveWork: 16, maxGenerationIdentities: 33,
  });
  const a = control(boundary.attachGeneration({ generationId: "A", invoke: async (context, operation) => {
    if (operation === "root") { void context.invoke("child"); return 0; }
    entered.resolve();
    await resume.promise;
    assert.equal(released, false);
    usefulEffects += 1;
    return usefulEffects;
  }, release: async () => { released = true; return complete(); } }));
  try {
    const raw = boundary.invoke("root");
    const observer = Promise.race([raw, abandoned.promise]);
    await entered.promise;
    abandoned.resolve("abandoned");
    const close = a.close();
    assert.equal(await observer, "abandoned");
    assert.equal(boundary.pending(), 2);
    assert.equal(released, false);
    assert.deepEqual(a.forget(), { status: "retained", reason: "work-pending" });
    resume.resolve();
    assert.equal(value(await raw), 0);
    assert.equal(usefulEffects, 1);
    assert.equal((await close).complete, true);
    assert.deepEqual(a.forget(), { status: "forgotten" });
  } finally { resume.resolve(); await a.close(); }
});

await test("reentrant close sees the reservation and does not deny an existing continuation", async () => {
  let close: Promise<CleanupReport> | undefined;
  const boundary = createInvocationBoundary<readonly ["root" | "child"], string>({
    readCanonicalHead: () => ({ generationId: "A", revision: "r/A" }), maxActiveWork: 16, maxGenerationIdentities: 33,
  });
  const a: GenerationControl<readonly ["root" | "child"], string> = control(boundary.attachGeneration({ generationId: "A", invoke: async (context, operation) => {
    if (operation === "child") { return "nested-A"; }
    assert.equal(boundary.pending(), 1);
    close = a.close();
    assert.equal(a.close(), close);
    assert.deepEqual(await boundary.invoke("child"), { status: "refused", reason: "admission-closed" });
    return value(await context.invoke("child"));
  }, release: async () => complete() }));
  assert.equal(value(await boundary.invoke("root")), "nested-A");
  assert.ok(close);
  assert.equal((await close).complete, true);
});

await test("work capacity includes root and descendants across generations and returns after actual completion", async () => {
  let head: Head = { generationId: "A", revision: "r/A" };
  const resume = Promise.withResolvers<void>();
  let calls = 0;
  const boundary = createInvocationBoundary<readonly ["root" | "child"], number>({ readCanonicalHead: () => head, maxActiveWork: 3, maxGenerationIdentities: 33 });
  const a = control(boundary.attachGeneration({ generationId: "A", invoke: async (context, operation) => {
    calls += 1;
    if (operation === "root") {
      void context.invoke("child");
      void context.invoke("child");
      assert.deepEqual(await context.invoke("child"), { status: "refused", reason: "work-capacity" });
    }
    await resume.promise;
    return calls;
  }, release: async () => complete() }));
  const b = control(boundary.attachGeneration({ generationId: "B", invoke: () => { calls += 1; return calls; }, release: async () => complete() }));
  try {
    const work = boundary.invoke("root");
    assert.equal(boundary.pending(), 3);
    head = { generationId: "B", revision: "r/B" };
    assert.deepEqual(await boundary.invoke("child"), { status: "refused", reason: "work-capacity" });
    assert.equal(calls, 3);
    resume.resolve();
    await work;
    assert.equal(boundary.pending(), 0);
    assert.equal(value(await boundary.invoke("child")), 4);
  } finally { resume.resolve(); await Promise.all([a.close(), b.close()]); }
});

await test("native debt is captured immutably, remains original across retry and cannot be mutated into release", async () => {
  const cause = new Error("first release failed");
  const nativeReport = { complete: false, settled: true, debts: [cause] };
  const originalNative = Promise.resolve(nativeReport);
  const retryResume = Promise.withResolvers<CleanupReport>();
  let closeCalls = 0;
  const boundary = createInvocationBoundary<readonly [], number>({
    readCanonicalHead: () => ({ generationId: "A", revision: "r/A" }), maxActiveWork: 16, maxGenerationIdentities: 33,
  });
  const a = control(boundary.attachGeneration({ generationId: "A", invoke: () => 1, release: () => {
    closeCalls += 1;
    return closeCalls === 1 ? originalNative : retryResume.promise;
  } }));
  const original = a.close();
  const report = await original;
  assert.equal(a.originalCleanup(), originalNative);
  assert.notEqual(report, nativeReport);
  assert.equal(report.debts[0], cause);
  assert.ok(Object.isFrozen(report) && Object.isFrozen(report.debts));
  nativeReport.complete = true;
  nativeReport.settled = false;
  nativeReport.debts.length = 0;
  assert.equal(report.complete, false);
  assert.equal(report.settled, true);
  assert.deepEqual(report.debts, [cause]);
  assert.deepEqual(a.forget(), { status: "retained", reason: "cleanup-incomplete" });
  assert.equal(a.close(), original);
  assert.equal(closeCalls, 1);
  const retry = a.retryCleanup();
  assert.equal(a.retryCleanup(), retry);
  retryResume.resolve(complete());
  assert.equal((await retry).complete, true);
  assert.equal(await original, report);
  assert.equal(report.complete, false);
  assert.deepEqual(a.forget(), { status: "forgotten" });
  assert.equal(a.snapshot().cleanup.original.status, "settled");
  assert.equal(a.snapshot().cleanup.retryCount, 1);
});

await test("reserved and late cleanup-only generations retain custody without ever admitting an entry", async () => {
  const boundary = createInvocationBoundary<readonly [], number>({
    readCanonicalHead: () => ({ generationId: "late", revision: "r/late" }), maxActiveWork: 16, maxGenerationIdentities: 2,
  });
  let nativeReleases = 0;
  const initial = control(boundary.reserveGeneration({ generationId: "initial", release: async () => { nativeReleases += 1; return complete(); } }));
  assert.equal(initial.snapshot().installed, false);
  boundary.seal();
  const late = control(boundary.reserveGeneration({ generationId: "late", release: async () => { nativeReleases += 1; return complete(); } }));
  assert.deepEqual(late.install(() => 1), { status: "refused", reason: "sealed" });
  assert.deepEqual(await boundary.invoke(), { status: "refused", reason: "boundary-closed" });
  await Promise.all([initial.close(), late.close()]);
  assert.equal(nativeReleases, 2);
  assert.deepEqual(late.forget(), { status: "forgotten" });
  assert.deepEqual(initial.forget(), { status: "forgotten" });
  assert.deepEqual(boundary.reserveGeneration({ generationId: "third", release: async () => complete() }), { status: "refused", reason: "generation-capacity" });
});

await test("selection failure is not provider failure; malformed native cleanup never authorizes forgetting", async () => {
  const selectionFailure = new Error("authority unavailable");
  let headFails = true;
  const boundary = createInvocationBoundary<readonly [], number>({ readCanonicalHead: () => {
    if (headFails) { throw selectionFailure; }
    return { generationId: "A", revision: "r/A" };
  }, maxActiveWork: 16, maxGenerationIdentities: 33 });
  const providerFailure = new Error("provider failed");
  const malformed = { complete: true, settled: false, debts: [] };
  const a = control(boundary.attachGeneration({ generationId: "A", invoke: () => { throw providerFailure; }, release: async () => malformed }));
  assert.deepEqual(await boundary.invoke(), { status: "refused", reason: "authority-unavailable", cause: selectionFailure });
  headFails = false;
  assert.deepEqual(await boundary.invoke(), { status: "failed", generationId: "A", cause: providerFailure });
  assert.equal(boundary.pending(), 0);
  await assert.rejects(a.close(), /invalid report/u);
  assert.deepEqual(a.forget(), { status: "retained", reason: "cleanup-incomplete" });
  assert.equal(a.snapshot().cleanup.original.status, "failed");
});

await test("an abandon-only native observation cannot authorize a concurrent second cleanup", async () => {
  const scope = createScope({ name: "bad-abandoning-owner" });
  const cleanupEntered = Promise.withResolvers<void>();
  const physicalRelease = Promise.withResolvers<void>();
  let released = false;
  let releaseCalls = 0;
  await scope.resources.setup({ name: "held-native-cleanup", setup: () => ({}), cleanup: async () => {
    cleanupEntered.resolve();
    await physicalRelease.promise;
    released = true;
  } });
  const abandon = new AbortController();
  abandon.abort();
  const boundary = createInvocationBoundary<readonly [], number>({
    readCanonicalHead: () => ({ generationId: "A", revision: "r/A" }), maxActiveWork: 16, maxGenerationIdentities: 33,
  });
  const a = control(boundary.attachGeneration({ generationId: "A", invoke: () => 1, release: () => {
    releaseCalls += 1;
    // Deliberately violate the port: return an observer snapshot, not the original flight.
    return scope.control.close({ abandon: abandon.signal });
  } }));
  try {
    assert.equal(value(await boundary.invoke()), 1);
    await assert.rejects(a.close(), /unsettled-observation/u);
    await cleanupEntered.promise;
    const original = a.snapshot().cleanup.original;
    assert.ok(original.status === "failed" && !original.retryable);
    await assert.rejects(a.retryCleanup(), /original native settlement/u);
    assert.equal(releaseCalls, 1);
    assert.equal(released, false);
    assert.deepEqual(a.forget(), { status: "retained", reason: "cleanup-incomplete" });
  } finally {
    physicalRelease.resolve();
    assert.equal((await scope.control.close()).complete, true);
  }
});

await test("an actually rejected original native close permits a separate retry and preserves its cause", async () => {
  const failure = new Error("native flight rejected");
  let releases = 0;
  const boundary = createInvocationBoundary<readonly [], number>({
    readCanonicalHead: () => ({ generationId: "A", revision: "r/A" }), maxActiveWork: 16, maxGenerationIdentities: 33,
  });
  const a = control(boundary.attachGeneration({ generationId: "A", invoke: () => 1, release: () => {
    releases += 1;
    return releases === 1 ? Promise.reject(failure) : Promise.resolve(complete());
  } }));
  const original = a.close();
  await assert.rejects(original, (cause) => cause === failure);
  const rejected = a.snapshot().cleanup.original;
  assert.ok(rejected.status === "failed" && rejected.retryable && rejected.cause === failure);
  assert.equal((await a.retryCleanup()).complete, true);
  assert.equal(releases, 2);
  await assert.rejects(original, (cause) => cause === failure);
  assert.deepEqual(a.forget(), { status: "forgotten" });
});
