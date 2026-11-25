import { compileComposition } from "@get-modular/core";
import {
  assemblyFor, declareModule, defineContract, implement, type CapabilitiesOf,
} from "@get-modular/assembly";
import { createScope, scoped } from "@get-modular/resources";

type ValuePort = { readonly read: () => string };
const Value = defineContract<ValuePort>()({ id: "fixture/value", revision: 1 });
interface Capabilities extends CapabilitiesOf<typeof Value> {}
const declaration = declareModule({
  moduleId: "fixture/value", implementationId: "fixture/value/default",
  owner: { authority: "fixture", path: ["value"] },
  provides: [Value.provide()], slots: [],
});

/** P1 public-package discriminator; no production or complete lifecycle claim. */
export async function runCompositionSpike() {
  const observations: string[] = [];
  const entry = implement<Capabilities>()(declaration, scoped("value", async (_deps, { resources }) => {
    const value = await resources.setup({
      name: "owned-value",
      setup: () => { observations.push("acquired"); return "public GM"; },
      cleanup: () => { observations.push("released"); },
    });
    const port: ValuePort = { read: () => value };
    return { instance: port, capabilities: { "fixture/value": port } };
  }));
  const composition = await compileComposition({ declarations: [declaration], profile: {
    kind: "get-modular.composition-profile", schemaVersion: 1, profileId: "fixture/public-spike",
    roots: [declaration.moduleId], selections: [{ moduleId: declaration.moduleId,
      implementationId: declaration.implementationId }], bindings: [],
  } });
  if (!composition.ok) throw new Error(JSON.stringify(composition.diagnostics));
  const prepared = await assemblyFor<Capabilities>().prepare({ composition, modules: [entry], roots: { value: entry } });
  if (prepared.status !== "prepared") throw new Error(JSON.stringify(prepared));
  const scope = createScope({ name: "public-spike" });
  let value: string;
  let close;
  try {
    const outcome = await prepared.prepared.run({ scope: scope.resources });
    if (outcome.status !== "succeeded") throw new Error(JSON.stringify(outcome));
    value = outcome.roots.value.read();
  } finally { close = await scope.control.close(); }
  return { value, close, observations };
}
