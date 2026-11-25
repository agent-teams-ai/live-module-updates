import { declareModule } from "@get-modular/assembly";
import { required } from "@get-modular/core";
import { Document, DocumentState } from "./document.contracts.js";

export const documentDeclaration = declareModule({
  moduleId: "fixture/document", implementationId: "fixture/document/default",
  owner: { authority: "fixture", path: ["document"] },
  provides: [Document.provide()], slots: [DocumentState.slot("state", required())],
});
export const documentStateDeclaration = declareModule({
  moduleId: "fixture/document/state", implementationId: "fixture/document/state/host",
  owner: { authority: "fixture", path: ["document"] },
  provides: [DocumentState.provide()], slots: [],
});
