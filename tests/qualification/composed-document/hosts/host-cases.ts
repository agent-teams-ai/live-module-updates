import { constructionProfiles, qualifyClosureConstruction } from "./closure-conformance.js";
import { requireFact, throwFailures, type ArtifactInputs, type EnvironmentFactory } from "./environment.js";
import { createComposedRuntime } from "./runtime-host.js";
import { liveCases } from "./live-cases.js";
import { nativeAuthorityCases } from "./authority-laws.js";
import { qualifyConstructionRefusal, refusalNames } from "./construction-refusals.js";
import { qualifyIndependentDomains } from "./independent-domains.js";

export interface CampaignOptions {
  readonly caseName?: string;
  readonly unsafeEffects?: boolean;
  readonly unsafeRemoval?: boolean;
  readonly unsafeOmitRelease?: boolean;
  readonly unsafeParentFirst?: boolean;
}

/** Actual results are compared to handwritten application expectations inside each case. */
export async function runHostCases(create: EnvironmentFactory, artifacts: ArtifactInputs, options: CampaignOptions = {}) {
  const rows: object[] = [];
  for (const profile of constructionProfiles) {
    if (options.caseName !== undefined && options.caseName !== "construction-" + profile.name) { continue; }
    const environment = create({ domain: "composed/construction/" + profile.name });
    const failures: unknown[] = [];
    try {
      const result = await qualifyClosureConstruction(environment, profile);
      rows.push({ name: "construction-" + profile.name, outcome: "passed", result });
    } catch (cause) { failures.push(cause); }
    try { environment.dispose(); } catch (cause) { failures.push(cause); }
    throwFailures(failures, "composed scenario and native disposal failed");
  }
  for (const name of refusalNames) {
    if (options.caseName !== undefined && options.caseName !== name) { continue; }
    const environment = create({ domain: "composed/" + name }); const failures: unknown[] = [];
    try { rows.push({ name, outcome: "passed", result: await qualifyConstructionRefusal(environment, name) }); }
    catch (cause) { failures.push(cause); }
    try { environment.dispose(); } catch (cause) { failures.push(cause); }
    throwFailures(failures, "construction refusal and native disposal failed");
  }
  rows.push(...await runLiveCases(create, artifacts, options));
  if (options.caseName === undefined || options.caseName === "independent-domains") {
    rows.push({ name: "independent-domains", outcome: "passed", result: await qualifyIndependentDomains(create, artifacts) });
  }
  for (const law of nativeAuthorityCases(create)) {
    if (options.caseName !== undefined && options.caseName !== "authority-" + law.name) { continue; }
    await law.run(); rows.push({ name: "authority-" + law.name, outcome: "passed", result: { publicEntry: "live-module-updates/testing" } });
  }
  requireFact(rows.length > 0, "c.selected-case-exists");
  return rows;
}

async function runLiveCases(create: EnvironmentFactory, artifacts: ArtifactInputs, options: CampaignOptions): Promise<readonly object[]> {
  const rows: object[] = [];
  for (const scenario of liveCases) {
    if (options.caseName !== undefined && options.caseName !== scenario.name) { continue; }
    const environment = create({ domain: "composed/" + scenario.name,
      ...(options.unsafeEffects === undefined ? {} : { unsafeEffects: options.unsafeEffects }),
      ...(options.unsafeOmitRelease === undefined ? {} : { unsafeOmitRelease: options.unsafeOmitRelease }),
      ...(options.unsafeRemoval === undefined ? {} : { unsafeRemoval: options.unsafeRemoval }) });
    const failures: unknown[] = [];
    let host: Awaited<ReturnType<typeof createComposedRuntime>> | undefined;
    try {
      host = createComposedRuntime(environment, { artifacts, ...scenario.options,
        ...(options.unsafeParentFirst === undefined ? {} : { unsafeParentFirst: options.unsafeParentFirst }) });
      if (scenario.deferConstruction !== true) { await host.construct(); }
      rows.push({ name: scenario.name, outcome: "passed", result: await scenario.run(host) });
    } catch (cause) { failures.push(cause); }
    try { await host?.dispose(); } catch (cause) { failures.push(cause); }
    try { environment.dispose(); } catch (cause) { failures.push(cause); }
    throwFailures(failures, "composed scenario and native disposal failed");
  }
  return rows;
}
