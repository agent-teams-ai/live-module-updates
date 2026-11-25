import { declareModule } from "@get-modular/assembly";
import { required } from "@get-modular/core";
import { Document } from "../../document/composition/document.contracts.js";
import { Format } from "../../format/composition/format.contracts.js";
import { Export, ExportDelivery } from "./export.contracts.js";

export const exportDeclaration = declareModule({
  moduleId: "fixture/export", implementationId: "fixture/export/default",
  owner: { authority: "fixture", path: ["export"] },
  provides: [Export.provide()],
  slots: [Document.slot("document", required()), Format.slot("format", required()), ExportDelivery.slot("delivery", required())],
});
export const exportDeliveryDeclaration = declareModule({
  moduleId: "fixture/export/delivery", implementationId: "fixture/export/delivery/host",
  owner: { authority: "fixture", path: ["export"] },
  provides: [ExportDelivery.provide()], slots: [],
});
