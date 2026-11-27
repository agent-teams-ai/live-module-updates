import { createResourcesPreparation } from "live-module-updates/resources";
import type { CandidateDescription, CompatibilityPort } from "live-module-updates";
import { createDocumentEntry, prepareClosure, type DocumentCommand, type DocumentReply } from "@fixture/composed-document";
import { plainFormatProvider, markedFormatProvider, type FormatProvider } from "@fixture/portable-document-gm";
import { authorFormatProvider } from "./author-format.js";
import { requireFact, type ArtifactInputs, type FormatObservation, type NativeEnvironment } from "./environment.js";

interface FactoryBinding {
  readonly candidate: CandidateDescription;
  readonly provider: FormatProvider;
}

function sameCandidate(left: CandidateDescription, right: CandidateDescription): boolean {
  return left.generationId === right.generationId && left.closureId === right.closureId && Object.is(left.profile, right.profile)
    && left.contract.id === right.contract.id && left.contract.revision === right.contract.revision;
}

function catalog(artifacts: ArtifactInputs, samePlan: boolean): readonly FactoryBinding[] {
  const members = [
    ["A", "plain", plainFormatProvider], ["B", "marked", markedFormatProvider], ["C", "author", authorFormatProvider],
    ...Array.from({ length: 34 }, (_, index) => ["R" + String(index), "plain", plainFormatProvider] as const),
  ] as const;
  return members.map(([generation, member, provider]) => {
    const create = provider.create.bind(provider);
    return {
    candidate: Object.freeze({ generationId: generation,
      closureId: JSON.stringify([artifacts.coreArchive, artifacts.adapterArchive, artifacts.referenceArchive, artifacts.authorSource, member]),
      contract: Object.freeze({ id: "reference/document-operation", revision: "1" }), profile: "cooperative-operation-v1" }),
    provider: { implementationId: samePlan ? "fixture/format/same" : provider.implementationId, create },
  }; });
}

/** The catalog binds actual imported factories; no prepared-plan cache or second resolver exists. */
export function createGenerationOwner(environment: NativeEnvironment, artifacts: ArtifactInputs, samePlan = false) {
  const bindings = catalog(artifacts, samePlan);
  const traces: FormatObservation[] = [];
  const plans = new Map<string, string>();
  const gates = new Map<string, string>();
  const failures = new Set<string>();
  const evaluations = new Map<string, number>();
  const compatibility: CompatibilityPort = { check: ({ candidate }) => {
    if (environment.authority.schemaVersion() !== "schema/1") { return { status: "refused", reason: "schema-incompatible" }; }
    return bindings.some(binding => sameCandidate(binding.candidate, candidate))
      ? { status: "compatible" } : { status: "refused", reason: "unknown-factory-closure" };
  } };
  const preparation = createResourcesPreparation<readonly [DocumentCommand], DocumentReply>(async (context, resources) => {
    const binding = bindings.find(value => sameCandidate(value.candidate, context.request.candidate));
    requireFact(binding !== undefined, "c.original-factory-binding");
    const generation = binding.candidate.generationId;
    const provider: FormatProvider = { implementationId: binding.provider.implementationId, create: () => {
      evaluations.set(generation, (evaluations.get(generation) ?? 0) + 1);
      const port = binding.provider.create();
      return {
        title: revision => {
          environment.use(generation);
          const output = port.title(revision);
          traces.push({ generation, member: "title", input: revision, output }); return output;
        },
        body: text => {
          environment.use(generation);
          const output = port.body(text);
          traces.push({ generation, member: "body", input: text, output }); return output;
        },
      };
    } };
    const prepared = await prepareClosure(provider);
    requireFact(prepared.status === "prepared", "c.generation-plan");
    plans.set(generation, prepared.composition.digest);
    const built = await prepared.prepared.run({ scope: resources, inputs: {
      state: { "fixture/document/state": environment.document(generation) },
      delivery: { "fixture/export/delivery": environment.delivery(generation) },
    } });
    if (built.status !== "succeeded") { throw new Error("actual generation GM construction refused", { cause: built }); }
    const gate = gates.get(generation);
    if (gate !== undefined) { await environment.wait(gate); }
    if (failures.has(generation)) { throw new Error("deliberate failure after actual GM native acquisition"); }
    return { invoke: createDocumentEntry({ document: built.roots.document, publication: built.roots.publication,
      summary: built.roots.summary, wait: environment.wait, use: () => { environment.use(generation); } }) };
  });
  return {
    compatibility, preparation,
    candidate: (generation: string): CandidateDescription => {
      const binding = bindings.find(value => value.candidate.generationId === generation);
      requireFact(binding !== undefined, "c.catalog-generation"); return binding.candidate;
    },
    traces: () => [...traces], plans: () => Object.fromEntries(plans),
    evaluations: (generation: string) => evaluations.get(generation) ?? 0,
    holdPreparation: (generation: string, barrier: string) => { gates.set(generation, barrier); },
    failPreparation: (generation: string) => { failures.add(generation); },
  };
}
