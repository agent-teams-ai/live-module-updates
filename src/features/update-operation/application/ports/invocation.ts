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

/**
 * One admitted provider invocation's continuation, not an authority token.
 * It closes when LMU observes that provider's return settlement; its descendants
 * keep their own continuations and retain the aggregate operation's lifetime.
 */
export interface BoundInvocation<Args extends readonly unknown[], Result> {
  readonly generationId: string;
  readonly invoke: (...args: Args) => Promise<InvocationOutcome<Result>>;
}

export type ModuleEntry<Args extends readonly unknown[], Result> =
  (context: BoundInvocation<Args, Result>, ...args: Args) => Result | PromiseLike<Result>;

/**
 * The stable surface ordinary callers may retain. Result ownership belongs to
 * the capability contract; returned functions/resources receive no implicit lease.
 */
export interface InvocationFacade<Args extends readonly unknown[], Result> {
  readonly invoke: (...args: Args) => Promise<InvocationOutcome<Result>>;
}
