import type { Head, PublicationReceipt, PublicationRequest } from "../application/models.ts";
import type { AuthorityContractFixture, AuthorityLawName } from "./authority-contract.ts";

export class AuthorityContractViolation extends Error {
  readonly code: string;
  readonly law: AuthorityLawName;
  constructor(law: AuthorityLawName, detail: string) {
    super(`Authority law ${law}: ${detail}`);
    this.name = "AuthorityContractViolation";
    this.code = "lmu.testing.authority." + law;
    this.law = law;
  }
}

export function requireLaw(condition: boolean, law: AuthorityLawName, detail: string): asserts condition {
  if (!condition) { throw new AuthorityContractViolation(law, detail); }
}

export function sameHead(left: Head, right: Head): boolean {
  return left.generationId === right.generationId && left.revision === right.revision;
}

/** Independent explicit contract oracle; do not import the coordinator's binding. */
export function sameRequest(left: PublicationRequest, right: PublicationRequest): boolean {
  return left.domainId === right.domainId && left.attemptId === right.attemptId && left.basis === right.basis
    && sameHead(left.expectedHead, right.expectedHead)
    && left.candidate.generationId === right.candidate.generationId
    && left.candidate.closureId === right.candidate.closureId
    && left.candidate.contract.id === right.candidate.contract.id
    && left.candidate.contract.revision === right.candidate.contract.revision
    && Object.is(left.candidate.profile, right.candidate.profile);
}

export function request(fixture: AuthorityContractFixture, attemptId: string, successor = false): PublicationRequest {
  const snapshot = fixture.authority.read();
  const candidate = successor ? fixture.successor : fixture.candidate;
  return freezeRequest({ domainId: snapshot.domainId, attemptId, basis: snapshot.basis, expectedHead: snapshot.head, candidate });
}

/** LMU supplies immutable grammar to the authority; qualify that same boundary. */
export function freezeRequest(value: PublicationRequest): PublicationRequest {
  return Object.freeze({ ...value, expectedHead: Object.freeze({ ...value.expectedHead }),
    candidate: Object.freeze({ ...value.candidate, contract: Object.freeze({ ...value.candidate.contract }) }) });
}

export function receiptCopy(receipt: PublicationReceipt): PublicationReceipt {
  const copied = { request: { ...receipt.request, expectedHead: { ...receipt.request.expectedHead },
    candidate: { ...receipt.request.candidate, contract: { ...receipt.request.candidate.contract } } },
  previousHead: { ...receipt.previousHead } };
  return receipt.status === "committed" ? { ...copied, status: "committed", head: { ...receipt.head } }
    : { ...copied, status: "rejected", reason: receipt.reason };
}

export function sameReceipt(left: PublicationReceipt, right: PublicationReceipt): boolean {
  return sameRequest(left.request, right.request) && sameHead(left.previousHead, right.previousHead)
    && (left.status === "committed" && right.status === "committed" ? sameHead(left.head, right.head)
      : left.status === "rejected" && right.status === "rejected" && left.reason === right.reason);
}

/** Mutation can fail on a frozen snapshot; that also preserves detachment. */
export function tryMutation(value: object, key: string, replacement: unknown): void {
  Reflect.set(value, key, replacement);
}
