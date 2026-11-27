import { declareModule } from "@get-modular/assembly";
import { Compatibility } from "./document-runtime.contracts.js";

export const compatibilityDeclaration = declareModule({
  moduleId: "reference/document-runtime/compatibility", implementationId: "reference/document-runtime/compatibility/host",
  owner: { authority: "reference", path: ["document-runtime"] },
  provides: [Compatibility.provide()], slots: [],
});
