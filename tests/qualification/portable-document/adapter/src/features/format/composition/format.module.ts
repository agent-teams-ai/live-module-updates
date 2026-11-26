import { implement } from "@get-modular/assembly";
import { createPlainFormat, createMarkedFormat } from "@fixture/portable-document";
import type { FormatCapabilities, FormatProvider } from "./format.contracts.js";
import { declareFormatProvider } from "./format.declaration.js";

export const plainFormatProvider = {
  implementationId: "fixture/format/plain", create: createPlainFormat,
} satisfies FormatProvider;
export const markedFormatProvider = {
  implementationId: "fixture/format/marked", create: createMarkedFormat,
} satisfies FormatProvider;

export function createFormatModule({ implementationId, create }: FormatProvider) {
  return implement<FormatCapabilities>()(declareFormatProvider(implementationId), async () => {
    const port = create();
    return { instance: port, capabilities: { "fixture/format": port } };
  });
}
