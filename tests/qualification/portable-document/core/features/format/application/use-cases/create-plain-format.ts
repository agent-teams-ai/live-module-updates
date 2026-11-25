import type { FormatPort } from "../ports/format.js";

export function createPlainFormat(): FormatPort {
  return { title: revision => `Document r${revision}`, body: text => text };
}
