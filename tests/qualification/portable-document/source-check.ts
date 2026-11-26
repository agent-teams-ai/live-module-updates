import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { lstat, readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { observeSourceGraph } from "@agent-teams/engineering-foundation/source-graph";
import { checkFeatureModule, STANDARD } from "@agent-teams/feature-module-standard";
import { checkModuleLayout, type ModuleLayoutReport } from "@get-modular/conformance";
import { sourceAuthority, sourceProfiles } from "./source-profile.ts";

interface PackageManifest {
  readonly name: string;
  readonly version: string;
  readonly bin?: Readonly<Record<string, string>>;
}
interface DependencyReport {
  readonly outcome: string;
  readonly capabilities: readonly {
    readonly capabilityId: string;
    readonly diagnostics: readonly { readonly ruleId: string; readonly message: string }[];
  }[];
}

async function installedPackage(name: string) {
  let directory = dirname(fileURLToPath(import.meta.resolve(name)));
  for (;;) {
    const path = join(directory, "package.json");
    try {
      const manifest = JSON.parse(await readFile(path, "utf8")) as PackageManifest;
      if (manifest.name === name) return { path, manifest };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    const parent = dirname(directory);
    assert.notEqual(parent, directory, `Installed manifest missing: ${name}`);
    directory = parent;
  }
}

async function toolIdentity() {
  const versions: Record<string, string> = {};
  for (const [name, version] of Object.entries(sourceAuthority.tools)) {
    const installed = await installedPackage(name);
    assert.equal(installed.manifest.version, version, `Pinned source tool: ${name}`);
    versions[name] = installed.manifest.version;
  }
  const foundation = await installedPackage("@agent-teams/engineering-foundation");
  const embedded = createRequire(foundation.path)("typescript") as { readonly version: string };
  assert.equal(embedded.version, sourceAuthority.tools.typescript, "Initialized Foundation compiler");
  assert.deepEqual(STANDARD, sourceAuthority.fms, "Adopted FMS text must match the installed kernel");
  return { versions, embeddedTypeScript: embedded.version, foundation };
}

/** Independent file census; the installed Foundation owns all source parsing. */
async function inventory(directory: string, roots: readonly string[]) {
  const files: string[] = [];
  const emptyDirectories: string[] = [];
  async function visit(path: string): Promise<void> {
    const metadata = await lstat(join(directory, path));
    assert.ok(!metadata.isSymbolicLink(), `Source symlink is outside this profile: ${path}`);
    if (metadata.isDirectory()) {
      const entries = await readdir(join(directory, path));
      if (entries.length === 0) emptyDirectories.push(path);
      for (const entry of entries) await visit(`${path}/${entry}`);
    } else {
      assert.ok(metadata.isFile() && path.endsWith(".ts"), `Unsupported source file: ${path}`);
      files.push(path);
    }
  }
  for (const root of roots) await visit(root);
  return { files: files.sort(), emptyDirectories: emptyDirectories.sort() };
}

async function dependencyPolicy(directory: string, foundation: Awaited<ReturnType<typeof installedPackage>>) {
  const bin = foundation.manifest.bin?.["agent-teams-foundation"];
  assert.equal(typeof bin, "string", "Foundation must expose its public CLI");
  const result = spawnSync(process.execPath, [
    join(dirname(foundation.path), bin!), "check", "architecture.source-dependencies",
    "--consumer", directory, "--format", "json",
  ], { cwd: directory, encoding: "utf8", timeout: 30_000, maxBuffer: 4 * 1024 * 1024 });
  assert.ifError(result.error);
  assert.ok(result.status === 0 || result.status === 1, `${result.stdout}\n${result.stderr}`);
  const report = JSON.parse(result.stdout) as DependencyReport;
  assert.equal(report.capabilities.length, 1, JSON.stringify(report));
  assert.equal(report.capabilities[0]?.capabilityId, "architecture.source-dependencies");
  assert.ok(report.outcome === "passed" || report.outcome === "violations", JSON.stringify(report));
  assert.equal(result.status, report.outcome === "passed" ? 0 : 1, JSON.stringify(report));
  return report;
}

/** Checks actual source, with one independent FMS/CMS module per packed artifact. */
export async function runSourceCheck(directory = import.meta.dirname) {
  const tools = await toolIdentity();
  const dependencies = await dependencyPolicy(directory, tools.foundation);
  const modules = await Promise.all(sourceProfiles.map(async profile => {
    const [graph, disk] = await Promise.all([
      observeSourceGraph({ consumerRoot: directory, roots: [profile.root] }),
      inventory(directory, [profile.root]),
    ]);
    const coverage: { readonly code: string; readonly path: string }[] = [];
    const problem = (code: string, path: string) => coverage.push({ code, path });
    if (JSON.stringify(graph.files) !== JSON.stringify(disk.files)) problem("inventory-mismatch", profile.root);
    for (const path of graph.parseFailures) problem("parse-failure", path);
    for (const item of graph.unresolved) problem("unresolved-reference", item.from);
    for (const item of graph.unresolvedRuntimeReferences) problem("unresolved-runtime-reference", item.from);
    for (const item of [...graph.edges, ...graph.external]) {
      if (!["static", "static-type", "export", "export-type"].includes(item.kind)) {
        problem("unsupported-reference-kind", item.from);
      }
    }
    for (const feature of profile.features.featureRoots) {
      if (!disk.files.some(path => path.startsWith(`${feature}/`))) problem("empty-feature", feature);
    }
    const useCases = graph.runtimeExports.filter(item => item.path.includes("/application/use-cases/"));
    for (const item of useCases) {
      if (item.status !== "complete") problem("incomplete-use-case-exports", item.path);
    }
    const fms = checkFeatureModule({
      ...profile.features, ...disk,
      imports: graph.edges.map(({ from, to, mode, line, kind }) => ({
        from, to, mode, line, reexport: kind === "export" || kind === "export-type",
      })),
    });
    let cms: { readonly ok: boolean; readonly report: ModuleLayoutReport };
    try {
      cms = { ok: true, report: checkModuleLayout({
        files: disk.files,
        imports: graph.edges.map(({ from, to, mode }) => ({ from, to, mode: mode === "type-only" ? "type" : "value" })),
        useCaseExports: Object.fromEntries(useCases.map(({ path, exports }) => [path, exports])),
      }) };
    } catch (error) {
      if (typeof error !== "object" || error === null || !("code" in error) || error.code !== "conformance.layout.violation") throw error;
      assert.ok("details" in error);
      cms = { ok: false, report: error.details as ModuleLayoutReport };
    }
    return { id: profile.id, ok: coverage.length === 0 && fms.ok && cms.ok, coverage, inventory: disk, fms, cms };
  }));
  return {
    ok: dependencies.outcome === "passed" && modules.every(module => module.ok),
    authority: sourceAuthority,
    tools: { versions: tools.versions, embeddedTypeScript: tools.embeddedTypeScript },
    dependencies, modules,
  };
}

if (import.meta.main) {
  const report = await runSourceCheck();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
}
