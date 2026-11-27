import { implement } from "@get-modular/assembly";
import { createExportSummary } from "../application/use-cases/create-export-summary.js";
import type { SummaryCapabilities } from "./export-summary.contracts.js";
import { summaryDeclaration } from "./export-summary.declaration.js";

export const summaryModule = implement<SummaryCapabilities>()(summaryDeclaration, async dependencies => ({
  instance: createExportSummary({ publish: () => dependencies.publication.publish() }),
  capabilities: {},
}));
