import { declareModule } from "@get-modular/assembly";
import { Settings } from "./document-runtime.contracts.js";

export const settingsDeclaration = declareModule({
  moduleId: "reference/document-runtime/settings", implementationId: "reference/document-runtime/settings/host",
  owner: { authority: "reference", path: ["document-runtime"] },
  provides: [Settings.provide()], slots: [],
});
