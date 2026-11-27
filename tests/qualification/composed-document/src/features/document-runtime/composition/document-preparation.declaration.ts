import { declareModule } from "@get-modular/assembly";
import { Preparation } from "./document-runtime.contracts.js";

export const preparationDeclaration = declareModule({
  moduleId: "reference/document-runtime/preparation", implementationId: "reference/document-runtime/preparation/host",
  owner: { authority: "reference", path: ["document-runtime"] },
  provides: [Preparation.provide()], slots: [],
});
