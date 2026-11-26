import { group } from "@get-modular/assembly";
import { summaryModule } from "./export-summary.module.js";

export const summaryGroup = group("export-summary", [summaryModule]);
export { summaryModule };
