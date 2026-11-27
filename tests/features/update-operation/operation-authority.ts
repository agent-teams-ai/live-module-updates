import type {
  AuthoritySnapshot, Head, PublicationReceipt, PublicationRequest, PublicationResult,
} from "../../../src/features/update-operation/application/models.ts";
import type { UpdateAuthority } from "../../../src/features/update-operation/application/ports/authority.ts";

interface RecordValue {
  readonly head: Head;
  readonly revision: number;
  readonly schema: number;
  readonly grantRevision: number;
  readonly allowed: boolean;
  readonly text: string;
  readonly receipts: ReadonlyMap<string, PublicationReceipt>;
}

function identity(request: PublicationRequest): string {
  return JSON.stringify([
    request.attemptId, request.domainId, request.expectedHead.generationId, request.expectedHead.revision,
    request.candidate.generationId, request.candidate.closureId, request.candidate.contract.id,
    request.candidate.contract.revision, request.candidate.profile, request.basis,
  ]);
}

function basis(value: RecordValue): string {
  return `${value.revision}/${value.schema}/${value.grantRevision}/${value.allowed ? "allowed" : "denied"}`;
}

/** Independent single-process authority and effect receiver used by operation tests. */
export function createOperationAuthority(domainId = "document") {
  const store = new Map<string, RecordValue>();
  store.set(domainId, {
    head: Object.freeze({ generationId: "A", revision: "0" }), revision: 0, schema: 1,
    grantRevision: 0, allowed: true, text: "seed", receipts: new Map(),
  });
  function current(): RecordValue {
    const value = store.get(domainId);
    if (!value) {throw new Error("Missing authority owner");}
    return value;
  }
  function read(): AuthoritySnapshot {
    const value = current();
    return Object.freeze({ domainId, head: Object.freeze({ ...value.head }), basis: basis(value) });
  }
  function publish(request: PublicationRequest): PublicationResult {
    const value = current();
    const previous = value.receipts.get(request.attemptId);
    if (previous) {return identity(previous.request) === identity(request)
      ? previous
      : Object.freeze({ status: "refused", request, reason: "changed-attempt" });}
    let reason: string | undefined;
    if (request.domainId !== domainId) {reason = "domain";}
    else if (request.expectedHead.generationId !== value.head.generationId || request.expectedHead.revision !== value.head.revision) {reason = "head-conflict";}
    else if (request.basis !== basis(value)) {reason = "basis-conflict";}
    else if (!value.allowed) {reason = "denied";}
    const result: PublicationReceipt = reason !== undefined
      ? Object.freeze({ status: "rejected", request, previousHead: value.head, reason })
      : Object.freeze({
        status: "committed", request, previousHead: value.head,
        head: Object.freeze({ generationId: request.candidate.generationId, revision: String(Number(value.head.revision) + 1) }),
      });
    const receipts = new Map(value.receipts);
    receipts.set(request.attemptId, result);
    // The relevant owner state, routing and receipt are replaced together.
    store.set(domainId, { ...value, head: result.status === "committed" ? result.head : value.head, receipts });
    return result;
  }
  const authority: UpdateAuthority = {
    read,
    publish,
    lookup(request) {
      const receipt = current().receipts.get(request.attemptId);
      return receipt ? { status: "known", receipt } : { status: "unknown" };
    },
  };
  return {
    authority,
    read,
    publish,
    document: () => Object.freeze({ revision: current().revision, text: current().text }),
    write(generationId: string, revision: number, text: string): "written" | "stale-generation" | "denied" | "state-conflict" {
      const value = current();
      if (value.head.generationId !== generationId) {return "stale-generation";}
      if (!value.allowed) {return "denied";}
      if (value.revision !== revision) {return "state-conflict";}
      store.set(domainId, { ...value, revision: value.revision + 1, text });
      return "written";
    },
    changeGrant(allowed: boolean) {
      const value = current();
      store.set(domainId, { ...value, allowed, grantRevision: value.grantRevision + 1 });
    },
    changeSchema(schema: number) { store.set(domainId, { ...current(), schema }); },
  };
}
