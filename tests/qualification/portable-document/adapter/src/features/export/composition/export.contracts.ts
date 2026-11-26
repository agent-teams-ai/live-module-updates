import { defineContract, type CapabilitiesOf } from "@get-modular/assembly";
import type { SetupSpec } from "@get-modular/resources";
import type { ExportCommands, ExportDeliveryPort } from "@fixture/portable-document";
import { Document } from "../../document/composition/document.contracts.js";
import { Format } from "../../format/composition/format.contracts.js";

export const Export = defineContract<ExportCommands>()({ id: "fixture/export", revision: 1 });
export const ExportDelivery = defineContract<SetupSpec<ExportDeliveryPort>>()({ id: "fixture/export/delivery", revision: 1 });
export interface ExportCapabilities extends CapabilitiesOf<
  typeof Export | typeof ExportDelivery | typeof Document | typeof Format
> {}
