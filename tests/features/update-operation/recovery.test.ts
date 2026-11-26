import assert from "node:assert/strict";
import { setImmediate as turn } from "node:timers/promises";
import test from "node:test";
import { createScope } from "@get-modular/resources";
import { createResourcesPreparation } from "../../../src/features/update-operation/adapters/resources.ts";
import { createUpdateRuntime } from "../../../src/features/update-operation/composition/create-update-runtime.ts";
import type { PublicationRequest, PublicationResult } from "../../../src/features/update-operation/application/models.ts";
import { createOperationAuthority } from "./operation-authority.ts";
import { description, recoveryHost, updateRequest } from "./recovery-fixture.ts";

await test("a throwing fulfilled acknowledgement stays unknown and keeps real B custody", async () => {
  const failure = new Error("Transport receipt getter failed after native commit");
  let accessed = 0;
  const host = await recoveryHost({ publish: (_request, commit) => {
    const actual = commit();
    assert.equal(actual.status, "committed");
    const response: PublicationResult = {
      status: "committed", previousHead: actual.previousHead, head: actual.head,
      get request(): PublicationRequest { accessed += 1; throw failure; },
    };
    return Promise.resolve(response);
  } });
  try {
    const update = host.start("B");
    await turn();
    const unknown = update.inspect();
    assert.equal(unknown.publication.status, "unknown");
    assert.equal(unknown.publication.cause, failure);
    assert.equal(unknown.settled, false);
    assert.equal(accessed, 1);
    assert.deepEqual(host.present, new Set(["A", "B"]));
    const useful = await host.runtime.invoke();
    assert.equal(useful.status, "returned");
    assert.equal(useful.generationId, "B");
    await update.reconcile();
    const resolved = await update.completion;
    assert.equal(resolved.publication.status, "committed");
    assert.equal(resolved.adoption.status, "observed");
    assert.deepEqual(host.present, new Set(["B"]));
    assert.deepEqual(host.evaluations, ["B"]);
  } finally { await host.runtime.close(); }
});

await test("initial cleanup debt is explicitly recoverable without an update handle", async () => {
  const host = await recoveryHost({ failCleanup: new Set(["A"]) });
  const originalPromise = host.runtime.close();
  const original = await originalPromise;
  assert.equal(original.complete, false);
  assert.equal(original.snapshot.attempts.length, 0);
  assert.ok(host.present.has("A"));
  const afterRetry = await host.runtime.retryCleanup();
  assert.equal(afterRetry.generations.length, 0);
  assert.equal(host.present.size, 0);
  assert.equal(host.cleanupCalls.get("A"), 2);
  assert.equal(host.runtime.close(), originalPromise);
  assert.equal(await originalPromise, original);
  assert.equal(original.complete, false);
  assert.deepEqual(host.runtime.startUpdate(updateRequest("B")), { status: "refused", reason: "closed" });
});

await test("a failed constructor leaves the real initial owner with its caller", async () => {
  const state = createOperationAuthority();
  const scope = createScope({ name: "caller-owned-initial" });
  let released = false;
  let nativeCalls = 0;
  await scope.resources.setup({ name: "initial native handle", setup: () => "native", cleanup: () => { released = true; } });
  const initial = {
    candidate: description("wrong-generation"), scope,
    invoke: () => "A",
    release() { nativeCalls += 1; return this.scope.control.close(); },
  };
  try {
    assert.throws(() => createUpdateRuntime<readonly [], string>({
      domainId: "document", initial, authority: state.authority,
      compatibility: { check: () => ({ status: "compatible" }) },
      preparation: createResourcesPreparation(() => { throw new Error("Must not prepare during construction"); }),
      limits: { maxAttempts: 32, maxCandidates: 2, maxRetainedPredecessors: 2, maxActiveWork: 16 },
    }), /Initial generation must match/);
    assert.equal(nativeCalls, 0);
    assert.equal(released, false);
  } finally { await initial.release(); }
  assert.equal(nativeCalls, 1);
  assert.equal(released, true);
});
