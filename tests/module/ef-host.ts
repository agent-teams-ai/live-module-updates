import assert from "node:assert/strict";
import { closeSync, fstatSync, openSync } from "node:fs";
import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ArtifactCleanupError, createNodeArtifactVerifier, type EvaluatedArtifact } from "@extension-foundation/node-artifact";
import { createScope, type Resources } from "@get-modular/resources";
import { createUpdateRuntime, type UpdateHandle, type UpdateRuntime } from "../../src/index.ts";
import { createResourcesPreparation } from "../../src/resources.ts";
import { candidate, createBarriers, type Command, type GenerationEnvironment, type Reply } from "./host-contract.ts";
import { createNodeAuthority } from "./native-node-authority.ts";
import { prepareGeneration } from "./generation-composition.ts";
import { artifactContract, artifactRequest, isDocumentFormatter, type DocumentFormatter, type EfFixtureInput } from "./ef-contract.ts";

interface Lease { readonly descriptor: number; readonly generation: string; active: boolean; activated: boolean; releases: number }
interface Recovery { debt: ArtifactCleanupError | undefined }

async function disposeOwnedHost(input: {
  readonly owned: { readonly close: () => Promise<{ readonly complete: boolean }> };
  readonly outside: ReturnType<typeof createScope>;
  readonly authority: ReturnType<typeof createNodeAuthority>;
  readonly leases: ReadonlyMap<string, Lease>;
  readonly directory: string;
  readonly staging: string;
  readonly foreign: number | undefined;
}): Promise<void> {
  const failures: unknown[] = [];
  let ownedComplete = false;
  let outsideComplete = false;
  let stageEmpty = false;
  try {
    const closed = await input.owned.close();
    ownedComplete = closed.complete && [...input.leases.values()].every(lease => !lease.active);
    if (!ownedComplete) { failures.push(new Error("b7.native-retirement-incomplete", { cause: closed })); }
  } catch (cause) { failures.push(cause); }
  try { if (input.foreign !== undefined) { fstatSync(input.foreign); } }
  catch (cause) { failures.push(cause); }
  try {
    stageEmpty = (await readdir(input.staging)).length === 0;
    if (!stageEmpty) { failures.push(new Error("b7.native-verification-stage-remains")); }
  } catch (cause) { failures.push(cause); }
  try {
    const closed = await input.outside.control.close(); outsideComplete = closed.complete;
    if (!outsideComplete) { failures.push(new Error("b7.foreign-owner-close", { cause: closed })); }
  } catch (cause) { failures.push(cause); }
  try { input.authority.dispose(); } catch (cause) { failures.push(cause); }
  if (ownedComplete && outsideComplete && stageEmpty) {
    try { await rm(input.directory, { recursive: true }); } catch (cause) { failures.push(cause); }
  }
  if (failures.length > 0) { throw new AggregateError(failures, "b7.host-cleanup-failed: " + input.directory); }
}

function evaluationWitness(resources: Resources) {
  const witness = { evaluations: 0, calls: 0 };
  const key = "__lmuEfJointEvaluation";
  return resources.setup({ name: "ef-evaluation-witness", setup: () => {
    assert.equal(Object.getOwnPropertyDescriptor(globalThis, key), undefined);
    Object.defineProperty(globalThis, key, { value: witness, configurable: true });
    return witness;
  }, cleanup: value => {
    if (Object.getOwnPropertyDescriptor(globalThis, key)?.value === value) { Reflect.deleteProperty(globalThis, key); }
  } });
}

/** One Resources obligation, with no inferred deletion or success for an unknown native tree. */
async function recoveryObligation(resources: Resources): Promise<Recovery> {
  return resources.setup<Recovery>({ name: "ef-native-verification-recovery", setup: () => ({ debt: undefined }),
    cleanup: value => { if (value.debt !== undefined) { throw value.debt; } } });
}

export async function createEfHost(input: EfFixtureInput, pauseBeforeEvaluation: boolean) {
  const directory = await mkdtemp(join(tmpdir(), "lmu-ef-native-host-"));
  const staging = join(directory, "verification");
  const authority = createNodeAuthority("ef/" + directory);
  const barriers = createBarriers();
  const outside = createScope({ name: "ef-host-foreign" });
  const initial = createScope({ name: "ef-initial-A" });
  const leases = new Map<string, Lease>();
  const usefulB = Promise.withResolvers<void>();
  let registration: Lease | undefined;
  let evaluationGranted = true;
  let runtime: UpdateRuntime<readonly [Command], Reply> | undefined;
  let candidateSignal: AbortSignal | undefined;
  let evaluated: Pick<EvaluatedArtifact<DocumentFormatter>, "evaluationId" | "facts"> | undefined;
  let authorizationCalls = 0;
  let transferred = false;
  let foreign: number | undefined;
  try {
    await mkdir(staging);
    const witness = await evaluationWitness(outside.resources);
    foreign = await outside.resources.setup({ name: "foreign-fd", setup: () => openSync(join(directory, "foreign"), "wx+"), cleanup: closeSync });

  async function generation(generationId: string, resources: Resources) {
    const lease = await resources.setup({ name: "owned-fd/" + generationId, setup: () => {
      const value: Lease = { descriptor: openSync(join(directory, generationId), "wx+"), generation: generationId, active: true, activated: false, releases: 0 };
      leases.set(generationId, value); return value;
    }, cleanup: value => {
      closeSync(value.descriptor); value.active = false; value.releases += 1;
      if (registration === value) { registration = undefined; }
    } });
    const environment: GenerationEnvironment = { generation: () => generationId, read: authority.document,
      write: (revision, text) => authority.write(generationId, revision, text), wait: barriers.wait,
      use: () => {
        if (authority.read().head.generationId === generationId) {
          if (!lease.activated) { registration = lease; lease.activated = true; }
          else { assert.equal(registration, lease, "b7.exact-registration"); }
        }
        assert.equal(lease.active, true, "b7.native-generation-lifetime"); fstatSync(lease.descriptor);
      } };
    return prepareGeneration(resources, environment);
  }

  const verifier = createNodeArtifactVerifier({ tools: input.tools, stagingRoot: staging });
  const preparation = createResourcesPreparation<readonly [Command], Reply>(async (context, resources) => {
    const request = artifactRequest(input.artifact);
    assert.equal(request.digest, context.request.candidate.closureId, "b7.request-matches-original-candidate");
    candidateSignal = resources.signal;
    const built = await generation("B", resources);
    const recovery = await recoveryObligation(resources);
    try {
      const verified = await verifier.verify(request);
      assert.equal(verified.facts.digest, request.digest, "b7.requested-verified-identity");
      assert.equal(verified.facts.digest, context.request.candidate.closureId, "b7.verified-closure-identity");
      if (pauseBeforeEvaluation) { await barriers.wait("verified-before-evaluation"); }
      const artifact = await verified.evaluate({ contract: artifactContract.contract, revision: artifactContract.revision,
        loader: artifactContract.loader, validate: isDocumentFormatter,
        authorize: () => { authorizationCalls += 1; return evaluationGranted && runtime !== undefined && !runtime.inspect().closed; } });
      evaluated = { evaluationId: artifact.evaluationId, facts: artifact.facts };
      const format = artifact.value.format;
      return { invoke: async (invocation, command) => {
        const result = await built.invoke(invocation, command);
        if (result.kind === "view" && (command.kind === "view" || command.kind === "held-view")) {
          const text = format(result.text); usefulB.resolve(); return { ...result, text };
        }
        return result;
      } };
    } catch (cause) { if (cause instanceof ArtifactCleanupError) { recovery.debt = cause; } throw cause; }
  });

    const built = await generation("A", initial.resources);
    runtime = createUpdateRuntime<readonly [Command], Reply>({ domainId: authority.read().domainId, authority,
      initial: { candidate: candidate("A"), invoke: built.invoke, release: () => initial.control.close() }, preparation,
      compatibility: { check: ({ candidate: description }) => description.generationId === "B"
        && description.closureId === input.artifact.digest && description.contract.id === "document-operation" && description.contract.revision === "1"
        ? { status: "compatible" } : { status: "refused", reason: "unsupported-ef-document-candidate" } },
      adoption: { args: [{ kind: "view" }], accept: value => value.kind === "view" && value.text.startsWith("signed:B:") },
      limits: { maxAttempts: 32, maxCandidates: 2, maxRetainedPredecessors: 2, maxActiveWork: 16 } });
    transferred = true;
    const ownedRuntime = runtime;
    function start(): UpdateHandle {
      const result = ownedRuntime.startUpdate({ attemptId: "signed-B", candidate: { ...candidate("B"), closureId: input.artifact.digest } });
      if (result.status === "refused") { throw new Error("b7.update-admission", { cause: result }); }
      return result.handle;
    }
    return { runtime: ownedRuntime, authority, start, entered: barriers.entered, resume: barriers.resume, usefulB: usefulB.promise,
      evaluations: () => witness.evaluations, formatCalls: () => witness.calls, authorizationCalls: () => authorizationCalls,
      revokeEvaluation: () => { evaluationGranted = false; }, candidateAborted: () => candidateSignal?.aborted,
      evaluated: () => evaluated, alive: (id: string) => leases.get(id)?.active ?? false,
      releases: (id: string) => leases.get(id)?.releases ?? 0, registered: () => registration?.generation,
      foreignIntact: () => { assert.notEqual(foreign, undefined); if (foreign === undefined) { throw new Error("missing foreign native owner"); } fstatSync(foreign); return true; },
      dispose: async () => {
        barriers.releaseAll();
        await disposeOwnedHost({ owned: ownedRuntime, outside, authority, leases, directory, staging, foreign });
      } };
  } catch (cause) {
    const failures = [cause];
    try { await disposeOwnedHost({ owned: transferred && runtime ? runtime : initial.control, outside, authority, leases, directory, staging, foreign }); }
    catch (cleanup) { failures.push(cleanup); }
    if (failures.length > 1) { throw new AggregateError(failures, "b7.initial-host-cleanup-debt", { cause }); }
    throw cause;
  }
}

export type EfHost = Awaited<ReturnType<typeof createEfHost>>;
