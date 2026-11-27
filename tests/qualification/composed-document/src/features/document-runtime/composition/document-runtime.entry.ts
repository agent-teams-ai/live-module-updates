import type { ModuleEntry } from "live-module-updates";
import type { DocumentCommand, DocumentOperationPorts, DocumentReply } from "../application/ports/document-operation.js";

/** Maps one already constructed closure to one admitted finite application operation. */
export function createDocumentEntry(ports: DocumentOperationPorts): ModuleEntry<readonly [DocumentCommand], DocumentReply> {
  return async (context, command) => {
    ports.use();
    switch (command.kind) {
      case "view": return { kind: "document", snapshot: ports.document.query() };
      case "edit": return { kind: "edit", result: ports.document.edit(command.expected, command.text) };
      case "export": return { kind: "export", result: await ports.publication.publish() };
      case "summary": return { kind: "summary", result: await ports.summary.publishSummary() };
      case "held-view": {
        await ports.wait(command.barrier);
        ports.use();
        return { kind: "document", snapshot: ports.document.query() };
      }
      case "nested-summary": {
        await ports.wait(command.barrier);
        ports.use();
        const nested = await context.invoke({ kind: "summary" });
        if (nested.status !== "returned") { throw new Error("the retained continuation could not invoke its own closure", { cause: nested }); }
        return nested.value;
      }
    }
  };
}
