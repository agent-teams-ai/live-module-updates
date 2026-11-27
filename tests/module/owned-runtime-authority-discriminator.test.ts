import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import test, { type TestContext } from "node:test";
import { fileURLToPath } from "node:url";
import { createOwnedRuntimeFixture, type OwnedRuntimeFixture } from "./owned-runtime-fixture.ts";

interface AuthorityObservation {
  readonly order: "lookup-overtakes-publish" | "publish-overtakes-lookup";
  readonly classification: "premature-parent-completion";
  readonly parentCompleteWhileNativeCallPending: boolean;
  readonly nativePendingAtParentCompletion: { readonly publish: number; readonly lookup: number };
  readonly actualPostAwaitNativeUses: { readonly publish: number; readonly lookup: number };
}

async function prepared(context: TestContext, name: string): Promise<OwnedRuntimeFixture> {
  const fixture = createOwnedRuntimeFixture({ domain: "c2/authority-overlap/" + name });
  context.after(async () => { await fixture.dispose(); });
  assert.equal((await fixture.construct()).status, "succeeded");
  const useful = await fixture.invoke({ kind: "view" });
  assert.equal(useful.status, "returned");
  assert.deepEqual(useful.value, { kind: "view", generation: "A", revision: 0, text: "A:seed" });
  fixture.publishAfter("actual-publication-response");
  return fixture;
}

function usefulB(fixture: OwnedRuntimeFixture): Promise<void> {
  return fixture.invoke({ kind: "view" }).then(useful => {
    assert.equal(useful.status, "returned");
    assert.deepEqual(useful.value, { kind: "view", generation: "B", revision: 0, text: "B:SEED" });
    return;
  });
}

await test("C2 actual authority-flight overlap distinguishes terminal receipt from native settlement", { timeout: 30_000 }, async context => {
  const directory = fileURLToPath(new URL("../../.qualification/evidence/owned-runtime/", import.meta.url));
  await mkdir(directory, { recursive: true });
  await rm(directory + "authority-overlap.json", { force: true });
  const observations: AuthorityObservation[] = [];
  await context.test("original publish still uses borrowed native FD after lookup proved commit", async scenario => {
    const fixture = await prepared(scenario, "lookup-first");
    const update = fixture.start("B");
    await fixture.entered("actual-publication-response");
    assert.equal(update.inspect().publication.status, "unknown");
    assert.equal((await update.reconcile()).publication.status, "committed");
    await update.completion;
    await usefulB(fixture);
    // Expected counterexample in the pre-C3 implementation. It is not a
    // supported parent-lifetime result: the original native call is still held.
    const parent = await fixture.closeParent();
    assert.equal(parent.complete, true);
    assert.equal((await fixture.originalRuntimeClose())?.complete, true);
    const nativePending = fixture.pendingAuthority();
    assert.deepEqual(nativePending, { publish: 1, lookup: 0 });
    assert.deepEqual(fixture.nativeUsesAfterAwait(), { publish: 0, lookup: 0 });
    fixture.useBorrowed();
    fixture.resume("actual-publication-response");
    await fixture.publicationSettled;
    assert.deepEqual(fixture.nativeUsesAfterAwait(), { publish: 1, lookup: 0 });
    assert.deepEqual(fixture.pendingAuthority(), { publish: 0, lookup: 0 });
    assert.equal(fixture.authority.publicationCalls(), 1);
    observations.push({ order: "lookup-overtakes-publish", classification: "premature-parent-completion",
      parentCompleteWhileNativeCallPending: parent.complete, nativePendingAtParentCompletion: nativePending,
      actualPostAwaitNativeUses: fixture.nativeUsesAfterAwait() });
  });
  await context.test("original publish settles while an already-started lookup still uses borrowed native FD", async scenario => {
    const fixture = await prepared(scenario, "publish-first");
    const update = fixture.start("B");
    await fixture.entered("actual-publication-response");
    fixture.lookupAfter("actual-lookup-response");
    const lookup = update.reconcile();
    await fixture.entered("actual-lookup-response");
    assert.deepEqual(fixture.pendingAuthority(), { publish: 1, lookup: 1 });
    fixture.resume("actual-publication-response");
    await fixture.publicationSettled;
    const result = await update.completion;
    assert.equal(result.publication.status, "committed");
    await usefulB(fixture);
    const parent = await fixture.closeParent();
    assert.equal(parent.complete, true);
    assert.equal((await fixture.originalRuntimeClose())?.complete, true);
    const nativePending = fixture.pendingAuthority();
    assert.deepEqual(nativePending, { publish: 0, lookup: 1 });
    assert.deepEqual(fixture.nativeUsesAfterAwait(), { publish: 1, lookup: 0 });
    fixture.useBorrowed();
    fixture.resume("actual-lookup-response");
    assert.equal((await lookup).publication.status, "committed");
    assert.deepEqual(fixture.nativeUsesAfterAwait(), { publish: 1, lookup: 1 });
    assert.deepEqual(fixture.pendingAuthority(), { publish: 0, lookup: 0 });
    assert.equal(fixture.authority.publicationCalls(), 1);
    observations.push({ order: "publish-overtakes-lookup", classification: "premature-parent-completion",
      parentCompleteWhileNativeCallPending: parent.complete, nativePendingAtParentCompletion: nativePending,
      actualPostAwaitNativeUses: fixture.nativeUsesAfterAwait() });
  });
  assert.equal(observations.length, 2, "both actual authority completion orders must reach the native witness");
  await writeFile(directory + "authority-overlap.json", JSON.stringify({ schema: 1,
    source: process.env.QUALIFICATION_SOURCE_SHA ?? "local-unpublished", node: process.version, target: "actual-native-node",
    scope: "TEST counterexamples; terminal receipt alone did not prove native authority settlement", observations }, null, 2) + "\n");
});
