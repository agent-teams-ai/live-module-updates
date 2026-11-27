import { declareModule } from "@get-modular/assembly";
import { required } from "@get-modular/core";
import { Authority, Compatibility, Invocation, Preparation, Settings } from "./document-runtime.contracts.js";

export const runtimeDeclaration = declareModule({
  moduleId: "reference/document-runtime", implementationId: "reference/document-runtime/default",
  owner: { authority: "reference", path: ["document-runtime"] },
  provides: [Invocation.provide()], slots: [Authority.slot("authority", required()),
    Compatibility.slot("compatibility", required()), Preparation.slot("preparation", required()), Settings.slot("settings", required())],
});
