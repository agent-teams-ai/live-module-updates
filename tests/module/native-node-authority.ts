import type { AuthoritySnapshot, Head, PublicationReceipt, PublicationRequest, PublicationResult, ReceiptLookup } from "../../src/index.ts";
import { publicationKey, type DocumentState, type Effect, type NativeAuthority, type PublicationMode } from "./host-contract.ts";

interface OwnerRecord {
  readonly head: Head;
  readonly document: DocumentState;
  readonly schema: string;
  readonly granted: boolean;
  readonly grantRevision: number;
  readonly serial: number;
  readonly history: ReadonlyMap<string, PublicationReceipt>;
  readonly generations: ReadonlySet<string>;
}
const basis = (value: OwnerRecord): string => JSON.stringify([value.schema, value.document.revision, value.grantRevision]);

/** One complete native Map record owns canonical state and original receipts. */
export function createNodeAuthority(domain: string, unsafeEffects = false): NativeAuthority {
  const state = new Map<string, OwnerRecord>([[domain, {
    head: { generationId: "A", revision: "node/head/0" }, document: { revision: 0, text: "seed" },
    schema: "schema/1", granted: true, grantRevision: 0, serial: 0, history: new Map(), generations: new Set(["A"]),
  }]]);
  let calls = 0;
  let mode: PublicationMode = "normal";
  const pending = new Map<string, PublicationRequest>();
  let before: (() => void) | undefined;
  function owned(): OwnerRecord {
    const current = state.get(domain);
    if (current === undefined) { throw new Error("node owner closed"); }
    return current;
  }
  function read(): AuthoritySnapshot {
    const current = owned();
    return { domainId: domain, head: { ...current.head }, basis: basis(current) };
  }
  function commit(request: PublicationRequest): PublicationResult {
    const current = owned();
    const previous = current.history.get(request.attemptId);
    if (previous !== undefined) {
      return publicationKey(previous.request) === publicationKey(request) ? structuredClone(previous)
        : { status: "refused", request, reason: "attempt-payload-mismatch" };
    }
    if (current.history.size >= 32) { return { status: "refused", request, reason: "receipt-capacity" }; }
    let reason: string | undefined;
    if (request.domainId !== domain) { reason = "wrong-domain"; }
    else if (request.expectedHead.generationId !== current.head.generationId || request.expectedHead.revision !== current.head.revision) { reason = "head-conflict"; }
    else if (request.basis !== basis(current)) { reason = "basis-conflict"; }
    else if (!current.granted) { reason = "grant-denied"; }
    else if (current.generations.has(request.candidate.generationId)) { reason = "generation-reused"; }
    const previousHead = { ...current.head };
    const next = { generationId: request.candidate.generationId, revision: "node/head/" + String(current.serial + 1) };
    const receipt: PublicationReceipt = reason === undefined ? { status: "committed", request, previousHead, head: next }
      : { status: "rejected", request, previousHead, reason };
    const history = new Map(current.history); history.set(request.attemptId, receipt);
    const generations = new Set(current.generations);
    if (receipt.status === "committed") { generations.add(next.generationId); }
    const replacement: OwnerRecord = { ...current, history, generations,
      ...(receipt.status === "committed" ? { head: next, serial: current.serial + 1 } : {}) };
    // All allocation and validation precedes this one canonical replacement.
    state.set(domain, replacement);
    pending.delete(request.attemptId);
    return structuredClone(receipt);
  }
  function publish(input: PublicationRequest): PublicationResult {
    const request = structuredClone(input);
    calls += 1;
    const callback = before; before = undefined; callback?.();
    const terminal = owned().history.get(request.attemptId);
    if (terminal !== undefined) {
      return publicationKey(terminal.request) === publicationKey(request) ? structuredClone(terminal)
        : { status: "refused", request, reason: "attempt-payload-mismatch" };
    }
    const existing = pending.get(request.attemptId);
    if (existing !== undefined) {
      return publicationKey(existing) === publicationKey(request) ? { status: "unknown" }
        : { status: "refused", request, reason: "attempt-payload-mismatch" };
    }
    if (owned().history.size + pending.size >= 32) { return { status: "refused", request, reason: "receipt-capacity" }; }
    if (mode === "delayed") { pending.set(request.attemptId, request); return { status: "unknown" }; }
    const result = commit(request);
    if (mode === "lost-ack" && (result.status === "committed" || result.status === "rejected")) {
      throw new Error("Node acknowledgement failed after the actual canonical mutation");
    }
    return result;
  }
  function lookup(request: PublicationRequest): ReceiptLookup {
    const receipt = owned().history.get(request.attemptId);
    return receipt !== undefined && publicationKey(receipt.request) === publicationKey(request)
      ? { status: "known", receipt: structuredClone(receipt) } : { status: "unknown" };
  }
  function write(generation: string, expected: number, text: string): Effect {
    const current = owned();
    if (!unsafeEffects && generation !== current.head.generationId) { return { status: "refused", reason: "stale-generation" }; }
    if (!unsafeEffects && !current.granted) { return { status: "refused", reason: "grant-denied" }; }
    if (current.schema !== "schema/1") { return { status: "refused", reason: "schema-conflict" }; }
    if (expected !== current.document.revision) { return { status: "refused", reason: "revision-conflict" }; }
    const document = { revision: current.document.revision + 1, text };
    state.set(domain, { ...current, document });
    return { status: "written", revision: document.revision };
  }
  return {
    read, publish, lookup, write, document: () => ({ ...owned().document }),
    grant: (allowed) => { const current = owned(); state.set(domain, { ...current, granted: allowed, grantRevision: current.grantRevision + 1 }); },
    schema: (value) => { state.set(domain, { ...owned(), schema: value }); },
    schemaVersion: () => owned().schema,
    publicationMode: (value) => { mode = value; }, beforeMutation: (callback) => { before = callback; },
    finishPending: () => { for (const [attempt, request] of pending) { commit(request); pending.delete(attempt); } },
    publicationCalls: () => calls, receipts: () => [...owned().history.values()].map(value => structuredClone(value)),
    dispose: () => { state.delete(domain); },
  };
}
