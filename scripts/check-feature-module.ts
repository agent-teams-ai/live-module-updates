import assert from "node:assert/strict";
import { lstat, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { observeSourceGraph } from "@agent-teams/engineering-foundation/source-graph";
import { checkFeatureModule, STANDARD, type LayerRole, type RoleRoot } from "@agent-teams/feature-module-standard";

export const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
export const profilePath = "architecture/feature-module-profile.json";
const inside = (file: string, directory: string) => file === directory || file.startsWith(directory + "/");

function isRecord(candidate: unknown): candidate is Record<string, unknown> {
  return typeof candidate === "object" && candidate !== null && !Array.isArray(candidate);
}
function record(value: unknown): Record<string, unknown> {
  assert.ok(isRecord(value), "profile object is missing");
  return value;
}
function records(value: unknown): Record<string, unknown>[] {
  assert.ok(Array.isArray(value), "profile list is missing");
  return value.map((item: unknown) => record(item));
}
function text(value: unknown): string {
  assert.ok(typeof value === "string" && value.length > 0, "profile string is missing");
  return value;
}
function path(value: unknown): string {
  const result = text(value);
  assert.ok(!result.startsWith("/") && !result.includes("\\") && !result.split("/").some(part => part === ".." || part === ""),
    "profile path must remain inside the repository");
  return result;
}
function paths(value: unknown): string[] {
  assert.ok(Array.isArray(value), "profile path list is missing");
  return value.map((item: unknown) => path(item));
}
function role(value: unknown): LayerRole {
  switch (value) {
    case "application": case "domain": case "adapters": case "composition": case "contracts": case "testing": return value;
    default: throw new Error("profile declares an unsupported layer role");
  }
}

/** File census only; the installed Foundation owns parsing and import resolution. */
async function inventory(root: string, roots: readonly string[]) {
  const files: string[] = [];
  const empty: string[] = [];
  async function visit(relative: string): Promise<void> {
    const stat = await lstat(join(root, relative));
    assert.ok(!stat.isSymbolicLink(), "source symlink is outside the adopted profile: " + relative);
    if (stat.isDirectory()) {
      const entries = await readdir(join(root, relative));
      if (entries.length === 0) {empty.push(relative);}
      for (const name of entries) {await visit(relative + "/" + name);}
    } else {
      assert.ok(stat.isFile() && relative.endsWith(".ts"), "uncovered source format: " + relative);
      files.push(relative);
    }
  }
  for (const sourceRoot of roots) { await visit(sourceRoot); }
  return { files: files.toSorted(), empty: empty.toSorted() };
}

/** Enforces this repository's one-module topology using the published FMS kernel. */
export async function checkOwnedFeatureModule(root = repositoryRoot) {
  const raw: unknown = JSON.parse(await readFile(join(root, profilePath), "utf8"));
  const profile = record(raw);
  const standard = record(profile["standard"]);
  assert.deepEqual({ id: standard["id"], version: standard["version"], digest: standard["digest"] }, STANDARD);
  assert.equal(profile["status"], "adopted");
  const modules = records(profile["modules"]);
  assert.equal(modules.length, 1, "an additional production module requires a topology decision");
  const module = modules[0];
  assert.ok(module);
  assert.equal(module["id"], "live-module-updates");
  assert.equal(module["role"], "platform-library");
  assert.equal(module["root"], ".");
  assert.deepEqual(profile["productionRoots"], ["src"]);
  assert.deepEqual(profile["applicationRoots"], []);
  assert.deepEqual(module["ownershipExceptions"], [], "no module-level behavior exception is adopted");
  assert.deepEqual(module["republications"], [], "no module republication is adopted");
  const sourceRoot = path(module["sourceRoot"]);
  assert.equal(sourceRoot, "src");
  const features = records(module["features"]);
  assert.ok(features.length > 0, "a production module needs a substantive feature");
  const featureRoots = features.map(feature => path(feature["root"]));
  const roleRoots: RoleRoot[] = features.flatMap(feature => records(feature["layers"])
    .map(layer => ({ root: path(layer["root"]), role: role(layer["role"]) })));
  const moduleComposition = paths(module["moduleComposition"]);
  const source = await inventory(root, [sourceRoot]);
  assert.ok(source.files.length > 0, "production source is empty");
  assert.deepEqual(source.empty, [], "empty ceremonial source directories are forbidden");
  for (const feature of featureRoots) {
    assert.ok(source.files.some(file => inside(file, feature)), "declared feature is empty: " + feature);
  }
  for (const layer of roleRoots) {
    assert.ok(source.files.some(file => inside(file, layer.root)), "declared layer is empty: " + layer.root);
  }
  for (const file of source.files) {
    assert.ok(featureRoots.some(feature => inside(file, feature)) || moduleComposition.includes(file),
      "production behavior outside an owned feature: " + file);
  }
  for (const file of moduleComposition) {assert.ok(source.files.includes(file), "curated module entry is missing: " + file);}
  const tests = await inventory(root, ["tests/features"]);
  const graph = await observeSourceGraph({ consumerRoot: root, roots: [sourceRoot, "tests/features"] });
  assert.deepEqual(graph.files, [...source.files, ...tests.files].toSorted(), "source parser census differs from disk");
  assert.deepEqual(graph.parseFailures, [], "source could not be parsed");
  assert.deepEqual(graph.unresolved, [], "source imports do not resolve");
  assert.deepEqual(graph.unresolvedRuntimeReferences, [], "computed source imports are not admitted");
  assert.ok([...graph.edges, ...graph.external].every(edge => ["static", "static-type", "export", "export-type"].includes(edge.kind)),
    "production and feature tests use explicit static ESM references");
  const surface = record(module["surfaces"]);
  const result = checkFeatureModule({
    featuresRoots: [path(module["featuresRoot"])], featureRoots, roleRoots,
    files: source.files, emptyDirectories: source.empty,
    testFiles: tests.files, testFeaturesRoot: "tests/features", moduleComposition,
    surfaces: {
      public: paths(surface["public"] ?? []),
      internalApi: paths(surface["internalApi"] ?? []),
      compositionSurface: paths(surface["compositionSurface"]),
    },
    useEdges: records(module["useEdges"]).map(edge => ({ from: text(edge["from"]), to: text(edge["to"]) })),
    imports: graph.edges.map(edge => ({ from: edge.from, to: edge.to, mode: edge.mode, line: edge.line,
      reexport: edge.kind === "export" || edge.kind === "export-type" })),
  });
  assert.equal(result.ok, true, JSON.stringify(result.diagnostics));
  assert.deepEqual(result.diagnostics, [], "unexpected FMS warnings need explicit review");
  return { standard: STANDARD, module: module["id"], files: source.files.length, tests: tests.files.length,
    features: result.features, metrics: result.metrics };
}

if (import.meta.main) {process.stdout.write(JSON.stringify(await checkOwnedFeatureModule(), null, 2) + "\n");}
