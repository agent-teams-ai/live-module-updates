import { declareModule } from "@get-modular/assembly";
import { required } from "@get-modular/core";
import { Export } from "@fixture/portable-document-gm";

export const summaryDeclaration = declareModule({
  moduleId: "author/export-summary", implementationId: "author/export-summary/default",
  owner: { authority: "author", path: ["export-summary"] }, provides: [],
  slots: [Export.slot("publication", required())],
});
