import {
  checkOptions, copyRequest, isRevision, receipt, requestBinding, snapshot,
  type Authority, type AuthorityOptions, type AuthoritySnapshot, type PublicationReceipt,
  type PublicationRejection, type PublicationResult, type WriteResult,
} from "./contract.js";

interface DomainRecord {
  readonly owner: symbol;
  readonly value: AuthoritySnapshot;
  readonly receipts: ReadonlyMap<string, PublicationReceipt>;
}

/** A real synchronous Map owner, scoped to one process and one disposable fixture. */
export function createNodeAuthority(options: AuthorityOptions): Authority {
  checkOptions(options);
  const domainId = options.domainId;
  const owner = Symbol(domainId);
  const domains = new Map<string, DomainRecord>();
  const capacity = options.receiptCapacity ?? 32;
  const initialGeneration = options.generationId;
  let closed = false;
  domains.set(domainId, {
    owner,
    value: snapshot({
      domainId,
      head: { revision: 0, generationId: initialGeneration },
      state: { revision: 0, schemaRevision: options.schemaRevision ?? 1, text: options.text ?? "seed" },
      grant: { revision: 0, allowed: true },
    }),
    receipts: new Map(),
  });

  function owned(): DomainRecord {
    const domain = domains.get(domainId);
    if (closed || !domain || domain.owner !== owner) throw new Error("Node TEST authority is closed or replaced");
    return domain;
  }

  function publish(input: Parameters<Authority["publish"]>[0]): PublicationResult {
    if (closed) return Object.freeze({ status: "refused", reason: "closed" });
    // Normalize any input access before reading the basis; no user callback runs below.
    const request = copyRequest(input);
    if (!request) return Object.freeze({ status: "refused", reason: "invalid-request" });
    if (request.domainId !== domainId) return Object.freeze({ status: "refused", reason: "wrong-domain" });
    const domain = owned();
    const previous = domain.receipts.get(request.attemptId);
    if (previous) {
      return requestBinding(previous.request) === requestBinding(request)
        ? receipt(previous)
        : Object.freeze({ status: "refused", reason: "attempt-payload-mismatch" });
    }
    if (domain.receipts.size >= capacity) return Object.freeze({ status: "refused", reason: "receipt-capacity" });
    const current = domain.value;
    let reason: PublicationRejection | undefined;
    if (request.expectedHead.revision !== current.head.revision || request.expectedHead.generationId !== current.head.generationId) reason = "head-conflict";
    else if (request.basis.schemaRevision !== current.state.schemaRevision) reason = "schema-conflict";
    else if (request.basis.stateRevision !== current.state.revision) reason = "state-conflict";
    else if (request.basis.grantRevision !== current.grant.revision) reason = "grant-conflict";
    else if (!current.grant.allowed) reason = "denied";
    else if (request.candidate.generationId === initialGeneration || [...domain.receipts.values()].some(
      entry => entry.status === "committed" && entry.head.generationId === request.candidate.generationId,
    )) reason = "generation-reused";

    const result: PublicationReceipt = reason
      ? receipt({ status: "rejected", request, previousHead: current.head, reason })
      : receipt({
        status: "committed", request, previousHead: current.head,
        head: { revision: current.head.revision + 1, generationId: request.candidate.generationId },
      });
    const nextReceipts = new Map(domain.receipts);
    nextReceipts.set(request.attemptId, result);
    const next = result.status === "committed" ? snapshot({ ...current, head: result.head }) : current;
    // The only conditional-publication mutation replaces head and receipt together.
    domains.set(domainId, { owner, value: next, receipts: nextReceipts });
    return receipt(result);
  }

  function write(generationId: string, expectedStateRevision: number, text: string): WriteResult {
    if (closed) return Object.freeze({ status: "rejected", reason: "closed" });
    if (typeof generationId !== "string" || !isRevision(expectedStateRevision) || typeof text !== "string") {
      return Object.freeze({ status: "rejected", reason: "invalid-input" });
    }
    const domain = owned();
    const current = domain.value;
    if (current.head.generationId !== generationId) return Object.freeze({ status: "rejected", reason: "stale-generation" });
    if (!current.grant.allowed) return Object.freeze({ status: "rejected", reason: "denied" });
    if (current.state.revision !== expectedStateRevision) return Object.freeze({ status: "rejected", reason: "state-conflict" });
    const next = snapshot({ ...current, state: { ...current.state, revision: current.state.revision + 1, text } });
    domains.set(domainId, { ...domain, value: next });
    return Object.freeze({ status: "written", snapshot: snapshot(next) });
  }

  return {
    read: () => snapshot(owned().value),
    publish,
    lookup(attemptId) {
      const value = owned().receipts.get(attemptId);
      return value ? Object.freeze({ status: "known", receipt: receipt(value) }) : Object.freeze({ status: "unknown" });
    },
    write,
    changeGrant(allowed) {
      if (typeof allowed !== "boolean") throw new Error("Invalid grant value");
      const domain = owned();
      const next = snapshot({ ...domain.value, grant: { revision: domain.value.grant.revision + 1, allowed } });
      domains.set(domainId, { ...domain, value: next });
      return snapshot(next);
    },
    changeSchema(schemaRevision) {
      if (!isRevision(schemaRevision)) throw new Error("Invalid schema revision");
      const domain = owned();
      const next = snapshot({ ...domain.value, state: { ...domain.value.state, schemaRevision } });
      domains.set(domainId, { ...domain, value: next });
      return snapshot(next);
    },
    dispose() {
      if (closed) return;
      closed = true;
      if (domains.get(domainId)?.owner === owner) domains.delete(domainId);
    },
  };
}
