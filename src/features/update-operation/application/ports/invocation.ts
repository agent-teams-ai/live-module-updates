/** Ordinary semantic results remain owned by the capability's contract. */
export type InvocationRefusal =
  | "no-current-generation"
  | "generation-unavailable"
  | "generation-changed"
  | "admission-closed"
  | "continuation-closed"
  | "work-capacity"
  | "boundary-closed";

export type InvocationOutcome<Result> =
  | { readonly status: "returned"; readonly generationId: string; readonly value: Result }
  | { readonly status: "failed"; readonly generationId: string; readonly cause: unknown }
  | { readonly status: "refused"; readonly reason: InvocationRefusal }
  | { readonly status: "refused"; readonly reason: "authority-unavailable"; readonly cause: unknown };

/** An already admitted operation's continuation, not a lookup or an authority token. */
export interface BoundInvocation<Args extends readonly unknown[], Result> {
  readonly generationId: string;
  invoke(...args: Args): Promise<InvocationOutcome<Result>>;
}

export type ModuleEntry<Args extends readonly unknown[], Result> =
  (context: BoundInvocation<Args, Result>, ...args: Args) => Result | PromiseLike<Result>;

/** The stable surface ordinary callers may retain. Provider roots do not escape here. */
export interface InvocationFacade<Args extends readonly unknown[], Result> {
  invoke(...args: Args): Promise<InvocationOutcome<Result>>;
}
