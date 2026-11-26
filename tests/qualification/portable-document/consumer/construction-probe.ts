export type ConstructionState = "not-started" | "pending" | "settled";
export interface ConstructionObservation {
  readonly state: ConstructionState;
  readonly closes: readonly ConstructionState[];
  readonly outcome: unknown;
}

/** TEST observation only: never replaces the raw Promise or delays actual cleanup. */
export function createConstructionProbe() {
  let state: ConstructionState = "not-started";
  let outcome: unknown;
  const closes: ConstructionState[] = [];
  const settled = (value: unknown) => { outcome = value; state = "settled"; };
  return {
    run: <Options, Result>(execute: (options: Options) => Promise<Result>, options: Options): Promise<Result> => {
      state = "pending";
      try {
        const raw = execute(options);
        void raw.then(settled, settled);
        return raw;
      } catch (error) { settled(error); throw error; }
    },
    close: <Result>(execute: () => Result): Result => { closes.push(state); return execute(); },
    read: (): ConstructionObservation => ({ state, outcome, closes: [...closes] }),
  };
}

/** Deliberate TEST control; activated only after construction custody exists. */
export function runWithoutCustody<Result>(work: () => Promise<Result>, _closed: Result): Promise<Result> {
  return work();
}

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}
export function constructionTrace(observation: ConstructionObservation, setupReason: unknown) {
  const outcome = record(observation.outcome);
  const cancellation = record(outcome?.["cancellation"]);
  const cause = record(outcome?.["cause"]);
  return {
    state: observation.state, closes: observation.closes,
    status: outcome?.["status"], phase: outcome?.["phase"], code: outcome?.["code"],
    implementationId: outcome?.["implementationId"], causeMessage: cause?.["message"],
    cancellation: cancellation !== undefined && Object.hasOwn(cancellation, "reason"),
    cancellationReasonMatches: setupReason !== undefined && cancellation !== undefined
      && Object.hasOwn(cancellation, "reason") && cancellation["reason"] === setupReason,
  };
}
