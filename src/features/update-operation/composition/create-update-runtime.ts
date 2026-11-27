import { createInvocationBoundary } from "../application/invocation.ts";
import { createUpdateCoordinator, type AdoptionProbe } from "../application/update-operation.ts";
import {
  copyAuthoritySnapshot, copyUpdateRequest,
  type CandidateDescription, type CloseSnapshot, type RuntimeSnapshot, type StartUpdateResult,
  type UpdateLimits, type UpdateRequest,
} from "../application/models.ts";
import type { UpdateAuthority } from "../application/ports/authority.ts";
import type { InvocationOutcome, ModuleEntry } from "../application/ports/invocation.ts";
import type { CleanupReport } from "../application/ports/lifetime.ts";
import type { CompatibilityPort, PreparationPort } from "../application/ports/preparation.ts";

export interface InitialGeneration<Args extends readonly unknown[], Result> {
  readonly candidate: CandidateDescription;
  readonly invoke: ModuleEntry<Args, Result>;
  /**
   * The Host admits/qualifies this initial closure before construction. Its
   * native owner transfers only on success and must not be independently released.
   */
  readonly release: () => Promise<CleanupReport>;
}

export interface UpdateRuntimeOptions<Args extends readonly unknown[], Result> {
  readonly domainId: string;
  readonly authority: UpdateAuthority;
  readonly compatibility: CompatibilityPort;
  readonly preparation: PreparationPort<Args, Result>;
  readonly initial: InitialGeneration<Args, Result>;
  readonly limits: UpdateLimits;
  readonly adoption?: AdoptionProbe<Args, Result>;
}

export interface UpdateRuntime<Args extends readonly unknown[], Result> {
  readonly invoke: (...args: Args) => Promise<InvocationOutcome<Result>>;
  readonly startUpdate: (request: UpdateRequest) => StartUpdateResult;
  readonly inspect: () => RuntimeSnapshot;
  readonly close: () => Promise<CloseSnapshot>;
  /** Explicitly retries settled native cleanup debt, including the initial owner. */
  readonly retryCleanup: () => Promise<RuntimeSnapshot>;
}

function captureAdoption<Args extends readonly unknown[], Result>(input: AdoptionProbe<Args, Result> | undefined): AdoptionProbe<Args, Result> | undefined {
  if (input === undefined) { return undefined; }
  const args = input.args;
  const accept = input.accept;
  if (!Array.isArray(args) || typeof accept !== "function") { throw new TypeError("Adoption requires explicit call arguments and a useful-result predicate"); }
  return Object.freeze({ args, accept: accept.bind(input) });
}

/**
 * Successful return transfers the initial native owner. All refusal/validation
 * failures occur before that transfer; the caller must close its untransferred owner.
 */
export function createUpdateRuntime<Args extends readonly unknown[], Result>(input: UpdateRuntimeOptions<Args, Result>): UpdateRuntime<Args, Result> {
  const domainId = input.domainId;
  if (typeof domainId !== "string" || domainId.length === 0) {throw new TypeError("domainId must be a nonempty string");}
  const { maxAttempts, maxCandidates, maxRetainedPredecessors, maxActiveWork } = input.limits;
  const limits = Object.freeze({ maxAttempts, maxCandidates, maxRetainedPredecessors, maxActiveWork });
  if (Object.values(limits).some(value => !Number.isSafeInteger(value) || value < 1)
    || maxAttempts >= Number.MAX_SAFE_INTEGER) {throw new TypeError("Every update limit must be an explicit positive safe integer");}
  const initialInput = input.initial;
  const initialRequest = copyUpdateRequest({ attemptId: "initial-generation", candidate: initialInput.candidate });
  const initialInvoke = initialInput.invoke;
  const initialRelease = initialInput.release;
  if (!initialRequest || typeof initialInvoke !== "function" || typeof initialRelease !== "function") {
    throw new TypeError("Initial generation must supply a valid identity, entry and existing native owner");
  }
  const authorityInput = input.authority;
  const compatibilityInput = input.compatibility;
  const preparationInput = input.preparation;
  const read = authorityInput.read;
  const publish = authorityInput.publish;
  const lookup = authorityInput.lookup;
  const check = compatibilityInput.check;
  const open = preparationInput.open;
  if (typeof read !== "function" || typeof publish !== "function" || typeof lookup !== "function"
    || typeof check !== "function" || typeof open !== "function") {throw new TypeError("Update ports must be complete callable owner contracts");}
  const authority: UpdateAuthority = Object.freeze({
    read: read.bind(authorityInput), publish: publish.bind(authorityInput), lookup: lookup.bind(authorityInput),
  });
  const compatibility: CompatibilityPort = Object.freeze({ check: check.bind(compatibilityInput) });
  const preparation: PreparationPort<Args, Result> = Object.freeze({ open: open.bind(preparationInput) });
  const adoption = captureAdoption(input.adoption);
  const invokeInitial = initialInvoke.bind(initialInput);
  const releaseInitial = initialRelease.bind(initialInput);
  // Last external read before the pure registration/transfer section below.
  const canonical = copyAuthoritySnapshot(authority.read());
  if (!canonical || canonical.domainId !== domainId || canonical.head.generationId !== initialRequest.candidate.generationId) {
    throw new TypeError("Initial generation must match the actual canonical authority head");
  }
  const invocation = createInvocationBoundary<Args, Result>({
    readCanonicalHead: () => {
      const value = copyAuthoritySnapshot(authority.read());
      if (!value || value.domainId !== domainId) {throw new Error("Invalid canonical authority snapshot");}
      return value.head;
    },
    maxActiveWork,
    maxGenerationIdentities: maxAttempts + 1,
  });
  const attached = invocation.attachGeneration({
    generationId: initialRequest.candidate.generationId,
    invoke: invokeInitial,
    release: releaseInitial,
  });
  if (attached.status !== "reserved") {throw new Error(`Initial owner registration failed: ${attached.reason}`);}
  const coordinator = createUpdateCoordinator({
    domainId, authority, compatibility, preparation, invocation, limits,
    initial: { candidate: initialRequest.candidate, control: attached.control },
    ...(adoption ? { adoption } : {}),
  });
  return Object.freeze({
    invoke: invocation.invoke,
    startUpdate: coordinator.startUpdate,
    inspect: coordinator.inspect,
    close: coordinator.close,
    retryCleanup: coordinator.retryCleanup,
  });
}
