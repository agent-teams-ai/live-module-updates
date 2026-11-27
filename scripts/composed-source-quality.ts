import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const nativeLint = join(repositoryRoot, "node_modules/.bin/oxlint");
const nativeBackend = join(repositoryRoot, "node_modules/.bin", process.platform === "win32" ? "tsgolint.CMD" : "tsgolint");
const configName = ".composed-quality.json";
type Scope = "reference" | "consumer";
export type QualityExecute = (program: string, args: readonly string[], cwd: string) => string;

interface Diagnostic {
  readonly code: string;
  readonly filename: string;
}
interface Control {
  readonly file: string;
  readonly valid: string;
  readonly invalid: string;
  readonly code: string;
}

/** Keep the pinned technical presets intact; CMS adds only its owned constraints. */
function configuration(scope: Scope) {
  const cms = scope === "reference" ? [
    { files: ["src/features/**/*.ts"], excludeFiles: ["**/*.test.ts"], rules: {
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 60, skipBlankLines: true, skipComments: true }],
      "max-params": ["error", { max: 4 }],
    } },
    { files: ["src/features/**/composition/*.module.ts"], rules: {
      "max-lines": ["error", { max: 80, skipBlankLines: true, skipComments: true }],
    } },
    { files: ["src/**/*.ts"], rules: { "no-restricted-imports": ["error", { paths: [
      { name: "@get-modular/observation/testing", message: "GM testing entry belongs to test code." },
      { name: "live-module-updates/testing", message: "LMU testing entry belongs to test code." },
    ] }] } },
    { files: ["src/features/**/contracts/**", "src/features/**/domain/**", "src/features/**/application/**", "src/features/**/adapters/**"],
      rules: { "no-restricted-imports": ["error", { patterns: [
        { group: ["@get-modular/*"], message: "GM dependencies belong to composition or tests." },
        { group: ["live-module-updates/*"], message: "Inner code uses only the portable LMU root contract." },
      ] }] } },
    { files: ["src/features/**/composition/*.declaration.ts"], rules: { "no-restricted-imports": ["error", {
      patterns: [{ group: ["*", "!@get-modular/assembly", "!@get-modular/core", "!*.contracts.js", "!*.contracts.ts"],
        message: "Declarations contain only native declarations, cardinality helpers and contract descriptors." }],
      paths: [{ name: "@get-modular/assembly", allowImportNames: ["declareModule"] },
        { name: "@get-modular/core", allowImportNames: ["required", "optional", "many"] }],
    }] } },
  ] : [];
  return {
    extends: ["type-aware.json", "maintainability.json"].map(name => join(repositoryRoot, "node_modules/stack-toolchain/presets/oxlint", name)),
    options: { respectEslintDisableDirectives: false, reportUnusedDisableDirectives: "error" },
    rules: { "typescript/method-signature-style": ["error", "property"] },
    overrides: cms,
  };
}

function diagnostics(output: string): readonly Diagnostic[] {
  const report: unknown = JSON.parse(output);
  assert.ok(typeof report === "object" && report !== null && "diagnostics" in report && Array.isArray(report.diagnostics),
    "native lint must return its actual diagnostic report");
  return report.diagnostics.map((value: unknown) => {
    assert.ok(typeof value === "object" && value !== null && "code" in value && typeof value.code === "string"
      && "filename" in value && typeof value.filename === "string", "native diagnostic lacks its rule or source identity");
    return { code: value.code, filename: value.filename };
  });
}

function argumentsFor(files: readonly string[]): string[] {
  return ["--config", configName, "--format", "json", "--threads", "1", "--no-ignore", "--disable-nested-config", ...files];
}
const controlLines = (count: number) => Array.from({ length: count }, (_, index) => "export const value" + String(index) + " = " + String(index) + ";").join("\n") + "\n";

/**
 * Oxlint 1.83.0 supports this explicit backend path. The clean artifact consumer
 * does not install development tooling, and its ambient PATH is not the owner.
 */
function lint(directory: string, files: readonly string[], expectedStatus: 0 | 1): readonly Diagnostic[] {
  const result = spawnSync(nativeLint, argumentsFor(files), {
    cwd: directory, encoding: "utf8", timeout: 60_000, maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, OXLINT_TSGOLINT_PATH: nativeBackend },
  });
  assert.equal(result.error, undefined, "native typed lint did not complete");
  assert.equal(result.signal, null, "native typed lint was interrupted");
  assert.equal(result.status, expectedStatus, result.stdout + result.stderr);
  return diagnostics(result.stdout).map(value => ({
    code: value.code, filename: isAbsolute(value.filename) ? relative(directory, value.filename) : value.filename,
  }));
}

async function toolchain(execute: QualityExecute) {
  const version = execute(nativeLint, ["--version"], repositoryRoot).trim();
  assert.match(version, /(?:^|[^0-9])1\.83\.0(?:$|[^0-9])/u, "the actual native linter must remain pinned");
  const owner: unknown = JSON.parse(await readFile(join(repositoryRoot, "node_modules/oxlint-tsgolint/package.json"), "utf8"));
  assert.ok(typeof owner === "object" && owner !== null && "version" in owner && owner.version === "7.0.2001",
    "the selected typed backend must match the root's initialized TS7 cohort");
  return { linter: version, typed: owner.version, backendPath: nativeBackend };
}

function controlFiles(scope: Scope): readonly Control[] {
  const inner = scope === "reference" ? "src/features/document-runtime/application/ports" : "hosts";
  const valid = "export interface NativeControl { readonly invoke: (value: string) => void }\n";
  const common = [
    { file: inner + "/__quality_floating.ts", valid, invalid: valid + "Promise.resolve();\n", code: "typescript(no-floating-promises)" },
    { file: inner + "/__quality_method.ts", valid,
      invalid: "export interface NativeControl { invoke(value: string): void }\n", code: "typescript(method-signature-style)" },
  ];
  if (scope === "consumer") { return common; }
  return [...common,
    { file: inner + "/__quality_gm.ts", valid,
      invalid: 'import type { Resources } from "@get-modular/resources";\nexport type NativeControl = Resources;\n', code: "eslint(no-restricted-imports)" },
    { file: inner + "/__quality_resources.ts", valid,
      invalid: 'import type { createResourcesPreparation } from "live-module-updates/resources";\nexport type NativeControl = typeof createResourcesPreparation;\n', code: "eslint(no-restricted-imports)" },
    { file: inner + "/__quality_testing.ts", valid,
      invalid: 'import type { AuthorityContractFixture } from "live-module-updates/testing";\nexport type NativeControl = AuthorityContractFixture;\n', code: "eslint(no-restricted-imports)" },
    { file: inner + "/__quality_parameters.ts", valid,
      invalid: "export const nativeControl = (a: number, b: number, c: number, d: number, e: number): number => a + b + c + d + e;\n", code: "eslint(max-params)" },
    { file: inner + "/__quality_function.ts", valid,
      invalid: "export function nativeControl(value: number): number {\n  let total = value;\n"
        + Array.from({ length: 59 }, () => "  total += 1;\n").join("") + "  return total;\n}\n", code: "eslint(max-lines-per-function)" },
    { file: inner + "/__quality_file.ts", valid, invalid: controlLines(301), code: "eslint(max-lines)" },
    { file: "src/features/document-runtime/composition/__quality_module.module.ts", valid, invalid: controlLines(81), code: "eslint(max-lines)" },
    { file: "src/features/document-runtime/composition/__quality_declaration.declaration.ts", valid,
      invalid: 'import { assemblyFor } from "@get-modular/assembly";\nexport const nativeControl = assemblyFor;\n', code: "eslint(no-restricted-imports)" },
  ];
}

/** Disposable native controls run under the very same initialized staged project and config. */
async function rejectControls(directory: string, scope: Scope) {
  const controls = controlFiles(scope);
  const created: string[] = [];
  try {
    for (const control of controls) {
      const path = join(directory, control.file);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, control.valid, { flag: "wx" }); created.push(path);
    }
    const files = controls.map(control => control.file);
    assert.deepEqual(lint(directory, files, 0), [], "native controls require valid setup first");
    for (const control of controls) { await writeFile(join(directory, control.file), control.invalid); }
    const actual = lint(directory, files, 1).map(value => ({ file: value.filename, code: value.code }))
      .toSorted((left, right) => left.file.localeCompare(right.file));
    const expected = controls.map(control => ({ file: control.file, code: control.code }))
      .toSorted((left, right) => left.file.localeCompare(right.file));
    assert.deepEqual(actual, expected, "each deliberate defect must fail exactly its intended native rule in its own file");
    return { validSetup: "passed", rejected: actual };
  } finally {
    for (const path of created) { await rm(path); }
  }
}

/** The caller supplies exact newly maintained files; borrowed source keeps its existing owner profile. */
export async function checkComposedQuality(directory: string, sources: readonly string[], scope: Scope, execute: QualityExecute) {
  assert.ok(sources.length > 0, "the maintained native-quality scope cannot be empty");
  const files = sources.map(source => {
    assert.ok(isAbsolute(source), "quality inputs are actual absolute staged paths");
    const path = relative(directory, source);
    assert.ok(path !== "" && !path.startsWith(".." + sep) && !isAbsolute(path) && path.endsWith(".ts") && !path.endsWith(".d.ts"),
      "quality input must be a maintained implementation inside its staged project");
    return path;
  }).toSorted();
  assert.equal(new Set(files).size, files.length, "quality input census contains duplicates");
  const tools = await toolchain(execute);
  const config = configuration(scope);
  await writeFile(join(directory, configName), JSON.stringify(config, null, 2) + "\n");
  const actual = lint(directory, files, 0);
  assert.deepEqual(actual, [], "maintained staged source must pass unchanged stock typed lint and its adopted scoped rules");
  const controls = await rejectControls(directory, scope);
  return { scope, files, tools, config, diagnostics: actual, controls };
}
