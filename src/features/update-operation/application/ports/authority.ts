import type { AuthoritySnapshot, PublicationRequest, PublicationResult, ReceiptLookup } from "../models.ts";

/** The actual owner of canonical routing and its conditional mutation. */
export interface UpdateAuthority {
  /** Synchronous, inert and detached. Selection and reservation cannot suspend. */
  readonly read: () => AuthoritySnapshot;
  /**
   * Atomically checks head and every relevant owner-defined basis condition,
   * mutates the same head read by invocation, and stores the original receipt.
   * No candidate callback may run in the owner's conditional section.
   */
  readonly publish: (request: PublicationRequest) => PublicationResult | PromiseLike<PublicationResult>;
  /** Unknown is nonterminal while the original request may still commit. */
  readonly lookup: (request: PublicationRequest) => ReceiptLookup | PromiseLike<ReceiptLookup>;
}
