import type { FormatProvider } from "@fixture/portable-document-gm";

/** A fresh consumer's provider. No document/export implementation or private import changes. */
export const authorFormatProvider: FormatProvider = {
  implementationId: "fixture/format/author",
  create: () => ({
    title: revision => "Author revision " + revision,
    body: text => "By author: " + text,
  }),
};
