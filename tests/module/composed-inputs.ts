/** The producer's maintained source inventory, copied unchanged into isolated builds. */
export const portableCoreInputs = [
  "index.ts",
  "features/document/application/ports/document.ts",
  "features/document/application/use-cases/create-document-commands.ts",
  "features/document/composition/document.ts",
  "features/format/application/ports/format.ts",
  "features/format/application/use-cases/create-plain-format.ts",
  "features/format/application/use-cases/create-marked-format.ts",
  "features/format/composition/format.ts",
  "features/export/application/ports/export.ts",
  "features/export/application/use-cases/create-export-commands.ts",
  "features/export/composition/export.ts",
] as const;

export const portableAdapterInputs = [
  "index.ts", "composition/root.ts",
  "features/document/composition/document.contracts.ts",
  "features/document/composition/document.declaration.ts",
  "features/document/composition/document.inputs.ts",
  "features/document/composition/document.module.ts",
  "features/document/composition/document.group.ts",
  "features/format/composition/format.contracts.ts",
  "features/format/composition/format.declaration.ts",
  "features/format/composition/format.module.ts",
  "features/format/composition/format.group.ts",
  "features/export/composition/export.contracts.ts",
  "features/export/composition/export.declaration.ts",
  "features/export/composition/export.inputs.ts",
  "features/export/composition/export.module.ts",
  "features/export/composition/export.group.ts",
] as const;

export const summaryInputs = [
  "index.ts",
  "features/export-summary/application/ports/export-summary.ts",
  "features/export-summary/application/use-cases/create-export-summary.ts",
  "features/export-summary/composition/export-summary.contracts.ts",
  "features/export-summary/composition/export-summary.declaration.ts",
  "features/export-summary/composition/export-summary.module.ts",
  "features/export-summary/composition/export-summary.group.ts",
] as const;

export const composedCohort = {
  "@get-modular/core": "0.8.0",
  "@get-modular/assembly": "0.8.0",
  "@get-modular/resources": "0.2.2",
  "@get-modular/conformance": "0.5.2",
} as const;

export interface ComposedArchive {
  readonly name: string;
  readonly version: string;
  readonly path: string;
  readonly files: readonly string[];
  readonly sha256: string;
  readonly integrity: string;
}

export interface ComposedSource {
  readonly source: string;
  readonly staged: string;
  readonly sha256: string;
  /** Only borrowed TEST adapters relink a checked source import to the installed public root. */
  readonly stagedSha256?: string;
}
