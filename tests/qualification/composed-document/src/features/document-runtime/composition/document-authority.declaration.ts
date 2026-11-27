import { declareModule } from "@get-modular/assembly";
import { Authority } from "./document-runtime.contracts.js";

export const authorityDeclaration = declareModule({
  moduleId: "reference/document-runtime/authority", implementationId: "reference/document-runtime/authority/host",
  owner: { authority: "reference", path: ["document-runtime"] },
  provides: [Authority.provide()], slots: [],
});
