import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";
import { projectQualitySourceTopology } from "@agent-teams/feature-module-standard/quality-topology";

export const qualityProfilePath = "architecture/foundation/source-coverage.yaml";
export const topologyPath = "architecture/foundation/source-topology.json";
const featureProfilePath = "architecture/feature-module-profile.json";
const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

/** Source-bound projection through the published FMS owner; no local topology mapper. */
export async function qualityTopologyProjection(root: string): Promise<string> {
  const [coverageBytes, featureBytes] = await Promise.all([
    readFile(join(root, qualityProfilePath)),
    readFile(join(root, featureProfilePath)),
  ]);
  const document = parseDocument(coverageBytes.toString("utf8"), { uniqueKeys: true });
  if (document.errors.length > 0) { throw new Error("Invalid quality coverage YAML"); }
  const coverage: unknown = document.toJS({ maxAliasCount: 0 });
  if (typeof coverage !== "object" || coverage === null || Array.isArray(coverage)
    || !("schemaVersion" in coverage) || coverage.schemaVersion !== 5
    || !("sourcePolicyPath" in coverage) || typeof coverage.sourcePolicyPath !== "string"
    || !("topologyPath" in coverage) || coverage.topologyPath !== topologyPath) {
    throw new Error("Quality topology requires the owned v5 coverage and topology path");
  }
  const feature: unknown = JSON.parse(featureBytes.toString("utf8"));
  const projected = projectQualitySourceTopology(feature, coverage.sourcePolicyPath);
  const derivedFrom = [
    { path: featureProfilePath, sha256: createHash("sha256").update(featureBytes).digest("hex") },
    { path: qualityProfilePath, sha256: createHash("sha256").update(coverageBytes).digest("hex") },
  ].toSorted((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0);
  return JSON.stringify({ ...projected, derivedFrom }, null, 2) + "\n";
}

export async function checkQualityTopology(root: string): Promise<void> {
  const expected = await qualityTopologyProjection(root);
  if (await readFile(join(root, topologyPath), "utf8") !== expected) {
    throw new Error("Quality topology is stale; run node scripts/check-quality-topology.ts --write");
  }
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.length !== 1 || (args[0] !== "--check" && args[0] !== "--write")) {
    throw new Error("Usage: node scripts/check-quality-topology.ts (--check|--write)");
  }
  if (args[0] === "--write") {
    await writeFile(join(repositoryRoot, topologyPath), await qualityTopologyProjection(repositoryRoot));
  } else {
    await checkQualityTopology(repositoryRoot);
  }
}
