import { assemblyFor, type Assembly, type AssemblyPreparationResult } from "@get-modular/assembly";
import { documentComposition, type FormatProvider } from "@fixture/portable-document-gm";
import type { SummaryCapabilities } from "../features/export-summary/composition/export-summary.contracts.js";
import { summaryGroup, summaryModule } from "../features/export-summary/composition/export-summary.group.js";

type ProviderComposition = ReturnType<typeof documentComposition>;
export type ClosureComposition = Omit<ProviderComposition, "profileId" | "modules" | "roots"> & {
  readonly profileId: string;
  readonly modules: readonly [...ProviderComposition["modules"], typeof summaryGroup];
  readonly roots: {
    readonly document: ProviderComposition["roots"]["document"];
    readonly publication: ProviderComposition["roots"]["export"];
    readonly summary: typeof summaryModule;
  };
};

/** One actual selection owns the original Document/Format/Export/Summary factory set. */
export function closureComposition(provider: FormatProvider): ClosureComposition {
  const base = documentComposition(provider);
  return {
    profileId: "composed-document/" + base.profileId,
    modules: [...base.modules, summaryGroup] as const,
    roots: { document: base.roots.document, publication: base.roots.export, summary: summaryModule },
    inputs: base.inputs,
  };
}

export function prepareClosure(provider: FormatProvider, api: Assembly<SummaryCapabilities> = assemblyFor<SummaryCapabilities>()): Promise<AssemblyPreparationResult<
  ClosureComposition["roots"], ClosureComposition["inputs"]
>> {
  return api.prepare(closureComposition(provider));
}
