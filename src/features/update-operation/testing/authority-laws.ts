import type { PublicationReceipt, PublicationRequest, PublicationResult } from "../application/models.ts";
import type { AuthorityContractFixture, AuthorityLawName } from "./authority-contract.ts";
import { freezeRequest, receiptCopy, request, requireLaw, sameHead, sameReceipt, sameRequest, tryMutation } from "./authority-evidence.ts";

function committed(result: PublicationResult, expected: PublicationRequest, law: AuthorityLawName): PublicationReceipt & { readonly status: "committed" } {
  requireLaw(result.status === "committed", law, "the valid normal publication did not return a terminal commit");
  requireLaw(sameRequest(result.request, expected) && sameHead(result.previousHead, expected.expectedHead)
    && result.head.generationId === expected.candidate.generationId && result.head.revision !== expected.expectedHead.revision,
  law, "commit is not bound to the actual requested transition and a fresh head revision");
  return result;
}

async function detachedRead(fixture: AuthorityContractFixture): Promise<void> {
  const first = fixture.authority.read();
  const expected = { domainId: first.domainId, basis: first.basis, head: { ...first.head } };
  tryMutation(first.head, "generationId", "deliberate-observer-mutation");
  tryMutation(first, "basis", "deliberate-observer-basis");
  const next = fixture.authority.read();
  requireLaw(next.domainId === expected.domainId && next.basis === expected.basis && sameHead(next.head, expected.head)
    && sameHead(fixture.observeHead(), expected.head), "detached-read", "an observer changed the owned state or received a false routing head");
}

async function canonicalPublication(fixture: AuthorityContractFixture): Promise<void> {
  const original = request(fixture, "contract/canonical");
  const result = committed(await fixture.authority.publish(original), original, "canonical-publication");
  const originalReceipt = receiptCopy(result);
  const originalHead = { ...result.head };
  requireLaw(sameHead(fixture.observeHead(), result.head) && sameHead(fixture.authority.read().head, result.head),
    "canonical-publication", "publication and native routing do not share one head");
  const repeated = await fixture.authority.publish(original);
  requireLaw((repeated.status === "committed" || repeated.status === "rejected") && sameReceipt(originalReceipt, repeated)
    && sameHead(fixture.observeHead(), originalHead), "canonical-publication", "same-payload replay changed its original result or the head");
}

function alteredRequests(original: PublicationRequest): readonly PublicationRequest[] {
  const candidate = original.candidate;
  return [
    { ...original, domainId: original.domainId + "/other" },
    { ...original, basis: original.basis + "/other" },
    { ...original, expectedHead: { ...original.expectedHead, generationId: original.expectedHead.generationId + "/other" } },
    { ...original, expectedHead: { ...original.expectedHead, revision: original.expectedHead.revision + "/other" } },
    { ...original, candidate: { ...candidate, generationId: candidate.generationId + "/other" } },
    { ...original, candidate: { ...candidate, closureId: candidate.closureId + "/other" } },
    { ...original, candidate: { ...candidate, contract: { ...candidate.contract, id: candidate.contract.id + "/other" } } },
    { ...original, candidate: { ...candidate, contract: { ...candidate.contract, revision: candidate.contract.revision + "/other" } } },
  ].map(freezeRequest);
}

async function originalPayload(fixture: AuthorityContractFixture): Promise<void> {
  const original = request(fixture, "contract/payload");
  const initial = receiptCopy(committed(await fixture.authority.publish(original), original, "original-payload"));
  for (const changed of alteredRequests(original)) {
    const result = await fixture.authority.publish(changed);
    requireLaw((result.status === "refused" || result.status === "rejected") && sameRequest(result.request, changed),
      "original-payload", "a changed replay payload was accepted or returned another request's receipt");
    const lookup = await fixture.authority.lookup(changed);
    requireLaw(lookup.status === "unknown" || (lookup.receipt.status === "rejected" && sameRequest(lookup.receipt.request, changed)),
      "original-payload", "lookup falsely bound the original commit to a changed payload");
    const preserved = await fixture.authority.lookup(original);
    requireLaw(preserved.status === "known" && sameReceipt(preserved.receipt, initial),
      "original-payload", "changed replay overwrote the immutable original result");
  }
  requireLaw(initial.status === "committed" && sameHead(fixture.observeHead(), initial.head),
    "original-payload", "rejected replay mutated native routing");
}

async function staleHead(fixture: AuthorityContractFixture): Promise<void> {
  const first = request(fixture, "contract/first");
  const stale = request(fixture, "contract/stale", true);
  const result = committed(await fixture.authority.publish(first), first, "stale-head");
  const currentHead = { ...result.head };
  const rejected = await fixture.authority.publish(stale);
  requireLaw((rejected.status === "refused" || rejected.status === "rejected") && sameRequest(rejected.request, stale)
    && sameHead(fixture.observeHead(), currentHead), "stale-head", "a stale conditional publication changed the canonical head");
}

async function staleBasis(fixture: AuthorityContractFixture): Promise<void> {
  const original = request(fixture, "contract/basis");
  fixture.invalidateBasis();
  const changed = fixture.authority.read();
  requireLaw(changed.basis !== original.basis && sameHead(changed.head, original.expectedHead),
    "stale-basis", "fixture did not change an actual basis condition independently of the head");
  const result = await fixture.authority.publish(original);
  requireLaw((result.status === "refused" || result.status === "rejected") && sameRequest(result.request, original)
    && sameHead(fixture.observeHead(), original.expectedHead), "stale-basis", "publication ignored the current owner basis");
  const fresh = request(fixture, "contract/current-basis");
  const accepted = committed(await fixture.authority.publish(fresh), fresh, "stale-basis");
  requireLaw(sameHead(fixture.observeHead(), accepted.head), "stale-basis",
    "the basis control made even fresh publication inadmissible or disconnected native routing");
}

async function pendingOriginal(fixture: AuthorityContractFixture): Promise<void> {
  const original = request(fixture, "contract/pending");
  fixture.holdPublication();
  const result = await fixture.authority.publish(original);
  const lookup = await fixture.authority.lookup(original);
  requireLaw(result.status === "unknown" && lookup.status === "unknown"
    && sameHead(fixture.observeHead(), original.expectedHead), "pending-original", "a still-possible publication was declared terminal");
  await fixture.releasePublication();
  const resolved = await fixture.authority.lookup(original);
  requireLaw(resolved.status === "known", "pending-original", "settled original publication lost its receipt");
  const receipt = committed(resolved.receipt, original, "pending-original");
  requireLaw(sameHead(fixture.observeHead(), receipt.head), "pending-original", "resolved receipt does not describe native routing");
}

async function lostAcknowledgement(fixture: AuthorityContractFixture): Promise<void> {
  const original = request(fixture, "contract/lost");
  fixture.loseAcknowledgement();
  let reply: PublicationResult | undefined;
  try { reply = await fixture.authority.publish(original); } catch { /* The transport deliberately loses only the reply. */ }
  requireLaw(reply === undefined || reply.status === "unknown", "lost-acknowledgement", "fixture did not lose the original acknowledgement");
  const resolved = await fixture.authority.lookup(original);
  requireLaw(resolved.status === "known", "lost-acknowledgement", "a committed native result is not recoverable by its original request");
  const receipt = committed(resolved.receipt, original, "lost-acknowledgement");
  requireLaw(sameHead(fixture.observeHead(), receipt.head) && sameHead(fixture.authority.read().head, receipt.head),
    "lost-acknowledgement", "lost response concealed a different canonical routing head");
}

async function immutableReceipt(fixture: AuthorityContractFixture): Promise<void> {
  const original = request(fixture, "contract/immutable");
  const receipt = committed(await fixture.authority.publish(original), original, "immutable-receipt");
  const expected = receiptCopy(receipt);
  tryMutation(receipt.head, "revision", "deliberate-receipt-mutation");
  tryMutation(receipt.request.candidate.contract, "revision", "deliberate-contract-mutation");
  const nextRequest = request(fixture, "contract/successor", true);
  const successor = committed(await fixture.authority.publish(nextRequest), nextRequest, "immutable-receipt");
  const later = await fixture.authority.lookup(original);
  requireLaw(later.status === "known" && sameReceipt(later.receipt, expected)
    && sameHead(fixture.observeHead(), successor.head), "immutable-receipt", "later work or observer mutation rewrote an original receipt");
}

export const authorityLaws: readonly {
  readonly name: AuthorityLawName;
  readonly run: (fixture: AuthorityContractFixture) => Promise<void>;
}[] = Object.freeze([
  { name: "detached-read", run: detachedRead },
  { name: "canonical-publication", run: canonicalPublication },
  { name: "original-payload", run: originalPayload },
  { name: "stale-head", run: staleHead },
  { name: "stale-basis", run: staleBasis },
  { name: "pending-original", run: pendingOriginal },
  { name: "lost-acknowledgement", run: lostAcknowledgement },
  { name: "immutable-receipt", run: immutableReceipt },
]);
