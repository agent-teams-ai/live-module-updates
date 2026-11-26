import type { DocumentCommands, DocumentPort, DocumentSnapshot, EditResult } from "../ports/document.js";

export function createDocumentCommands(port: DocumentPort): DocumentCommands {
  return {
    query: (): DocumentSnapshot => {
      return port.read();
    },
    edit: (expectedRevision: number, proposedText: string): EditResult => {
      const text = proposedText.trim();
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || text.length === 0 || text.length > 80) {
        return { status: "rejected", reason: "invalid" };
      }
      return port.commit(expectedRevision, text);
    },
  };
}
