import { createNodeEnvironment } from "./node-environment.js";
import { runHostCases, type CampaignOptions } from "./host-cases.js";
import type { ArtifactInputs } from "./environment.js";

export const runNodeCases = (artifacts: ArtifactInputs, options?: CampaignOptions) => runHostCases(createNodeEnvironment, artifacts, options);
