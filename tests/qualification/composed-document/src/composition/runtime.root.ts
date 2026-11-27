import { assemblyFor, type Assembly } from "@get-modular/assembly";
import type { RuntimeCapabilities } from "../features/document-runtime/composition/document-runtime.contracts.js";
import { documentRuntimeGroup, runtimeModule, documentClient } from "../features/document-runtime/composition/document-runtime.group.js";
import { runtimeInputs } from "../features/document-runtime/composition/document-runtime.inputs.js";

/** The coordinator is a Host-owned instance; downstream roots receive its narrow capability. */
export const runtimeComposition = {
  profileId: "reference/composed-document-runtime",
  modules: [documentRuntimeGroup] as const,
  roots: { owner: runtimeModule, document: documentClient },
  inputs: runtimeInputs,
};

export function prepareRuntime(api: Assembly<RuntimeCapabilities> = assemblyFor<RuntimeCapabilities>()) {
  return api.prepare(runtimeComposition);
}
