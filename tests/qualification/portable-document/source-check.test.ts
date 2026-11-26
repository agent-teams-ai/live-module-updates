import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { runSourceCheck } from "./source-check.ts";

const source = import.meta.dirname;
const application = "core/features/document/application/use-cases/create-document-commands.ts";
const cases: readonly {
  readonly name: string;
  readonly path: string;
  readonly append: string;
  readonly newFile?: boolean;
  readonly dependencyRule: string;
  readonly fms?: string;
  readonly cms?: string;
}[] = [
  {
    name: "application cannot acquire Node IO", path: application,
    append: '\nimport "node:fs/promises";\n', dependencyRule: "forbidden-builtin-dependency",
  },
  {
    name: "ordinary application cannot depend on GM", path: application,
    append: '\nimport "@get-modular/assembly";\n', dependencyRule: "forbidden-package-dependency",
  },
  {
    name: "application cannot reach a sibling implementation", path: application,
    append: '\nimport "../../../format/application/use-cases/create-plain-format.js";\n',
    dependencyRule: "forbidden-boundary-dependency", fms: "deep-import",
  },
  {
    name: "new source cannot evade feature and descriptor placement", newFile: true,
    path: "core/features/rogue.contracts.ts", append: "export const stray = 1;\n",
    dependencyRule: "unclassified-source-file", fms: "container-file", cms: "descriptor-path",
  },
];

test("installed source owners reject real mutations and accept the restored reference", { timeout: 120_000 }, async t => {
  const directory = await mkdtemp(join(tmpdir(), "portable-document-source-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  // Real source and canonical manifests, without build artifacts or a synthetic
  // dependency declaration. Policy execution needs no prepared runtime consumer.
  for (const path of ["core", "adapter/src", "adapter/package.json", "architecture",
    "package.json", "foundation.config.yaml", "pnpm-workspace.yaml"]) {
    await mkdir(dirname(join(directory, path)), { recursive: true });
    await cp(join(source, path), join(directory, path), { recursive: true });
  }
  const baseline = await runSourceCheck(directory);
  assert.equal(baseline.ok, true, JSON.stringify(baseline));
  assert.deepEqual(baseline.modules.map(module => ({ id: module.id, features: module.fms.features.map(feature => feature.id).sort() })), [
    { id: "ordinary-core", features: ["document", "export", "format"] },
    { id: "gm-adapter", features: ["document", "export", "format"] },
  ]);
  for (const mutation of cases) {
    await t.test(mutation.name, async () => {
      const path = join(directory, mutation.path);
      const original = mutation.newFile ? undefined : await readFile(path, "utf8");
      try {
        await writeFile(path, `${original ?? ""}${mutation.append}`, mutation.newFile ? { flag: "wx" } : undefined);
        const report = await runSourceCheck(directory);
        assert.equal(report.ok, false, JSON.stringify(report));
        assert.equal(report.dependencies.outcome, "violations", JSON.stringify(report.dependencies));
        assert.ok(report.dependencies.capabilities[0]?.diagnostics.some(item =>
          item.ruleId === `architecture.source-dependencies.${mutation.dependencyRule}`), JSON.stringify(report.dependencies));
        const core = report.modules.find(module => module.id === "ordinary-core")!;
        assert.deepEqual(core.coverage, [], "The intended architecture rule must reject fully parsed source");
        if (mutation.fms) assert.ok(core.fms.diagnostics.some(item => item.code === mutation.fms), JSON.stringify(core.fms));
        if (mutation.cms) assert.ok(core.cms.report.violations.some(item => item.code === mutation.cms), JSON.stringify(core.cms));
      } finally {
        if (original === undefined) await rm(path, { force: true });
        else {
          await writeFile(path, original);
          assert.equal(await readFile(path, "utf8"), original, "Restore the exact edited source bytes");
        }
      }
      const restored = await runSourceCheck(directory);
      assert.equal(restored.ok, true, JSON.stringify(restored));
      assert.deepEqual(restored.modules, baseline.modules, "Restore all observed files, directories and diagnostics");
    });
  }
});
