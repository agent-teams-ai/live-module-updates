import { group } from "@get-modular/assembly";
import { documentModule } from "./document.module.js";

export const documentGroup = group("document", [documentModule]);
export { documentModule };
