import { captureCleanupReport } from "./cleanup-report.ts";
import type { BoundInvocation, InvocationOutcome, ModuleEntry } from "./ports/invocation.ts";
import type {
  CleanupReport, CleanupState, ForgetResult, GenerationControl, GenerationSnapshot, InstallationResult,
} from "./ports/lifetime.ts";

interface Work<Result> {
  acceptingChildren: boolean;
  readonly children: Promise<InvocationOutcome<Result>>[];
  completion: ReturnType<typeof Promise.withResolvers<InvocationOutcome<Result>>> | undefined;
  raw: Promise<Result> | undefined;
}

interface CleanupAttempt {
  state: CleanupState;
  complete: boolean;
  native: Promise<CleanupReport> | undefined;
  observation: Promise<CleanupReport> | undefined;
}

interface GenerationOptions<Args extends readonly unknown[], Result> {
  readonly generationId: string;
  readonly release: () => Promise<CleanupReport>;
  readonly sealed: boolean;
  readonly sharedWork: Set<object>;
  readonly maxActiveWork: number;
  readonly forgetRegistration: (control: GenerationControl<Args, Result>) => void;
}

export interface GenerationRecord<Args extends readonly unknown[], Result> {
  readonly control: GenerationControl<Args, Result>;
  readonly start: (args: Args) => Promise<InvocationOutcome<Result>>;
}

const notStarted: CleanupState = Object.freeze({ status: "not-started" });

/** The single exact instance owner; native Resources still owns every cleanup callback. */
class GenerationOwner<Args extends readonly unknown[], Result> {
  readonly control: GenerationControl<Args, Result>;
  readonly #generationId: string;
  readonly #sharedWork: Set<object>;
  readonly #maxActiveWork: number;
  readonly #active = new Set<Work<Result>>();
  readonly #drainWaiters = new Set<() => void>();
  #forgetRegistration: ((control: GenerationControl<Args, Result>) => void) | undefined;
  #entry: ModuleEntry<Args, Result> | undefined;
  #release: (() => Promise<CleanupReport>) | undefined;
  #sealed: boolean;
  #retained = true;
  #originalClose: Promise<CleanupReport> | undefined;
  #originalAttempt: CleanupAttempt | undefined;
  #latestAttempt: CleanupAttempt | undefined;
  #retryFlight: Promise<CleanupReport> | undefined;
  #retryCount = 0;

  constructor(options: GenerationOptions<Args, Result>) {
    this.#generationId = options.generationId;
    this.#sharedWork = options.sharedWork;
    this.#maxActiveWork = options.maxActiveWork;
    this.#release = options.release;
    this.#sealed = options.sealed;
    this.#forgetRegistration = options.forgetRegistration;
    this.control = Object.freeze({
      generationId: this.#generationId,
      install: (entry: ModuleEntry<Args, Result>) => this.#install(entry),
      seal: () => { this.#sealed = true; },
      pending: () => this.#active.size,
      drained: () => this.#drained(),
      close: () => this.#close(),
      retryCleanup: () => this.#retryCleanup(),
      originalCleanup: () => this.#originalAttempt?.native,
      snapshot: () => this.#snapshot(),
      forget: () => this.#forget(),
    });
  }

  start(args: Args, parent?: Work<Result>): Promise<InvocationOutcome<Result>> {
    if (parent ? !parent.acceptingChildren : this.#sealed) {
      return Promise.resolve({ status: "refused", reason: parent ? "continuation-closed" : "admission-closed" });
    }
    if (!this.#entry) { return Promise.resolve({ status: "refused", reason: "generation-unavailable" }); }
    if (this.#sharedWork.size >= this.#maxActiveWork) { return Promise.resolve({ status: "refused", reason: "work-capacity" }); }
    const completion = Promise.withResolvers<InvocationOutcome<Result>>();
    const record: Work<Result> = { acceptingChildren: true, children: [], completion, raw: undefined };
    this.#active.add(record);
    this.#sharedWork.add(record);
    parent?.children.push(completion.promise);
    const context: BoundInvocation<Args, Result> = Object.freeze({
      generationId: this.#generationId,
      invoke: (...nested: Args) => this.start(nested, record),
    });
    let call: ModuleEntry<Args, Result> | undefined = this.#entry;
    try {
      const raw = Promise.resolve(call(context, ...args));
      record.raw = raw;
      void raw.then(
        (value) => { this.#finish(record, { status: "returned", generationId: this.#generationId, value }); return; },
        (cause: unknown) => { this.#finish(record, { status: "failed", generationId: this.#generationId, cause }); return; },
      );
    } catch (cause) {
      this.#finish(record, { status: "failed", generationId: this.#generationId, cause });
    } finally { call = undefined; }
    return completion.promise;
  }

  #finish(record: Work<Result>, outcome: InvocationOutcome<Result>): void {
    record.acceptingChildren = false;
    void Promise.all(record.children).then(() => {
      this.#active.delete(record);
      this.#sharedWork.delete(record);
      const completion = record.completion;
      // A closed escaped continuation keeps no raw promise, child result or resolver.
      record.raw = undefined;
      record.children.length = 0;
      record.completion = undefined;
      completion?.resolve(outcome);
      if (this.#active.size === 0) {
        for (const resolve of this.#drainWaiters) { resolve(); }
        this.#drainWaiters.clear();
      }
      return;
    });
  }

  #install(entry: ModuleEntry<Args, Result>): InstallationResult {
    if (!this.#retained) { return { status: "refused", reason: "forgotten" }; }
    if (this.#sealed) { return { status: "refused", reason: "sealed" }; }
    if (this.#entry) { return { status: "refused", reason: "already-installed" }; }
    if (typeof entry !== "function") { return { status: "refused", reason: "invalid-entry" }; }
    this.#entry = entry;
    return { status: "installed" };
  }

  #drained(): Promise<void> {
    if (this.#active.size === 0) { return Promise.resolve(); }
    return new Promise<void>((resolve) => { this.#drainWaiters.add(resolve); });
  }

  #capture(attempt: CleanupAttempt, value: unknown): CleanupReport {
    try {
      const report = captureCleanupReport(value);
      attempt.complete = report.complete;
      attempt.state = Object.freeze({ status: "settled", report });
      return report;
    } catch (cause) {
      // A malformed or abandon-only observation cannot authorize another cleanup.
      attempt.state = Object.freeze({ status: "failed", cause, retryable: false });
      throw cause;
    }
  }

  #beginCleanup(original: boolean): Promise<CleanupReport> {
    const attempt: CleanupAttempt = { state: Object.freeze({ status: "pending" }), complete: false, native: undefined, observation: undefined };
    this.#latestAttempt = attempt;
    if (original) { this.#originalAttempt = attempt; }
    let call = this.#release;
    let native: Promise<CleanupReport>;
    try {
      if (!call) { throw new Error("generation has no retained native cleanup owner"); }
      native = call();
    } catch (cause) { native = Promise.reject(cause); }
    finally { call = undefined; }
    attempt.native = native;
    const observation = Promise.resolve(native).then(
      (report) => this.#capture(attempt, report),
      (cause: unknown) => {
        attempt.state = Object.freeze({ status: "failed", cause, retryable: true });
        throw cause;
      },
    );
    attempt.observation = observation;
    return observation;
  }

  #close(): Promise<CleanupReport> {
    if (this.#originalClose) { return this.#originalClose; }
    const completion = Promise.withResolvers<CleanupReport>();
    this.#originalClose = completion.promise;
    this.#sealed = true;
    void (async () => {
      await this.#drained();
      completion.resolve(await this.#beginCleanup(true));
    })().catch(completion.reject);
    return this.#originalClose;
  }

  #retryCleanup(): Promise<CleanupReport> {
    const latest = this.#latestAttempt;
    if (this.#retryFlight && latest?.state.status === "pending") { return this.#retryFlight; }
    if (!this.#originalClose || !latest || latest.state.status === "pending") {
      return Promise.reject(new Error("cleanup retry requires a settled original attempt"));
    }
    if (latest.complete && latest.observation) { return latest.observation; }
    if (latest.state.status === "failed" && !latest.state.retryable) {
      return Promise.reject(new Error("cleanup retry cannot proceed without the original native settlement"));
    }
    const completion = Promise.withResolvers<CleanupReport>();
    this.#retryFlight = completion.promise;
    this.#retryCount += 1;
    void this.#beginCleanup(false).then(completion.resolve, completion.reject);
    return this.#retryFlight;
  }

  #snapshot(): GenerationSnapshot {
    return Object.freeze({ generationId: this.#generationId, installed: this.#entry !== undefined,
      sealed: this.#sealed, retained: this.#retained, pendingWork: this.#active.size,
      cleanup: Object.freeze({ requested: this.#originalClose !== undefined, original: this.#originalAttempt?.state ?? notStarted,
        latest: this.#latestAttempt?.state ?? notStarted, retryCount: this.#retryCount }) });
  }

  #forget(): ForgetResult {
    if (!this.#retained) { return { status: "forgotten" }; }
    if (!this.#sealed) { return { status: "retained", reason: "admission-open" }; }
    if (this.#active.size > 0) { return { status: "retained", reason: "work-pending" }; }
    if (this.#latestAttempt?.complete !== true) { return { status: "retained", reason: "cleanup-incomplete" }; }
    this.#forgetRegistration?.(this.control);
    this.#forgetRegistration = undefined;
    this.#entry = undefined;
    this.#release = undefined;
    this.#retained = false;
    return { status: "forgotten" };
  }
}

/** Internal construction; no provider callback or acquisition runs here. */
export function createGenerationRecord<Args extends readonly unknown[], Result>(options: GenerationOptions<Args, Result>): GenerationRecord<Args, Result> {
  const owner = new GenerationOwner(options);
  return Object.freeze({ control: owner.control, start: (args: Args) => owner.start(args) });
}
