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

export interface DocumentCommands {
  readonly query: () => DocumentSnapshot;
  readonly edit: (expectedRevision: number, proposedText: string) => EditResult;
}
