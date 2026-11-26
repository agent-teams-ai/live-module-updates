import assert from "node:assert/strict";
import test from "node:test";
import { createResourcesPreparation } from "../../../src/features/update-operation/adapters/resources.ts";
import type { PreparationContext } from "../../../src/features/update-operation/application/ports/preparation.ts";

function context(): PreparationContext {
  return { domainId: "fixture-domain", request: { attemptId: "attempt-B", candidate: {
    generationId: "B", closureId: "closure-B", contract: { id: "counter", revision: "v1" }, profile: "cooperative-operation-v1",
  } }, baseline: { domainId: "fixture-domain", head: { generationId: "A", revision: "r/A" }, basis: "state/0+schema/1+grant/1" } };
}

await test("Resources open is inert; closed and reused owners cannot evaluate another preparation", async () => {
  let evaluations = 0;
  const preparation = createResourcesPreparation<readonly [], number>(() => {
    evaluations += 1;
    return { invoke: () => 7 };
  });
  const closed = preparation.open(context());
  assert.equal(evaluations, 0);
  assert.equal((await closed.close()).complete, true);
  assert.throws(() => closed.prepare(), /already closed/u);
  assert.equal(evaluations, 0);
  const owner = preparation.open(context());
  try {
    const prepared = await owner.prepare();
    assert.equal(evaluations, 1);
    assert.equal(typeof prepared.invoke, "function");
    assert.throws(() => owner.prepare(), /already been used/u);
  } finally { await owner.close(); }
});

await test("partial preparation failure releases its native resources and preserves borrowed state and foreign registration", async () => {
  const target = new EventTarget();
  const state = { count: 3 };
  let ownEvents = 0;
  let foreignEvents = 0;
  const foreign = () => { foreignEvents += 1; };
  target.addEventListener("pulse", foreign);
  const failure = new Error("composition failed after acquisition");
  const preparation = createResourcesPreparation<readonly [], number>(async (_context, resources) => {
    await resources.setup({ name: "listener", setup: () => {
      const listener = () => { ownEvents += 1; };
      target.addEventListener("pulse", listener);
      return listener;
    }, cleanup: (listener) => { target.removeEventListener("pulse", listener); } });
    target.dispatchEvent(new Event("pulse"));
    throw failure;
  });
  const owner = preparation.open(context());
  try {
    await assert.rejects(async () => owner.prepare(), (cause) => cause === failure);
    assert.equal(ownEvents, 1);
    assert.equal((await owner.close()).complete, true);
    target.dispatchEvent(new Event("pulse"));
    assert.equal(ownEvents, 1);
    assert.equal(foreignEvents, 2);
    assert.equal(state.count, 3);
  } finally { await owner.close(); target.removeEventListener("pulse", foreign); }
});

await test("the real native scope retains late acquisition and preserves its actual close flight", async () => {
  const entered = Promise.withResolvers<void>();
  const acquire = Promise.withResolvers<{ active: boolean }>();
  let released = false;
  const preparation = createResourcesPreparation<readonly [], number>(async (_context, resources) => {
    const resource = await resources.setup({ name: "late-acquisition", setup: async () => {
      entered.resolve(); return acquire.promise;
    }, cleanup: (value) => { value.active = false; released = true; } });
    return { invoke: () => resource.active ? 1 : 0 };
  });
  const owner = preparation.open(context());
  const preparing = Promise.resolve(owner.prepare());
  await entered.promise;
  const close = owner.close();
  assert.equal(owner.close(), close);
  assert.equal(released, false);
  acquire.resolve({ active: true });
  await assert.rejects(preparing, (cause) => typeof cause === "object" && cause !== null && "code" in cause && cause.code === "resources.scope.closed");
  assert.equal((await close).complete, true);
  assert.equal(released, true);
});
