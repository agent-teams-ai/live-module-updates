import { assemblyFor, type AssemblyPreparationResult } from "@get-modular/assembly";
import { documentComposition, type FormatProvider } from "@fixture/portable-document-gm";
import type { SummaryCapabilities } from "./features/export-summary/composition/export-summary.contracts.js";
import { summaryGroup, summaryModule } from "./features/export-summary/composition/export-summary.group.js";

type ProviderComposition = ReturnType<typeof documentComposition>;
export type SummaryComposition = Omit<ProviderComposition, "profileId" | "modules" | "roots"> & {
  readonly profileId: string;
  readonly modules: readonly [...ProviderComposition["modules"], typeof summaryGroup];
  readonly roots: { readonly summary: typeof summaryModule };
};

export function summaryComposition(provider: FormatProvider): SummaryComposition {
  const base = documentComposition(provider);
  return {
    profileId: "author/export-summary/" + base.profileId,
    modules: [...base.modules, summaryGroup] as const,
    roots: { summary: summaryModule },
    inputs: base.inputs,
  };
}

export function prepareSummaryComposition(provider: FormatProvider): Promise<AssemblyPreparationResult<
  SummaryComposition["roots"], SummaryComposition["inputs"]
>> {
  return assemblyFor<SummaryCapabilities>().prepare(summaryComposition(provider));
}
