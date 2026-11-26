import assert from "node:assert/strict";
import { setImmediate as turn } from "node:timers/promises";
import test from "node:test";
import { recoveryHost, updateRequest } from "./recovery-fixture.ts";

await test("two candidates share one prospective predecessor reservation and the real authority decides their race", async () => {
  const release = Promise.withResolvers<void>();
  const bothReady = Promise.withResolvers<void>();
  let ready = 0;
  const host = await recoveryHost({
    limits: { maxRetainedPredecessors: 1 },
    prepare: async (_context, _resources, normal) => {
      const prepared = await normal();
      ready += 1;
      if (ready === 2) { bothReady.resolve(); }
      await release.promise;
      return prepared;
    },
  });
  try {
    const b = host.start("B");
    const c = host.start("C");
    await bothReady.promise;
    assert.deepEqual(host.runtime.inspect().reservedPredecessors, ["A"]);
    assert.deepEqual(host.runtime.startUpdate(updateRequest("D")), { status: "refused", reason: "candidate-capacity" });
    assert.deepEqual(host.evaluations, ["B", "C"]);
    release.resolve();
    const results = await Promise.all([b.completion, c.completion]);
    assert.deepEqual(results.map(value => value.publication.status).toSorted(), ["committed", "rejected"]);
    const loser = results.find(value => value.publication.status === "rejected");
    assert.ok(loser);
    assert.equal(loser.publication.status, "rejected");
    assert.equal(loser.publication.receipt.reason, "head-conflict");
    const winner = host.state.read().head.generationId;
    assert.deepEqual(host.present, new Set([winner]));
    assert.equal((await host.runtime.invoke()).status, "returned");
  } finally { release.resolve(); await host.runtime.close(); }
});

await test("failed attempts consume bounded immutable history without evaluating unsupported candidates", async () => {
  const host = await recoveryHost({ compatibility: { check: () => ({ status: "refused", reason: "unsupported-contract" }) } });
  try {
    assert.deepEqual(host.runtime.startUpdate(updateRequest("A")), { status: "refused", reason: "generation-reused" });
    const first = host.start("candidate-0");
    await first.completion;
    for (let index = 1; index < 32; index += 1) { await host.start(`candidate-${index}`).completion; }
    assert.deepEqual(host.runtime.startUpdate(updateRequest("overflow")), { status: "refused", reason: "attempt-capacity" });
    assert.equal(host.runtime.inspect().attempts.length, 32);
    assert.equal(host.runtime.inspect().candidates, 0);
    assert.deepEqual(host.evaluations, []);
    const replay = host.runtime.startUpdate(updateRequest("candidate-0"));
    assert.equal(replay.status, "replayed");
    assert.equal(replay.handle, first);
    assert.deepEqual(host.present, new Set(["A"]));
  } finally { await host.runtime.close(); }
});

await test("two retained cleanup debts refuse another update before acquisition and an explicit retry frees the budget", async () => {
  const host = await recoveryHost({ failCleanup: new Set(["A", "B"]) });
  try {
    const b = host.start("B");
    await b.completion;
    const c = host.start("C");
    await c.completion;
    assert.equal(host.runtime.inspect().retainedPredecessors, 2);
    assert.deepEqual(host.runtime.startUpdate(updateRequest("D")), { status: "refused", reason: "retention-capacity" });
    assert.deepEqual(host.evaluations, ["B", "C"]);
    assert.deepEqual(host.present, new Set(["A", "B", "C"]));
    await b.retryCleanup();
    assert.equal(host.runtime.inspect().retainedPredecessors, 1);
    const d = host.start("D");
    await d.completion;
    assert.equal(host.state.read().head.generationId, "D");
    await c.retryCleanup();
    assert.deepEqual(host.present, new Set(["D"]));
  } finally { await host.runtime.retryCleanup(); await host.runtime.close(); }
});

await test("failed candidate cleanup debt still consumes candidate custody capacity", async () => {
  const host = await recoveryHost({
    failCleanup: new Set(["B", "C"]),
    prepare: async (_context, _resources, normal) => { await normal(); throw new Error("Prepared resource then failed"); },
  });
  try {
    const b = host.start("B");
    await b.completion;
    const c = host.start("C");
    await c.completion;
    assert.equal(host.runtime.inspect().candidates, 2);
    assert.deepEqual(host.runtime.startUpdate(updateRequest("D")), { status: "refused", reason: "candidate-capacity" });
    await b.retryCleanup();
    assert.equal(host.runtime.inspect().candidates, 1);
    await host.start("D").completion;
    assert.deepEqual(host.evaluations, ["B", "C", "D"]);
    assert.equal(host.state.read().head.generationId, "A");
    await c.retryCleanup();
    assert.deepEqual(host.present, new Set(["A"]));
  } finally { await host.runtime.retryCleanup(); await host.runtime.close(); }
});

await test("sixteen held operations saturate the domain across a live generation change", async () => {
  const gates = Array.from({ length: 16 }, () => Promise.withResolvers<void>());
  const host = await recoveryHost();
  try {
    const calls = gates.map(gate => host.runtime.invoke({ held: gate.promise }));
    assert.deepEqual(await host.runtime.invoke(), { status: "refused", reason: "work-capacity" });
    const update = host.start("B");
    await turn();
    assert.equal(update.inspect().publication.status, "committed");
    assert.equal(update.inspect().adoption.status, "failed");
    assert.equal(update.inspect().settled, false);
    assert.ok(host.present.has("A"));
    const first = gates[0];
    assert.ok(first);
    first.resolve();
    const firstCall = calls[0];
    assert.ok(firstCall);
    await firstCall;
    const fresh = await host.runtime.invoke();
    assert.equal(fresh.status, "returned");
    assert.equal(fresh.generationId, "B");
    for (const gate of gates) { gate.resolve(); }
    const results = await Promise.all(calls);
    assert.ok(results.every(value => value.status === "returned" && value.generationId === "A"));
    await update.completion;
    assert.deepEqual(host.present, new Set(["B"]));
  } finally { for (const gate of gates) { gate.resolve(); } await host.runtime.close(); }
});

await test("abandoning an observer cannot release the raw admitted operation", async () => {
  const gate = Promise.withResolvers<void>();
  const host = await recoveryHost();
  try {
    const raw = host.runtime.invoke({ held: gate.promise, nested: true });
    assert.equal(await Promise.race([raw, Promise.resolve("observer left")]), "observer left");
    const update = host.start("B");
    await turn();
    assert.equal(update.inspect().adoption.status, "observed");
    assert.equal(update.inspect().settled, false);
    assert.ok(host.present.has("A"));
    gate.resolve();
    const result = await raw;
    assert.equal(result.status, "returned");
    assert.equal(result.generationId, "A");
    await update.completion;
    assert.deepEqual(host.present, new Set(["B"]));
  } finally { gate.resolve(); await host.runtime.close(); }
});

await test("one domain's native cleanup debt does not block another domain", async () => {
  const indebted = await recoveryHost({ domainId: "indebted", failCleanup: new Set(["A"]) });
  const independent = await recoveryHost({ domainId: "independent" });
  try {
    await indebted.start("B").completion;
    assert.ok(indebted.present.has("A"));
    await independent.start("B").completion;
    await independent.start("C").completion;
    assert.equal(independent.state.read().head.generationId, "C");
    assert.deepEqual(independent.present, new Set(["C"]));
    assert.ok(indebted.present.has("A"));
  } finally {
    await indebted.runtime.retryCleanup();
    await Promise.all([indebted.runtime.close(), independent.runtime.close()]);
  }
});
