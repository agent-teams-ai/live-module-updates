import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { test } from "node:test";
import { featureContractParityProgram } from "./feature-contract-cases.ts";
import { verifyModularRuntimeIdentity, type packModularConsumer } from "./pack-modular.ts";
import { evidenceRoot, fixtureRoot, run, sha256, verifyPackageBytes } from "./pack-consumer.ts";

type Packed = Awaited<ReturnType<typeof packModularConsumer>>;
type Expected = "pass" | "conflict" | "missing-exports";
const publicRoot = "@fixture/portable-document-gm";
const publicProgram = 'import { Export, type ExportContracts, type ExportCapabilities } from "@fixture/portable-document-gm";\n'
  + "export const descriptor = Export;\nexport type Contracts = ExportContracts;\nexport type Capabilities = ExportCapabilities;\n";
const authoredFiles = [
  "author-entry/index.ts",
  "author-entry/features/export-summary/application/ports/export-summary.ts",
  "author-entry/features/export-summary/application/use-cases/create-export-summary.ts",
  "author-entry/features/export-summary/composition/export-summary.contracts.ts",
  "author-entry/features/export-summary/composition/export-summary.declaration.ts",
  "author-entry/features/export-summary/composition/export-summary.group.ts",
  "author-entry/features/export-summary/composition/export-summary.module.ts",
  "installed-feature-probe.ts",
];

function overlapProgram(kind: "identical" | "value" | "revision"): string {
  const value = kind === "value" ? "{ readonly inspect: () => string }" : "DocumentPort";
  return [
    'import { defineContract, type CapabilitiesOf } from "@get-modular/assembly";',
    'import type { DocumentPort } from "@fixture/portable-document";',
    'import type { ExportContracts } from "@fixture/portable-document-gm";',
    'const OwnState = defineContract<' + value + '>()({ id: "fixture/document/state", revision: ' + (kind === "revision" ? 2 : 1) + " });",
    "export interface Complete extends CapabilitiesOf<ExportContracts>, CapabilitiesOf<typeof OwnState> {}",
  ].join("\n") + "\n";
}

function assertCompilerResult(result: ReturnType<typeof spawnSync>, expected: Expected): void {
  assert.equal(result.error, undefined, "compiler process failed");
  assert.equal(result.signal, null, "compiler was interrupted");
  assert.equal(result.stderr, "", "unexpected compiler stderr");
  assert.equal(result.status, expected === "pass" ? 0 : 1, String(result.stdout));
  assert.equal(typeof result.stdout, "string");
  const stdout = String(result.stdout);
  if (expected === "pass") { assert.equal(stdout, ""); return; }
  const headers = stdout.split(/\r?\n/u).filter(line => line !== "" && !line.startsWith(" "));
  if (expected === "conflict") {
    assert.equal(headers.length, 1, "only the duplicate transitive contract may fail");
    assert.match(headers[0] ?? "", /^contract-case\.ts\(5,18\): error TS2320: Interface 'Complete' cannot simultaneously extend types 'CapabilitiesOf<ExportContracts>' and 'CapabilitiesOf<.+>'\.$/u);
    assert.match(stdout, /\n  Named property '"fixture\/document\/state"' of types 'CapabilitiesOf<ExportContracts>' and 'CapabilitiesOf<.+>' are not identical\.\r?\n?$/u);
    return;
  }
  assert.equal(headers.length, 3, "all three public imports must be independently rejected");
  const names = headers.map(header => {
    const match = /^contract-case\.ts\(1,\d+\): error TS2305: Module '"@fixture\/portable-document-gm"' has no exported member '(Export|ExportContracts|ExportCapabilities)'\.$/u.exec(header);
    assert.ok(match, "unrelated compiler diagnostic: " + header);
    return match[1];
  });
  assert.deepEqual(names, ["Export", "ExportContracts", "ExportCapabilities"]);
}

/** A second installation contains only packed providers and the authored consumer. */
export function registerInstalledFeatureCases(current: () => Packed, observations: object[]): void {
  test("M5 installed external feature composes, preserves contracts and rejects broken package boundaries", { timeout: 120_000 }, async () => {
    const packed = current();
    const root = await mkdtemp(join(tmpdir(), "installed-feature-consumer-"));
    const compiler = join(fixtureRoot, "node_modules/.bin/tsc");
    const version = run(compiler, ["--version"], fixtureRoot).trim();
    assert.equal(version, "Version 7.0.2");
    const records: object[] = [];
    let lockSha256: string | undefined;
    const persist = () => writeFile(join(evidenceRoot, "installed-feature-consumer.json"), JSON.stringify({
      source: packed.artifacts.source, compiler: version, core: packed.artifacts.core,
      adapter: packed.artifacts.adapter, publicPackages: packed.artifacts.publicPackages, lockSha256, records,
    }, null, 2) + "\n");
    try {
      assert.ok(relative(packed.root, root).startsWith(".."), "consumer must not be a child of the adapter build root");
      const installed = await packed.installInto(root);
      lockSha256 = installed.lockSha256;
      await cp(join(root, "package-lock.json"), join(evidenceRoot, "installed-feature-package-lock.json"));
      await mkdir(join(root, "consumer"));
      await cp(join(fixtureRoot, "consumer/author-entry"), join(root, "consumer/author-entry"), { recursive: true });
      await cp(join(fixtureRoot, "consumer/installed-feature-probe.ts"), join(root, "consumer/installed-feature-probe.ts"));
      assert.equal(existsSync(join(root, "adapter/src")), false);
      assert.equal(existsSync(join(root, "core")), false);
      const common = {
        target: "ES2024", module: "NodeNext", moduleResolution: "NodeNext",
        lib: ["ES2024", "ESNext.Disposable", "DOM"], types: [], strict: true,
        noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true,
        verbatimModuleSyntax: true, erasableSyntaxOnly: true, skipLibCheck: false,
      };
      const config = {
        compilerOptions: { ...common, types: ["node"], typeRoots: [resolve(fixtureRoot, "node_modules/@types")],
          declaration: true, rootDir: "consumer", outDir: "dist" },
        include: ["consumer/author-entry/**/*.ts", "consumer/installed-feature-probe.ts"],
      };
      await writeFile(join(root, "tsconfig.json"), JSON.stringify(config, null, 2));
      const compile = spawnSync(compiler, ["-p", "tsconfig.json", "--pretty", "false"], {
        cwd: root, encoding: "utf8", timeout: 30_000, maxBuffer: 1024 * 1024,
      });
      records.push({ label: "strict-author-entry", config, result: {
        status: compile.status, signal: compile.signal, stdout: compile.stdout ?? "",
        stderr: compile.stderr ?? "", error: compile.error?.message ?? null,
      } });
      await persist();
      assertCompilerResult(compile, "pass");
      const inputs = run(compiler, ["-p", "tsconfig.json", "--listFilesOnly"], root).trim().split(/\r?\n/u);
      const sourceInputs = inputs.filter(path => !path.endsWith(".d.ts"));
      assert.deepEqual(sourceInputs.map(path => relative(join(root, "consumer"), path)).sort(), [...authoredFiles].sort());
      for (const path of inputs.filter(path => path.endsWith(".d.ts"))) {
        assert.ok(path.startsWith(join(root, "node_modules") + "/") || path.startsWith(join(fixtureRoot, "node_modules") + "/"),
          "unexpected compiler input outside installed packages/toolchain: " + path);
      }
      assert.ok(inputs.some(path => path === join(installed.adapterRoot, "dist/index.d.ts")));
      assert.ok(inputs.every(path => !path.includes("/adapter/src/")));
      records.push({ label: "compiler-input-inventory", inputs,
        sources: Object.fromEntries(await Promise.all(authoredFiles.map(async path =>
          [path, sha256(await readFile(join(root, "consumer", path)))] as const))) });
      await persist();

      async function contractCase(label: string, program: string, expected: Expected): Promise<void> {
        const directory = await mkdtemp(join(root, "contract-"));
        try {
          const contractConfig = { compilerOptions: { ...common, noEmit: true }, files: ["contract-case.ts"] };
          await writeFile(join(directory, "contract-case.ts"), program);
          await writeFile(join(directory, "tsconfig.json"), JSON.stringify(contractConfig, null, 2));
          const result = spawnSync(compiler, ["-p", "tsconfig.json", "--pretty", "false"], {
            cwd: directory, encoding: "utf8", timeout: 30_000, maxBuffer: 1024 * 1024,
          });
          records.push({ label, expected, program, programSha256: sha256(program), config: contractConfig,
            result: { status: result.status, signal: result.signal, stdout: result.stdout ?? "",
              stderr: result.stderr ?? "", error: result.error?.message ?? null } });
          await persist();
          assertCompilerResult(result, expected);
        } finally { await rm(directory, { recursive: true, force: true }); }
      }
      await contractCase("public-root-parity", featureContractParityProgram(publicRoot), "pass");
      await contractCase("identical-transitive-overlap", overlapProgram("identical"), "pass");
      await contractCase("consumer-value-conflict", overlapProgram("value"), "conflict");
      await contractCase("consumer-revision-conflict", overlapProgram("revision"), "conflict");

      const declarationPath = join(installed.adapterRoot, "dist/index.d.ts");
      const original = await readFile(declarationPath, "utf8");
      const exports = [
        'export { Export } from "./features/export/composition/export.contracts.js";',
        'export type { ExportContracts, ExportCapabilities } from "./features/export/composition/export.contracts.js";',
      ];
      let mutant = original;
      for (const statement of exports) {
        assert.equal(mutant.split(statement).length, 2, "public declaration mutation target changed");
        mutant = mutant.replace(statement, "");
      }
      try {
        await writeFile(declarationPath, mutant);
        await contractCase("removed-public-export-detector", publicProgram, "missing-exports");
      } finally { await writeFile(declarationPath, original); }
      await verifyPackageBytes(installed.adapterRoot, packed.adapterBuilt);
      await contractCase("restored-public-exports", publicProgram, "pass");

      const hidden = "dist/features/export/composition/export.contracts.js";
      const expectedHidden = packed.adapterBuilt.get(hidden);
      assert.ok(expectedHidden);
      assert.deepEqual(await readFile(join(installed.adapterRoot, hidden)), expectedHidden, "deep import target must actually exist");
      const entry = join(root, "dist/installed-feature-probe.js");
      await verifyModularRuntimeIdentity(join(installed.adapterRoot, "dist/index.js"), entry);
      const execution = spawnSync(process.execPath, [entry], {
        cwd: root, encoding: "utf8", timeout: 30_000, maxBuffer: 1024 * 1024,
      });
      records.push({ label: "installed-feature-runtime", result: {
        status: execution.status, signal: execution.signal, stdout: execution.stdout ?? "",
        stderr: execution.stderr ?? "", error: execution.error?.message ?? null,
      } });
      await persist();
      assert.equal(execution.error, undefined);
      assert.equal(execution.signal, null);
      assert.equal(execution.status, 0, execution.stdout + execution.stderr);
      assert.equal(execution.stderr, "");
      const result: unknown = JSON.parse(execution.stdout);
      assert.deepEqual(result, {
        soleRoot: "author/export-summary/default", missingProviderRejected: true, effectsBeforeRun: 0,
        deepImportRejected: true, summary: { status: "published", revision: 7, contentLength: 22 },
        rejection: { status: "rejected", reason: "denied" },
        deliveries: [{ revision: 7, content: "Document r7\nMiXeD text" }],
        factories: 1, acquired: 1, attempts: 2, released: 1, remainingLeases: 0,
      });
      await verifyPackageBytes(installed.adapterRoot, packed.adapterBuilt);
      observations.push({ profile: "installed-feature-consumer", result, lockSha256, compiler: version });
    } finally {
      await rm(root, { recursive: true, force: true });
      assert.equal(existsSync(root), false, "external consumer root remains after qualification");
    }
  });
}
