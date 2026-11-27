import { createGenerationRecord, type GenerationRecord } from "./generation.ts";
import type { Head } from "./models.ts";
import type { InvocationOutcome, InvocationRefusal, ModuleEntry } from "./ports/invocation.ts";
import type { CleanupReport, GenerationControl, GenerationReservation } from "./ports/lifetime.ts";

function refused(reason: InvocationRefusal): Promise<{ readonly status: "refused"; readonly reason: InvocationRefusal }> {
  return Promise.resolve({ status: "refused", reason });
}

/**
 * One cooperative execution agent and one Host-owned canonical head. No callback
 * or await separates the inert owner snapshot from the exact work reservation.
 */
export function createInvocationBoundary<Args extends readonly unknown[], Result>(options: {
  readonly readCanonicalHead: () => Head | undefined;
  readonly maxActiveWork: number;
  readonly maxGenerationIdentities: number;
}) {
  const { readCanonicalHead, maxActiveWork, maxGenerationIdentities } = options;
  if (typeof readCanonicalHead !== "function"
    || !Number.isSafeInteger(maxActiveWork) || maxActiveWork < 1
    || !Number.isSafeInteger(maxGenerationIdentities) || maxGenerationIdentities < 1) {
    throw new TypeError("invocation requires a canonical-head reader and explicit positive work/identity limits");
  }
  const entries = new Map<string, GenerationRecord<Args, Result>>();
  const usedIdentities = new Set<string>();
  const sharedWork = new Set<object>();
  let sealed = false;

  function reserveGeneration(spec: {
    readonly generationId: string;
    readonly release: () => Promise<CleanupReport>;
  }): GenerationReservation<Args, Result> {
    const { generationId, release } = spec;
    if (typeof generationId !== "string" || generationId.length === 0) { return { status: "refused", reason: "invalid-generation" }; }
    if (typeof release !== "function") { return { status: "refused", reason: "invalid-owner" }; }
    if (usedIdentities.has(generationId)) { return { status: "refused", reason: "generation-reused" }; }
    if (usedIdentities.size >= maxGenerationIdentities) { return { status: "refused", reason: "generation-capacity" }; }
    const record = createGenerationRecord<Args, Result>({
      generationId, release, sealed, sharedWork, maxActiveWork,
      forgetRegistration: (control) => { if (entries.get(generationId)?.control === control) { entries.delete(generationId); } },
    });
    usedIdentities.add(generationId);
    entries.set(generationId, record);
    return { status: "reserved", control: record.control };
  }

  function attachGeneration(spec: {
    readonly generationId: string;
    readonly invoke: ModuleEntry<Args, Result>;
    readonly release: () => Promise<CleanupReport>;
  }): GenerationReservation<Args, Result> {
    const { generationId, invoke, release } = spec;
    if (typeof invoke !== "function") { return { status: "refused", reason: "invalid-owner" }; }
    const reserved = reserveGeneration({ generationId, release });
    if (reserved.status === "reserved") { reserved.control.install(invoke); }
    return reserved;
  }

  function selectAndInvoke(expected: string | undefined, args: Args): Promise<InvocationOutcome<Result>> {
    if (sealed) { return refused("boundary-closed"); }
    let head: Head | undefined;
    try { head = readCanonicalHead(); }
    catch (cause) { return Promise.resolve({ status: "refused", reason: "authority-unavailable", cause }); }
    if (!head) { return refused("no-current-generation"); }
    if (expected !== undefined && head.generationId !== expected) { return refused("generation-changed"); }
    const entry = entries.get(head.generationId);
    if (!entry) { return refused("generation-unavailable"); }
    return entry.start(args);
  }

  function sealBoundary(): void {
    sealed = true;
    for (const entry of entries.values()) { entry.control.seal(); }
  }

  return Object.freeze({
    invoke: (...args: Args) => selectAndInvoke(undefined, args),
    invokeExpected: (generationId: string, ...args: Args) => selectAndInvoke(generationId, args),
    reserveGeneration, attachGeneration, seal: sealBoundary,
    generationControl: (generationId: string) => entries.get(generationId)?.control,
    generations: (): readonly GenerationControl<Args, Result>[] => Object.freeze([...entries.values()].map((entry) => entry.control)),
    hasGenerationIdentity: (generationId: string) => usedIdentities.has(generationId),
    pending: () => sharedWork.size,
  });
}

export type InvocationBoundary<Args extends readonly unknown[], Result> = ReturnType<typeof createInvocationBoundary<Args, Result>>;
