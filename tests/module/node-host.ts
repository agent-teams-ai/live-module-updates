import { closeSync, fstatSync, mkdtempSync, openSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createScope, type Resources } from "@get-modular/resources";
import { createUpdateRuntime } from "../../src/index.ts";
import { createResourcesPreparation } from "../../src/resources.ts";
import { candidate, createBarriers, expect, type Command, type GenerationEnvironment, type HostOptions, type NativeHost, type Reply } from "./host-contract.ts";
import { createNodeAuthority } from "./native-node-authority.ts";
import { prepareGeneration } from "./generation-composition.ts";

interface NativeLease { readonly generation: string; readonly descriptor: number; active: boolean; activated: boolean; releases: number }

/** Native Node FDs and a private Map registry; it shares no browser lifetime implementation. */
export async function createNodeHost(options: HostOptions): Promise<NativeHost> {
  const directory = mkdtempSync(join(tmpdir(), "lmu-native-fd-"));
  const authority = createNodeAuthority(options.domain, options.unsafeEffects);
  const barriers = createBarriers();
  const leases = new Map<string, NativeLease>();
  const registry = new Map<string, NativeLease | object>();
  const foreign = Object.freeze({ foreign: true });
  registry.set("foreign", foreign);
  const preparationGates = new Map<string, string>();
  const preparationFailures = new Set<string>();
  const cleanupFailures = new Set<string>();
  let nextUse: (() => void) | undefined;
  async function prepare(generation: string, resources: Resources) {
    const lease = await resources.setup({ name: "node-fd/" + generation,
      setup: () => {
        const value: NativeLease = { generation, descriptor: openSync(join(directory, String(leases.size)), "wx+"), active: true, activated: false, releases: 0 };
        leases.set(generation, value); return value;
      },
      cleanup: (value) => {
        if (cleanupFailures.has(generation)) { throw new Error("deliberate native FD cleanup failure"); }
        if (options.unsafeRemoval === true) {
          const current = registry.get("current");
          if (current !== undefined && current !== value && "descriptor" in current && typeof current.descriptor === "number") {
            closeSync(current.descriptor);
            if ("active" in current) { current.active = false; }
          }
        }
        closeSync(value.descriptor); value.active = false; value.releases += 1;
        if (options.unsafeRemoval === true || registry.get("current") === value) { registry.delete("current"); }
      },
    });
    const barrier = preparationGates.get(generation);
    if (barrier !== undefined) { await barriers.wait(barrier); }
    if (preparationFailures.has(generation)) { throw new Error("preparation failed after native FD acquisition"); }
    const environment: GenerationEnvironment = {
      generation: () => generation, read: authority.document,
      write: (expected, text) => authority.write(generation, expected, text), wait: barriers.wait,
      use: () => {
        const callback = nextUse; nextUse = undefined; callback?.();
        if (authority.read().head.generationId === generation) {
          if (!lease.activated) { registry.set("current", lease); lease.activated = true; }
          else if (registry.get("current") !== lease) { throw new Error("b6.registration-identity"); }
        }
        if (!lease.active) { throw new Error("b6.use-after-release"); }
        fstatSync(lease.descriptor);
      },
    };
    return prepareGeneration(resources, environment);
  }
  const initial = createScope({ name: "node-initial" });
  try {
    const built = await prepare("A", initial.resources);
    const runtime = createUpdateRuntime<readonly [Command], Reply>({
      domainId: options.domain, authority,
      initial: { candidate: candidate("A"), invoke: built.invoke, release: () => initial.control.close() },
      preparation: createResourcesPreparation((context, resources) => prepare(context.request.candidate.generationId, resources)),
      compatibility: { check: ({ candidate: description }) => {
        if (description.contract.id !== "document-operation" || description.contract.revision !== "1") { return { status: "refused", reason: "unsupported-contract" }; }
        if (authority.schemaVersion() !== "schema/1") { return { status: "refused", reason: "unsupported-state" }; }
        if (!["A", "B", "C"].includes(description.generationId) || description.closureId !== "fixture-closure/" + description.generationId) {
          return { status: "refused", reason: "unknown-fixture-closure" };
        }
        return { status: "compatible" };
      } },
      adoption: { args: [{ kind: "view" }], accept: value => value.kind === "view" },
      limits: { maxAttempts: 32, maxCandidates: 2, maxRetainedPredecessors: options.retained ?? 2, maxActiveWork: 16 },
    });
    return {
      kind: "node", authority, runtime, entered: barriers.entered, resume: barriers.resume,
      onNextUse: (callback) => { nextUse = callback; },
      prepareAfter: (generation, barrier) => { preparationGates.set(generation, barrier); },
      failPreparation: (generation) => { preparationFailures.add(generation); },
      failCleanup: (generation, enabled) => { if (enabled) { cleanupFailures.add(generation); } else { cleanupFailures.delete(generation); } },
      alive: (generation) => leases.get(generation)?.active ?? false,
      releases: (generation) => leases.get(generation)?.releases ?? 0,
      registered: () => { const value = registry.get("current"); return value !== undefined && "generation" in value && typeof value.generation === "string" ? value.generation : undefined; },
      foreignIntact: () => registry.get("foreign") === foreign,
      dispose: async (attempts) => {
        barriers.releaseAll(); cleanupFailures.clear(); authority.finishPending();
        for (const attempt of attempts) { await attempt.reconcile(); await attempt.retryCleanup(); }
        const closed = await runtime.close();
        try {
          expect(closed.complete && [...leases.values()].every(lease => !lease.active), "b6.native-teardown");
          expect(registry.get("foreign") === foreign, "b6.foreign-resource-survival");
        } finally {
          for (const lease of leases.values()) { if (lease.active) { closeSync(lease.descriptor); lease.active = false; } }
          authority.dispose(); registry.clear(); rmSync(directory, { recursive: true, force: true });
        }
      },
    };
  } catch (cause) {
    cleanupFailures.clear(); await initial.control.close(); authority.dispose(); rmSync(directory, { recursive: true, force: true }); throw cause;
  }
}
