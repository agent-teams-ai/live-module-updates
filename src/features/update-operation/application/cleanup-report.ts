import type { CleanupReport } from "./ports/lifetime.ts";

function debtArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

/** The returned value is not evidence that the original native close settled. */
export class InvalidCleanupReportError extends TypeError {
  readonly code = "lmu.cleanup.invalid-report";
  readonly reason: "malformed" | "unsettled-observation" | "inconsistent" | "unreadable";

  constructor(reason: InvalidCleanupReportError["reason"], cause?: unknown) {
    super(`Native cleanup returned an invalid report: ${reason}`, cause === undefined ? undefined : { cause });
    this.reason = reason;
  }
}

/** Pure receipt capture shared by registered and exceptional unregistered owners. */
export function captureCleanupReport(value: unknown): CleanupReport {
  try {
    if (typeof value !== "object" || value === null
      || !("complete" in value) || !("settled" in value) || !("debts" in value)) {
      throw new InvalidCleanupReportError("malformed");
    }
    // Read the owner fields exactly once before validation. Never deep-clone an
    // opaque debt or Error: their identity remains the native owner's evidence.
    const { complete, settled, debts } = value;
    if (typeof complete !== "boolean" || typeof settled !== "boolean" || !debtArray(debts)) {
      throw new InvalidCleanupReportError("malformed");
    }
    if (!settled) { throw new InvalidCleanupReportError("unsettled-observation"); }
    const capturedDebts: readonly unknown[] = Object.freeze([...debts]);
    if (complete && capturedDebts.length !== 0) { throw new InvalidCleanupReportError("inconsistent"); }
    return Object.freeze({ complete, settled, debts: capturedDebts });
  } catch (cause) {
    if (cause instanceof InvalidCleanupReportError) { throw cause; }
    throw new InvalidCleanupReportError("unreadable", cause);
  }
}
