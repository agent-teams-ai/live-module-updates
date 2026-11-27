import { createBrowserEnvironment } from "./browser-environment.js";
import { runHostCases, type CampaignOptions } from "./host-cases.js";
import type { ArtifactInputs } from "./environment.js";

export const runBrowserCases = (artifacts: ArtifactInputs, options?: CampaignOptions) => runHostCases(createBrowserEnvironment, artifacts, options);
