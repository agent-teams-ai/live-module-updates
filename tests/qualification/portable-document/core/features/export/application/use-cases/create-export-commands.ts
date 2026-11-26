import type { ExportCommands, ExportDependencies, ExportResult } from "../ports/export.js";

export function createExportCommands({ document, format, delivery }: ExportDependencies): ExportCommands {
  return {
    async publish(): Promise<ExportResult> {
      const { revision, text } = document.query();
      const title = format.title(revision);
      const preparation = await delivery.prepare();
      if (preparation.status === "cancelled") return { status: "rejected", reason: "cancelled" };
      const content = `${title}\n${format.body(text)}`;
      return delivery.commit(revision, content);
    },
  };
}
