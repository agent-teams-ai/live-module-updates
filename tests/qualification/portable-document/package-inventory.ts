/** Handwritten source/output inventory; unexpected compiler or package files reject. */
export const coreSources = [
  "index",
  "features/document/application/ports/document",
  "features/document/application/use-cases/create-document-commands",
  "features/document/composition/document",
  "features/format/application/ports/format",
  "features/format/application/use-cases/create-plain-format",
  "features/format/application/use-cases/create-marked-format",
  "features/format/composition/format",
  "features/export/application/ports/export",
  "features/export/application/use-cases/create-export-commands",
  "features/export/composition/export",
] as const;

export const adapterSources = [
  "index", "composition/root",
  "features/document/composition/document.contracts",
  "features/document/composition/document.declaration",
  "features/document/composition/document.inputs",
  "features/document/composition/document.module",
  "features/document/composition/document.group",
  "features/format/composition/format.contracts",
  "features/format/composition/format.declaration",
  "features/format/composition/format.module",
  "features/format/composition/format.group",
  "features/export/composition/export.contracts",
  "features/export/composition/export.declaration",
  "features/export/composition/export.inputs",
  "features/export/composition/export.module",
  "features/export/composition/export.group",
] as const;

export const packagePaths = (sources: readonly string[]) => [
  "package.json", ...sources.flatMap(path => ["dist/" + path + ".js", "dist/" + path + ".d.ts"]),
].sort();
