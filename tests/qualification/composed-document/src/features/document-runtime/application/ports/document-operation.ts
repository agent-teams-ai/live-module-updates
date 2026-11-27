import type { DocumentCommands, DocumentSnapshot, EditResult, ExportCommands, ExportResult } from "@fixture/portable-document";
import type { InvocationFacade } from "live-module-updates";
import type { SummaryCommands, SummaryOutcome } from "../../../export-summary/application/ports/export-summary.js";

/** This application owns its finite operations; the LMU library owns admission outcomes. */
export type DocumentCommand =
  | { readonly kind: "view" | "export" | "summary" }
  | { readonly kind: "edit"; readonly expected: number; readonly text: string }
  | { readonly kind: "nested-summary" | "held-view"; readonly barrier: string };

export type DocumentReply =
  | { readonly kind: "document"; readonly snapshot: DocumentSnapshot }
  | { readonly kind: "edit"; readonly result: EditResult }
  | { readonly kind: "export"; readonly result: ExportResult }
  | { readonly kind: "summary"; readonly result: SummaryOutcome };

/** This descriptor's semantic owner fixes the complete command and result union. */
export type DocumentInvocation = InvocationFacade<readonly [DocumentCommand], DocumentReply>;

export interface DocumentOperationPorts {
  readonly document: DocumentCommands;
  readonly publication: ExportCommands;
  readonly summary: SummaryCommands;
  readonly wait: (name: string) => Promise<void>;
  readonly use: () => void;
}
