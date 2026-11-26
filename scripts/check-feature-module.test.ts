import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { checkFeatureModule, STANDARD } from "@agent-teams/feature-module-standard";
import { conformanceCases } from "@agent-teams/feature-module-standard/fixtures";
import { checkOwnedFeatureModule, profilePath, repositoryRoot } from "./check-feature-module.ts";

function profile() {
  return {
    status: "adopted", standard: STANDARD, productionRoots: ["src"], applicationRoots: [],
    modules: [{
      id: "live-module-updates", role: "platform-library", root: ".", sourceRoot: "src",
      featuresRoot: "src/features", moduleComposition: ["src/index.ts", "src/resources.ts"], ownershipExceptions: [],
      features: [{ id: "update-operation", root: "src/features/update-operation", layers: [
        { role: "application", root: "src/features/update-operation/application" },
        { role: "adapters", root: "src/features/update-operation/adapters" },
        { role: "composition", root: "src/features/update-operation/composition" },
      ] }],
      surfaces: { public: ["src/features/update-operation/adapters/resources.ts"], internalApi: [] as string[],
        compositionSurface: ["src/features/update-operation/composition/create-update-runtime.ts"] },
      useEdges: [], republications: [],
    }],
  };
}
const sources: Readonly<Record<string, string>> = {
  "src/resources.ts": 'export { read } from "./features/update-operation/adapters/resources.js";\n',
  "src/features/update-operation/application/models.ts": "export interface Snapshot { readonly revision: number }\n",
  "src/features/update-operation/application/ports/adoption.ts": "export interface Adoption { readonly accept: () => boolean }\n",
  "src/features/update-operation/application/ports/authority.ts": "export interface Authority { readonly read: () => number }\n",
  "src/features/update-operation/application/ports/preparation.ts": "export interface Preparation { readonly prepare: () => number }\n",
  "src/features/update-operation/application/ports/invocation.ts": "export interface Invocation { readonly invoke: () => number }\n",
  "src/features/update-operation/application/ports/lifetime.ts": "export interface Lifetime { readonly close: () => number }\n",
  "src/features/update-operation/application/update-operation.ts": "export const update = () => 7;\n",
  "src/index.ts": 'export { create } from "./features/update-operation/composition/create-update-runtime.js";\n',
  "src/features/update-operation/application/invocation.ts": "export const operation = () => 7;\n",
  "src/features/update-operation/adapters/resources.ts": "export const read = () => 7;\n",
  "src/features/update-operation/composition/create-update-runtime.ts":
    'import { operation } from "../application/invocation.js";\nexport const create = () => ({ read: operation });\n',
  "tests/features/update-operation/contract.test.ts":
    'import { operation } from "../../../src/features/update-operation/application/invocation.js";\nexport const observed = operation();\n',
};
async function put(root: string, path: string, content: string): Promise<void> {
  await mkdir(dirname(join(root, path)), { recursive: true });
  await writeFile(join(root, path), content);
}
async function fixture(run: (root: string, adopted: ReturnType<typeof profile>) => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "lmu-fms-control-"));
  try {
    const adopted = profile();
    for (const [path, content] of Object.entries(sources)) {await put(root, path, content);}
    await put(root, profilePath, JSON.stringify(adopted));
    await run(root, adopted);
  } finally { await rm(root, { recursive: true, force: true }); }
}

await test("the adopted platform-library topology has a substantive valid feature", async () => {
  await fixture(async root => {
    const result = await checkOwnedFeatureModule(root);
    assert.equal(result.files, 12);
    assert.deepEqual(result.features.map(feature => feature.id), ["update-operation"]);
  });
});

await test("FMS observes the shared standard's positive and negative source descriptions", () => {
  assert.ok(conformanceCases.length > 0);
  for (const entry of conformanceCases) {
    const result = checkFeatureModule(entry.input);
    assert.deepEqual(result.diagnostics.map(diagnostic => diagnostic.code), entry.expect, entry.id);
    assert.equal(result.ok, entry.ok, entry.id);
  }
});

await test("the local topology gate rejects unowned behavior and ceremonial layers", async t => {
  for (const mutation of [
    { name: "behavior outside features", path: "src/helper.ts", content: "export const operation = () => 1;\n", expected: /outside an owned feature/u },
    { name: "undeclared feature", path: "src/features/rogue/application/run.ts", content: "export const run = () => 1;\n", expected: /outside an owned feature/u },
  ]) {
    await t.test(mutation.name, () => fixture(async root => {
      await put(root, mutation.path, mutation.content);
      await assert.rejects(checkOwnedFeatureModule(root), mutation.expected);
    }));
  }
  await t.test("empty layer", () => fixture(async root => {
    await mkdir(join(root, "src/features/update-operation/domain"));
    await assert.rejects(checkOwnedFeatureModule(root), /empty ceremonial/u);
  }));
  await t.test("undeclared production module", () => fixture(async (root, adopted) => {
    await put(root, "packages/rogue/src/index.ts", "export const rogue = 1;\n");
    const module = adopted.modules[0];
    assert.ok(module);
    adopted.modules.push({ ...module, id: "rogue", root: "packages/rogue", sourceRoot: "packages/rogue/src" });
    await put(root, profilePath, JSON.stringify(adopted));
    await assert.rejects(checkOwnedFeatureModule(root), /additional production module requires a topology decision/u);
  }));
});

await test("cross-feature private access and an undeclared public dependency are distinct refusals", async t => {
  for (const exposed of [false, true]) {
    await t.test(exposed ? "undeclared public use" : "private deep import", () => fixture(async (root, adopted) => {
      const module = adopted.modules[0];
      assert.ok(module);
      module.features.push({ id: "other", root: "src/features/other", layers: [
        { root: "src/features/other/application", role: "application" },
      ] });
      const other = "src/features/other/application/read.ts";
      await put(root, other, "export const read = () => 9;\n");
      if (exposed) {module.surfaces.internalApi.push(other);}
      await put(root, "src/features/update-operation/application/invocation.ts",
        'import { read } from "../../other/application/read.js";\nexport const operation = read;\n');
      await put(root, profilePath, JSON.stringify(adopted));
      await assert.rejects(checkOwnedFeatureModule(root), exposed ? /use-undeclared/u : /deep-import/u);
    }));
  }
});

await test("Foundation rejects a real external runtime dependency in application code", async () => {
  await fixture(async root => {
    for (const path of ["package.json", "pnpm-workspace.yaml", "foundation.config.yaml", "architecture/foundation"]) {
      await mkdir(dirname(join(root, path)), { recursive: true });
      await cp(join(repositoryRoot, path), join(root, path), { recursive: true });
    }
    // The disposable topology really materializes its optional entry, even
    // while the production source is being delivered in the same bootstrap.
    const manifest: unknown = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
    assert.ok(typeof manifest === "object" && manifest !== null && "exports" in manifest);
    assert.ok(typeof manifest.exports === "object" && manifest.exports !== null);
    Reflect.set(manifest.exports, "./resources", { types: "./dist/resources.d.ts", import: "./dist/resources.js" });
    await put(root, "package.json", JSON.stringify(manifest));
    await cp(join(repositoryRoot, "scripts"), join(root, "scripts"), { recursive: true });
    await mkdir(join(root, "tests/module"));
    const cli = fileURLToPath(new URL("./dist/cli.js", import.meta.resolve("@agent-teams/engineering-foundation/package.json")));
    const check = () => spawnSync(process.execPath,
      [cli, "check", "architecture.source-dependencies", "--consumer", root, "--format", "json"],
      { cwd: root, encoding: "utf8", timeout: 30_000, maxBuffer: 1024 * 1024 });
    const before = check();
    assert.equal(before.error, undefined);
    assert.equal(before.status, 0, before.stdout + before.stderr);
    const path = "src/features/update-operation/application/invocation.ts";
    await put(root, path, await readFile(join(root, path), "utf8") + 'import "@get-modular/resources";\n');
    const after = check();
    assert.equal(after.error, undefined);
    assert.equal(after.status, 1, after.stdout + after.stderr);
    assert.match(after.stdout, /architecture\.source-dependencies\.forbidden-package-dependency/u);
  });
});
