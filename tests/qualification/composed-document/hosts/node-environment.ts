import { appendFileSync, closeSync, fstatSync, mkdtempSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExportDeliveryPort } from "@fixture/portable-document";
import { createBarriers } from "./authority/host-contract.js";
import { createNodeAuthority } from "./authority/native-node-authority.js";
import { requireFact, throwFailures, type Delivery, type EnvironmentOptions, type NativeEnvironment } from "./environment.js";

interface NativeDescriptor {
  readonly descriptor: number;
  readonly device: bigint;
  readonly inode: bigint;
}
interface Lease extends NativeDescriptor {
  readonly generation: string;
  readonly path: string;
  readonly port: ExportDeliveryPort;
  readonly signal: AbortSignal;
  active: boolean;
  activated: boolean;
  releases: number;
}

function openDescriptor(path: string): NativeDescriptor {
  const descriptor = openSync(path, "wx+");
  try {
    const identity = fstatSync(descriptor, { bigint: true });
    return { descriptor, device: identity.dev, inode: identity.ino };
  } catch (cause) {
    try { closeSync(descriptor); }
    catch (cleanup) { throw new AggregateError([cause, cleanup], "native descriptor setup and cleanup failed", { cause: cleanup }); }
    throw cause;
  }
}

function createNativeFiles() {
  const directory = mkdtempSync(join(tmpdir(), "composed-node-"));
  let foreign: NativeDescriptor | undefined;
  try {
    foreign = openDescriptor(join(directory, "foreign"));
    writeFileSync(foreign.descriptor, "foreign-owner");
    return { directory, foreign };
  } catch (cause) {
    const errors: unknown[] = [cause];
    try { if (foreign !== undefined) { closeSync(foreign.descriptor); } } catch (cleanup) { errors.push(cleanup); }
    try { rmSync(directory, { recursive: true, force: true }); } catch (cleanup) { errors.push(cleanup); }
    throwFailures(errors, "native foreign setup and cleanup failed");
    throw cause;
  }
}

function ownsDescriptor(descriptor: number, device: bigint, inode: bigint): boolean {
  try {
    const actual = fstatSync(descriptor, { bigint: true });
    return actual.dev === device && actual.ino === inode;
  } catch (cause) {
    if (typeof cause === "object" && cause !== null && "code" in cause && cause.code === "EBADF") { return false; }
    throw cause;
  }
}

/** Independent synchronous Node file receiver; canonical state belongs to the existing Map owner. */
export function createNodeEnvironment(options: EnvironmentOptions): NativeEnvironment {
  const { directory, foreign } = createNativeFiles();
  const authority = createNodeAuthority(options.domain, options.unsafeEffects);
  const barriers = createBarriers();
  const leases = new Map<string, Lease>();
  const registration = new Map<string, Lease>();
  const holds = new Map<string, string>();
  const failures = new Set<string>();
  function use(generation: string): void {
    const lease = leases.get(generation);
    requireFact(lease?.active === true, "c.native-lifetime");
    requireFact(!lease.signal.aborted, "c.native-signal-lifetime");
    requireFact(ownsDescriptor(lease.descriptor, lease.device, lease.inode), "c.native-lifetime");
    if (authority.observeHead().generationId === generation) {
      if (!lease.activated) { registration.set("current", lease); lease.activated = true; }
      else { requireFact(registration.get("current") === lease, "c.registration-identity"); }
    }
  }
  function acquire(generation: string, signal: AbortSignal): Lease {
    requireFact(!leases.has(generation), "c.one-native-acquisition");
    const path = join(directory, "delivery-" + String(leases.size));
    const native = openDescriptor(path);
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
        const permission = authority.checkEffect(generation, revision);
        if (permission.status === "refused") {
          return { status: "rejected", reason: permission.reason === "stale-generation" ? "closed"
            : permission.reason === "grant-denied" ? "denied" : "conflict" };
        }
        // No await or consumer callback separates the owner's check from this native effect.
        appendFileSync(native.descriptor, JSON.stringify({ generation, revision, content }) + "\n");
        return { status: "published", revision, content };
      },
    };
    const lease: Lease = { generation, ...native, path, port, signal, active: true, activated: false, releases: 0 };
    leases.set(generation, lease);
    return lease;
  }
  function release(lease: Lease): void {
    if (failures.has(lease.generation)) { throw new Error("deliberate native composed FD cleanup debt"); }
    if (options.unsafeRemoval === true) {
      const current = registration.get("current");
      if (current !== undefined && current !== lease && current.active) { closeSync(current.descriptor); current.active = false; }
    }
    if (options.unsafeOmitRelease !== true) { closeSync(lease.descriptor); }
    lease.active = false; lease.releases += 1;
    if (registration.get("current") === lease || options.unsafeRemoval === true) { registration.delete("current"); }
  }
  function deliveries(): readonly Delivery[] {
    const result: Delivery[] = [];
    for (const lease of leases.values()) {
      for (const line of readFileSync(lease.path, "utf8").split("\n").filter(value => value !== "")) {
        const value: unknown = JSON.parse(line);
        requireFact(typeof value === "object" && value !== null && "generation" in value && typeof value.generation === "string"
          && "revision" in value && typeof value.revision === "number" && "content" in value && typeof value.content === "string", "c.native-delivery-shape");
        result.push({ generation: value.generation, revision: value.revision, content: value.content });
      }
    }
    return result;
  }
  return {
    kind: "node", authority, use, deliveries,
    document: generation => ({ read: authority.document, commit: (expected, text) => {
      const result = authority.write(generation, expected, text);
      return result.status === "written" ? { status: "saved", snapshot: authority.document() }
        : { status: "rejected", reason: result.reason === "stale-generation" ? "closed" : result.reason === "grant-denied" ? "denied" : "conflict" };
    } }),
    delivery: generation => {
      let lease: Lease | undefined;
      return { name: "composed-file/" + generation,
        setup: ({ signal }) => { lease = acquire(generation, signal); return lease.port; },
        cleanup: port => { requireFact(lease !== undefined && port === lease.port, "c.exact-native-owner"); release(lease); } };
    },
    alive: generation => { const lease = leases.get(generation); return lease !== undefined && ownsDescriptor(lease.descriptor, lease.device, lease.inode); },
    aborted: generation => leases.get(generation)?.signal.aborted ?? false,
    acquired: () => [...leases.keys()],
    releases: generation => leases.get(generation)?.releases ?? 0,
    registered: () => registration.get("current")?.generation,
    foreignIntact: () => ownsDescriptor(foreign.descriptor, foreign.device, foreign.inode)
      && readFileSync(join(directory, "foreign"), "utf8") === "foreign-owner",
    failCleanup: (generation, fail) => { if (fail) { failures.add(generation); } else { failures.delete(generation); } },
    holdDelivery: (generation, barrier) => { holds.set(generation, barrier); },
    entered: barriers.entered, wait: barriers.wait, resume: barriers.resume, releaseBarriers: barriers.releaseAll,
    dispose: () => {
      const errors: unknown[] = [];
      try {
        requireFact([...leases.values()].every(lease => !ownsDescriptor(lease.descriptor, lease.device, lease.inode)), "c.native-teardown-leak");
        requireFact(ownsDescriptor(foreign.descriptor, foreign.device, foreign.inode), "c.foreign-survival");
      } catch (cause) { errors.push(cause); }
      for (const lease of leases.values()) {
        try { if (ownsDescriptor(lease.descriptor, lease.device, lease.inode)) { closeSync(lease.descriptor); } }
        catch (cause) { errors.push(cause); }
        lease.active = false;
      }
      try { if (ownsDescriptor(foreign.descriptor, foreign.device, foreign.inode)) { closeSync(foreign.descriptor); } }
      catch (cause) { errors.push(cause); }
      try { authority.dispose(); rmSync(directory, { recursive: true, force: true }); }
      catch (cause) { errors.push(cause); }
      throwFailures(errors, "native file observation and final disposal failed");
    },
  };
}
