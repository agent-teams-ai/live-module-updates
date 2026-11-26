import { assemblyFor, declareModule, defineContract, group, implement, input, type CapabilitiesOf } from "@get-modular/assembly";
import { required } from "@get-modular/core";
import { smoke } from "@get-modular/conformance";
import type { Resources } from "@get-modular/resources";
import type { PreparedGeneration } from "../../src/index.ts";
import { expect, type Command, type Entry, type GenerationEnvironment, type Reply } from "./host-contract.ts";

interface DocumentService { readonly invoke: Entry }
const Document = defineContract<DocumentService>()({ id: "qualification/document", revision: 1 });
const Environment = defineContract<GenerationEnvironment>()({ id: "qualification/document/environment", revision: 1 });
interface Capabilities extends CapabilitiesOf<typeof Document | typeof Environment> {}

function view(environment: GenerationEnvironment): Reply {
  environment.use();
  const value = environment.read();
  const generation = environment.generation();
  const text = generation === "B" ? value.text.toUpperCase() : generation === "C" ? value.text + "!" : value.text;
  return { kind: "view", generation, text: generation + ":" + text, revision: value.revision };
}
function entry(environment: GenerationEnvironment): Entry {
  return async (context, command) => {
    environment.use();
    if (command.kind === "held-view" || command.kind === "held-edit" || command.kind === "nested") {
      await environment.wait(command.barrier);
      environment.use();
    }
    if (command.kind === "nested") {
      const result = await context.invoke({ kind: "view" });
      if (result.status !== "returned") { throw new Error("nested admitted invocation was refused"); }
      return result.value;
    }
    if (command.kind === "edit" || command.kind === "held-edit") {
      return { kind: "effect", effect: environment.write(command.expected, command.text) };
    }
    return view(environment);
  };
}
function composition(generation: string) {
  const hostDeclaration = declareModule({ moduleId: "qualification/environment", implementationId: "qualification/environment/host",
    owner: { authority: "qualification", path: ["document"] }, provides: [Environment.provide()], slots: [] });
  const host = input<Capabilities>()(hostDeclaration);
  const declaration = declareModule({ moduleId: "qualification/document", implementationId: "qualification/document/" + generation.toLowerCase(),
    owner: { authority: "qualification", path: ["document"] }, provides: [Document.provide()],
    slots: [Environment.slot("environment", required())] });
  const module = implement<Capabilities>()(declaration, async (dependencies) => {
    const service: DocumentService = { invoke: entry(dependencies.environment) };
    return { instance: service, capabilities: { "qualification/document": service } };
  });
  return { profileId: "qualification/document/" + generation.toLowerCase(), modules: [group("document", [module])] as const,
    roots: { document: module }, inputs: { host } };
}

/** The actual typed GM sole-entry-root build receives only a borrowed Host port. */
export async function prepareGeneration(resources: Resources, environment: GenerationEnvironment): Promise<PreparedGeneration<readonly [Command], Reply>> {
  const prepared = await assemblyFor<Capabilities>().prepare(composition(environment.generation()));
  if (prepared.status !== "prepared") { throw new Error("GM generation preparation failed", { cause: prepared }); }
  const result = await prepared.prepared.run({ signal: resources.signal, scope: resources,
    inputs: { host: { "qualification/document/environment": environment } } });
  if (result.status !== "succeeded") { throw new Error("GM generation construction failed", { cause: result }); }
  return { invoke: result.roots.document.invoke };
}

export async function qualifyComposition(): Promise<number> {
  const environment: GenerationEnvironment = { generation: () => "A", read: () => ({ revision: 0, text: "seed" }),
    write: () => ({ status: "refused", reason: "grant-denied" }), wait: () => Promise.resolve(), use: () => {} };
  const steps = await smoke({ api: assemblyFor<Capabilities>(), compose: supplied => supplied.prepare(composition("A")),
    inputs: { host: { "qualification/document/environment": environment } } });
  expect(steps.length === 3, "b6.gm-smoke-count");
  for (const step of steps) {
    expect(step.problem === undefined &&  step.report.complete, "b6.gm-construction-ownership");
  }
  return steps.length;
}
