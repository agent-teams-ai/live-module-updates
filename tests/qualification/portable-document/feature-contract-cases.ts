import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import type { packModularConsumer } from "./pack-modular.ts";
import { evidenceRoot, fixtureRoot, run, sha256 } from "./pack-consumer.ts";

type Packed = Awaited<ReturnType<typeof packModularConsumer>>;
const contractPaths = ["document", "format", "export"].map(feature =>
  `features/${feature}/composition/${feature}.contracts.ts`);
const parityProgram = `import type { ExportCapabilities } from "./features/export/composition/export.contracts.js";
import type { DocumentCommands, DocumentPort, ExportCommands, ExportDeliveryPort, FormatPort } from "@fixture/portable-document";
import type { SetupSpec } from "@get-modular/resources";
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
type ExpectedValues = {
  readonly "fixture/document": DocumentCommands;
  readonly "fixture/document/state": DocumentPort;
  readonly "fixture/format": FormatPort;
  readonly "fixture/export": ExportCommands;
  readonly "fixture/export/delivery": SetupSpec<ExportDeliveryPort>;
};
type TransitiveState = ExportCapabilities["fixture/document/state"];
type KeyParity = Assert<Equal<keyof ExportCapabilities, keyof ExpectedValues>>;
type ValueParity = Assert<Equal<{[K in keyof ExportCapabilities]: ExportCapabilities[K]["value"]}, ExpectedValues>>;
type ExpectedTokens = {[K in keyof ExpectedValues]: \`\${K}/r1\`};
type TokenParity = Assert<Equal<{[K in keyof ExportCapabilities]: ExportCapabilities[K]["compatibility"]["token"]}, ExpectedTokens>>;
`;

/** Compile the real feature fragment without importing the Host aggregate. */
export function registerFeatureContractCases(current: () => Packed, observations: object[]): void {
  test("M4 independent Export feature retains transitive state and complete contract parity", { timeout: 60_000 }, async () => {
    const packed = current();
    const compiler = join(fixtureRoot, "node_modules/.bin/tsc");
    const version = run(compiler, ["--version"], fixtureRoot).trim();
    assert.equal(version, "Version 7.0.2");
    // Normal ancestor resolution reaches only the already installed packed packages.
    const root = await mkdtemp(join(packed.root, "feature-contract-"));
    try {
      const sources: Record<string, string> = {};
      for (const path of contractPaths) {
        const bytes = await readFile(join(packed.root, "adapter/src", path));
        sources[path] = sha256(bytes);
        await mkdir(dirname(join(root, path)), { recursive: true });
        await writeFile(join(root, path), bytes, { flag: "wx" });
      }
      const config = {
        compilerOptions: {
          target: "ES2024", module: "NodeNext", moduleResolution: "NodeNext",
          lib: ["ES2024", "ESNext.Disposable", "DOM"], types: [], strict: true,
          noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true,
          verbatimModuleSyntax: true, erasableSyntaxOnly: true, skipLibCheck: false, noEmit: true,
        },
        files: ["feature-parity.ts"],
      };
      await writeFile(join(root, "package.json"), JSON.stringify({ private: true, type: "module" }));
      await writeFile(join(root, "feature-parity.ts"), parityProgram);
      await writeFile(join(root, "tsconfig.json"), JSON.stringify(config, null, 2));
      const result = spawnSync(compiler, ["-p", "tsconfig.json", "--pretty", "false"], {
        cwd: root, encoding: "utf8", timeout: 30_000, maxBuffer: 1024 * 1024,
      });
      const record = {
        profile: "independent-feature-contracts", source: packed.artifacts.source, compiler: version,
        consumerLockSha256: packed.artifacts.consumerLockSha256, sources,
        program: parityProgram, programSha256: sha256(parityProgram), config,
        result: { status: result.status, signal: result.signal, stdout: result.stdout ?? "",
          stderr: result.stderr ?? "", error: result.error?.message ?? null },
      };
      observations.push(record);
      // Write diagnostics before assertions so the pre-fix failure remains reviewable.
      await writeFile(join(evidenceRoot, "feature-contract-compiler.json"), JSON.stringify(record, null, 2) + "\n");
      assert.ifError(result.error);
      assert.equal(result.signal, null, "feature compiler was interrupted");
      assert.equal(result.status, 0,
        "independent Export map must include DocumentState and preserve complete key/value/token parity:\n"
        + record.result.stdout + record.result.stderr);
      assert.equal(record.result.stdout, "", "unexpected successful compiler output");
      assert.equal(record.result.stderr, "", "unexpected compiler stderr");
    } finally { await rm(root, { recursive: true, force: true }); }
  });
}
