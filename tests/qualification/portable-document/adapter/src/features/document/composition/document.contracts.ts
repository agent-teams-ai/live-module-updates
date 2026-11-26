import { defineContract, type CapabilitiesOf } from "@get-modular/assembly";
import type { DocumentCommands, DocumentPort } from "@fixture/portable-document";

export const Document = defineContract<DocumentCommands>()({ id: "fixture/document", revision: 1 });
export const DocumentState = defineContract<DocumentPort>()({ id: "fixture/document/state", revision: 1 });
export type DocumentContracts = typeof Document | typeof DocumentState;
export interface DocumentCapabilities extends CapabilitiesOf<DocumentContracts> {}
