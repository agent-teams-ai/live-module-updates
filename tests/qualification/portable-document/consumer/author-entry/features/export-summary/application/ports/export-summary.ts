/** This consumer owns the publication view required by its summary operation. */
export type PublicationOutcome =
  | { readonly status: "published"; readonly revision: number; readonly content: string }
  | { readonly status: "rejected"; readonly reason: "conflict" | "denied" | "closed" | "cancelled" };

export interface PublicationPort {
  readonly publish: () => Promise<PublicationOutcome>;
}

export type SummaryOutcome =
  | { readonly status: "published"; readonly revision: number; readonly contentLength: number }
  | Extract<PublicationOutcome, { readonly status: "rejected" }>;

export interface SummaryCommands {
  readonly publishSummary: () => Promise<SummaryOutcome>;
}
