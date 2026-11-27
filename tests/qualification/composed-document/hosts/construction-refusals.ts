import { assemblyFor, declareModule, defineContract, input, type CapabilitiesOf } from "@get-modular/assembly";
import type { UpdateAuthority } from "live-module-updates";
import { runtimeComposition, type RuntimeCapabilities } from "@fixture/composed-document";
import { requireFact, type NativeEnvironment } from "./environment.js";

export const refusalNames = ["runtime-missing-input", "runtime-contract-conflict"] as const;
const AuthorityV2 = defineContract<UpdateAuthority>()({ id: "reference/document-runtime/authority", revision: 2 });
interface IncompatibleCapabilities extends CapabilitiesOf<typeof AuthorityV2> {}

export async function qualifyConstructionRefusal(environment: NativeEnvironment, name: typeof refusalNames[number]) {
  const { preparation: _missing, ...withoutPreparation } = runtimeComposition.inputs;
  const incompatible = input<IncompatibleCapabilities>()(declareModule({ moduleId: "reference/document-runtime/authority",
    implementationId: "reference/document-runtime/authority/incompatible", owner: { authority: "reference", path: ["document-runtime"] },
    provides: [AuthorityV2.provide()], slots: [] }));
  const definition = name === "runtime-missing-input" ? { ...runtimeComposition, inputs: withoutPreparation }
    : { ...runtimeComposition, inputs: { ...runtimeComposition.inputs, authority: incompatible } };
  const api = assemblyFor<RuntimeCapabilities>();
  requireFact((await api.prepare(runtimeComposition)).status === "prepared", "c.valid-runtime-construction-metadata");
  // This deliberately invalid external input cannot enter through the typed authoring route.
  const prepared: unknown = await Reflect.apply(api.prepare, api, [definition]);
  requireFact(typeof prepared === "object" && prepared !== null && "status" in prepared && prepared.status === "failed"
    && "error" in prepared && typeof prepared.error === "object" && prepared.error !== null
    && "code" in prepared.error && "cause" in prepared.error
    && "diagnostics" in prepared && Array.isArray(prepared.diagnostics), "c.actual-gm-refusal");
  if (name === "runtime-missing-input") {
    requireFact(prepared.error.code === "assembly.prepare.unresolved-binding" && Array.isArray(prepared.error.cause)
      && prepared.error.cause.some((issue: unknown) => typeof issue === "object" && issue !== null
        && "capabilityId" in issue && issue.capabilityId === "reference/document-runtime/preparation"), "c.actual-gm-refusal-code");
  } else {
    requireFact(prepared.error.code === "assembly.prepare.core-rejected"
      && prepared.diagnostics.some((issue: unknown) => typeof issue === "object" && issue !== null
        && "code" in issue && issue.code === "binding.compatibility-mismatch"), "c.actual-gm-refusal-code");
  }
  requireFact(environment.acquired().length === 0 && environment.authority.publicationCalls() === 0, "c.gm-refusal-before-effects");
  requireFact(environment.foreignIntact(), "c.foreign-survival");
  return { status: prepared.status, code: prepared.error.code, diagnostics: prepared.diagnostics, acquisitions: 0, publications: 0 };
}
