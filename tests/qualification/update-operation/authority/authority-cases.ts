import {
  copyReceipt, type Authority, type AuthorityFactory, type AuthorityOptions,
  type CaseEvidence, type PublicationReceipt, type PublicationRequest, type PublicationResult,
} from "./contract.js";

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function same(actual: unknown, expected: unknown, message: string): void {
  check(JSON.stringify(actual) === JSON.stringify(expected), `${message}: ${JSON.stringify(actual)}`);
}

export function requestFor(authority: Authority, attemptId: string, generationId: string): PublicationRequest {
  const current = authority.read();
  return {
    attemptId,
    domainId: current.domainId,
    expectedHead: { ...current.head },
    candidate: { generationId, closureId: `closure:${generationId}` },
    basis: {
      stateRevision: current.state.revision,
      schemaRevision: current.state.schemaRevision,
      grantRevision: current.grant.revision,
    },
  };
}

function committed(value: PublicationResult): asserts value is PublicationReceipt & { readonly status: "committed" } {
  check(value.status === "committed", `Expected committed publication, got ${JSON.stringify(value)}`);
}

/** Same behavioral obligations, independent native owners; no shared reference reducer. */
export async function runAuthorityCases(create: AuthorityFactory): Promise<readonly CaseEvidence[]> {
  const evidence: CaseEvidence[] = [];
  let sequence = 0;
  async function run(name: string, body: (authority: Authority) => void | Promise<void>, overrides: Partial<AuthorityOptions> = {}): Promise<void> {
    const domainId = `authority-case-${++sequence}`;
    const authority = create({ domainId, generationId: "A", storageKey: `lmu:${domainId}`, ...overrides });
    try {
      await body(authority);
      evidence.push({ name, outcome: "passed" });
    } finally {
      authority.dispose();
    }
  }

  await run("publication changes canonical routing and preserves borrowed state", authority => {
    const before = authority.read();
    const result = authority.publish(requestFor(authority, "a-b", "B"));
    committed(result);
    same(authority.read().head, { revision: 1, generationId: "B" }, "Canonical head did not change");
    same(authority.read().state, before.state, "Publication replaced borrowed state");
    same(result.previousHead, before.head, "Receipt lost the exact predecessor");
    const lookup = authority.lookup("a-b");
    check(lookup.status === "known", "Committed attempt has no receipt");
    same(lookup.receipt, result, "Lookup differs from the publication receipt");
    check(Object.isFrozen(result) && Object.isFrozen(result.request) && Object.isFrozen(result.request.basis)
      && Object.isFrozen(result.previousHead) && Object.isFrozen(result.head), "Receipt has a mutable nested value");
    check(Object.isFrozen(before) && Object.isFrozen(before.head) && Object.isFrozen(before.state) && Object.isFrozen(before.grant), "Read returned mutable owner state");
    same(before.head, { revision: 0, generationId: "A" }, "An earlier snapshot changed after publication");
  });

  await run("competing prepared candidates have one conditional winner", authority => {
    const requestB = requestFor(authority, "race-b", "B");
    const requestC = requestFor(authority, "race-c", "C");
    committed(authority.publish(requestB));
    const loser = authority.publish(requestC);
    check(loser.status === "rejected" && loser.reason === "head-conflict", "Concurrent loser overwrote the winner");
    same(authority.read().head, { revision: 1, generationId: "B" }, "Loser changed routing");
    const known = authority.lookup("race-c");
    check(known.status === "known" && known.receipt.status === "rejected", "Rejected attempt lost its terminal receipt");
  });

  await run("matching replay returns original receipt after a later head", authority => {
    const requestB = requestFor(authority, "first", "B");
    const first = authority.publish(requestB);
    committed(first);
    committed(authority.publish(requestFor(authority, "second", "C")));
    const replay = authority.publish(requestB);
    same(replay, first, "Replay synthesized an outcome from the current head");
    same(authority.read().head, { revision: 2, generationId: "C" }, "Replay reactivated an old generation");
    const known = authority.lookup("first");
    check(known.status === "known", "Original attempt became unknown");
    same(known.receipt, first, "Original receipt was overwritten");
  });

  await run("changed same-attempt payload never overwrites its first receipt", authority => {
    const request = requestFor(authority, "bound", "B");
    const first = authority.publish(request);
    committed(first);
    const changed: readonly PublicationRequest[] = [
      { ...request, candidate: { ...request.candidate, generationId: "C" } },
      { ...request, candidate: { ...request.candidate, closureId: "other-bytes" } },
      { ...request, expectedHead: { ...request.expectedHead, revision: 99 } },
      { ...request, expectedHead: { ...request.expectedHead, generationId: "other-predecessor" } },
      { ...request, basis: { ...request.basis, schemaRevision: 99 } },
      { ...request, basis: { ...request.basis, stateRevision: 99 } },
      { ...request, basis: { ...request.basis, grantRevision: 99 } },
    ];
    for (const altered of changed) {
      const result = authority.publish(altered);
      check(result.status === "refused" && result.reason === "attempt-payload-mismatch", "Changed payload reused the original attempt");
    }
    const wrongDomain = authority.publish({ ...request, domainId: "other-domain" });
    check(wrongDomain.status === "refused" && wrongDomain.reason === "wrong-domain", "Foreign domain was accepted");
    const known = authority.lookup("bound");
    check(known.status === "known", "Refused reuse removed the receipt");
    same(known.receipt, first, "Refused reuse changed the receipt");
    same(authority.read().head, first.head, "Changed payload changed canonical routing");
  });

  await run("schema change is checked at the actual mutation", authority => {
    const request = requestFor(authority, "schema", "B");
    authority.changeSchema(2);
    const result = authority.publish(request);
    check(result.status === "rejected" && result.reason === "schema-conflict", "Stale schema preview authorized publication");
    check(authority.read().head.generationId === "A", "Schema conflict changed routing");
  });

  await run("state change is checked at the actual mutation", authority => {
    const request = requestFor(authority, "state", "B");
    check(authority.write("A", 0, "changed by owner").status === "written", "Owner write setup failed");
    const result = authority.publish(request);
    check(result.status === "rejected" && result.reason === "state-conflict", "Stale state preview authorized publication");
    same(authority.read().state, { revision: 1, schemaRevision: 1, text: "changed by owner" }, "Conflict damaged owner state");
  });

  await run("grant revision prevents revoked-then-restored preview reuse", authority => {
    const request = requestFor(authority, "grant", "B");
    authority.changeGrant(false);
    authority.changeGrant(true);
    const result = authority.publish(request);
    check(result.status === "rejected" && result.reason === "grant-conflict", "Reopened grant reused a stale authorization basis");
    authority.changeGrant(false);
    const denied = authority.publish(requestFor(authority, "denied", "C"));
    check(denied.status === "rejected" && denied.reason === "denied", "Current denied grant accepted publication");
  });

  await run("late effects are decided by current receiver state", authority => {
    const oldRead = authority.read();
    committed(authority.publish(requestFor(authority, "effect-switch", "B")));
    same(authority.write("A", oldRead.state.revision, "late A"), { status: "rejected", reason: "stale-generation" }, "Retained A bypassed current-generation policy");
    authority.changeGrant(false);
    same(authority.write("B", 0, "denied B"), { status: "rejected", reason: "denied" }, "Published B bypassed current grant");
    authority.changeGrant(true);
    check(authority.write("B", 0, "useful B").status === "written", "B could not perform useful work");
    same(authority.write("B", 0, "stale revision"), { status: "rejected", reason: "state-conflict" }, "Stale write bypassed current revision");
    same(authority.read().state, { revision: 1, schemaRevision: 1, text: "useful B" }, "Rejected effects reached owned state");
  });

  await run("lookup absence stays nonterminal while the original request is delayed", async authority => {
    const request = requestFor(authority, "delayed", "B");
    let release: (() => void) | undefined;
    const waiting = new Promise<void>(resolve => { release = resolve; });
    const original = waiting.then(() => authority.publish(request));
    same(authority.lookup("delayed"), { status: "unknown" }, "Unknown request was classified as terminal");
    check(authority.read().head.generationId === "A", "Delayed request ran before release");
    check(release, "Delay setup failed");
    release();
    committed(await original);
    check(authority.read().head.generationId === "B", "Original request could not commit after an unknown lookup");
    check(authority.lookup("delayed").status === "known", "Late commit lacks an original receipt");
  });

  await run("a thrown acknowledgement can follow successful native publication", authority => {
    const request = requestFor(authority, "lost-ack", "B");
    const failure = new Error("Injected acknowledgement loss after actual mutation");
    let observed: unknown;
    try {
      committed(authority.publish(request));
      throw failure;
    } catch (error) { observed = error; }
    check(observed === failure, "Acknowledgement-loss injection did not execute");
    check(authority.read().head.generationId === "B", "Loss was injected before real publication");
    const known = authority.lookup("lost-ack");
    check(known.status === "known" && known.receipt.status === "committed", "Same-attempt reconciliation did not recover committed publication");
  });

  await run("malformed acknowledgement cannot erase an already committed outcome", authority => {
    const request = requestFor(authority, "malformed-ack", "B");
    committed(authority.publish(request));
    const malformed: unknown = { status: "committed" };
    check(copyReceipt(malformed) === undefined, "Malformed response was accepted as a receipt");
    check(authority.read().head.generationId === "B", "Malformed response reverted native publication");
    const known = authority.lookup("malformed-ack");
    check(known.status === "known" && known.receipt.status === "committed", "Valid original receipt was discarded");
  });

  await run("terminal rejection remains bound after unrelated progress", authority => {
    const stale = requestFor(authority, "rejected-once", "B");
    committed(authority.publish(requestFor(authority, "winner", "C")));
    const rejected = authority.publish(stale);
    check(rejected.status === "rejected" && rejected.reason === "head-conflict", "Rejection setup failed");
    committed(authority.publish(requestFor(authority, "later", "D")));
    same(authority.publish(stale), rejected, "Replay changed a terminal rejection");
  });

  await run("receipt capacity rejects new attempts without evicting prior identity", authority => {
    const firstRequest = requestFor(authority, "bounded-0", "generation-0");
    const first = authority.publish(firstRequest);
    committed(first);
    for (let index = 1; index < 32; index += 1) committed(authority.publish(requestFor(authority, `bounded-${index}`, `generation-${index}`)));
    const before = authority.read();
    same(authority.publish(requestFor(authority, "overflow", "overflow-generation")), { status: "refused", reason: "receipt-capacity" }, "Receipt bound was exceeded");
    same(authority.read(), before, "Capacity refusal changed owned state");
    same(authority.publish(firstRequest), first, "Capacity limit discarded idempotent replay");
    check(authority.lookup("bounded-0").status === "known", "Capacity evicted the oldest receipt");
    same(authority.lookup("overflow"), { status: "unknown" }, "Refused new attempt fabricated a terminal receipt");
  });

  await run("an activated generation identity cannot be reused", authority => {
    committed(authority.publish(requestFor(authority, "activate-b", "B")));
    committed(authority.publish(requestFor(authority, "activate-c", "C")));
    for (const generationId of ["A", "B", "C"]) {
      const result = authority.publish(requestFor(authority, `reuse-${generationId}`, generationId));
      check(result.status === "rejected" && result.reason === "generation-reused", "Previously active identity was reused");
    }
    check(authority.read().head.generationId === "C", "Identity reuse changed canonical head");
  });

  await run("invalid request is refused before conditional publication", authority => {
    const request = requestFor(authority, "invalid", "B");
    const before = authority.read();
    same(authority.publish({ ...request, basis: { ...request.basis, stateRevision: Number.NaN } }), { status: "refused", reason: "invalid-request" }, "Invalid revision was accepted");
    same(authority.read(), before, "Invalid request mutated native state");
    same(authority.lookup("invalid"), { status: "unknown" }, "Invalid request consumed an attempt identity");
  });

  await run("request access completes before the owner's conditional decision", authority => {
    const original = requestFor(authority, "outer", "B");
    const competing = requestFor(authority, "getter-reentrant", "C");
    let accessed = 0;
    const request: PublicationRequest = {
      ...original,
      get expectedHead() {
        accessed += 1;
        committed(authority.publish(competing));
        return original.expectedHead;
      },
    };
    const result = authority.publish(request);
    check(accessed === 1, "Caller accessor executed inside later receipt handling");
    check(result.status === "rejected" && result.reason === "head-conflict", "Callback between validation and mutation bypassed the actual basis");
    check(authority.read().head.generationId === "C", "Outer stale request overwrote reentrant publication");
  });

  await run("one domain's receipt pressure does not stop another domain", authority => {
    committed(authority.publish(requestFor(authority, "fill", "B")));
    same(authority.publish(requestFor(authority, "overflow", "C")), { status: "refused", reason: "receipt-capacity" }, "Pressure setup failed");
    const independent = create({ domainId: "independent-domain", generationId: "X", storageKey: "lmu:independent-domain" });
    try {
      committed(independent.publish(requestFor(independent, "independent", "Y")));
      check(independent.write("Y", 0, "independent useful effect").status === "written", "Unrelated domain was stalled");
      check(authority.read().head.generationId === "B", "Independent progress mutated the pressured domain");
    } finally { independent.dispose(); }
  }, { receiptCapacity: 1 });

  await run("closed native authority rejects new effects and releases idempotently", authority => {
    const request = requestFor(authority, "closed", "B");
    authority.dispose();
    authority.dispose();
    same(authority.publish(request), { status: "refused", reason: "closed" }, "Closed authority admitted a new publication");
    same(authority.write("A", 0, "closed effect"), { status: "rejected", reason: "closed" }, "Closed authority admitted an effect");
    let rejectedRead = false;
    try { authority.read(); } catch { rejectedRead = true; }
    check(rejectedRead, "Closed authority presented a live canonical head");
  });

  return evidence;
}

/** Native browser-only resource witness, kept separate from portable authority semantics. */
export function runBrowserStorageCases(storage: Storage, create: AuthorityFactory): readonly CaseEvidence[] {
  const outsideKey = "lmu:authority-unrelated-native-owner";
  const ownedKey = "lmu:authority-replacement-witness";
  check(storage.getItem(outsideKey) === null && storage.getItem(ownedKey) === null, "Browser resource witness keys already exist");
  let authority: Authority | undefined;
  try {
    storage.setItem(outsideKey, "unrelated-resource");
    authority = create({ domainId: "native-replacement", generationId: "A", storageKey: ownedKey });
    const original = storage.getItem(ownedKey);
    check(original !== null, "Authority never used native Storage");
    const replacement = JSON.stringify({ ownerId: "another-exact-native-owner", value: "replacement" });
    storage.setItem(ownedKey, replacement);
    let refused = false;
    try { authority.read(); } catch { refused = true; }
    check(refused, "Replaced native owner was silently reused");
    authority.dispose();
    same(storage.getItem(ownedKey), replacement, "Late old disposal removed its replacement");
    same(storage.getItem(outsideKey), "unrelated-resource", "Disposal removed an unrelated native key");
    return [{ name: "browser native cleanup preserves a replacement and unrelated owner", outcome: "passed", witness: "native sessionStorage values after late disposal" }];
  } finally {
    try { authority?.dispose(); }
    finally {
      storage.removeItem(ownedKey);
      storage.removeItem(outsideKey);
    }
  }
}
