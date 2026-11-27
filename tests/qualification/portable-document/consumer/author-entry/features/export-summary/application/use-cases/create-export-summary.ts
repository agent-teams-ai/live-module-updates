import type { PublicationPort, SummaryCommands } from "../ports/export-summary.js";

export function createExportSummary({ publish }: PublicationPort): SummaryCommands {
  return {
    publishSummary: async () => {
      const result = await publish();
      if (result.status === "rejected") return result;
      // The application wants code units, not visual characters or a durable receipt.
      return { status: "published", revision: result.revision, contentLength: result.content.length };
    },
  };
}
