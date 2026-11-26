import assert from "node:assert/strict";
import { setImmediate as turn } from "node:timers/promises";
import test from "node:test";
import { createScope } from "@get-modular/resources";
import { createUpdateRuntime, type UpdateRuntime } from "../../../src/features/update-operation/composition/create-update-runtime.ts";
import type { CloseSnapshot } from "../../../src/features/update-operation/application/models.ts";
import { createOperationAuthority } from "./operation-authority.ts";
import { description, recoveryHost, updateRequest } from "./recovery-fixture.ts";

await test("shutdown retains a late preparation and cleans its actual owner without publishing it", async () => {
  const entered = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  const host = await recoveryHost({ prepare: async (_context, _resources, normal) => {
    const prepared = await normal();
    entered.resolve();
    await release.promise;
    return prepared;
  } });
  try {
    const update = host.start("B");
    await entered.promise;
    const closing = host.runtime.close();
    let settled = false;
    void closing.then(() => { settled = true; return null; });
    await turn();
    assert.equal(settled, false);
    assert.equal(update.inspect().preparation.status, "pending");
    assert.equal(update.inspect().publication.status, "not-requested");
    assert.ok(host.present.has("B"));
    assert.deepEqual(await host.runtime.invoke(), { status: "refused", reason: "boundary-closed" });
    release.resolve();
    const [final, closed] = await Promise.all([update.completion, closing]);
    assert.equal(final.preparation.status, "failed");
    assert.equal(final.publication.status, "not-requested");
    assert.equal(closed.complete, true);
    assert.equal(host.present.size, 0);
    assert.equal(host.state.read().head.generationId, "A");
  } finally { release.resolve(); await host.runtime.close(); }
});

await test("reentrant shutdown during inert open still captures and closes the real empty native owner", async () => {
  const state = createOperationAuthority();
  const initial = createScope({ name: "initial" });
  let runtime: UpdateRuntime<readonly [], string> | undefined;
  let closing: Promise<CloseSnapshot> | undefined;
  let prepared = false;
  let candidateCloseCalls = 0;
  const built = createUpdateRuntime<readonly [], string>({
    domainId: "document", authority: state.authority,
    initial: { candidate: description("A"), invoke: () => "A", release: () => initial.control.close() },
    compatibility: { check: () => ({ status: "compatible" }) },
    preparation: {
      open() {
        const actual = createScope({ name: "actual-candidate-owner" });
        assert.ok(runtime);
        closing = runtime.close();
        return {
          prepare() { prepared = true; return { invoke: () => "B" }; },
          close() { candidateCloseCalls += 1; return actual.control.close(); },
        };
      },
    },
    limits: { maxAttempts: 32, maxCandidates: 2, maxRetainedPredecessors: 2, maxActiveWork: 16 },
  });
  runtime = built;
  const start = built.startUpdate(updateRequest("B"));
  assert.equal(start.status, "started");
  const result = await start.handle.completion;
  assert.equal(prepared, false);
  assert.equal(result.preparation.status, "failed");
  assert.equal(result.candidateLifetime?.cleanup.original.status, "settled");
  assert.equal(candidateCloseCalls, 1);
  assert.ok(closing);
  assert.equal((await closing).complete, true);
  assert.equal(state.read().head.generationId, "A");
});

await test("synchronous preparation reentry sees the already reserved original attempt", async () => {
  let current: Awaited<ReturnType<typeof recoveryHost>> | undefined;
  let reentries = 0;
  const host = await recoveryHost({ prepare: (context, _resources, normal) => {
    assert.ok(current);
    const replay = current.runtime.startUpdate(context.request);
    assert.equal(replay.status, "replayed");
    assert.equal(replay.handle.inspect().preparation.status, "pending");
    assert.equal(replay.handle.inspect().candidateLifetime?.installed, false);
    reentries += 1;
    return normal();
  } });
  current = host;
  try {
    await host.start("B").completion;
    assert.equal(reentries, 1);
    assert.deepEqual(host.evaluations, ["B"]);
  } finally { await host.runtime.close(); }
});
