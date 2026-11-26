import type { ModuleEntry } from "./invocation.ts";

/** Minimal native cleanup port; the exact owner's report and debts are preserved. */
export interface CleanupReport {
  readonly complete: boolean;
  readonly settled: boolean;
  readonly debts: readonly unknown[];
}

export type CleanupState =
  | { readonly status: "not-started" }
  | { readonly status: "pending" }
  | { readonly status: "settled"; readonly report: CleanupReport }
  | { readonly status: "failed"; readonly cause: unknown; readonly retryable: boolean };

export interface GenerationSnapshot {
  readonly generationId: string;
  readonly installed: boolean;
  readonly sealed: boolean;
  readonly retained: boolean;
  readonly pendingWork: number;
  readonly cleanup: {
    readonly requested: boolean;
    readonly original: CleanupState;
    readonly latest: CleanupState;
    readonly retryCount: number;
  };
}

export type InstallationResult =
  | { readonly status: "installed" }
  | { readonly status: "refused"; readonly reason: "already-installed" | "sealed" | "forgotten" | "invalid-entry" };

export type ForgetResult =
  | { readonly status: "forgotten" }
  | { readonly status: "retained"; readonly reason: "admission-open" | "work-pending" | "cleanup-incomplete" };

/** Host coordination only: none of these methods exposes a provider or resource root. */
export interface GenerationControl<Args extends readonly unknown[], Result> {
  readonly generationId: string;
  install(entry: ModuleEntry<Args, Result>): InstallationResult;
  seal(): void;
  pending(): number;
  drained(): Promise<void>;
  /** Observe the original drain/cleanup attempt; calling again never retries it. */
  close(): Promise<CleanupReport>;
  /** A separate native attempt, after actual settlement; an abandoned observation cannot authorize retry. */
  retryCleanup(): Promise<CleanupReport>;
  originalCleanup(): Promise<CleanupReport> | undefined;
  snapshot(): GenerationSnapshot;
  /** The coordinator first discharges preparation/publication obligations. */
  forget(): ForgetResult;
}

export type GenerationReservation<Args extends readonly unknown[], Result> =
  | { readonly status: "reserved"; readonly control: GenerationControl<Args, Result> }
  | { readonly status: "refused"; readonly reason: "invalid-generation" | "invalid-owner" | "generation-reused" | "generation-capacity" };
