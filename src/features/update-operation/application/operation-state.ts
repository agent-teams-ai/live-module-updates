import type {
  AdoptionState, AuthoritySnapshot, CloseSnapshot, PlanningState,
  PreparationState, PublicationRequest, PublicationState, RuntimeSnapshot, UpdateHandle,
  UpdateHold, UpdateLimits, UpdateRequest, UpdateSnapshot,
} from "./models.ts";
import type { InvocationBoundary } from "./invocation.ts";
import type { UpdateAuthority } from "./ports/authority.ts";
import type { CleanupReport, GenerationControl, GenerationSnapshot } from "./ports/lifetime.ts";
import type { CompatibilityPort, PreparationCustody, PreparationPort } from "./ports/preparation.ts";
import type { AdoptionProbe } from "./ports/adoption.ts";

export interface Owner<Args extends readonly unknown[], Result> {
  readonly generationId: string;
  control: GenerationControl<Args, Result> | undefined;
  custody: PreparationCustody<Args, Result> | undefined;
  pendingPreparation: boolean;
  pendingPublication: boolean;
  retirementRequested: boolean;
  retiringPredecessor: boolean;
  retirementFlight: Promise<void> | undefined;
}

export interface Attempt<Args extends readonly unknown[], Result> extends Owner<Args, Result> {
  readonly request: UpdateRequest;
  readonly binding: string;
  readonly completion: PromiseWithResolvers<UpdateSnapshot>;
  handle: UpdateHandle;
  baseline: AuthoritySnapshot | undefined;
  predecessor: Owner<Args, Result> | undefined;
  planning: PlanningState;
  preparation: PreparationState;
  publication: PublicationState;
  adoption: AdoptionState;
  publicationRequest: PublicationRequest | undefined;
  reconcileFlight: Promise<UpdateSnapshot> | undefined;
  candidateSlot: boolean;
  reservedPredecessor: string | undefined;
  unregisteredCleanup: GenerationSnapshot["cleanup"] | undefined;
  unregisteredOriginal: Promise<CleanupReport> | undefined;
  settled: boolean;
  observationIssue: unknown;
}

export function originalCleanupObserved<Args extends readonly unknown[], Result>(owner: Owner<Args, Result> | undefined): boolean {
  if (!owner?.control) {return true;}
  const original = owner.control.snapshot().cleanup.original;
  return original.status === "settled" || original.status === "failed";
}

function holdsFor<Args extends readonly unknown[], Result>(
  attempt: Attempt<Args, Result>, candidateLifetime: GenerationSnapshot | undefined, predecessorLifetime: GenerationSnapshot | undefined,
): readonly UpdateHold[] {
  const holds: UpdateHold[] = [];
  if (attempt.pendingPreparation) {holds.push("preparation");}
  if (attempt.pendingPublication) {holds.push("publication");}
  if ((candidateLifetime?.pendingWork ?? 0) > 0 || (predecessorLifetime?.pendingWork ?? 0) > 0) {holds.push("work");}
  const needed = attempt.publication.status === "committed" ? predecessorLifetime : candidateLifetime;
  if ((needed?.cleanup.requested === true && !(needed.cleanup.latest.status === "settled" && needed.cleanup.latest.report.complete))
    || (attempt.unregisteredCleanup && !(attempt.unregisteredCleanup.latest.status === "settled" && attempt.unregisteredCleanup.latest.report.complete))) {holds.push("cleanup");}
  if (attempt.reservedPredecessor !== undefined) {holds.push("retirement-reservation");}
  return Object.freeze(holds);
}

export function snapshot<Args extends readonly unknown[], Result>(attempt: Attempt<Args, Result>): UpdateSnapshot {
  const candidateLifetime = attempt.control?.snapshot();
  const predecessorLifetime = attempt.predecessor?.control?.snapshot();
  return Object.freeze({
    attemptId: attempt.request.attemptId,
    candidate: attempt.request.candidate,
    planning: attempt.planning,
    preparation: attempt.preparation,
    publication: attempt.publication,
    adoption: attempt.adoption,
    ...(candidateLifetime ? { candidateLifetime } : {}),
    ...(predecessorLifetime ? { predecessorLifetime } : {}),
    ...(attempt.unregisteredCleanup ? { unregisteredCleanup: attempt.unregisteredCleanup } : {}),
    holds: holdsFor(attempt, candidateLifetime, predecessorLifetime),
    settled: attempt.settled,
    ...(attempt.observationIssue !== undefined ? { observationIssue: attempt.observationIssue } : {}),
  });
}

export function terminal<Args extends readonly unknown[], Result>(attempt: Attempt<Args, Result>): boolean {
  if (attempt.pendingPreparation || attempt.pendingPublication || attempt.planning.status === "pending"
    || attempt.preparation.status === "pending" || attempt.adoption.status === "pending") {return false;}
  if (attempt.unregisteredCleanup && attempt.unregisteredCleanup.original.status !== "settled" && attempt.unregisteredCleanup.original.status !== "failed") {return false;}
  return originalCleanupObserved(attempt.publication.status === "committed" ? attempt.predecessor : attempt);
}

/** One complete update use case. Host ports own authority and native resource semantics. */
export interface OperationOwner<Args extends readonly unknown[], Result> {
  readonly domainId: string;
  readonly invocation: InvocationBoundary<Args, Result>;
  readonly limits: UpdateLimits;
  readonly read: UpdateAuthority["read"];
  readonly publish: UpdateAuthority["publish"];
  readonly lookup: UpdateAuthority["lookup"];
  readonly checkCompatibility: CompatibilityPort["check"];
  readonly open: PreparationPort<Args, Result>["open"];
  readonly adoptionProbe: AdoptionProbe<Args, Result> | undefined;
  readonly attempts: Map<string, Attempt<Args, Result>>;
  readonly initialOwner: Owner<Args, Result>;
  closed: boolean;
  closeFlight: PromiseWithResolvers<CloseSnapshot> | undefined;
  retryFlight: Promise<RuntimeSnapshot> | undefined;
}

