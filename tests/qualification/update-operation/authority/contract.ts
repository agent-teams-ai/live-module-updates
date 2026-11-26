/** TEST grammar for the single-agent, disposable-session authority discriminator. */
export interface Head {
  readonly revision: number;
  readonly generationId: string;
}

export interface AuthoritySnapshot {
  readonly domainId: string;
  readonly head: Head;
  readonly state: {
    readonly revision: number;
    readonly schemaRevision: number;
    readonly text: string;
  };
  readonly grant: {
    readonly revision: number;
    readonly allowed: boolean;
  };
}

export interface PublicationRequest {
  readonly attemptId: string;
  readonly domainId: string;
  readonly expectedHead: Head;
  readonly candidate: {
    readonly generationId: string;
    readonly closureId: string;
  };
  readonly basis: {
    readonly stateRevision: number;
    readonly schemaRevision: number;
    readonly grantRevision: number;
  };
}

export type PublicationRejection =
  | "head-conflict"
  | "schema-conflict"
  | "state-conflict"
  | "grant-conflict"
  | "denied"
  | "generation-reused";

export type PublicationReceipt =
  | {
    readonly status: "committed";
    readonly request: PublicationRequest;
    readonly previousHead: Head;
    readonly head: Head;
  }
  | {
    readonly status: "rejected";
    readonly request: PublicationRequest;
    readonly previousHead: Head;
    readonly reason: PublicationRejection;
  };

export type PublicationResult = PublicationReceipt | {
  readonly status: "refused";
  readonly reason: "invalid-request" | "wrong-domain" | "attempt-payload-mismatch" | "receipt-capacity" | "closed";
};

export type ReceiptLookup =
  | { readonly status: "known"; readonly receipt: PublicationReceipt }
  // Absence is deliberately nonterminal: an already submitted request may still commit.
  | { readonly status: "unknown" };

export type WriteResult =
  | { readonly status: "written"; readonly snapshot: AuthoritySnapshot }
  | {
    readonly status: "rejected";
    readonly reason: "closed" | "invalid-input" | "stale-generation" | "denied" | "state-conflict";
  };

export interface Authority {
  /** Detached inert values; this is the sole current-head source used by admission. */
  read(): AuthoritySnapshot;
  /** Conditional mutation and immutable receipt creation are one owner operation. */
  publish(request: PublicationRequest): PublicationResult;
  lookup(attemptId: string): ReceiptLookup;
  /** The current-generation fence is this fixture's receiver policy, not a product default. */
  write(generationId: string, expectedStateRevision: number, text: string): WriteResult;
  changeGrant(allowed: boolean): AuthoritySnapshot;
  changeSchema(schemaRevision: number): AuthoritySnapshot;
  dispose(): void;
}

export interface AuthorityOptions {
  readonly domainId: string;
  readonly generationId: string;
  readonly text?: string;
  readonly schemaRevision?: number;
  readonly receiptCapacity?: number;
  readonly storageKey?: string;
}

export type AuthorityFactory = (options: AuthorityOptions) => Authority;
export interface CaseEvidence {
  readonly name: string;
  readonly outcome: "passed";
  readonly witness?: string;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isRevision(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function readHead(value: unknown): Head | undefined {
  if (!isRecord(value)) return undefined;
  const { revision, generationId } = value;
  if (!isRevision(revision) || !isIdentifier(generationId)) return undefined;
  return Object.freeze({ revision, generationId });
}

/** Data normalization only. No shared conditional-publication implementation. */
export function copyRequest(value: unknown): PublicationRequest | undefined {
  if (!isRecord(value)) return undefined;
  const { attemptId, domainId, expectedHead, candidate, basis } = value;
  const head = readHead(expectedHead);
  if (!isIdentifier(attemptId) || !isIdentifier(domainId) || !head || !isRecord(candidate) || !isRecord(basis)) return undefined;
  const { generationId, closureId } = candidate;
  const { stateRevision, schemaRevision, grantRevision } = basis;
  if (!isIdentifier(generationId) || !isIdentifier(closureId)
    || !isRevision(stateRevision) || !isRevision(schemaRevision) || !isRevision(grantRevision)) return undefined;
  return Object.freeze({
    attemptId,
    domainId,
    expectedHead: head,
    candidate: Object.freeze({ generationId, closureId }),
    basis: Object.freeze({ stateRevision, schemaRevision, grantRevision }),
  });
}

export function requestBinding(request: PublicationRequest): string {
  return JSON.stringify([
    request.attemptId, request.domainId, request.expectedHead.revision, request.expectedHead.generationId,
    request.candidate.generationId, request.candidate.closureId,
    request.basis.stateRevision, request.basis.schemaRevision, request.basis.grantRevision,
  ]);
}

export function copySnapshot(value: unknown): AuthoritySnapshot | undefined {
  if (!isRecord(value)) return undefined;
  const { domainId, head: headValue, state, grant } = value;
  const head = readHead(headValue);
  if (!isIdentifier(domainId) || !head || !isRecord(state) || !isRecord(grant)) return undefined;
  const { revision, schemaRevision, text } = state;
  const { revision: grantRevision, allowed } = grant;
  if (!isRevision(revision) || !isRevision(schemaRevision) || typeof text !== "string"
    || !isRevision(grantRevision) || typeof allowed !== "boolean") return undefined;
  return Object.freeze({
    domainId,
    head,
    state: Object.freeze({ revision, schemaRevision, text }),
    grant: Object.freeze({ revision: grantRevision, allowed }),
  });
}

export function snapshot(value: AuthoritySnapshot): AuthoritySnapshot {
  const copied = copySnapshot(value);
  if (!copied) throw new Error("Invalid TEST authority snapshot");
  return copied;
}

export function copyReceipt(value: unknown): PublicationReceipt | undefined {
  if (!isRecord(value)) return undefined;
  const request = copyRequest(value.request);
  const previousHead = readHead(value.previousHead);
  if (!request || !previousHead) return undefined;
  if (value.status === "committed") {
    const head = readHead(value.head);
    if (!head || head.revision !== previousHead.revision + 1 || head.generationId !== request.candidate.generationId
      || previousHead.revision !== request.expectedHead.revision || previousHead.generationId !== request.expectedHead.generationId) return undefined;
    return Object.freeze({ status: "committed", request, previousHead, head });
  }
  const reason = value.reason;
  if (value.status !== "rejected" || (reason !== "head-conflict" && reason !== "schema-conflict"
    && reason !== "state-conflict" && reason !== "grant-conflict" && reason !== "denied" && reason !== "generation-reused")) return undefined;
  return Object.freeze({ status: "rejected", request, previousHead, reason });
}

export function receipt(value: PublicationReceipt): PublicationReceipt {
  const copied = copyReceipt(value);
  if (!copied) throw new Error("Invalid TEST publication receipt");
  return copied;
}

export function checkOptions(options: AuthorityOptions): void {
  if (!isIdentifier(options.domainId) || !isIdentifier(options.generationId)
    || (options.schemaRevision !== undefined && !isRevision(options.schemaRevision))
    || (options.text !== undefined && typeof options.text !== "string")
    || (options.storageKey !== undefined && !isIdentifier(options.storageKey))
    || (options.receiptCapacity !== undefined && (!isRevision(options.receiptCapacity) || options.receiptCapacity < 1 || options.receiptCapacity > 32))) {
    throw new Error("Invalid TEST authority options");
  }
}
