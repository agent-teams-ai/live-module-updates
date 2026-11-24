/** Representative fixture contract, deliberately not an LMU/EF public API. */
export interface DocumentSnapshot {
  readonly revision: number;
  readonly text: string;
}

export type EditResult =
  | { readonly status: "saved"; readonly snapshot: DocumentSnapshot }
  | { readonly status: "rejected"; readonly reason: "invalid" | "conflict" | "denied" | "closed" };

/** The Host checks authority and revision together at the final effect boundary. */
export interface DocumentPort {
  readonly read: () => DocumentSnapshot;
  readonly commit: (expectedRevision: number, text: string) => EditResult;
}

export function createDocumentCommands(port: DocumentPort) {
  return {
    query(): DocumentSnapshot {
      return port.read();
    },
    edit(expectedRevision: number, proposedText: string): EditResult {
      const text = proposedText.trim();
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || text.length === 0 || text.length > 80) {
        return { status: "rejected", reason: "invalid" };
      }
      return port.commit(expectedRevision, text);
    },
  };
}
