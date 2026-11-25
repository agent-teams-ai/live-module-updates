/** Export owns the narrow views it consumes; composition maps actual providers. */
export interface ExportDocumentPort {
  readonly query: () => { readonly revision: number; readonly text: string };
}

export interface ExportFormatPort {
  readonly title: (revision: number) => string;
  readonly body: (text: string) => string;
}

export type ExportPreparation = { readonly status: "ready" } | { readonly status: "cancelled" };
export type ExportResult =
  | { readonly status: "published"; readonly revision: number; readonly content: string }
  | { readonly status: "rejected"; readonly reason: "conflict" | "denied" | "closed" | "cancelled" };

/** The final receiver checks the current grant and expected document revision. */
export interface ExportDeliveryPort {
  readonly prepare: () => Promise<ExportPreparation>;
  readonly commit: (expectedRevision: number, content: string) => ExportResult;
}

export interface ExportDependencies {
  readonly document: ExportDocumentPort;
  readonly format: ExportFormatPort;
  readonly delivery: ExportDeliveryPort;
}

export interface ExportCommands {
  readonly publish: () => Promise<ExportResult>;
}
