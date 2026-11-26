import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import type { packModularConsumer } from "./pack-modular.ts";
import { evidenceRoot, fixtureRoot, run, sha256 } from "./pack-consumer.ts";

type Packed = Awaited<ReturnType<typeof packModularConsumer>>;
type Feature = "document" | "format" | "export";
type Sources = Record<string, string>;
type Expectation = "pass" | "conflict" | readonly string[];
const contractPath = (feature: Feature) => "features/" + feature + "/composition/" + feature + ".contracts.ts";
const contractPaths = (["document", "format", "export"] as const).map(contractPath);
const fragmentProgram = 'import type { ExportCapabilities } from "./features/export/composition/export.contracts.js";\n'
  + "export type CheckedExport = ExportCapabilities;\n";
/** One handwritten oracle qualifies both source fragments and the installed public entry. */
export function featureContractParityProgram(contractImport: string): string {
  return [
    'import type { ExportCapabilities, ExportContracts } from ' + JSON.stringify(contractImport) + ';',
    'import type { CapabilitiesOf } from "@get-modular/assembly";',
    'import type { DocumentCommands, DocumentPort, ExportCommands, ExportDeliveryPort, FormatPort } from "@fixture/portable-document";',
    'import type { SetupSpec } from "@get-modular/resources";',
    "type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;",
    "type Assert<T extends true> = T;",
    "type ExpectedValues = {",
    '  readonly "fixture/document": DocumentCommands;',
    '  readonly "fixture/document/state": DocumentPort;',
    '  readonly "fixture/format": FormatPort;',
    '  readonly "fixture/export": ExportCommands;',
    '  readonly "fixture/export/delivery": SetupSpec<ExportDeliveryPort>;',
    "};",
    "type ExpectedTokens = {",
    '  readonly "fixture/document": "fixture/document/r1";',
    '  readonly "fixture/document/state": "fixture/document/state/r1";',
    '  readonly "fixture/format": "fixture/format/r1";',
    '  readonly "fixture/export": "fixture/export/r1";',
    '  readonly "fixture/export/delivery": "fixture/export/delivery/r1";',
    "};",
    'type ExpectedCompatibility = {[K in keyof ExpectedValues]: {readonly family: "exact"; readonly familyVersion: 1; readonly token: ExpectedTokens[K]}};',
    "type UnionMap = CapabilitiesOf<ExportContracts>;",
    'type TransitiveState = ExportCapabilities["fixture/document/state"];',
    "type InterfaceKeys = Assert<Equal<keyof ExportCapabilities, keyof ExpectedValues>>;",
    'type InterfaceValues = Assert<Equal<{[K in keyof ExportCapabilities]: ExportCapabilities[K]["value"]}, ExpectedValues>>;',
    'type InterfaceCompatibility = Assert<Equal<{[K in keyof ExportCapabilities]: ExportCapabilities[K]["compatibility"]}, ExpectedCompatibility>>;',
    "type UnionKeys = Assert<Equal<keyof UnionMap, keyof ExpectedValues>>;",
    'type UnionValues = Assert<Equal<{[K in keyof UnionMap]: UnionMap[K]["value"]}, ExpectedValues>>;',
    'type UnionCompatibility = Assert<Equal<{[K in keyof UnionMap]: UnionMap[K]["compatibility"]}, ExpectedCompatibility>>;',
    "type SurfaceParity = Assert<Equal<ExportCapabilities, UnionMap>>;",
  ].join("\n") + "\n";
}
const parityProgram = featureContractParityProgram("./features/export/composition/export.contracts.js");

function replaceSource(sources: Sources, feature: Feature, anchor: string, replacement: string): void {
  const path = contractPath(feature);
  const source = sources[path];
  assert.ok(source !== undefined);
  assert.equal(source.split(anchor).length, 2, "contract source mutation target changed: " + path);
  sources[path] = source.replace(anchor, replacement);
}
function omitState(original: Sources, surface: "union" | "interface"): Sources {
  const sources = { ...original };
  replaceSource(sources, "export", "import type { DocumentContracts }", "import type { Document, DocumentContracts }");
  if (surface === "union") {
    replaceSource(sources, "export", "typeof Export | typeof ExportDelivery | DocumentContracts | FormatContracts;",
      "typeof Export | typeof ExportDelivery | typeof Document | FormatContracts;");
  } else {
    replaceSource(sources, "export", "CapabilitiesOf<DocumentContracts>", "CapabilitiesOf<typeof Document>");
  }
  return sources;
}
function unusedConflict(original: Sources, kind: "value" | "revision"): Sources {
  const sources = { ...original };
  replaceSource(sources, "format", "import type { FormatPort }", "import type { DocumentPort, FormatPort }");
  const value = kind === "value" ? "{ readonly inspect: () => string }" : "DocumentPort";
  const revision = kind === "value" ? 1 : 2;
  replaceSource(sources, "format", "export type FormatContracts = typeof Format;",
    "export const UnusedState = defineContract<" + value + '>()({ id: "fixture/document/state", revision: ' + revision + " });\n"
    + "export type FormatContracts = typeof Format | typeof UnusedState;");
  return sources;
}
function collapseBases(original: Sources): Sources {
  const sources = { ...original };
  replaceSource(sources, "export", [
    "export interface ExportCapabilities extends",
    "  CapabilitiesOf<typeof Export | typeof ExportDelivery>,",
    "  CapabilitiesOf<DocumentContracts>,",
    "  CapabilitiesOf<FormatContracts>",
    "{}",
  ].join("\n"), "export interface ExportCapabilities extends CapabilitiesOf<ExportContracts> {}");
  return sources;
}

function assertDiagnostics(stdout: string, expectation: Exclude<Expectation, "pass">): void {
  const headers = stdout.split(/\r?\n/u).filter(line => line !== "" && !line.startsWith(" "));
  if (expectation === "conflict") {
    assert.equal(headers.length, 1, "expected only the independent feature conflict");
    const [header] = headers;
    assert.ok(header);
    assert.match(header, /^features\/export\/composition\/export\.contracts\.ts\(\d+,\d+\): error TS2320: Interface 'ExportCapabilities' cannot simultaneously extend types 'CapabilitiesOf<DocumentContracts>' and 'CapabilitiesOf<FormatContracts>'\.$/u);
    assert.match(stdout, /\n  Named property '"fixture\/document\/state"' of types 'CapabilitiesOf<DocumentContracts>' and 'CapabilitiesOf<FormatContracts>' are not identical\.\r?\n?$/u);
    return;
  }
  const actual = headers.map(header => {
    const match = /^feature-parity\.ts\((\d+),\d+\): error TS(\d+): (.+)$/u.exec(header);
    assert.ok(match, "unrelated compiler diagnostic: " + header);
    const code = Number(match[2]);
    assert.equal(match[3], code === 2339
      ? "Property 'fixture/document/state' does not exist on type 'ExportCapabilities'."
      : "Type 'false' does not satisfy the constraint 'true'.");
    return { line: Number(match[1]), code };
  });
  const expected = expectation.map(name => {
    const line = parityProgram.split("\n").findIndex(text => text.startsWith("type " + name + " = ")) + 1;
    assert.ok(line > 0, "parity assertion was removed: " + name);
    return { line, code: name === "TransitiveState" ? 2339 : 2344 };
  });
  assert.deepEqual(actual, expected, "only the selected surface's parity assertions may fail");
}

/** Compile actual standalone feature fragments against the installed packed dependencies. */
export function registerFeatureContractCases(current: () => Packed, observations: object[]): void {
  test("M4 independent Export feature retains transitive state and complete contract parity", { timeout: 60_000 }, async () => {
    const packed = current();
    const compiler = join(fixtureRoot, "node_modules/.bin/tsc");
    const version = run(compiler, ["--version"], fixtureRoot).trim();
    assert.equal(version, "Version 7.0.2");
    const original: Sources = {};
    for (const path of contractPaths) original[path] = await readFile(join(packed.root, "adapter/src", path), "utf8");
    const records: object[] = [];
    async function check(label: string, sources: Sources, program: string, expectation: Expectation): Promise<void> {
      // Normal ancestor resolution reaches the same already installed packed packages.
      const root = await mkdtemp(join(packed.root, "feature-contract-"));
      try {
        for (const [path, text] of Object.entries(sources)) {
          await mkdir(dirname(join(root, path)), { recursive: true });
          await writeFile(join(root, path), text, { flag: "wx" });
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
        await writeFile(join(root, "feature-parity.ts"), program);
        await writeFile(join(root, "tsconfig.json"), JSON.stringify(config, null, 2));
        const result = spawnSync(compiler, ["-p", "tsconfig.json", "--pretty", "false"], {
          cwd: root, encoding: "utf8", timeout: 30_000, maxBuffer: 1024 * 1024,
        });
        const record = {
          label, expectation, sources: Object.fromEntries(Object.entries(sources).map(([path, text]) => [path, sha256(text)])),
          program, programSha256: sha256(program), config,
          result: { status: result.status, signal: result.signal, stdout: result.stdout ?? "",
            stderr: result.stderr ?? "", error: result.error?.message ?? null },
        };
        records.push(record);
        observations.push({ profile: "independent-feature-contracts", ...record });
        // Preserve every raw compiler result before its acceptance assertions, including failures.
        await writeFile(join(evidenceRoot, "feature-contract-compiler.json"), JSON.stringify({
          source: packed.artifacts.source, compiler: version, consumerLockSha256: packed.artifacts.consumerLockSha256,
          originalSources: Object.fromEntries(Object.entries(original).map(([path, text]) => [path, sha256(text)])),
          cases: records,
        }, null, 2) + "\n");
        assert.ifError(result.error);
        assert.equal(result.signal, null, "feature compiler was interrupted");
        assert.equal(record.result.stderr, "", "unexpected compiler stderr");
        assert.equal(result.status, expectation === "pass" ? 0 : 1,
          label + " produced the wrong compiler outcome:\n" + record.result.stdout);
        if (expectation === "pass") assert.equal(record.result.stdout, "", "unexpected successful compiler output");
        else assertDiagnostics(record.result.stdout, expectation);
      } finally { await rm(root, { recursive: true, force: true }); }
    }

    await check("complete", original, parityProgram, "pass");
    await check("omit-union-state", omitState(original, "union"), parityProgram,
      ["UnionKeys", "UnionValues", "UnionCompatibility", "SurfaceParity"]);
    await check("omit-interface-state", omitState(original, "interface"), parityProgram,
      ["TransitiveState", "InterfaceKeys", "InterfaceValues", "InterfaceCompatibility", "SurfaceParity"]);
    for (const kind of ["value", "revision"] as const) {
      const sources = unusedConflict(original, kind);
      await check("unused-" + kind + "-conflict", sources, fragmentProgram, "conflict");
      await check("collapsed-" + kind + "-bases", collapseBases(sources), fragmentProgram, "pass");
    }
    const identical = { ...original };
    replaceSource(identical, "format", "export type FormatContracts = typeof Format;",
      'import type { DocumentState } from "../../document/composition/document.contracts.js";\n'
      + "export type FormatContracts = typeof Format | typeof DocumentState;");
    await check("identical-overlap", identical, parityProgram, "pass");
    assert.equal(records.length, 8);
  });
}
