import type { CapabilitiesOf } from "@get-modular/assembly";
import type { ExportContracts } from "@fixture/portable-document-gm";

export type SummaryContracts = ExportContracts;
export interface SummaryCapabilities extends CapabilitiesOf<ExportContracts> {}
