import type { GenerationSnapshot } from "./ports/lifetime.ts";

/** An owner-issued equality token. LMU neither allocates nor increments revisions. */
export interface Head {
  readonly generationId: string;
  readonly revision: string;
}

export interface AuthoritySnapshot {
  readonly domainId: string;
  readonly head: Head;
  /** An inert binding to owner-defined conditions, never permission to perform an effect. */
  readonly basis: string;
}

export interface CandidateDescription {
  readonly generationId: string;
  readonly closureId: string;
  readonly contract: { readonly id: string; readonly revision: string };
  readonly profile: "cooperative-operation-v1";
}

export interface UpdateRequest {
  readonly attemptId: string;
  readonly candidate: CandidateDescription;
}

export interface PublicationRequest {
  readonly domainId: string;
  readonly attemptId: string;
  readonly candidate: CandidateDescription;
  readonly expectedHead: Head;
  readonly basis: string;
}

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
    readonly reason: string;
  };

export type PublicationResult = PublicationReceipt
  | { readonly status: "refused"; readonly request: PublicationRequest; readonly reason: string }
  | { readonly status: "unknown" };

export type ReceiptLookup =
  | { readonly status: "known"; readonly receipt: PublicationReceipt }
  | { readonly status: "unknown" };

export type PlanningState =
  | { readonly status: "pending" }
  | { readonly status: "ready"; readonly baseline: AuthoritySnapshot }
  | { readonly status: "refused"; readonly reason: string }
  | { readonly status: "failed"; readonly cause: unknown };

export type PreparationState =
  | { readonly status: "not-started" }
  | { readonly status: "pending" }
  | { readonly status: "ready" }
  | { readonly status: "failed"; readonly cause: unknown };

export type PublicationState =
  | { readonly status: "not-requested" }
  | { readonly status: "unknown"; readonly cause?: unknown }
  | { readonly status: "committed"; readonly receipt: PublicationReceipt & { readonly status: "committed" } }
  | { readonly status: "rejected"; readonly receipt: PublicationReceipt & { readonly status: "rejected" } }
  | { readonly status: "refused"; readonly reason: string };

export type AdoptionState =
  | { readonly status: "not-started" }
  | { readonly status: "pending" }
  | { readonly status: "observed"; readonly generationId: string }
  | { readonly status: "superseded" }
  | { readonly status: "failed"; readonly cause: unknown }
  | { readonly status: "not-requested" };

export type UpdateHold = "preparation" | "publication" | "work" | "cleanup" | "retirement-reservation";

export interface UpdateSnapshot {
  readonly attemptId: string;
  readonly candidate: CandidateDescription;
  readonly planning: PlanningState;
  readonly preparation: PreparationState;
  readonly publication: PublicationState;
  readonly adoption: AdoptionState;
  /** Absent means no native owner was acquired, not a fabricated successful close. */
  readonly candidateLifetime?: GenerationSnapshot;
  /** Actual owner evidence when a malformed preparation port could not be registered. */
  readonly unregisteredCleanup?: GenerationSnapshot["cleanup"];
  readonly predecessorLifetime?: GenerationSnapshot;
  readonly holds: readonly UpdateHold[];
  /** Original operation observation settled; this does not imply zero cleanup debt. */
  readonly settled: boolean;
  readonly observationIssue?: unknown;
}

export interface UpdateHandle {
  readonly attemptId: string;
  inspect(): UpdateSnapshot;
  /** The original terminal result; subsequent cleanup retries cannot rewrite it. */
  readonly completion: Promise<UpdateSnapshot>;
  /** Consults the authority for this exact request, never creates a replacement attempt. */
  reconcile(): Promise<UpdateSnapshot>;
  /** A separate action after a settled incomplete original cleanup. */
  retryCleanup(): Promise<UpdateSnapshot>;
}

export type StartRefusal =
  | "invalid-request"
  | "attempt-payload-mismatch"
  | "attempt-capacity"
  | "candidate-capacity"
  | "retention-capacity"
  | "generation-reused"
  | "closed";

export type StartUpdateResult =
  | { readonly status: "started" | "replayed"; readonly handle: UpdateHandle }
  | { readonly status: "refused"; readonly reason: StartRefusal };

export interface UpdateLimits {
  readonly maxAttempts: number;
  readonly maxCandidates: number;
  readonly maxRetainedPredecessors: number;
  readonly maxActiveWork: number;
}

export interface RuntimeSnapshot {
  readonly domainId: string;
  readonly closed: boolean;
  readonly attempts: readonly UpdateSnapshot[];
  readonly generations: readonly GenerationSnapshot[];
  readonly candidates: number;
  readonly retainedPredecessors: number;
  readonly reservedPredecessors: readonly string[];
}

export interface CloseSnapshot {
  readonly complete: boolean;
  readonly snapshot: RuntimeSnapshot;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function identifier(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function copyHead(value: unknown): Head | undefined {
  if (!record(value)) {return undefined;}
  const { generationId, revision } = value;
  return identifier(generationId) && identifier(revision) ? Object.freeze({ generationId, revision }) : undefined;
}

export function copyAuthoritySnapshot(value: unknown): AuthoritySnapshot | undefined {
  if (!record(value)) {return undefined;}
  const { domainId, basis, head: headValue } = value;
  const head = copyHead(headValue);
  return identifier(domainId) && identifier(basis) && head ? Object.freeze({ domainId, basis, head }) : undefined;
}

function copyCandidate(candidate: unknown): CandidateDescription | undefined {
  if (!record(candidate)) {return undefined;}
  const { generationId, closureId, contract, profile } = candidate;
  if (!identifier(generationId) || !identifier(closureId) || !record(contract) || profile !== "cooperative-operation-v1") {return undefined;}
  const { id, revision } = contract;
  if (!identifier(id) || !identifier(revision)) {return undefined;}
  return Object.freeze({
    generationId, closureId, profile,
    contract: Object.freeze({ id, revision }),
  });
}

export function copyUpdateRequest(value: unknown): UpdateRequest | undefined {
  if (!record(value)) {return undefined;}
  const { attemptId, candidate: candidateValue } = value;
  const candidate = copyCandidate(candidateValue);
  if (!identifier(attemptId) || !candidate) {return undefined;}
  return Object.freeze({ attemptId, candidate });
}

/** Only the explicitly defined inert grammar is bound; no product object serializer. */
export function updateBinding(request: UpdateRequest): string {
  return JSON.stringify([request.attemptId, request.candidate.generationId, request.candidate.closureId,
    request.candidate.contract.id, request.candidate.contract.revision, request.candidate.profile]);
}

export function copyPublicationRequest(value: unknown): PublicationRequest | undefined {
  if (!record(value)) {return undefined;}
  const { domainId, attemptId, candidate: candidateValue, expectedHead, basis } = value;
  const head = copyHead(expectedHead);
  const candidate = copyCandidate(candidateValue);
  if (!identifier(domainId) || !identifier(attemptId) || !identifier(basis) || !head || !candidate) {return undefined;}
  return Object.freeze({ domainId, attemptId, basis, expectedHead: head, candidate });
}

export function publicationBinding(request: PublicationRequest): string {
  return JSON.stringify([request.domainId, request.attemptId, request.candidate.generationId,
    request.candidate.closureId, request.candidate.contract.id, request.candidate.contract.revision, request.candidate.profile,
    request.expectedHead.generationId, request.expectedHead.revision, request.basis]);
}

export function copyPublicationResult(value: unknown, expected: PublicationRequest): PublicationResult | undefined {
  if (!record(value)) {return undefined;}
  const status = value.status;
  if (status === "unknown") {return Object.freeze({ status: "unknown" });}
  const request = copyPublicationRequest(value.request);
  if (!request || publicationBinding(request) !== publicationBinding(expected)) {return undefined;}
  if (status === "refused") {
    const reason = value.reason;
    return identifier(reason) ? Object.freeze({ status: "refused", request, reason }) : undefined;
  }
  const previousHead = copyHead(value.previousHead);
  if (!previousHead) {return undefined;}
  if (status === "rejected") {
    const reason = value.reason;
    return identifier(reason) ? Object.freeze({ status: "rejected", request, previousHead, reason }) : undefined;
  }
  const head = copyHead(value.head);
  if (status !== "committed" || !head || head.generationId !== request.candidate.generationId
    || head.revision === previousHead.revision || previousHead.generationId !== request.expectedHead.generationId
    || previousHead.revision !== request.expectedHead.revision) {return undefined;}
  return Object.freeze({ status: "committed", request, previousHead, head });
}

export function copyLookup(value: unknown, expected: PublicationRequest): ReceiptLookup | undefined {
  if (!record(value)) {return undefined;}
  const status = value.status;
  if (status === "unknown") {return Object.freeze({ status: "unknown" });}
  if (status !== "known") {return undefined;}
  const receipt = copyPublicationResult(value.receipt, expected);
  if (!receipt || (receipt.status !== "committed" && receipt.status !== "rejected")) {return undefined;}
  return Object.freeze({ status: "known", receipt });
}
