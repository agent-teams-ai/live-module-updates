import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { checkQualityTopology, qualityProfilePath, topologyPath } from "./check-quality-topology.ts";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const featureProfilePath = "architecture/feature-module-profile.json";
type Mode = "static" | "scope" | "full";
interface Diagnostic { readonly rule: string; readonly path: string; readonly evidence: string }
interface Observation {
  readonly status: number | null;
  readonly outcome: string;
  readonly diagnostics: readonly Diagnostic[];
  readonly problem: string;
}
function record(value: unknown): Record<string, unknown> {
  assert.ok(typeof value === "object" && value !== null && !Array.isArray(value));
  return Object.fromEntries(Object.entries(value));
}
function text(value: unknown): string {
  assert.ok(typeof value === "string");
  return value;
}

/** Invoke the fixture's actual installed Foundation; setup failures cannot satisfy a rule oracle. */
function observe(root: string, mode: Mode): Observation {
  const require = createRequire(join(root, "package.json"));
  const cli = join(dirname(require.resolve("@agent-teams/engineering-foundation/package.json")), "dist/cli.js");
  const args = mode === "static" ? ["check", "quality.source-coverage"]
    : ["quality", "check", ...(mode === "scope" ? ["--scope-only"] : [])];
  const result = spawnSync(process.execPath, [cli, ...args, "--consumer", root, "--format", "json"],
    { cwd: root, encoding: "utf8", timeout: 330_000, maxBuffer: 8 * 1024 * 1024 });
  assert.equal(result.error, undefined, result.stderr);
  assert.equal(result.signal, null, result.stderr);
  assert.notEqual(result.status, null, "native quality command did not finish");
  const report = record(JSON.parse(result.stdout));
  const capabilities = report["capabilities"];
  assert.ok(Array.isArray(capabilities) && capabilities.length === 1, result.stdout + result.stderr);
  const capability = record(capabilities[0]);
  assert.equal(capability["capabilityId"], "quality.source-coverage");
  assert.equal(capability["capabilityConfigSchemaVersion"], 5);
  const outcome = text(report["outcome"]);
  assert.equal(capability["outcome"], outcome);
  const diagnostics = capability["diagnostics"];
  assert.ok(Array.isArray(diagnostics));
  return { status: result.status, outcome,
    diagnostics: diagnostics.map((value: unknown) => {
      const entry = record(value);
      return { rule: text(entry["ruleId"]), path: text(record(entry["location"])["path"]),
        evidence: text(JSON.stringify(entry["evidence"])) };
    }),
    problem: capability["problem"] === undefined ? "" : text(record(capability["problem"])["message"]),
  };
}
function passed(result: Observation): void {
  assert.equal(result.status, 0, JSON.stringify(result));
  assert.equal(result.outcome, "passed", JSON.stringify(result));
  assert.deepEqual(result.diagnostics, []);
}
function violates(result: Observation, rule: string, path: string, evidence?: RegExp): void {
  assert.equal(result.status, 1, JSON.stringify(result));
  assert.equal(result.outcome, "violations", JSON.stringify(result));
  assert.ok(result.diagnostics.some(item => item.rule === "quality.source-coverage." + rule
    && item.path === path && (evidence === undefined || evidence.test(item.evidence))), JSON.stringify(result));
}
async function changed(root: string, path: string, bytes: string, run: () => Promise<void>): Promise<void> {
  const absolute = join(root, path);
  const original = await readFile(absolute);
  try { await writeFile(absolute, bytes); await run(); }
  finally { await writeFile(absolute, original); }
}
async function created(root: string, path: string, bytes: string, run: () => Promise<void>): Promise<void> {
  const absolute = join(root, path);
  // Exclusive creation proves the control never replaces an existing source.
  await writeFile(absolute, bytes, { flag: "wx" });
  try { await run(); }
  finally { await rm(absolute); }
}
async function consumer(run: (root: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "lmu-quality-v5-"));
  try {
    const inputs = ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "foundation.config.yaml",
      "toolchain.config.json", ".oxlintrc.json", "architecture", "src", "scripts", "dist",
      "tsconfig.json", "tsconfig.portable.json", "tsconfig.tools.json", "tsconfig.tests.json",
      "tsconfig.build.json", "tests/tsconfig.json", "tests/features", "tests/module"];
    for (const path of inputs) {
      await mkdir(dirname(join(root, path)), { recursive: true });
      await cp(join(repositoryRoot, path), join(root, path), { recursive: true });
    }
    const install = spawnSync("pnpm", ["install", "--offline", "--frozen-lockfile", "--ignore-scripts",
      "--engine-strict", "--strict-peer-dependencies"],
    { cwd: root, encoding: "utf8", timeout: 120_000, maxBuffer: 8 * 1024 * 1024 });
    assert.equal(install.error, undefined);
    assert.equal(install.signal, null);
    assert.equal(install.status, 0, install.stdout + install.stderr);
    await run(root);
  } finally { await rm(root, { recursive: true, force: true }); }
}

await test("the installed v5 quality boundary retains source, compiler and lint protections", async t => {
  await consumer(async root => {
    await checkQualityTopology(root);
    passed(observe(root, "static"));
    passed(observe(root, "scope"));
    passed(observe(root, "full"));

    for (const path of [featureProfilePath, qualityProfilePath]) {
      await t.test("raw input binding: " + path, async () => {
        const original = await readFile(join(root, path), "utf8");
        await changed(root, path, original + "\n", async () => {
          await assert.rejects(checkQualityTopology(root), /Quality topology is stale/u);
          const result = observe(root, "static");
          assert.notEqual(result.status, 0, JSON.stringify(result));
          assert.equal(result.outcome, "invalid-input", JSON.stringify(result));
          assert.match(result.problem, /Generated quality topology is stale/u);
        });
        await checkQualityTopology(root);
        passed(observe(root, "static"));
      });
    }

    await t.test("required generator rejects altered projection with unchanged input hashes", async () => {
      const projection = record(JSON.parse(await readFile(join(root, topologyPath), "utf8")));
      projection["testRoots"] = ["tests"];
      await changed(root, topologyPath, JSON.stringify(projection, null, 2) + "\n", async () => {
        await assert.rejects(checkQualityTopology(root), /Quality topology is stale/u);
      });
      await checkQualityTopology(root);
    });

    await t.test("new unowned production source cannot disappear from the census", async () => {
      const path = "src/__quality_unowned.ts";
      await created(root, path, "export const unowned = 1;\n", async () => {
        violates(observe(root, "static"), "source-classification", path);
      });
      passed(observe(root, "static"));
    });

    await t.test("removing production compiler input fails the actual scope gate", async () => {
      const path = "src/features/update-operation/application/__quality_context.ts";
      await created(root, path, "export const contextWitness = 1;\n", async () => {
        passed(observe(root, "scope"));
        const config = record(JSON.parse(await readFile(join(root, "toolchain.config.json"), "utf8")));
        config["typecheck"] = { projects: ["tsconfig.tools.json"] };
        await changed(root, "toolchain.config.json", JSON.stringify(config, null, 2) + "\n", async () => {
          violates(observe(root, "scope"), "type-context", path);
        });
        passed(observe(root, "scope"));
      });
    });

    await t.test("inherited mandatory lint severity remains protected", async () => {
      const config = record(JSON.parse(await readFile(join(root, ".oxlintrc.json"), "utf8")));
      config["rules"] = { "typescript/no-floating-promises": "off" };
      await changed(root, ".oxlintrc.json", JSON.stringify(config, null, 2) + "\n", async () => {
        violates(observe(root, "static"), "protected-setting", ".oxlintrc.json");
      });
      passed(observe(root, "static"));
    });

    await t.test("actual typed lint rejects the intended source rule after valid setup", async () => {
      const path = "src/features/update-operation/application/__quality_floating.ts";
      const valid = "export function ignored(): void { void Promise.resolve(1); }\n";
      await created(root, path, valid, async () => {
        passed(observe(root, "full"));
        await changed(root, path, "export function ignored(): void { Promise.resolve(1); }\n", async () => {
          violates(observe(root, "full"), "lint-violation", path, /no-floating-promises/u);
        });
        passed(observe(root, "full"));
      });
    });
  });
});
