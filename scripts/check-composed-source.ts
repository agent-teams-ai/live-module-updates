import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { observeSourceGraph } from "@agent-teams/engineering-foundation/source-graph";
import { checkFeatureModule, STANDARD } from "@agent-teams/feature-module-standard";
import { checkModuleLayout } from "@get-modular/conformance";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
type Execute = (program: string, args: readonly string[], cwd: string) => string;

export const composedAuthority = {
  fms: { id: "agent-teams.feature-module-standard", version: "v1.1",
    digest: "sha256:cfa088ef7396139554fe5e3bcc839271b23299c6b60c569a3a7f1cd7c9f0bc6c" },
  cms: { repository: "agent-teams-ai/get-modular", commit: "27dfb4ddf67cead198fee6e781ab355c37782928",
    path: "docs/architecture/common-assembly.md", anchor: "consumer-module-standard",
    sha256: "ef5044eef1da7a01f3ca40323cd17d9f2597fc22b5abb905c7c77e5318b408d7" },
  scope: "private composed-document reference, not the ordinary LMU library or a product adoption",
} as const;

const features = ["export-summary", "document-runtime"] as const;
const application = features.map(feature => "src/features/" + feature + "/application");
const composition = features.map(feature => "src/features/" + feature + "/composition");
const publicPorts = [
  "src/features/export-summary/application/ports/export-summary.ts",
  "src/features/document-runtime/application/ports/document-operation.ts",
];
const moduleComposition = ["src/index.ts", "src/summary.ts", "src/composition/closure.ts"];
const compositionSurface = [
  "src/features/export-summary/composition/export-summary.group.ts",
  "src/features/export-summary/composition/export-summary.module.ts",
  "src/features/document-runtime/composition/document-runtime.entry.ts",
];

async function dependencyCheck(directory: string, execute: Execute) {
  await writeFile(join(directory, "pnpm-workspace.yaml"), "packages: []\n");
  await writeFile(join(directory, "foundation.config.yaml"), JSON.stringify({ schemaVersion: 2,
    project: { id: "composed-document-reference" }, capabilities: {
      "architecture.source-dependencies": { configPath: "source-dependencies.yaml" },
    } }));
  const allow = (boundaries: readonly string[], packages: readonly string[]) => ({ boundaries, packages, builtins: [], runtimeReferences: [] });
  await writeFile(join(directory, "source-dependencies.yaml"), JSON.stringify({ schemaVersion: 3,
    workspace: { kind: "pnpm", manifest: "pnpm-workspace.yaml" }, rootPackage: true, packageRoots: [], governedRoots: ["src"],
    boundaries: [
      { id: "reference-application", roots: application, entrypoints: [...publicPorts,
        "src/features/export-summary/application/use-cases/create-export-summary.ts"],
        allow: allow([], ["@fixture/portable-document", "live-module-updates"]) },
      { id: "reference-composition", roots: [...composition, ...moduleComposition], entrypoints: [...compositionSurface, ...moduleComposition],
        allow: allow(["reference-application"], ["@fixture/portable-document", "@fixture/portable-document-gm", "live-module-updates",
          "@get-modular/core", "@get-modular/assembly", "@get-modular/resources"]) },
    ] }));
  const output: unknown = JSON.parse(execute(join(repositoryRoot, "node_modules/.bin/agent-teams-foundation"),
    ["check", "architecture.source-dependencies", "--consumer", directory, "--format", "json"], directory));
  assert.ok(typeof output === "object" && output !== null && "outcome" in output);
  assert.equal(output.outcome, "passed", "the actual staged Foundation boundary must pass");
  return output;
}

/** The exact staged files are parsed by Foundation and checked by the published FMS/CMS owners. */
export async function checkComposedSource(directory: string, sources: readonly string[], execute: Execute) {
  assert.deepEqual(STANDARD, composedAuthority.fms);
  const files = sources.map(path => relative(directory, path)).toSorted();
  const graph = await observeSourceGraph({ consumerRoot: directory, roots: ["src"] });
  assert.deepEqual(graph.files, files, "every staged implementation belongs to the explicit source inventory");
  assert.deepEqual(graph.parseFailures, []);
  assert.deepEqual(graph.unresolved, []);
  assert.deepEqual(graph.unresolvedRuntimeReferences, []);
  assert.ok([...graph.edges, ...graph.external].every(edge => ["static", "static-type", "export", "export-type"].includes(edge.kind)));
  const fms = checkFeatureModule({ files, emptyDirectories: [], featuresRoots: ["src/features"],
    featureRoots: features.map(feature => "src/features/" + feature),
    roleRoots: [...application.map(path => ({ root: path, role: "application" as const })),
      ...composition.map(path => ({ root: path, role: "composition" as const }))],
    moduleComposition,
    surfaces: { public: publicPorts, compositionSurface,
      compositionContract: ["src/features/export-summary/composition/export-summary.contracts.ts"] },
    useEdges: [{ from: "document-runtime", to: "export-summary" }],
    imports: graph.edges.map(edge => ({ from: edge.from, to: edge.to, mode: edge.mode, line: edge.line,
      reexport: edge.kind === "export" || edge.kind === "export-type" })),
  });
  assert.equal(fms.ok, true, JSON.stringify(fms.diagnostics));
  assert.deepEqual(fms.diagnostics, []);
  const useCases = graph.runtimeExports.filter(item => item.path.includes("/application/use-cases/"));
  assert.ok(useCases.every(item => item.status === "complete"));
  const cms = checkModuleLayout({ files,
    imports: graph.edges.map(edge => ({ from: edge.from, to: edge.to, mode: edge.mode === "type-only" ? "type" : "value" })),
    useCaseExports: Object.fromEntries(useCases.map(item => [item.path, item.exports])),
  });
  const dependencies = await dependencyCheck(directory, execute);
  return { authority: composedAuthority, files, fms, cms, dependencies };
}
