import { implement } from "@get-modular/assembly";
import type { DocumentInvocation } from "../application/ports/document-operation.js";
import type { RuntimeCapabilities } from "./document-runtime.contracts.js";
import { clientDeclaration } from "./document-client.declaration.js";

/** The dependent product sees only its concrete stable invocation capability. */
export const documentClient = implement<RuntimeCapabilities>()(clientDeclaration, dependencies => {
  const instance = Object.freeze<DocumentInvocation>({ invoke: command => dependencies.document.invoke(command) });
  return Promise.resolve({ instance, capabilities: {} });
});
