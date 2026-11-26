import { implement } from "@get-modular/assembly";
import { createDocumentCommands } from "@fixture/portable-document";
import type { DocumentCapabilities } from "./document.contracts.js";
import { documentDeclaration } from "./document.declaration.js";

export const documentModule = implement<DocumentCapabilities>()(documentDeclaration, async dependencies => {
  const port = createDocumentCommands(dependencies.state);
  return { instance: port, capabilities: { "fixture/document": port } };
});
