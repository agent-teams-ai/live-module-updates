import assert from "node:assert/strict";
import test from "node:test";
import type { ModuleEntry, PreparedGeneration } from "../../../src/index.ts";
import { recoveryHost, type RecoveryArgs } from "./recovery-fixture.ts";

interface ReceiverEntry {
  readonly original: PreparedGeneration<RecoveryArgs, string>;
  invoke: ModuleEntry<RecoveryArgs, string>;
}

await test("candidate installation captures the original invoke method and its receiver", async () => {
  const returned: ReceiverEntry[] = [];
  const host = await recoveryHost({ prepare: async (_context, _resources, normal) => {
    const prepared: ReceiverEntry = {
      original: await normal(),
      invoke(context, ...args) {
        assert.equal(this, prepared, "the valid prepared method lost its original receiver");
        return this.original.invoke(context, ...args);
      },
    };
    returned.push(prepared);
    return prepared;
  } });
  try {
    const update = await host.start("B").completion;
    assert.equal(update.publication.status, "committed");
    assert.equal(update.adoption.status, "observed");
    assert.deepEqual(await host.runtime.invoke(), { status: "returned", generationId: "B", value: "B" });
    const prepared = returned[0];
    assert.ok(prepared);
    prepared.invoke = () => "replacement property must not be installed";
    assert.deepEqual(await host.runtime.invoke(), { status: "returned", generationId: "B", value: "B" });
    assert.equal((await host.runtime.close()).complete, true);
    assert.equal(host.runtime.inspect().ownershipReleased, true);
    assert.deepEqual(host.present, new Set());
    assert.equal(host.cleanupCalls.get("A"), 1);
    assert.equal(host.cleanupCalls.get("B"), 1);
  } finally { await host.runtime.close(); }
});

await test("a malformed prepared entry retains and closes its real acquired owner before publication", async () => {
  const host = await recoveryHost({ prepare: async (_context, _resources, normal) => {
    const prepared = await normal();
    // Model an invalid foreign JavaScript return without a declaration shim.
    Object.defineProperty(prepared, "invoke", { value: undefined });
    return prepared;
  } });
  try {
    const update = await host.start("B").completion;
    assert.equal(update.preparation.status, "failed");
    assert.match(String(update.preparation.cause), /Cannot install prepared generation: invalid-entry/u);
    assert.equal(update.publication.status, "not-requested");
    assert.deepEqual(host.present, new Set(["A"]));
    assert.equal(host.cleanupCalls.get("B"), 1);
    assert.deepEqual(await host.runtime.invoke(), { status: "returned", generationId: "A", value: "A" });
  } finally { await host.runtime.close(); }
});
