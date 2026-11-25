import { group } from "@get-modular/assembly";
import { exportModule } from "./export.module.js";

export const exportGroup = group("export", [exportModule]);
export { exportModule };
