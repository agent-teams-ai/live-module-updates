import type { FormatPort } from "../ports/format.js";

export function createMarkedFormat(): FormatPort {
  return { title: revision => `[Document r${revision}]`, body: text => `> ${text}` };
}
