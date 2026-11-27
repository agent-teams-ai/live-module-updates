import { declareModule } from "@get-modular/assembly";
import { required } from "@get-modular/core";
import { Invocation } from "./document-runtime.contracts.js";

export const clientDeclaration = declareModule({
  moduleId: "reference/document-runtime/client", implementationId: "reference/document-runtime/client/default",
  owner: { authority: "reference", path: ["document-runtime"] },
  provides: [], slots: [Invocation.slot("document", required())],
});
