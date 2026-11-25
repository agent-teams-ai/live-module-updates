import { assemblyFor } from "@get-modular/assembly";
import type { DocumentCapabilities } from "../features/document/composition/document.contracts.js";
import { documentGroup, documentModule } from "../features/document/composition/document.group.js";
import { documentStateInput } from "../features/document/composition/document.inputs.js";
import type { FormatCapabilities, FormatProvider } from "../features/format/composition/format.contracts.js";
import { createFormatGroup } from "../features/format/composition/format.group.js";
import type { ExportCapabilities } from "../features/export/composition/export.contracts.js";
import { exportGroup, exportModule } from "../features/export/composition/export.group.js";
import { exportDeliveryInput } from "../features/export/composition/export.inputs.js";

export interface PortableDocumentCapabilities extends DocumentCapabilities, FormatCapabilities, ExportCapabilities {}

/** The caller selects a provider; GM remains the sole owner of graph construction. */
export function documentComposition(provider: FormatProvider) {
  const format = createFormatGroup(provider);
  return {
    profileId: "fixture/portable-document",
    modules: [documentGroup, format.group, exportGroup] as const,
    roots: { document: documentModule, format: format.module, export: exportModule },
    inputs: { state: documentStateInput, delivery: exportDeliveryInput },
  };
}

/** The Host supplies and retains its Resources scope, run inputs and drain policy. */
export function prepareDocumentComposition(provider: FormatProvider) {
  return assemblyFor<PortableDocumentCapabilities>().prepare(documentComposition(provider));
}

export { plainFormatProvider, markedFormatProvider } from "../features/format/composition/format.group.js";
