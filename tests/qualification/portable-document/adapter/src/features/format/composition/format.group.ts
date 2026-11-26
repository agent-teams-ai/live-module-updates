import { group } from "@get-modular/assembly";
import type { FormatProvider } from "./format.contracts.js";
import { createFormatModule, plainFormatProvider, markedFormatProvider } from "./format.module.js";

export function createFormatGroup(provider: FormatProvider) {
  const module = createFormatModule(provider);
  return { group: group("format", [module]), module };
}
export { plainFormatProvider, markedFormatProvider };
