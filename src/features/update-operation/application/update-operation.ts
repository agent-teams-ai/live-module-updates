import {
  copyAuthoritySnapshot, copyLookup, copyPublicationResult, copyUpdateRequest, updateBinding,
  type AuthoritySnapshot, type CandidateDescription, type CloseSnapshot,
  type PublicationReceipt, type PublicationRequest, type RuntimeSnapshot, type StartUpdateResult,
  type UpdateHandle, type UpdateLimits, type UpdateRequest, type UpdateSnapshot,
} from "./models.ts";
import type { InvocationBoundary } from "./invocation.ts";
import { captureCleanupReport } from "./cleanup-report.ts";
import type { UpdateAuthority } from "./ports/authority.ts";
import type { CleanupState, GenerationControl } from "./ports/lifetime.ts";
import type { CompatibilityPort, PreparationPort } from "./ports/preparation.ts";
import type { AdoptionProbe } from "./ports/adoption.ts";
export type { AdoptionProbe } from "./ports/adoption.ts";
import { cleanupSettled, snapshot, terminal, type Attempt, type OperationOwner, type Owner } from "./operation-state.ts";

export interface UpdateCoordinatorOptions<Args extends readonly unknown[], Result> {
  readonly domainId: string;
  readonly authority: UpdateAuthority;
  readonly compatibility: CompatibilityPort;
  readonly preparation: PreparationPort<Args, Result>;
  readonly invocation: InvocationBoundary<Args, Result>;
  readonly initial: {
    readonly candidate: CandidateDescription;
    readonly control: GenerationControl<Args, Result>;
  };
  readonly limits: UpdateLimits;
  readonly adoption?: AdoptionProbe<Args, Result>;
}

function isClosed<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>): boolean {
  return coordinator.closed;
}

function owners<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>): readonly Owner<Args, Result>[] {
  const { attempts, initialOwner } = coordinator;
  return [initialOwner, ...attempts.values()];
}

function ownerFor<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>, generationId: string): Owner<Args, Result> | undefined {
  const { attempts, initialOwner } = coordinator;
  if (initialOwner.generationId === generationId) {return initialOwner;}
  for (const attempt of attempts.values()) {
    if (attempt.generationId === generationId && attempt.control) {return attempt;}
  }
  return undefined;
}

function candidateCount<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>): number {
  const { attempts } = coordinator;
  let count = 0;
  for (const attempt of attempts.values()) {if (attempt.candidateSlot) {count += 1;}}
  return count;
}

function retirementBudget<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>): Set<string> {
  const { attempts } = coordinator;
  const ids = new Set<string>();
  for (const owner of owners(coordinator)) {
    if (owner.retiringPredecessor && owner.control?.snapshot().retained === true) {ids.add(owner.generationId);}
  }
  for (const attempt of attempts.values()) {if (attempt.reservedPredecessor !== undefined) {ids.add(attempt.reservedPredecessor);}}
  return ids;
}

function inspect<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>): RuntimeSnapshot {
  const { domainId, invocation, attempts } = coordinator;
  const retained = owners(coordinator).filter(owner => owner.retiringPredecessor && owner.control?.snapshot().retained === true);
  const reserved = new Set<string>();
  for (const attempt of attempts.values()) {if (attempt.reservedPredecessor !== undefined) {reserved.add(attempt.reservedPredecessor);}}
  return Object.freeze({
    domainId, closed: coordinator.closed,
    attempts: Object.freeze([...attempts.values()].map(snapshot)),
    generations: Object.freeze(invocation.generations().map(control => control.snapshot())),
    candidates: candidateCount(coordinator),
    retainedPredecessors: retained.length,
    reservedPredecessors: Object.freeze([...reserved]),
  });
}

function refresh<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>): void {
  const { attempts } = coordinator;
  for (const attempt of attempts.values()) {
    if (!attempt.settled && terminal(attempt)) {
      attempt.settled = true;
      attempt.completion.resolve(snapshot(attempt));
    }
  }
  if (!coordinator.closeFlight) {return;}
  if (owners(coordinator).some(owner => owner.pendingPreparation || owner.pendingPublication || !cleanupSettled(owner))) {return;}
  if ([...attempts.values()].some(attempt => attempt.unregisteredCleanup?.original.status === "pending")) {return;}
  const current = inspect(coordinator);
  const complete = owners(coordinator).every(owner => owner.control?.snapshot().retained !== true)
    && [...attempts.values()].every(attempt => !attempt.custody);
  coordinator.closeFlight.resolve(Object.freeze({ complete, snapshot: current }));
}

function forget<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>, owner: Owner<Args, Result>): void {
  const { attempts } = coordinator;
  if (owner.pendingPreparation || owner.pendingPublication || !owner.retirementRequested || !owner.control) {return;}
  if (owner.control.forget().status === "forgotten") {
    owner.custody = undefined;
    for (const attempt of attempts.values()) {if (attempt === owner) {attempt.candidateSlot = false;}}
  }
}

function retire<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>, owner: Owner<Args, Result>): void {
  owner.retirementRequested = true;
  owner.control?.seal();
  if (owner.pendingPreparation || owner.pendingPublication || !owner.control || owner.retirementFlight) {return;}
  const done = Promise.withResolvers<void>();
  owner.retirementFlight = done.promise;
  let closing: Promise<unknown>;
  try { closing = owner.control.close(); }
  catch (cause) { closing = Promise.reject(cause); }
  void closing.then(() => {
    forget(coordinator, owner);
    done.resolve();
    refresh(coordinator);
    return null;
  }, () => {
    // The exact control retains the original failed cleanup evidence.
    done.resolve();
    refresh(coordinator);
  });
}

async function observeAdoption<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>, attempt: Attempt<Args, Result>): Promise<void> {
  const { invocation, adoptionProbe } = coordinator;
  if (!adoptionProbe || coordinator.closed) {
    attempt.adoption = Object.freeze({ status: "not-requested" });
    refresh(coordinator);
    return;
  }
  attempt.adoption = Object.freeze({ status: "pending" });
  try {
    const outcome = await invocation.invokeExpected(attempt.generationId, ...adoptionProbe.args);
    if (outcome.status === "refused" && (outcome.reason === "generation-changed" || outcome.reason === "generation-unavailable")) {
      attempt.adoption = Object.freeze({ status: "superseded" });
    } else if (outcome.status === "returned" && outcome.generationId === attempt.generationId && adoptionProbe.accept(outcome.value)) {
      attempt.adoption = Object.freeze({ status: "observed", generationId: outcome.generationId });
    } else {
      attempt.adoption = Object.freeze({ status: "failed", cause: outcome });
    }
  } catch (cause) { attempt.adoption = Object.freeze({ status: "failed", cause }); }
  refresh(coordinator);
}

function acceptReceipt<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>, attempt: Attempt<Args, Result>, result: PublicationReceipt | { readonly status: "refused"; readonly reason: string }): void {
  if (attempt.publication.status !== "unknown") {
    const original = attempt.publication;
    const matching = (original.status === "committed" || original.status === "rejected")
      && (result.status === "committed" || result.status === "rejected")
      && JSON.stringify(original.receipt) === JSON.stringify(result);
    if (!matching && !(original.status === "refused" && result.status === "refused" && original.reason === result.reason)) {
      attempt.observationIssue = new Error("The authority contradicted its original terminal outcome");
    }
    return;
  }
  attempt.pendingPublication = false;
  attempt.reservedPredecessor = undefined;
  if (result.status === "committed") {
    attempt.publication = Object.freeze({ status: "committed", receipt: result });
    attempt.candidateSlot = false;
    if (attempt.predecessor) {
      attempt.predecessor.retiringPredecessor = true;
      retire(coordinator, attempt.predecessor);
    }
    // Start useful observation before terminal completion can be reported.
    void observeAdoption(coordinator, attempt);
    if (attempt.retirementRequested) {retire(coordinator, attempt);}
  } else {
    attempt.publication = result.status === "rejected"
      ? Object.freeze({ status: "rejected", receipt: result })
      : Object.freeze({ status: "refused", reason: result.reason });
    attempt.adoption = Object.freeze({ status: "not-requested" });
    retire(coordinator, attempt);
  }
  refresh(coordinator);
}

function uncertain<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>, attempt: Attempt<Args, Result>, cause?: unknown): void {
  if (attempt.publication.status !== "unknown") {
    if (cause !== undefined) {attempt.observationIssue = cause;}
    return;
  }
  attempt.publication = Object.freeze({ status: "unknown", ...(cause !== undefined ? { cause } : {}) });
  refresh(coordinator);
}

function requestPublication<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>, attempt: Attempt<Args, Result>, baseline: AuthoritySnapshot): void {
  const { domainId, publish } = coordinator;
  const request: PublicationRequest = Object.freeze({
    domainId, attemptId: attempt.request.attemptId, candidate: attempt.request.candidate,
    expectedHead: baseline.head, basis: baseline.basis,
  });
  attempt.publicationRequest = request;
  attempt.pendingPublication = true;
  attempt.publication = Object.freeze({ status: "unknown" });
  try {
    const raw = publish(request);
    void Promise.resolve(raw).then(value => {
      try {
        const result = copyPublicationResult(value, request);
        if (!result) {uncertain(coordinator, attempt, new Error("Malformed or unbound publication response"));}
        else if (result.status === "unknown") {uncertain(coordinator, attempt);}
        else {acceptReceipt(coordinator, attempt, result);}
      } catch (cause) { uncertain(coordinator, attempt, cause); }
      return null;
    }, (cause: unknown) =>{  uncertain(coordinator, attempt, cause); });
  } catch (cause) { uncertain(coordinator, attempt, cause); }
}

async function observeUnregisteredNative<Args extends readonly unknown[], Result>(attempt: Attempt<Args, Result>, retry: boolean): Promise<CleanupState> {
  if (!attempt.custody) { throw new Error("No native custody is available"); }
  let value: unknown;
  try {
    const native = attempt.custody.close();
    if (!retry) { attempt.unregisteredOriginal = native; }
    value = await native;
  } catch (cause) { return Object.freeze<CleanupState>({ status: "failed", cause, retryable: true }); }
  try { return Object.freeze({ status: "settled", report: captureCleanupReport(value) }); }
  catch (cause) { return Object.freeze<CleanupState>({ status: "failed", cause, retryable: false }); }
}

async function closeUnregistered<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>, attempt: Attempt<Args, Result>, retry = false): Promise<void> {
  if (!attempt.custody || (!retry && attempt.unregisteredCleanup)) { return; }
  const previous = attempt.unregisteredCleanup;
  const pending: CleanupState = Object.freeze({ status: "pending" });
  const original = retry && previous ? previous.original : pending;
  const retryCount = (previous?.retryCount ?? 0) + (retry ? 1 : 0);
  attempt.unregisteredCleanup = Object.freeze({ requested: true, original, latest: pending, retryCount });
  const latest = await observeUnregisteredNative(attempt, retry);
  attempt.unregisteredCleanup = Object.freeze({ requested: true, original: retry ? original : latest, latest, retryCount });
  if (latest.status === "settled" && latest.report.complete) { attempt.custody = undefined; attempt.candidateSlot = false; }
  refresh(coordinator);
}

async function prepare<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>, attempt: Attempt<Args, Result>, baseline: AuthoritySnapshot): Promise<void> {
  const { domainId, invocation, checkCompatibility, open } = coordinator;
  try {
    const compatible = checkCompatibility(Object.freeze({ candidate: attempt.request.candidate, current: baseline }));
    if (compatible.status !== "compatible") {
      attempt.planning = Object.freeze({ status: "refused", reason: compatible.reason });
      return;
    }
    if (attempt.predecessor?.control?.snapshot().installed !== true) {
      attempt.planning = Object.freeze({ status: "refused", reason: "unowned-current-generation" });
      return;
    }
    if (isClosed(coordinator)) { attempt.planning = Object.freeze({ status: "refused", reason: "runtime-closed" }); return; }
    attempt.planning = Object.freeze({ status: "ready", baseline });
    const custody = open(Object.freeze({ domainId, request: attempt.request, baseline }));
    attempt.custody = custody;
    const release = custody.close.bind(custody);
    const reservation = invocation.reserveGeneration({ generationId: attempt.generationId, release });
    if (reservation.status !== "reserved") {throw new Error(`Cannot retain the preparation owner: ${reservation.reason}`);}
    attempt.control = reservation.control;
    if (isClosed(coordinator)) {throw new Error("Runtime closed before candidate preparation");}
    attempt.preparation = Object.freeze({ status: "pending" });
    const prepared = await custody.prepare();
    if (isClosed(coordinator)) {throw new Error("Runtime closed while candidate preparation was outstanding");}
    const installed = attempt.control.install(prepared.invoke);
    if (installed.status !== "installed") {throw new Error(`Cannot install prepared generation: ${installed.reason}`);}
    attempt.preparation = Object.freeze({ status: "ready" });
    attempt.pendingPreparation = false;
    requestPublication(coordinator, attempt, baseline);
  } catch (cause) {
    if (attempt.planning.status === "pending") {attempt.planning = Object.freeze({ status: "failed", cause });}
    else {attempt.preparation = Object.freeze({ status: "failed", cause });}
  } finally {
    attempt.pendingPreparation = false;
    if (attempt.publication.status === "not-requested") {
      attempt.reservedPredecessor = undefined;
      attempt.adoption = Object.freeze({ status: "not-requested" });
      if (attempt.control) {retire(coordinator, attempt);}
      else if (attempt.custody) {void closeUnregistered(coordinator, attempt);}
      else {attempt.candidateSlot = false;}
    } else if (attempt.retirementRequested) {retire(coordinator, attempt);}
    refresh(coordinator);
  }
}

function reconcile<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>, attempt: Attempt<Args, Result>): Promise<UpdateSnapshot> {
  const { lookup } = coordinator;
  const request = attempt.publicationRequest;
  if (!request || attempt.publication.status !== "unknown") {return Promise.resolve(snapshot(attempt));}
  if (attempt.reconcileFlight) {return attempt.reconcileFlight;}
  const done = Promise.withResolvers<UpdateSnapshot>();
  attempt.reconcileFlight = done.promise;
  void (async () => {
    try {
      const result = copyLookup(await lookup(request), request);
      if (!result) {uncertain(coordinator, attempt, new Error("Malformed or unbound original-attempt receipt"));}
      else if (result.status === "known") {acceptReceipt(coordinator, attempt, result.receipt);}
      else {uncertain(coordinator, attempt);}
    } catch (cause) { uncertain(coordinator, attempt, cause); }
    attempt.reconcileFlight = undefined;
    done.resolve(snapshot(attempt));
  })();
  return done.promise;
}

function retryable(state: CleanupState | undefined): boolean {
  return state?.status === "failed" ? state.retryable
    : state?.status === "settled" && state.report.settled && !state.report.complete;
}

async function retryOwner<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>, owner: Owner<Args, Result> | undefined): Promise<void> {
  if (!owner?.control || !owner.retirementRequested || owner.pendingPreparation || owner.pendingPublication) { return; }
  const latest = owner.control.snapshot().cleanup.latest;
  if (!retryable(latest)) { return; }
  await owner.control.retryCleanup();
  forget(coordinator, owner);
  refresh(coordinator);
}

async function retryCleanup<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>, attempt: Attempt<Args, Result>): Promise<UpdateSnapshot> {
  const owner = attempt.publication.status === "committed" ? attempt.predecessor : attempt;
  try {
    await retryOwner(coordinator, owner);
    if (owner === attempt && !attempt.control && retryable(attempt.unregisteredCleanup?.latest)) {
      await closeUnregistered(coordinator, attempt, true);
    }
  } catch (cause) { attempt.observationIssue = cause; }
  return snapshot(attempt);
}

function retryRuntimeCleanup<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>): Promise<RuntimeSnapshot> {
  if (coordinator.retryFlight) { return coordinator.retryFlight; }
  const done = Promise.withResolvers<RuntimeSnapshot>();
  coordinator.retryFlight = done.promise;
  void (async () => {
    const native = owners(coordinator).map(owner => retryOwner(coordinator, owner));
    for (const attempt of coordinator.attempts.values()) {
      if (!attempt.control && retryable(attempt.unregisteredCleanup?.latest)) { native.push(closeUnregistered(coordinator, attempt, true)); }
    }
    // Each exact owner retains its own rejection/debt; other owners still progress.
    await Promise.allSettled(native);
    coordinator.retryFlight = undefined;
    refresh(coordinator);
    done.resolve(inspect(coordinator));
  })();
  return done.promise;
}

function startUpdate<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>, input: UpdateRequest): StartUpdateResult {
  const { domainId, limits, read, attempts, initialOwner } = coordinator;
  let request: UpdateRequest | undefined;
  try { request = copyUpdateRequest(input); } catch { request = undefined; }
  if (!request) {return Object.freeze({ status: "refused", reason: "invalid-request" });}
  const binding = updateBinding(request);
  const existing = attempts.get(request.attemptId);
  if (existing) {return existing.binding === binding
    ? Object.freeze({ status: "replayed", handle: existing.handle })
    : Object.freeze({ status: "refused", reason: "attempt-payload-mismatch" });}
  if (coordinator.closed) {return Object.freeze({ status: "refused", reason: "closed" });}
  if (attempts.size >= limits.maxAttempts) {return Object.freeze({ status: "refused", reason: "attempt-capacity" });}
  if (candidateCount(coordinator) >= limits.maxCandidates) {return Object.freeze({ status: "refused", reason: "candidate-capacity" });}
  if (request.candidate.generationId === initialOwner.generationId
    || [...attempts.values()].some(value => value.generationId === request.candidate.generationId)) {
    return Object.freeze({ status: "refused", reason: "generation-reused" });
  }
  let baseline: AuthoritySnapshot | undefined;
  let readIssue: unknown;
  try {
    baseline = copyAuthoritySnapshot(read());
    if (!baseline || baseline.domainId !== domainId) {throw new Error("Invalid canonical authority snapshot");}
  } catch (cause) { readIssue = cause; baseline = undefined; }
  if (baseline) {
    const budget = retirementBudget(coordinator);
    budget.add(baseline.head.generationId);
    if (budget.size > limits.maxRetainedPredecessors) {return Object.freeze({ status: "refused", reason: "retention-capacity" });}
  }
  const completion = Promise.withResolvers<UpdateSnapshot>();
  // The handle closes over the subsequently assigned record; no external callback
  // can reach it before the record is registered below.
  const handle: UpdateHandle = Object.freeze({
    attemptId: request.attemptId,
    completion: completion.promise,
    inspect: () => snapshot(attempt),
    reconcile: () => reconcile(coordinator, attempt),
    retryCleanup: () => retryCleanup(coordinator, attempt),
  });
  const attempt: Attempt<Args, Result> = {
    generationId: request.candidate.generationId, request, binding, completion, handle,
    baseline, predecessor: baseline ? ownerFor(coordinator, baseline.head.generationId) : undefined,
    control: undefined, custody: undefined, pendingPreparation: true, pendingPublication: false,
    retirementRequested: false, retiringPredecessor: false, retirementFlight: undefined,
    planning: Object.freeze({ status: "pending" }), preparation: Object.freeze({ status: "not-started" }),
    publication: Object.freeze({ status: "not-requested" }), adoption: Object.freeze({ status: "not-started" }),
    publicationRequest: undefined, reconcileFlight: undefined, candidateSlot: true,
    reservedPredecessor: baseline?.head.generationId, unregisteredCleanup: undefined, unregisteredOriginal: undefined,
    settled: false, observationIssue: undefined,
  };
  attempts.set(request.attemptId, attempt);
  if (baseline) {void prepare(coordinator, attempt, baseline);}
  else {
    attempt.pendingPreparation = false;
    attempt.planning = Object.freeze({ status: "failed", cause: readIssue });
    attempt.adoption = Object.freeze({ status: "not-requested" });
    attempt.candidateSlot = false;
    refresh(coordinator);
  }
  return Object.freeze({ status: "started", handle });
}

function close<Args extends readonly unknown[], Result>(coordinator: OperationOwner<Args, Result>): Promise<CloseSnapshot> {
  const { invocation } = coordinator;
  if (coordinator.closeFlight) {return coordinator.closeFlight.promise;}
  coordinator.closeFlight = Promise.withResolvers<CloseSnapshot>();
  coordinator.closed = true;
  invocation.seal();
  for (const owner of owners(coordinator)) {retire(coordinator, owner);}
  refresh(coordinator);
  return coordinator.closeFlight.promise;
}

export function createUpdateCoordinator<Args extends readonly unknown[], Result>(options: UpdateCoordinatorOptions<Args, Result>) {
  const coordinator: OperationOwner<Args, Result> = {
    domainId: options.domainId,
    invocation: options.invocation,
    limits: options.limits,
    read: options.authority.read.bind(options.authority),
    publish: options.authority.publish.bind(options.authority),
    lookup: options.authority.lookup.bind(options.authority),
    checkCompatibility: options.compatibility.check.bind(options.compatibility),
    open: options.preparation.open.bind(options.preparation),
    adoptionProbe: options.adoption,
    attempts: new Map(),
    initialOwner: {
      generationId: options.initial.candidate.generationId,
      control: options.initial.control,
      custody: undefined,
      pendingPreparation: false,
      pendingPublication: false,
      retirementRequested: false,
      retiringPredecessor: false,
      retirementFlight: undefined,
    },
    closed: false,
    closeFlight: undefined,
    retryFlight: undefined,
  };
  return Object.freeze({
    startUpdate: (request: UpdateRequest) => startUpdate(coordinator, request),
    inspect: () => inspect(coordinator),
    close: () => close(coordinator),
    retryCleanup: () => retryRuntimeCleanup(coordinator),
  });
}
