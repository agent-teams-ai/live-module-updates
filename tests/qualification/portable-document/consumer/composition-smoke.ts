import assert from "node:assert/strict";
import { assemblyFor, type RunInputs } from "@get-modular/assembly";
import { smoke, type SmokeStep } from "@get-modular/conformance";
import type { SetupSpec } from "@get-modular/resources";
import type { ExportDeliveryPort, FormatPort } from "@fixture/portable-document";
import {
  documentComposition, prepareDocumentComposition, plainFormatProvider, markedFormatProvider,
  type FormatProvider, type PortableDocumentCapabilities,
} from "@fixture/portable-document-gm";
import { authorFormatProvider } from "./author-format.js";

type Inputs = RunInputs<ReturnType<typeof documentComposition>["inputs"]>;
const complete = { complete: true, settled: true, debts: [] };

export interface CompositionSmokeEvidence {
  readonly providers: readonly string[];
  readonly smokeSteps: number;
  readonly acquisitions: number;
  readonly releases: number;
  readonly remainingLeases: number;
  readonly prototype: {
    readonly code: "conformance.ports.prototype-member";
    readonly steps: number;
    readonly acquisitions: number;
    readonly releases: number;
    readonly remainingLeases: number;
  };
  readonly cleanup: {
    readonly code: "conformance.smoke.failed";
    readonly steps: number;
    readonly failedDebts: number;
    readonly acquisitions: number;
    readonly cleanupAttempts: number;
    readonly releases: number;
    readonly heldLeases: number;
    readonly reclaimedLeases: number;
    readonly remainingLeases: number;
  };
}

/** TEST leases observe construction custody; native FD/DOM tests remain separate. */
function deliveryWitness(cleanupFault?: Error) {
  const live = new Set<ExportDeliveryPort>();
  let acquisitions = 0;
  let cleanupAttempts = 0;
  let releases = 0;
  let reclaimed = 0;
  const setup: SetupSpec<ExportDeliveryPort> = {
    name: "smoke-delivery",
    setup: () => {
      const port: ExportDeliveryPort = {
        prepare: async () => ({ status: "ready" }),
        commit: (revision, content) => ({ status: "published", revision, content }),
      };
      acquisitions += 1;
      live.add(port);
      return port;
    },
    cleanup: port => {
      cleanupAttempts += 1;
      assert.ok(live.has(port), "cleanup must own this attempt's lease");
      if (cleanupFault !== undefined) throw cleanupFault;
      assert.equal(live.delete(port), true);
      releases += 1;
    },
  };
  const inputs: Inputs = {
    state: { "fixture/document/state": {
      read: () => ({ revision: 7, text: "smoke document" }),
      commit: () => ({ status: "rejected", reason: "denied" }),
    } },
    delivery: { "fixture/export/delivery": setup },
  };
  return {
    inputs,
    inspect: () => ({ acquisitions, cleanupAttempts, releases, live: live.size, reclaimed }),
    // Explicit TEST teardown is separate from registered cleanup and its report.
    reclaim: () => { reclaimed += live.size; live.clear(); },
  };
}

function runSmoke(provider: FormatProvider, inputs: Inputs) {
  return smoke({
    api: assemblyFor<PortableDocumentCapabilities>(),
    compose: supplied => prepareDocumentComposition(provider, supplied),
    inputs,
  });
}

function assertSteps(steps: readonly SmokeStep[], formatIdentity: string): void {
  const expected = [
    "none:",
    "fail:fixture/document/default", "abort:fixture/document/default",
    `fail:${formatIdentity}`, `abort:${formatIdentity}`,
    "fail:fixture/export/default", "abort:fixture/export/default",
  ];
  assert.deepEqual(steps.map(step => `${step.inject}:${step.at ?? ""}`).sort(), expected.sort());
  for (const step of steps) {
    assert.equal(step.problem, undefined);
    assert.deepEqual(step.report, complete);
    if (step.inject === "none") assert.equal(step.outcome, "succeeded");
    else if (step.inject === "fail") assert.equal(step.outcome, "failed");
    else assert.ok(step.outcome === "cancelled" || step.outcome === "failed");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function rejectedSteps(run: () => Promise<readonly SmokeStep[]>, code: string): Promise<readonly unknown[]> {
  let rejection: unknown;
  try { await run(); } catch (cause) { rejection = cause; }
  assert.ok(isRecord(rejection), "the invalid construction must reject");
  assert.equal(rejection["code"], code);
  const details = rejection["details"];
  assert.ok(isRecord(details));
  const steps: unknown = details["steps"];
  assert.ok(Array.isArray(steps));
  return steps;
}

/** Intentionally violates CMS: these prototype methods must never qualify as a port. */
class PrototypeFormat implements FormatPort {
  title(revision: number): string { return `Revision ${revision}`; }
  body(text: string): string { return text; }
}

async function rejectPrototype(): Promise<CompositionSmokeEvidence["prototype"]> {
  const witness = deliveryWitness();
  try {
    const steps = await rejectedSteps(() => runSmoke({
      implementationId: "fixture/format/prototype-rejected", create: () => new PrototypeFormat(),
    }, witness.inputs), "conformance.ports.prototype-member");
    assert.equal(steps.length, 1);
    const first = steps[0];
    assert.ok(isRecord(first));
    assert.equal(first["outcome"], "succeeded");
    assert.deepEqual(first["report"], complete);
    const observed = witness.inspect();
    assert.deepEqual(observed, { acquisitions: 1, cleanupAttempts: 1, releases: 1, live: 0, reclaimed: 0 });
    return {
      code: "conformance.ports.prototype-member", steps: steps.length,
      acquisitions: observed.acquisitions, releases: observed.releases, remainingLeases: observed.live,
    };
  } finally { witness.reclaim(); }
}

function failedDebtCount(steps: readonly unknown[], cause: Error): number {
  let count = 0;
  for (const step of steps) {
    assert.ok(isRecord(step));
    const report = step["report"];
    assert.ok(isRecord(report));
    assert.equal(report["settled"], true);
    const debts: unknown = report["debts"];
    assert.ok(Array.isArray(debts));
    const entries: readonly unknown[] = debts;
    assert.equal(report["complete"], entries.length === 0);
    for (const debt of entries) {
      assert.ok(isRecord(debt));
      assert.equal(debt["state"], "failed");
      assert.equal(debt["cause"], cause);
      count += 1;
    }
  }
  return count;
}

async function rejectCleanup(): Promise<CompositionSmokeEvidence["cleanup"]> {
  const fault = new Error("intentional smoke cleanup failure");
  const witness = deliveryWitness(fault);
  let steps: readonly unknown[] = [];
  let heldLeases = 0;
  try {
    steps = await rejectedSteps(() => runSmoke(plainFormatProvider, witness.inputs), "conformance.smoke.failed");
    assert.equal(steps.length, 7);
    assert.equal(failedDebtCount(steps, fault), 3);
    const observed = witness.inspect();
    assert.deepEqual(observed, { acquisitions: 3, cleanupAttempts: 3, releases: 0, live: 3, reclaimed: 0 });
    heldLeases = observed.live;
  } finally { witness.reclaim(); }
  // Reclaiming the fake leases cannot rewrite the original incomplete reports.
  const failedDebts = failedDebtCount(steps, fault);
  assert.equal(failedDebts, 3);
  const after = witness.inspect();
  assert.equal(after.live, 0);
  assert.equal(after.reclaimed, heldLeases);
  return {
    code: "conformance.smoke.failed", steps: steps.length, failedDebts,
    acquisitions: after.acquisitions, cleanupAttempts: after.cleanupAttempts, releases: after.releases,
    heldLeases, reclaimedLeases: after.reclaimed, remainingLeases: after.live,
  };
}

export async function verifyCompositionSmoke(): Promise<CompositionSmokeEvidence> {
  const cases = [
    { provider: plainFormatProvider, identity: "fixture/format/plain" },
    { provider: markedFormatProvider, identity: "fixture/format/marked" },
    { provider: authorFormatProvider, identity: "fixture/format/author" },
  ];
  let smokeSteps = 0;
  let acquisitions = 0;
  let releases = 0;
  let remainingLeases = 0;
  for (const expected of cases) {
    const witness = deliveryWitness();
    try {
      const steps = await runSmoke(expected.provider, witness.inputs);
      assertSteps(steps, expected.identity);
      const observed = witness.inspect();
      // Only normal construction and injections at Export reach delivery acquisition.
      assert.deepEqual(observed, { acquisitions: 3, cleanupAttempts: 3, releases: 3, live: 0, reclaimed: 0 });
      smokeSteps += steps.length;
      acquisitions += observed.acquisitions;
      releases += observed.releases;
      remainingLeases += observed.live;
    } finally { witness.reclaim(); }
  }
  return {
    providers: cases.map(entry => entry.identity), smokeSteps, acquisitions, releases, remainingLeases,
    prototype: await rejectPrototype(), cleanup: await rejectCleanup(),
  };
}
