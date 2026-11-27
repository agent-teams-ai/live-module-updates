/** Curated TEST reference; the authored Summary implementation is staged unchanged. */
export { summaryComposition, prepareSummaryComposition } from "./summary.js";
export type { SummaryComposition } from "./summary.js";
export type { SummaryContracts, SummaryCapabilities } from "./features/export-summary/composition/export-summary.contracts.js";
export type { PublicationOutcome, SummaryCommands, SummaryOutcome } from "./features/export-summary/application/ports/export-summary.js";
export { closureComposition, prepareClosure } from "./composition/closure.js";
export type { ClosureComposition } from "./composition/closure.js";
export { createDocumentEntry } from "./features/document-runtime/composition/document-runtime.entry.js";
export type { DocumentCommand, DocumentInvocation, DocumentOperationPorts, DocumentReply } from "./features/document-runtime/application/ports/document-operation.js";
export { runtimeComposition, prepareRuntime } from "./composition/root.js";
export { Invocation } from "./features/document-runtime/composition/document-runtime.contracts.js";
export type { DocumentRuntimeInputs, DocumentRuntimeRecovery, DocumentRuntimeSettings, RuntimeCapabilities, RuntimeContracts } from "./features/document-runtime/composition/document-runtime.contracts.js";
