import type { AuthoritySnapshot, CandidateDescription, UpdateRequest } from "../models.ts";
import type { ModuleEntry } from "./invocation.ts";
import type { CleanupReport } from "./lifetime.ts";

export interface PreparationContext {
  readonly domainId: string;
  readonly request: UpdateRequest;
  readonly baseline: AuthoritySnapshot;
}

export interface PreparedGeneration<Args extends readonly unknown[], Result> {
  /** LMU captures this original callable and its prepared receiver before installation. */
  readonly invoke: ModuleEntry<Args, Result>;
}

export interface PreparationCustody<Args extends readonly unknown[], Result> {
  /** Every acquisition and evaluation must be covered by this original owner. */
  readonly prepare: () => PreparedGeneration<Args, Result> | PromiseLike<PreparedGeneration<Args, Result>>;
  /** Actual native close. LMU preserves the first flight and makes retries explicit. */
  readonly close: () => Promise<CleanupReport>;
}

export interface PreparationPort<Args extends readonly unknown[], Result> {
  /**
   * Creates an inert owner synchronously. No evaluation or external acquisition
   * occurs until the returned owner is captured and prepare() is called.
   */
  readonly open: (context: PreparationContext) => PreparationCustody<Args, Result>;
}

export type CompatibilityResult =
  | { readonly status: "compatible" }
  | { readonly status: "refused"; readonly reason: string };

export interface CompatibilityPort {
  /** Inert planning only; cannot grant publication or product-write authority. */
  readonly check: (context: { readonly candidate: CandidateDescription; readonly current: AuthoritySnapshot }) => CompatibilityResult;
}
