import type { AuthoritySnapshot, PublicationReceipt, PublicationRequest, PublicationResult, ReceiptLookup } from "../../src/index.ts";
import { publicationKey, type DocumentState, type Effect, type EffectPermission, type NativeAuthority, type PublicationMode } from "./host-contract.ts";

interface StorageRecord {
  readonly owner: string;
  readonly snapshot: AuthoritySnapshot;
  readonly document: DocumentState;
  readonly schema: string;
  readonly granted: boolean;
  readonly grantRevision: number;
  readonly serial: number;
  readonly history: readonly PublicationReceipt[];
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isHead(value: unknown): boolean {
  return record(value) && typeof value["generationId"] === "string" && typeof value["revision"] === "string";
}
function isRequest(value: unknown): boolean {
  if (!record(value) || typeof value["domainId"] !== "string" || typeof value["attemptId"] !== "string"
    || typeof value["basis"] !== "string" || !isHead(value["expectedHead"])) { return false; }
  const candidate = value["candidate"];
  if (!record(candidate) || typeof candidate["generationId"] !== "string" || typeof candidate["closureId"] !== "string"
    || candidate["profile"] !== "cooperative-operation-v1") { return false; }
  const contract = candidate["contract"];
  return record(contract) && typeof contract["id"] === "string" && typeof contract["revision"] === "string";
}
function isReceipt(value: unknown): boolean {
  if (!record(value) || !isRequest(value["request"]) || !isHead(value["previousHead"])) { return false; }
  return value["status"] === "committed" ? isHead(value["head"])
    : value["status"] === "rejected" && typeof value["reason"] === "string";
}
function validRecord(value: unknown): value is StorageRecord {
  if (!record(value) || typeof value["owner"] !== "string" || typeof value["schema"] !== "string"
    || typeof value["granted"] !== "boolean" || typeof value["grantRevision"] !== "number"
    || typeof value["serial"] !== "number" || !Array.isArray(value["history"]) || !value["history"].every(isReceipt)) { return false; }
  const snapshot = value["snapshot"];
  const document = value["document"];
  return record(snapshot) && typeof snapshot["domainId"] === "string" && typeof snapshot["basis"] === "string"
    && isHead(snapshot["head"]) && record(document) && typeof document["text"] === "string" && typeof document["revision"] === "number";
}
function basis(value: Pick<StorageRecord, "document" | "grantRevision" | "schema">): string {
  return [value.schema, String(value.document.revision), String(value.grantRevision)].join("|");
}

/** One native Storage replacement atomically binds head and original receipts in this single realm. */
export function createBrowserAuthority(storage: Storage, domain: string, unsafeEffects = false): NativeAuthority {
  const key = "lmu/" + domain;
  const owner = crypto.randomUUID();
  if (storage.getItem(key) !== null) { throw new Error("browser authority slot already owned"); }
  let closed = false;
  let calls = 0;
  let mode: PublicationMode = "normal";
  const pending = new Map<string, PublicationRequest>();
  let before: (() => void) | undefined;
  const initial: StorageRecord = { owner, snapshot: { domainId: domain, head: { generationId: "A", revision: "browser/head/0" }, basis: "schema/1|0|0" },
    document: { revision: 0, text: "seed" }, schema: "schema/1", granted: true, grantRevision: 0, serial: 0, history: [] };
  storage.setItem(key, JSON.stringify(initial));
  function owned(): StorageRecord {
    if (closed) { throw new Error("browser owner closed"); }
    const value: unknown = JSON.parse(storage.getItem(key) ?? "null");
    if (!validRecord(value) || value.owner !== owner || value.snapshot.domainId !== domain) { throw new Error("browser authority owner was replaced"); }
    return value;
  }
  const save = (value: StorageRecord): void => { storage.setItem(key, JSON.stringify(value)); };
  function commit(request: PublicationRequest): PublicationResult {
    const current = owned();
    const known = current.history.find(entry => entry.request.attemptId === request.attemptId);
    if (known !== undefined) {
      return publicationKey(known.request) === publicationKey(request) ? known
        : { status: "refused", request, reason: "attempt-payload-mismatch" };
    }
    if (current.history.length >= 32) { return { status: "refused", request, reason: "receipt-capacity" }; }
    const { head } = current.snapshot;
    let reason: string | undefined;
    if (domain !== request.domainId) { reason = "wrong-domain"; }
    else if (head.revision !== request.expectedHead.revision || head.generationId !== request.expectedHead.generationId) { reason = "head-conflict"; }
    else if (basis(current) !== request.basis) { reason = "basis-conflict"; }
    else if (!current.granted) { reason = "grant-denied"; }
    else if (request.candidate.generationId === "A" || current.history.some(entry => entry.status === "committed" && entry.head.generationId === request.candidate.generationId)) { reason = "generation-reused"; }
    const receipt: PublicationReceipt = reason === undefined
      ? { status: "committed", request, previousHead: head, head: { generationId: request.candidate.generationId, revision: "browser/head/" + String(current.serial + 1) } }
      : { status: "rejected", request, previousHead: head, reason };
    save({ ...current, serial: current.serial + (receipt.status === "committed" ? 1 : 0),
      snapshot: receipt.status === "committed" ? { ...current.snapshot, head: receipt.head } : current.snapshot,
      history: [...current.history, receipt] });
    pending.delete(request.attemptId);
    return structuredClone(receipt);
  }
  function publish(value: PublicationRequest): PublicationResult {
    const request = structuredClone(value);
    calls += 1;
    const callback = before; before = undefined; callback?.();
    const terminal = owned().history.find(entry => entry.request.attemptId === request.attemptId);
    if (terminal !== undefined) {
      return publicationKey(terminal.request) === publicationKey(request) ? terminal
        : { status: "refused", request, reason: "attempt-payload-mismatch" };
    }
    const existing = pending.get(request.attemptId);
    if (existing !== undefined) {
      return publicationKey(existing) === publicationKey(request) ? { status: "unknown" }
        : { status: "refused", request, reason: "attempt-payload-mismatch" };
    }
    if (owned().history.length + pending.size >= 32) { return { status: "refused", request, reason: "receipt-capacity" }; }
    if (mode === "delayed") { pending.set(request.attemptId, request); return { status: "unknown" }; }
    const result = commit(request);
    if (mode === "lost-ack" && (result.status === "committed" || result.status === "rejected")) {
      throw new Error("Browser acknowledgement failed after the actual Storage mutation");
    }
    return result;
  }
  function lookup(request: PublicationRequest): ReceiptLookup {
    const receipt = owned().history.find(entry => entry.request.attemptId === request.attemptId);
    return receipt !== undefined && publicationKey(receipt.request) === publicationKey(request)
      ? { status: "known", receipt } : { status: "unknown" };
  }
  function permission(current: StorageRecord, generation: string, expected: number): EffectPermission {
    if (!unsafeEffects && generation !== current.snapshot.head.generationId) { return { status: "refused", reason: "stale-generation" }; }
    if (!unsafeEffects && !current.granted) { return { status: "refused", reason: "grant-denied" }; }
    if (current.schema !== "schema/1") { return { status: "refused", reason: "schema-conflict" }; }
    if (expected !== current.document.revision) { return { status: "refused", reason: "revision-conflict" }; }
    return { status: "allowed" };
  }
  function write(generation: string, expected: number, text: string): Effect {
    const current = owned();
    const allowed = permission(current, generation, expected);
    if (allowed.status === "refused") { return allowed; }
    const next = { ...current, document: { revision: current.document.revision + 1, text } };
    save({ ...next, snapshot: { ...next.snapshot, basis: basis(next) } });
    return { status: "written", revision: next.document.revision };
  }
  return {
    read: () => owned().snapshot, publish, lookup, write, document: () => owned().document,
    observeHead: () => ({ ...owned().snapshot.head }),
    checkEffect: (generation, expected) => permission(owned(), generation, expected),
    grant: (allowed) => { const current = owned(); const next = { ...current, granted: allowed, grantRevision: current.grantRevision + 1 };
      save({ ...next, snapshot: { ...next.snapshot, basis: basis(next) } }); },
    schema: (value) => { const next = { ...owned(), schema: value }; save({ ...next, snapshot: { ...next.snapshot, basis: basis(next) } }); },
    schemaVersion: () => owned().schema,
    publicationMode: (value) => { mode = value; }, beforeMutation: (callback) => { before = callback; },
    finishPending: () => { for (const [attempt, request] of pending) { commit(request); pending.delete(attempt); } },
    publicationCalls: () => calls, receipts: () => owned().history,
    dispose: () => { if (closed) { return; } const current: unknown = JSON.parse(storage.getItem(key) ?? "null"); closed = true;
      if (record(current) && current["owner"] === owner) { storage.removeItem(key); } },
  };
}
