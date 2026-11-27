import assert from "node:assert/strict";
import { ArtifactError } from "@extension-foundation/node-artifact";
import type { InvocationOutcome, UpdateHandle, UpdateSnapshot } from "../../src/index.ts";
import type { Reply } from "./host-contract.ts";
import { createEfHost, type EfHost } from "./ef-host.ts";
import type { EfCaseName, EfFixtureInput } from "./ef-contract.ts";

function returned(outcome: InvocationOutcome<Reply>, expected: string): void {
  assert.equal(outcome.status, "returned", "b7.useful-invocation");
  assert.equal(outcome.value.kind, "view", "b7.document-view");
  assert.equal(outcome.value.text, expected, "b7.verified-useful-output");
}

function refusedPreparation(host: EfHost, result: UpdateSnapshot, code: string): void {
  assert.equal(result.preparation.status, "failed", "b7.refused-preparation");
  assert.ok(result.preparation.cause instanceof ArtifactError, "b7.public-ef-refusal");
  assert.equal(result.preparation.cause.code, code, "b7.expected-ef-boundary");
  assert.equal(result.publication.status, "not-requested", "b7.no-refused-publication");
  assert.equal(host.authority.publicationCalls(), 0, "b7.no-refused-publication");
  assert.equal(host.evaluations(), 0, "b7.no-refused-evaluation");
  assert.equal(host.formatCalls(), 0, "b7.no-refused-module-effect");
  assert.equal(host.authority.read().head.generationId, "A", "b7.refusal-preserves-canonical-head");
  assert.equal(host.alive("B"), false, "b7.refused-candidate-cleanup");
  assert.equal(host.releases("B"), 1, "b7.exact-refused-candidate-cleanup");
}

async function requiredWitness(witness: Promise<void>, update: UpdateHandle, name: string): Promise<void> {
  await Promise.race([witness, update.completion.then(result => {
    throw new Error(name, { cause: result.preparation.status === "failed" ? result.preparation.cause : result });
  })]);
}

async function overlap(host: EfHost, input: EfFixtureInput): Promise<Record<string, unknown>> {
  const held = host.runtime.invoke({ kind: "held-view", barrier: "held-A" });
  await host.entered("held-A");
  const update = host.start();
  await requiredWitness(host.usefulB, update, "b7.update-completed-before-useful-B");
  assert.equal(update.inspect().publication.status, "committed", "b7.authoritative-publication");
  assert.ok(host.alive("A") && host.alive("B"), "b7.held-native-custody");
  assert.equal(host.releases("A"), 0, "b7.no-early-retirement");
  returned(await host.runtime.invoke({ kind: "view" }), "signed:B:SEED");
  host.resume("nested-B");
  returned(await host.runtime.invoke({ kind: "nested", barrier: "nested-B" }), "signed:B:SEED");
  const calls = host.formatCalls();
  assert.ok(calls >= 3, "b7.actual-verified-formatter-execution");
  host.resume("held-A"); returned(await held, "A:seed");
  const completed = await update.completion;
  assert.equal(completed.adoption.status, "observed", "b7.useful-adoption");
  assert.equal(host.formatCalls(), calls, "b7.retained-A-does-not-call-B");
  assert.equal(host.evaluations(), 1, "b7.one-typed-evaluation");
  assert.equal(host.releases("A"), 1, "b7.original-retirement");
  assert.ok(!host.alive("A") && host.alive("B") && host.foreignIntact(), "b7.exact-native-retirement");
  assert.equal(host.registered(), "B", "b7.replacement-registration-survives");
  assert.deepEqual(host.authority.document(), { revision: 0, text: "seed" }, "b7.borrowed-state-survives");
  const evaluated = host.evaluated();
  assert.ok(evaluated, "b7.actual-evaluation-identity");
  assert.equal(evaluated.facts.digest, input.artifact.digest, "b7.exact-verified-digest");
  assert.equal(completed.candidate.closureId, evaluated.facts.digest, "b7.original-candidate-binding");
  assert.notEqual(evaluated.evaluationId, completed.candidate.generationId, "b7.distinct-runtime-identity");
  assert.notEqual(evaluated.evaluationId, evaluated.facts.digest, "b7.distinct-artifact-identity");
  return { digest: evaluated.facts.digest, evaluationId: evaluated.evaluationId,
    generationId: completed.candidate.generationId, evaluations: host.evaluations(), formatCalls: calls,
    authority: host.authority.read(), retiredA: host.releases("A"), foreignSurvived: true };
}

async function rejectSignedCandidate(host: EfHost, code: string): Promise<Record<string, unknown>> {
  const result = await host.start().completion;
  refusedPreparation(host, result, code);
  returned(await host.runtime.invoke({ kind: "view" }), "A:seed");
  assert.equal(host.authorizationCalls(), 0, "b7.rejected-before-evaluation-authorization");
  return { refusal: code, evaluations: host.evaluations(), formatCalls: host.formatCalls(), releasedB: host.releases("B") };
}

async function refuseAfterVerify(host: EfHost, closeRuntime: boolean): Promise<Record<string, unknown>> {
  const update = host.start();
  await requiredWitness(host.entered("verified-before-evaluation"), update, "b7.update-completed-before-real-verification");
  assert.equal(host.evaluations(), 0, "b7.verification-does-not-evaluate");
  assert.equal(host.alive("B"), true, "b7.owned-verification-candidate");
  let closing: ReturnType<EfHost["runtime"]["close"]> | undefined;
  if (closeRuntime) { closing = host.runtime.close(); } else { host.revokeEvaluation(); }
  assert.equal(host.candidateAborted(), false, "b7.preparation-still-owns-native-scope");
  host.resume("verified-before-evaluation");
  const result = await update.completion;
  refusedPreparation(host, result, "artifact.denied");
  assert.equal(host.authorizationCalls(), 1, "b7.current-evaluation-authority");
  if (closing) { assert.equal((await closing).complete, true, "b7.original-close-after-verification"); }
  else { returned(await host.runtime.invoke({ kind: "view" }), "A:seed"); }
  return { refusal: "artifact.denied", evaluations: host.evaluations(),
    currentAdmission: closeRuntime ? "closed" : "revoked", authorizationCalls: host.authorizationCalls(), releasedB: host.releases("B") };
}

/** Compiled and run only against the actual independently installed package archives. */
export async function runEfConsumer(input: EfFixtureInput, name: EfCaseName): Promise<Record<string, unknown>> {
  const host = await createEfHost(input, name === "revoked-evaluation" || name === "closed-before-evaluation");
  let evidence: Record<string, unknown>;
  try {
    returned(await host.runtime.invoke({ kind: "view" }), "A:seed");
    if (name === "signed-overlap") { evidence = await overlap(host, input); }
    else if (name === "tampered-signature") { evidence = await rejectSignedCandidate(host, "artifact.signature"); }
    else if (name === "tampered-bytes") { evidence = await rejectSignedCandidate(host, "artifact.transport"); }
    else { evidence = await refuseAfterVerify(host, name === "closed-before-evaluation"); }
  } catch (cause) {
    const failures = [cause];
    try { await host.dispose(); }
    catch (cleanup) { failures.push(cleanup); }
    if (failures.length > 1) { throw new AggregateError(failures, "b7.joint-case-and-cleanup-failed", { cause }); }
    throw cause;
  }
  await host.dispose();
  return { name, outcome: "passed", ...evidence };
}
