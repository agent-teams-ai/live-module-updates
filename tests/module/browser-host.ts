import { createScope, type Resources } from "@get-modular/resources";
import { createUpdateRuntime } from "../../src/index.ts";
import { createResourcesPreparation } from "../../src/resources.ts";
import { candidate, createBarriers, expect, type Command, type GenerationEnvironment, type HostOptions, type NativeHost, type Reply } from "./host-contract.ts";
import { createBrowserAuthority } from "./native-browser-authority.ts";
import { prepareGeneration } from "./generation-composition.ts";

interface DomLease { readonly generation: string; readonly token: string; readonly listener: () => void; active: boolean; activated: boolean; releases: number; pulses: number }

/** Genuine DOM listeners and Storage ownership; no EventTarget stand-in or Node Host wrapper. */
export async function createBrowserHost(options: HostOptions): Promise<NativeHost> {
  const authority = createBrowserAuthority(sessionStorage, options.domain, options.unsafeEffects);
  const button = document.createElement("button");
  document.body.append(button);
  const barriers = createBarriers();
  const leases: DomLease[] = [];
  const preparationGates = new Map<string, string>();
  const preparationFailures = new Set<string>();
  const cleanupFailures = new Set<string>();
  let nextUse: (() => void) | undefined;
  const foreign = { calls: 0 };
  const foreignListener = () => { foreign.calls += 1; };
  button.addEventListener("qualification-pulse", foreignListener);
  async function prepare(generation: string, resources: Resources) {
    const lease = await resources.setup({ name: "browser-listener/" + generation,
      setup: () => {
        const value: DomLease = { generation, token: crypto.randomUUID(), active: true, activated: false, releases: 0, pulses: 0,
          listener: () => { value.pulses += 1; } };
        button.addEventListener("qualification-pulse", value.listener);
        leases.push(value); return value;
      },
      cleanup: (value) => {
        if (cleanupFailures.has(generation)) { throw new Error("deliberate native DOM cleanup failure"); }
        if (options.unsafeRemoval === true) {
          const current = leases.find(entry => entry.token === button.dataset["owner"]);
          if (current !== undefined && current !== value) { button.removeEventListener("qualification-pulse", current.listener); current.active = false; }
        }
        button.removeEventListener("qualification-pulse", value.listener); value.active = false; value.releases += 1;
        if (options.unsafeRemoval === true || button.dataset["owner"] === value.token) {
          delete button.dataset["owner"]; delete button.dataset["generation"];
        }
      },
    });
    const barrier = preparationGates.get(generation);
    if (barrier !== undefined) { await barriers.wait(barrier); }
    if (preparationFailures.has(generation)) { throw new Error("preparation failed after native DOM acquisition"); }
    const environment: GenerationEnvironment = { generation: () => generation, read: authority.document,
      write: (expected, text) => authority.write(generation, expected, text), wait: barriers.wait,
      use: () => {
        const callback = nextUse; nextUse = undefined; callback?.();
        if (authority.read().head.generationId === generation) {
          if (!lease.activated) { button.dataset["owner"] = lease.token; button.dataset["generation"] = generation; lease.activated = true; }
          else if (button.dataset["owner"] !== lease.token) { throw new Error("b6.registration-identity"); }
        }
        const before = lease.pulses; button.dispatchEvent(new Event("qualification-pulse"));
        if (!lease.active || lease.pulses !== before + 1) { throw new Error("b6.use-after-release"); }
      },
    };
    return prepareGeneration(resources, environment);
  }
  const initial = createScope({ name: "browser-initial" });
  try {
    const built = await prepare("A", initial.resources);
    const runtime = createUpdateRuntime<readonly [Command], Reply>({
      domainId: options.domain, authority, initial: { candidate: candidate("A"), invoke: built.invoke, release: () => initial.control.close() },
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
      kind: "chromium", authority, runtime, entered: barriers.entered, resume: barriers.resume,
      onNextUse: (callback) => { nextUse = callback; },
      prepareAfter: (generation, barrier) => { preparationGates.set(generation, barrier); },
      failPreparation: (generation) => { preparationFailures.add(generation); },
      failCleanup: (generation, enabled) => { if (enabled) { cleanupFailures.add(generation); } else { cleanupFailures.delete(generation); } },
      alive: (generation) => leases.find(value => value.generation === generation)?.active ?? false,
      releases: (generation) => leases.find(value => value.generation === generation)?.releases ?? 0,
      registered: () => button.dataset["generation"],
      foreignIntact: () => { const before = foreign.calls; button.dispatchEvent(new Event("qualification-pulse")); return foreign.calls === before + 1; },
      dispose: async (attempts) => {
        barriers.releaseAll(); cleanupFailures.clear(); authority.finishPending();
        for (const attempt of attempts) { await attempt.reconcile(); await attempt.retryCleanup(); }
        const closed = await runtime.close();
        try {
          expect(closed.complete && leases.every(lease => !lease.active), "b6.native-teardown");
          const before = foreign.calls; button.dispatchEvent(new Event("qualification-pulse"));
          expect(foreign.calls === before + 1, "b6.foreign-resource-survival");
        } finally {
          for (const lease of leases) { button.removeEventListener("qualification-pulse", lease.listener); lease.active = false; }
          button.removeEventListener("qualification-pulse", foreignListener); button.remove(); authority.dispose();
        }
      },
    };
  } catch (cause) { cleanupFailures.clear(); await initial.control.close(); button.remove(); authority.dispose(); throw cause; }
}
