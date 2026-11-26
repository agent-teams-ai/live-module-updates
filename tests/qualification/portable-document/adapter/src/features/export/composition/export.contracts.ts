import { defineContract, type CapabilitiesOf } from "@get-modular/assembly";
import type { SetupSpec } from "@get-modular/resources";
import type { ExportCommands, ExportDeliveryPort } from "@fixture/portable-document";
import type { DocumentContracts } from "../../document/composition/document.contracts.js";
import type { FormatContracts } from "../../format/composition/format.contracts.js";

export const Export = defineContract<ExportCommands>()({ id: "fixture/export", revision: 1 });
export const ExportDelivery = defineContract<SetupSpec<ExportDeliveryPort>>()({ id: "fixture/export/delivery", revision: 1 });
export type ExportContracts = typeof Export | typeof ExportDelivery | DocumentContracts | FormatContracts;
export interface ExportCapabilities extends
  CapabilitiesOf<typeof Export | typeof ExportDelivery>,
  CapabilitiesOf<DocumentContracts>,
  CapabilitiesOf<FormatContracts>
{}
