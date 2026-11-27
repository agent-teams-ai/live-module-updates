import type { ExportDeliveryPort } from "@fixture/portable-document";
import { createBarriers } from "./authority/host-contract.js";
import { createBrowserAuthority } from "./authority/native-browser-authority.js";
import { requireFact, type Delivery, type EnvironmentOptions, type NativeEnvironment } from "./environment.js";

interface Lease {
  readonly generation: string;
  readonly token: string;
  readonly listener: () => void;
  readonly port: ExportDeliveryPort;
  readonly signal: AbortSignal;
  active: boolean;
  activated: boolean;
  pulses: number;
  releases: number;
}

/** Genuine Storage/DOM owner, independent of the Node file receiver and lifetime implementation. */
export function createBrowserEnvironment(options: EnvironmentOptions): NativeEnvironment {
  const authority = createBrowserAuthority(sessionStorage, options.domain, options.unsafeEffects);
  const barriers = createBarriers();
  const target = document.createElement("button");
  const output = document.createElement("ol");
  document.body.append(target, output);
  const leases: Lease[] = [];
  const holds = new Map<string, string>();
  const failures = new Set<string>();
  let foreignCalls = 0;
  const foreign = () => { foreignCalls += 1; };
  target.addEventListener("composed-native-pulse", foreign);
  function listenerPresent(lease: Lease): boolean {
    const before = lease.pulses;
    target.dispatchEvent(new Event("composed-native-pulse"));
    return lease.pulses === before + 1;
  }
  function use(generation: string): void {
    const lease = leases.find(value => value.generation === generation);
    requireFact(lease !== undefined && lease.active, "c.native-lifetime");
    requireFact(!lease.signal.aborted, "c.native-signal-lifetime");
    const before = lease.pulses;
    target.dispatchEvent(new Event("composed-native-pulse"));
    requireFact(lease.pulses === before + 1, "c.native-lifetime");
    if (authority.observeHead().generationId === generation) {
      if (!lease.activated) { target.dataset["owner"] = lease.token; target.dataset["generation"] = generation; lease.activated = true; }
      else { requireFact(target.dataset["owner"] === lease.token, "c.registration-identity"); }
    }
  }
  function acquire(generation: string, signal: AbortSignal): Lease {
    requireFact(!leases.some(value => value.generation === generation), "c.one-native-acquisition");
    const port: ExportDeliveryPort = {
      prepare: async () => {
        use(generation);
        const held = holds.get(generation);
        if (held !== undefined) { await barriers.wait(held); }
        use(generation);
        return { status: "ready" };
      },
      commit: (revision, content) => {
        use(generation);
        const node = document.createElement("li");
        node.dataset["generation"] = generation; node.dataset["revision"] = String(revision); node.textContent = content;
        const permission = authority.checkEffect(generation, revision);
        if (permission.status === "refused") {
          return { status: "rejected", reason: permission.reason === "stale-generation" ? "closed"
            : permission.reason === "grant-denied" ? "denied" : "conflict" };
        }
        // The detached node is prepared before the final native-owner check.
        output.append(node);
        return { status: "published", revision, content };
      },
    };
    const lease: Lease = { generation, token: crypto.randomUUID(), port, signal, active: true, activated: false, pulses: 0, releases: 0,
      listener: () => { lease.pulses += 1; } };
    target.addEventListener("composed-native-pulse", lease.listener); leases.push(lease);
    return lease;
  }
  function release(lease: Lease): void {
    if (failures.has(lease.generation)) { throw new Error("deliberate native composed DOM cleanup debt"); }
    if (options.unsafeRemoval === true) {
      const current = leases.find(value => value.token === target.dataset["owner"]);
      if (current !== undefined && current !== lease) { target.removeEventListener("composed-native-pulse", current.listener); current.active = false; }
    }
    if (options.unsafeOmitRelease !== true) { target.removeEventListener("composed-native-pulse", lease.listener); }
    lease.active = false; lease.releases += 1;
    if (target.dataset["owner"] === lease.token || options.unsafeRemoval === true) { delete target.dataset["owner"]; delete target.dataset["generation"]; }
  }
  function deliveries(): readonly Delivery[] {
    return [...output.querySelectorAll("li")].map(node => {
      const generation = node.dataset["generation"]; const revision = Number(node.dataset["revision"]);
      requireFact(typeof generation === "string" && Number.isSafeInteger(revision), "c.native-delivery-shape");
      return { generation, revision, content: node.textContent };
    });
  }
  return {
    kind: "chromium", authority, use, deliveries,
    document: generation => ({ read: authority.document, commit: (expected, text) => {
      const result = authority.write(generation, expected, text);
      return result.status === "written" ? { status: "saved", snapshot: authority.document() }
        : { status: "rejected", reason: result.reason === "stale-generation" ? "closed" : result.reason === "grant-denied" ? "denied" : "conflict" };
    } }),
    delivery: generation => {
      let lease: Lease | undefined;
      return { name: "composed-dom/" + generation,
        setup: ({ signal }) => { lease = acquire(generation, signal); return lease.port; },
        cleanup: port => { requireFact(lease !== undefined && port === lease.port, "c.exact-native-owner"); release(lease); } };
    },
    alive: generation => {
      const lease = leases.find(value => value.generation === generation);
      return lease !== undefined && listenerPresent(lease);
    },
    releases: generation => leases.find(value => value.generation === generation)?.releases ?? 0,
    aborted: generation => leases.find(value => value.generation === generation)?.signal.aborted ?? false,
    acquired: () => leases.map(value => value.generation),
    registered: () => target.dataset["generation"],
    foreignIntact: () => {
      const before = foreignCalls; target.dispatchEvent(new Event("composed-native-pulse"));
      return target.isConnected && output.isConnected && foreignCalls === before + 1;
    },
    failCleanup: (generation, fail) => { if (fail) { failures.add(generation); } else { failures.delete(generation); } },
    holdDelivery: (generation, barrier) => { holds.set(generation, barrier); },
    entered: barriers.entered, wait: barriers.wait, resume: barriers.resume, releaseBarriers: barriers.releaseAll,
    dispose: () => {
      try {
        requireFact(leases.every(lease => !listenerPresent(lease)), "c.native-teardown-leak");
        const before = foreignCalls; target.dispatchEvent(new Event("composed-native-pulse")); requireFact(foreignCalls === before + 1, "c.foreign-survival");
      } finally {
        for (const lease of leases) { target.removeEventListener("composed-native-pulse", lease.listener); lease.active = false; }
        target.removeEventListener("composed-native-pulse", foreign); target.remove(); output.remove(); authority.dispose();
      }
    },
  };
}
