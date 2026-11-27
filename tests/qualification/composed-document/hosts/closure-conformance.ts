import { assemblyFor, entriesOf } from "@get-modular/assembly";
import { checkNamespaces, checkWiring, isolate, smoke, type WiringOracle } from "@get-modular/conformance";
import { createScope, type SetupSpec } from "@get-modular/resources";
import type { ExportDeliveryPort } from "@fixture/portable-document";
import { closureComposition, prepareClosure, type SummaryCapabilities } from "@fixture/composed-document";
import { markedFormatProvider, plainFormatProvider, type FormatProvider } from "@fixture/portable-document-gm";
import { requireFact, throwFailures, type NativeEnvironment } from "./environment.js";

export interface ProfileCase {
  readonly name: "plain" | "marked";
  readonly provider: FormatProvider;
  readonly implementation: string;
  readonly content: string;
}
export const constructionProfiles: readonly ProfileCase[] = [
  { name: "plain", provider: plainFormatProvider, implementation: "fixture/format/plain", content: "Document r0\nseed" },
  { name: "marked", provider: markedFormatProvider, implementation: "fixture/format/marked", content: "[Document r0]\n> seed" },
];

function wiring(implementation: string): WiringOracle {
  return { providers: {
    "fixture/document": "fixture/document/default", "fixture/document/state": "fixture/document/state/host",
    "fixture/format": implementation, "fixture/export": "fixture/export/default", "fixture/export/delivery": "fixture/export/delivery/host",
  }, roots: ["fixture/document/default", "fixture/export/default", "author/export-summary/default"] };
}

export async function qualifyClosureConstruction(environment: NativeEnvironment, expected: ProfileCase) {
  const definition = closureComposition(expected.provider);
  const declarations = [...entriesOf(definition.modules).map(entry => entry.declaration),
    definition.inputs.state.declaration, definition.inputs.delivery.declaration];
  checkNamespaces({ namespace: "fixture", declarations: declarations.filter(entry => entry.moduleId.startsWith("fixture/")) });
  checkNamespaces({ namespace: "author", declarations: declarations.filter(entry => entry.moduleId.startsWith("author/")) });
  const prepared = await prepareClosure(expected.provider);
  requireFact(prepared.status === "prepared", "c.construction-prepare");
  checkWiring(prepared.composition, [wiring(expected.implementation)], { declarations });
  const fakeDelivery: SetupSpec<ExportDeliveryPort> = { name: "conformance-delivery",
    setup: () => ({ prepare: () => Promise.resolve({ status: "ready" }),
      commit: (revision, content) => ({ status: "published", revision, content }) }), cleanup: () => {} };
  const inputs = { state: { "fixture/document/state": environment.document("A") }, delivery: { "fixture/export/delivery": fakeDelivery } };
  const steps = await smoke({ api: assemblyFor<SummaryCapabilities>(), compose: supplied => prepareClosure(expected.provider, supplied), inputs });
  requireFact(steps.every(step => step.problem === undefined && step.report.complete), "c.construction-smoke");
  await using isolated = await isolate(definition.roots.summary, { dependencies: {
    publication: { publish: () => Promise.resolve({ status: "published", revision: 7, content: "independent input" }) },
  } });
  const isolatedResult = await isolated.instance.publishSummary();
  requireFact(isolatedResult.status === "published" && isolatedResult.revision === 7 && isolatedResult.contentLength === 17, "c.summary-isolation");
  const scope = createScope({ name: "native-composed-construction" });
  const failures: unknown[] = [];
  let observation: object | undefined;
  try {
    const result = await prepared.prepared.run({ signal: scope.resources.signal, scope: scope.resources,
      inputs: { state: inputs.state, delivery: { "fixture/export/delivery": environment.delivery("A") } } });
    requireFact(result.status === "succeeded", "c.construction-run");
    const summary = await result.roots.summary.publishSummary();
    requireFact(summary.status === "published" && summary.revision === 0 && summary.contentLength === expected.content.length, "c.useful-summary");
    const delivery = environment.deliveries();
    requireFact(delivery.length === 1 && delivery[0]?.generation === "A" && delivery[0].revision === 0
      && delivery[0].content === expected.content, "c.native-delivery");
    observation = { profile: expected.name, content: delivery[0].content, summary, smokeSteps: steps.length, digest: prepared.composition.digest };
  } catch (cause) { failures.push(cause); }
  try {
    const closed = await scope.control.close();
    requireFact(closed.complete && closed.settled && !environment.alive("A") && environment.releases("A") === 1, "c.native-construction-cleanup");
    requireFact(environment.foreignIntact(), "c.foreign-survival");
  } catch (cause) { failures.push(cause); }
  throwFailures(failures, "native construction and original cleanup failed");
  requireFact(observation !== undefined, "c.construction-observation");
  return observation;
}
