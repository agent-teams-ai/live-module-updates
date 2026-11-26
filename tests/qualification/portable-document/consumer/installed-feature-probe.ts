import assert from "node:assert/strict";
import { assemblyFor } from "@get-modular/assembly";
import { createScope, type SetupSpec } from "@get-modular/resources";
import type { ExportDeliveryPort } from "@fixture/portable-document";
import { plainFormatProvider, type FormatProvider } from "@fixture/portable-document-gm";
import { prepareSummaryComposition, summaryComposition } from "./author-entry/index.js";
import type { SummaryCapabilities } from "./author-entry/features/export-summary/composition/export-summary.contracts.js";

/** TEST adapter: the separately authored application does not own these runtime concerns. */
export async function verifyInstalledFeature() {
  let factories = 0;
  let acquired = 0;
  let released = 0;
  let attempts = 0;
  let granted = true;
  const leases = new Set<ExportDeliveryPort>();
  const deliveries: { readonly revision: number; readonly content: string }[] = [];
  const snapshot = { revision: 7, text: "MiXeD text" };
  const provider: FormatProvider = {
    implementationId: "fixture/format/plain",
    create: () => { factories += 1; return plainFormatProvider.create(); },
  };
  const definition = summaryComposition(provider);
  assert.deepEqual(Object.keys(definition.roots), ["summary"], "the new feature is the sole entry root");
  const missing = await assemblyFor<SummaryCapabilities>().prepare({
    ...definition,
    modules: [definition.modules[0], definition.modules[1], definition.modules[3]] as const,
  });
  assert.equal(missing.status, "failed");
  if (missing.status !== "failed") throw new Error("author.summary.missing-export-accepted");
  assert.equal(missing.error.code, "assembly.prepare.unresolved-binding");
  assert.ok(Array.isArray(missing.error.cause));
  assert.ok(missing.error.cause.some((problem: unknown) => typeof problem === "object" && problem !== null
    && "consumerImplementationId" in problem && problem.consumerImplementationId === "author/export-summary/default"
    && "slotId" in problem && problem.slotId === "publication"
    && "capabilityId" in problem && problem.capabilityId === "fixture/export"
    && "candidates" in problem && Array.isArray(problem.candidates) && problem.candidates.length === 0));

  const accepted = await prepareSummaryComposition(provider);
  assert.equal(accepted.status, "prepared");
  if (accepted.status !== "prepared") throw new Error("author.summary.prepare-failed");
  assert.deepEqual({ factories, acquired, attempts, deliveries: deliveries.length, released },
    { factories: 0, acquired: 0, attempts: 0, deliveries: 0, released: 0 });

  const delivery: ExportDeliveryPort = {
    prepare: async () => ({ status: "ready" }),
    commit: (revision, content) => {
      attempts += 1;
      if (!granted) return { status: "rejected", reason: "denied" };
      deliveries.push({ revision, content });
      return { status: "published", revision, content };
    },
  };
  const setup: SetupSpec<ExportDeliveryPort> = {
    name: "author-summary-delivery",
    setup: () => { acquired += 1; leases.add(delivery); return delivery; },
    cleanup: held => {
      assert.equal(held, delivery, "cleanup received a different acquisition");
      assert.equal(leases.delete(held), true, "delivery lease was released twice");
      released += 1;
    },
  };
  const scope = createScope({ name: "installed-feature-consumer" });
  try {
    const result = await accepted.prepared.run({
      scope: scope.resources,
      inputs: {
        state: { "fixture/document/state": {
          read: () => ({ ...snapshot }),
          commit: () => ({ status: "rejected", reason: "denied" }),
        } },
        delivery: { "fixture/export/delivery": setup },
      },
    });
    assert.equal(result.status, "succeeded");
    if (result.status !== "succeeded") throw new Error("author.summary.run-failed");
    assert.deepEqual(Object.keys(result.roots), ["summary"]);
    assert.deepEqual(result.created.map(entry => entry.implementationId).sort(), [
      "author/export-summary/default", "fixture/document/default", "fixture/export/default", "fixture/format/plain",
    ]);
    assert.deepEqual(await result.roots.summary.publishSummary(), { status: "published", revision: 7, contentLength: 22 });
    assert.deepEqual(deliveries, [{ revision: 7, content: "Document r7\nMiXeD text" }]);
    granted = false;
    assert.deepEqual(await result.roots.summary.publishSummary(), { status: "rejected", reason: "denied" });
    assert.deepEqual(deliveries, [{ revision: 7, content: "Document r7\nMiXeD text" }], "denial produced a delivery effect");
    assert.deepEqual(snapshot, { revision: 7, text: "MiXeD text" });
  } finally {
    assert.deepEqual(await scope.control.close(), { complete: true, settled: true, debts: [] });
  }
  assert.deepEqual({ factories, acquired, attempts, effects: deliveries.length, released, remainingLeases: leases.size },
    { factories: 1, acquired: 1, attempts: 2, effects: 1, released: 1, remainingLeases: 0 });

  // The file exists inside the verified artifact; only the public package root
  // is admitted. A variable models the intentional runtime negative control.
  const hidden = "@fixture/portable-document-gm/dist/features/export/composition/export.contracts.js";
  await assert.rejects(import(hidden), { code: "ERR_PACKAGE_PATH_NOT_EXPORTED" });
  return {
    soleRoot: "author/export-summary/default", missingProviderRejected: true,
    effectsBeforeRun: 0, deepImportRejected: true,
    summary: { status: "published", revision: 7, contentLength: 22 },
    rejection: { status: "rejected", reason: "denied" },
    deliveries, factories, acquired, attempts, released, remainingLeases: leases.size,
  };
}

if (import.meta.main) process.stdout.write(JSON.stringify(await verifyInstalledFeature()) + "\n");
