import { declareModule } from "@get-modular/assembly";
import { Format } from "./format.contracts.js";

export function declareFormatProvider(implementationId: string) {
  return declareModule({
    moduleId: "fixture/format", implementationId,
    owner: { authority: "fixture", path: ["format"] },
    provides: [Format.provide()], slots: [],
  });
}
