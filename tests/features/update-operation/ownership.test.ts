import assert from "node:assert/strict";
import test from "node:test";
import { createScope, type Resources } from "@get-modular/resources";
import {
  createUpdateRuntime, type CleanupReport, type PreparationCustody, type PreparationPort,
} from "../../../src/index.ts";
import { createOperationAuthority } from "./operation-authority.ts";
import { description, recoveryHost, updateRequest } from "./recovery-fixture.ts";

function runtimeWithOwner(release: () => Promise<CleanupReport>, preparation: PreparationPort<readonly [], string>) {
  const state = createOperationAuthority();
  return createUpdateRuntime<readonly [], string>({
    domainId: "document", authority: state.authority,
    initial: { candidate: description("A"), invoke: () => "A", release },
    compatibility: { check: () => ({ status: "compatible" }) }, preparation,
    limits: { maxAttempts: 32, maxCandidates: 2, maxRetainedPredecessors: 2, maxActiveWork: 16 },
  });
}

async function nativeListener(resources: Resources, beforeCleanup: () => void | Promise<void>) {
  const target = new EventTarget();
  let delivered = 0;
  let cleanupCalls = 0;
  const listener = (): void => { delivered += 1; };
  await resources.setup({ name: "actual-owned-listener", setup: () => {
    target.addEventListener("pulse", listener); return listener;
  }, cleanup: async owned => {
    cleanupCalls += 1;
    await beforeCleanup();
    target.removeEventListener("pulse", owned);
  } });
  return {
    pulse: () => { const before = delivered; target.dispatchEvent(new Event("pulse")); return delivered - before; },
    cleanupCalls: () => cleanupCalls,
  };
}

await test("current ownership follows actual work and explicit native recovery without rewriting original close", async () => {
  const host = await recoveryHost({ failCleanup: new Set(["A"]) });
  const resume = Promise.withResolvers<void>();
  try {
    assert.equal(host.runtime.inspect().ownershipReleased, false);
    const held = host.runtime.invoke({ held: resume.promise, nested: true });
    const closing = host.runtime.close();
    assert.equal(host.runtime.inspect().closed, true);
    assert.equal(host.runtime.inspect().ownershipReleased, false);
    assert.equal(host.runtime.inspect().generations[0]?.pendingWork, 1);
    assert.deepEqual(await host.runtime.invoke(), { status: "refused", reason: "boundary-closed" });
    resume.resolve();
    assert.equal((await held).status, "returned");
    const original = await closing;
    assert.equal(original.complete, false);
    assert.equal(original.snapshot.ownershipReleased, false);
    assert.ok(host.present.has("A"));
    const recovered = await host.runtime.retryCleanup();
    assert.equal(recovered.ownershipReleased, true);
    assert.equal(host.present.size, 0);
    assert.equal(host.cleanupCalls.get("A"), 2);
    assert.equal(host.runtime.close(), closing);
    assert.equal(await closing, original);
    assert.equal(original.snapshot.ownershipReleased, false);
    assert.equal(original.complete, false);
  } finally { resume.resolve(); await host.runtime.close(); await host.runtime.retryCleanup(); }
});

await test("unregistered custody retains real native debt even after every registered generation is forgotten", async () => {
  const initial = createScope({ name: "initial-native-owner" });
  const unregistered = createScope({ name: "pre-owned-malformed-boundary" });
  const registrationFailure = new Error("malformed owner accessor before registration");
  let failCleanup = true;
  let closeReads = 0;
  let preparations = 0;
  const native = await nativeListener(unregistered.resources, () => {
    if (failCleanup) { throw new Error("actual retained listener cleanup debt"); }
  });
  // A deliberately malformed owner returns already-owned native custody. The
  // fallback must retain it even though no candidate implementation can run.
  const custody: PreparationCustody<readonly [], string> = {
    prepare: () => { preparations += 1; return { invoke: () => "B" }; },
    get close(): () => Promise<CleanupReport> {
      closeReads += 1;
      if (closeReads === 1) { throw registrationFailure; }
      return () => unregistered.control.close();
    },
  };
  const runtime = runtimeWithOwner(() => initial.control.close(), { open: () => custody });
  try {
    const start = runtime.startUpdate(updateRequest("B"));
    assert.equal(start.status, "started");
    const operation = await start.handle.completion;
    assert.equal(preparations, 0);
    assert.equal(operation.preparation.status, "failed");
    assert.equal(operation.preparation.cause, registrationFailure);
    assert.equal(operation.candidateLifetime, undefined);
    assert.equal(operation.unregisteredCleanup?.original.status, "settled");
    assert.ok(operation.holds.includes("cleanup"));
    const closing = runtime.close();
    const original = await closing;
    assert.equal(original.complete, false);
    assert.equal(original.snapshot.generations.length, 0);
    assert.equal(original.snapshot.ownershipReleased, false);
    assert.equal(native.pulse(), 1);
    assert.equal(native.cleanupCalls(), 1);
    failCleanup = false;
    const recovered = await runtime.retryCleanup();
    assert.equal(recovered.ownershipReleased, true);
    assert.equal(native.pulse(), 0);
    assert.equal(native.cleanupCalls(), 2);
    assert.equal(runtime.close(), closing);
    assert.equal(await closing, original);
    assert.equal(original.complete, false);
    assert.equal(original.snapshot.ownershipReleased, false);
    assert.equal(await start.handle.completion, operation);
    assert.ok(operation.holds.includes("cleanup"));
  } finally {
    failCleanup = false;
    await runtime.close(); await runtime.retryCleanup();
    await unregistered.control.close(); await initial.control.close();
  }
});

await test("an abandon-only owner observation cannot release custody or authorize retry even after external physical completion", async () => {
  const scope = createScope({ name: "abandoning-initial-owner" });
  const entered = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  const native = await nativeListener(scope.resources, async () => { entered.resolve(); await release.promise; });
  const abandon = new AbortController();
  abandon.abort();
  let ownerCalls = 0;
  const runtime = runtimeWithOwner(() => {
    ownerCalls += 1;
    // Deliberate port violation: observer abandonment is not original settlement.
    return scope.control.close({ abandon: abandon.signal });
  }, { open: () => { throw new Error("this initial-owner case never prepares a candidate"); } });
  try {
    const closing = runtime.close();
    const original = await closing;
    await entered.promise;
    assert.equal(original.complete, false);
    assert.equal(original.snapshot.ownershipReleased, false);
    const invalid = original.snapshot.generations[0]?.cleanup.original;
    assert.ok(invalid?.status === "failed" && !invalid.retryable);
    assert.equal(native.pulse(), 1);
    assert.equal((await runtime.retryCleanup()).ownershipReleased, false);
    assert.equal(ownerCalls, 1);
    release.resolve();
    assert.equal((await scope.control.close()).complete, true);
    assert.equal(native.pulse(), 0);
    assert.equal((await runtime.retryCleanup()).ownershipReleased, false);
    assert.equal(runtime.inspect().generations.length, 1);
    assert.equal(ownerCalls, 1);
    assert.equal(native.cleanupCalls(), 1);
    assert.equal(runtime.close(), closing);
    assert.equal(await closing, original);
    assert.equal(original.snapshot.ownershipReleased, false);
  } finally { release.resolve(); await scope.control.close(); await runtime.close(); }
});
