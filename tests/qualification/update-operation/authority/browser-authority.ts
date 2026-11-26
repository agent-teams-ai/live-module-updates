import {
  checkOptions, copyReceipt, copyRequest, copySnapshot, isIdentifier, isRecord, isRevision,
  receipt, requestBinding, snapshot,
  type Authority, type AuthorityOptions, type AuthoritySnapshot, type PublicationReceipt,
  type PublicationRejection, type PublicationResult, type WriteResult,
} from "./contract.js";

interface StorageRecord {
  readonly ownerId: string;
  readonly initialGeneration: string;
  readonly value: AuthoritySnapshot;
  readonly receipts: readonly PublicationReceipt[];
}

function decode(serialized: string | null): StorageRecord {
  if (serialized === null) throw new Error("Browser TEST authority has no native state");
  const value: unknown = JSON.parse(serialized);
  if (!isRecord(value) || !isIdentifier(value.ownerId) || !isIdentifier(value.initialGeneration)
    || !Array.isArray(value.receipts) || value.receipts.length > 32) throw new Error("Invalid browser authority record");
  const state = copySnapshot(value.value);
  if (!state) throw new Error("Invalid browser authority snapshot");
  const receipts: PublicationReceipt[] = [];
  const attempts = new Set<string>();
  for (const item of value.receipts) {
    const entry = copyReceipt(item);
    if (!entry || entry.request.domainId !== state.domainId || attempts.has(entry.request.attemptId)) {
      throw new Error("Invalid browser authority receipt");
    }
    receipts.push(entry);
    attempts.add(entry.request.attemptId);
  }
  return { ownerId: value.ownerId, initialGeneration: value.initialGeneration, value: state, receipts };
}

/**
 * One native Storage item contains head, receipts and receiver state.
 * The proof is single-realm atomic replacement, not cross-tab coordination or durability.
 */
export function createBrowserAuthority(storage: Storage, options: AuthorityOptions): Authority {
  checkOptions(options);
  const domainId = options.domainId;
  const generationId = options.generationId;
  const key = options.storageKey ?? `lmu-test-authority:${domainId}`;
  if (storage.getItem(key) !== null) throw new Error("Refusing to replace an existing browser authority owner");
  const ownerId = crypto.randomUUID();
  const capacity = options.receiptCapacity ?? 32;
  let closed = false;
  const initial: StorageRecord = {
    ownerId,
    initialGeneration: generationId,
    value: snapshot({
      domainId,
      head: { revision: 0, generationId },
      state: { revision: 0, schemaRevision: options.schemaRevision ?? 1, text: options.text ?? "seed" },
      grant: { revision: 0, allowed: true },
    }),
    receipts: [],
  };
  storage.setItem(key, JSON.stringify(initial));

  function owned(): StorageRecord {
    if (closed) throw new Error("Browser TEST authority is closed");
    const current = decode(storage.getItem(key));
    if (current.ownerId !== ownerId || current.value.domainId !== domainId) throw new Error("Browser TEST authority owner was replaced");
    return current;
  }

  function publish(input: Parameters<Authority["publish"]>[0]): PublicationResult {
    if (closed) return Object.freeze({ status: "refused", reason: "closed" });
    // Convert caller data to inert values before the native owner's conditional section.
    const request = copyRequest(input);
    if (!request) return Object.freeze({ status: "refused", reason: "invalid-request" });
    if (request.domainId !== domainId) return Object.freeze({ status: "refused", reason: "wrong-domain" });
    const current = owned();
    const previous = current.receipts.find(value => value.request.attemptId === request.attemptId);
    if (previous) {
      if (requestBinding(previous.request) !== requestBinding(request)) return Object.freeze({ status: "refused", reason: "attempt-payload-mismatch" });
      return receipt(previous);
    }
    if (current.receipts.length >= capacity) return Object.freeze({ status: "refused", reason: "receipt-capacity" });
    const state = current.value;
    let rejected: PublicationRejection | undefined;
    if (state.head.generationId !== request.expectedHead.generationId || state.head.revision !== request.expectedHead.revision) rejected = "head-conflict";
    else if (state.state.schemaRevision !== request.basis.schemaRevision) rejected = "schema-conflict";
    else if (state.state.revision !== request.basis.stateRevision) rejected = "state-conflict";
    else if (state.grant.revision !== request.basis.grantRevision) rejected = "grant-conflict";
    else if (state.grant.allowed !== true) rejected = "denied";
    else {
      const used = current.initialGeneration === request.candidate.generationId
        || current.receipts.find(value => value.status === "committed" && value.head.generationId === request.candidate.generationId) !== undefined;
      if (used) rejected = "generation-reused";
    }

    const result: PublicationReceipt = rejected === undefined
      ? receipt({
        status: "committed", request, previousHead: state.head,
        head: { generationId: request.candidate.generationId, revision: state.head.revision + 1 },
      })
      : receipt({ status: "rejected", request, previousHead: state.head, reason: rejected });
    const next: StorageRecord = {
      ...current,
      value: result.status === "committed" ? snapshot({ ...state, head: result.head }) : state,
      receipts: [...current.receipts, result],
    };
    // Exactly one native write: there is no observable head-without-receipt interval.
    storage.setItem(key, JSON.stringify(next));
    return receipt(result);
  }

  function write(generationId: string, expectedStateRevision: number, text: string): WriteResult {
    if (closed) return Object.freeze({ status: "rejected", reason: "closed" });
    if (typeof generationId !== "string" || !isRevision(expectedStateRevision) || typeof text !== "string") {
      return Object.freeze({ status: "rejected", reason: "invalid-input" });
    }
    const current = owned();
    const state = current.value;
    if (generationId !== state.head.generationId) return Object.freeze({ status: "rejected", reason: "stale-generation" });
    if (state.grant.allowed !== true) return Object.freeze({ status: "rejected", reason: "denied" });
    if (expectedStateRevision !== state.state.revision) return Object.freeze({ status: "rejected", reason: "state-conflict" });
    const next = snapshot({ ...state, state: { ...state.state, text, revision: state.state.revision + 1 } });
    storage.setItem(key, JSON.stringify({ ...current, value: next }));
    return Object.freeze({ status: "written", snapshot: snapshot(next) });
  }

  return {
    read: () => snapshot(owned().value),
    publish,
    lookup(attemptId) {
      const entry = owned().receipts.find(value => value.request.attemptId === attemptId);
      return entry ? Object.freeze({ status: "known", receipt: receipt(entry) }) : Object.freeze({ status: "unknown" });
    },
    write,
    changeGrant(allowed) {
      if (typeof allowed !== "boolean") throw new Error("Invalid grant value");
      const current = owned();
      const next = snapshot({ ...current.value, grant: { revision: current.value.grant.revision + 1, allowed } });
      storage.setItem(key, JSON.stringify({ ...current, value: next }));
      return snapshot(next);
    },
    changeSchema(schemaRevision) {
      if (!isRevision(schemaRevision)) throw new Error("Invalid schema revision");
      const current = owned();
      const next = snapshot({ ...current.value, state: { ...current.value.state, schemaRevision } });
      storage.setItem(key, JSON.stringify({ ...current, value: next }));
      return snapshot(next);
    },
    dispose() {
      if (closed) return;
      closed = true;
      const serialized = storage.getItem(key);
      if (serialized === null) return;
      const current: unknown = JSON.parse(serialized);
      // An old disposer must not erase a replacement native owner at the same key.
      if (isRecord(current) && current.ownerId === ownerId) storage.removeItem(key);
    },
  };
}
