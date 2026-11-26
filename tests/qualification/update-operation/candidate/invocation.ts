/** TEST-only L1 candidate. Its qualification precedes any production API decision. */
export type InvocationOutcome<Result> =
  | { readonly status: "returned"; readonly value: Result }
  | { readonly status: "failed"; readonly cause: unknown }
  | { readonly status: "refused"; readonly reason: InvocationRefusal };

export type InvocationRefusal =
  | "no-current-generation"
  | "generation-unavailable"
  | "admission-closed"
  | "continuation-closed"
  | "work-capacity";

/** A continuation of an already admitted operation, never a lookup or authority token. */
export interface BoundInvocation<Args extends readonly unknown[], Result> {
  readonly generationId: string;
  invoke(...args: Args): Promise<InvocationOutcome<Result>>;
}

export interface CleanupReport {
  readonly complete: boolean;
  readonly settled: boolean;
  readonly debts: readonly unknown[];
}

export interface GenerationControl<Report extends CleanupReport> {
  readonly generationId: string;
  seal(): void;
  pending(): number;
  drained(): Promise<void>;
  /** This always observes the original attempt, including its original debt/failure. */
  close(): Promise<Report>;
  /** A distinct retry after a settled incomplete original attempt, never an observation. */
  retryCleanup(): Promise<Report>;
  originalCleanup(): Promise<Report> | undefined;
}

export interface GenerationSpec<Args extends readonly unknown[], Result, Report extends CleanupReport> {
  readonly generationId: string;
  readonly invoke: (context: BoundInvocation<Args, Result>, ...args: Args) => Result | PromiseLike<Result>;
  readonly release: () => Promise<Report>;
}

/**
 * One cooperative JS agent, one Host-owned canonical head. readHead is an inert,
 * synchronous owner snapshot: it cannot invoke provider code or yield. The registry
 * retains exact instances; it never stores or publishes another current head.
 */
export function createInvocationBoundary<Args extends readonly unknown[], Result, Report extends CleanupReport>(options: {
  readonly readHead: () => Readonly<{ generationId: string }> | undefined;
  readonly maxActiveWork: number;
}) {
  if (!Number.isSafeInteger(options.maxActiveWork) || options.maxActiveWork < 1) {
    throw new TypeError("maxActiveWork must be an explicit positive safe integer");
  }
  const readHead = options.readHead;
  const maxActiveWork = options.maxActiveWork;
  const domainWork = new Set<object>();
  const entries = new Map<string, (args: Args) => Promise<InvocationOutcome<Result>>>();

  function attachGeneration(spec: GenerationSpec<Args, Result, Report>): GenerationControl<Report> {
    const generationId = spec.generationId;
    if (generationId.length === 0 || entries.has(generationId)) {
      throw new TypeError("a generation must have a nonempty, session-unique identity");
    }
    const entry = spec.invoke;
    const release = spec.release;
    type Work = {
      acceptingChildren: boolean;
      readonly children: Promise<InvocationOutcome<Result>>[];
      readonly completion: ReturnType<typeof Promise.withResolvers<InvocationOutcome<Result>>>;
      raw: Promise<Result> | undefined;
    };
    const active = new Set<Work>();
    const drainWaiters = new Set<() => void>();
    let accepting = true;
    let originalClose: Promise<Report> | undefined;
    let originalNativeClose: Promise<Report> | undefined;
    let latestCleanup: Promise<Report> | undefined;
    let latestReport: Report | undefined;
    let cleanupSettled = false;
    let cleanupFailed = false;
    let cleanupRetry: Promise<Report> | undefined;

    const refused = (reason: InvocationRefusal): Promise<InvocationOutcome<Result>> =>
      Promise.resolve({ status: "refused", reason });

    function start(args: Args, parent?: Work): Promise<InvocationOutcome<Result>> {
      if (parent ? !parent.acceptingChildren : !accepting) {
        return refused(parent ? "continuation-closed" : "admission-closed");
      }
      if (domainWork.size >= maxActiveWork) return refused("work-capacity");

      // Reserve every root/descendant before entering any provider callback.
      const record: Work = {
        acceptingChildren: true,
        children: [],
        completion: Promise.withResolvers<InvocationOutcome<Result>>(),
        raw: undefined,
      };
      active.add(record);
      domainWork.add(record);
      parent?.children.push(record.completion.promise);
      const context: BoundInvocation<Args, Result> = Object.freeze({
        generationId,
        invoke: (...nested: Args) => start(nested, record),
      });

      const finish = (outcome: InvocationOutcome<Result>): void => {
        // No new descendant can be registered after this raw body settles. Existing
        // descendants retain their own continuations, even if the parent forgot await.
        record.acceptingChildren = false;
        void Promise.all(record.children).then(() => {
          active.delete(record);
          domainWork.delete(record);
          record.completion.resolve(outcome);
          if (active.size === 0) {
            for (const resolve of drainWaiters) resolve();
            drainWaiters.clear();
          }
        });
      };
      try {
        const raw = Promise.resolve(entry(context, ...args));
        record.raw = raw; // Keep the actual operation, never an observer's abort race.
        void raw.then(
          (value) => finish({ status: "returned", value }),
          (cause: unknown) => finish({ status: "failed", cause }),
        );
      } catch (cause) {
        finish({ status: "failed", cause });
      }
      return record.completion.promise;
    }

    function seal(): void {
      accepting = false;
    }

    function drained(): Promise<void> {
      if (active.size === 0) return Promise.resolve();
      return new Promise<void>((resolve) => drainWaiters.add(resolve));
    }

    function startNativeCleanup(original: boolean): Promise<Report> {
      cleanupSettled = false;
      cleanupFailed = false;
      latestReport = undefined;
      let native: Promise<Report>;
      try {
        native = release();
      } catch (cause) {
        native = Promise.reject(cause);
      }
      latestCleanup = native;
      if (original) originalNativeClose = native;
      void native.then(
        (report) => { latestReport = report; cleanupSettled = true; },
        () => { cleanupFailed = true; cleanupSettled = true; },
      );
      return native;
    }

    function close(): Promise<Report> {
      if (originalClose) return originalClose;
      const completion = Promise.withResolvers<Report>();
      // Publish the flight and seal before any callback or cleanup can reenter.
      originalClose = completion.promise;
      seal();
      void (async () => {
        await drained();
        completion.resolve(await startNativeCleanup(true));
      })().catch(completion.reject);
      return originalClose;
    }

    function retryCleanup(): Promise<Report> {
      if (cleanupRetry && !cleanupSettled) return cleanupRetry;
      if (!originalClose || !cleanupSettled || !latestCleanup) {
        return Promise.reject(new Error("cleanup retry requires a settled original attempt"));
      }
      if (latestReport?.complete) return latestCleanup;
      if (!cleanupFailed && !latestReport?.settled) {
        return Promise.reject(new Error("an abandoned cleanup observation is not a settled attempt"));
      }
      // Publish the retry flight before release, which may synchronously reenter.
      const retry = Promise.withResolvers<Report>();
      cleanupRetry = retry.promise;
      cleanupSettled = false;
      void startNativeCleanup(false).then(retry.resolve, retry.reject);
      return retry.promise;
    }

    entries.set(generationId, (args) => start(args));
    return Object.freeze({ generationId, seal, pending: () => active.size, drained, close, retryCleanup,
      originalCleanup: () => originalNativeClose });
  }

  function invoke(...args: Args): Promise<InvocationOutcome<Result>> {
    let head: Readonly<{ generationId: string }> | undefined;
    try {
      head = readHead();
    } catch (cause) {
      return Promise.resolve({ status: "failed", cause });
    }
    if (!head) return Promise.resolve({ status: "refused", reason: "no-current-generation" });
    const entry = entries.get(head.generationId);
    if (!entry) return Promise.resolve({ status: "refused", reason: "generation-unavailable" });
    // In the selected single-agent profile, no await/provider callback separates
    // canonical selection, lookup and start's reservation.
    return entry(args);
  }

  return Object.freeze({ invoke, attachGeneration, pending: () => domainWork.size });
}

export type Observation<Result> =
  | { readonly status: "settled"; readonly outcome: InvocationOutcome<Result> }
  | { readonly status: "abandoned" };

/** This cancels only one observer. It cannot seal, cancel, release or settle the work. */
export function observeInvocation<Result>(work: Promise<InvocationOutcome<Result>>, abandon: AbortSignal): Promise<Observation<Result>> {
  if (abandon.aborted) return Promise.resolve({ status: "abandoned" });
  return new Promise((resolve) => {
    const stop = () => resolve({ status: "abandoned" });
    abandon.addEventListener("abort", stop, { once: true });
    void work.then((outcome) => {
      abandon.removeEventListener("abort", stop);
      resolve({ status: "settled", outcome });
    });
  });
}
