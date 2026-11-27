import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { repositoryRoot } from "./check-feature-module.ts";

await test("the actual scoped native lint rule rejects bivariant public method contracts", async () => {
  const qualification = join(repositoryRoot, ".qualification");
  await mkdir(qualification, { recursive: true });
  const directory = await mkdtemp(join(qualification, "contract-style-"));
  try {
    const raw: unknown = JSON.parse(await readFile(join(repositoryRoot, ".oxlintrc.json"), "utf8"));
    assert.ok(typeof raw === "object" && raw !== null && "extends" in raw && Array.isArray(raw.extends));
    const config = { ...raw, extends: raw.extends.map((path: unknown) => {
      assert.ok(typeof path === "string"); return resolve(repositoryRoot, path);
    }) };
    await writeFile(join(directory, ".oxlintrc.json"), JSON.stringify(config));
    await writeFile(join(directory, "tsconfig.json"), JSON.stringify({
      compilerOptions: { strict: true, target: "ES2024", types: [], noEmit: true }, include: ["src/**/*.ts"],
    }));
    const files = [
      "src/features/update-operation/application/ports/consumer.ts",
      "src/features/update-operation/application/models.ts",
      "src/features/update-operation/composition/create-update-runtime.ts",
    ];
    const check = () => spawnSync(join(repositoryRoot, "node_modules/.bin/oxlint"),
      ["--config", ".oxlintrc.json", "--format", "json", ...files],
      { cwd: directory, encoding: "utf8", timeout: 30_000, maxBuffer: 1024 * 1024 });
    for (const path of files) {
      await mkdir(dirname(join(directory, path)), { recursive: true });
      await writeFile(join(directory, path), "export interface Port { readonly invoke: (input: string) => void }\n");
    }
    const positive = check();
    assert.equal(positive.error, undefined);
    assert.equal(positive.status, 0, positive.stdout + positive.stderr);
    for (const path of files) { await writeFile(join(directory, path), "export interface Port { invoke(input: string): void }\n"); }
    const negative = check();
    assert.equal(negative.error, undefined);
    assert.equal(negative.status, 1, negative.stdout + negative.stderr);
    const report: unknown = JSON.parse(negative.stdout);
    assert.ok(typeof report === "object" && report !== null && "diagnostics" in report && Array.isArray(report.diagnostics));
    assert.equal(report.diagnostics.length, files.length);
    const diagnostics: readonly unknown[] = report.diagnostics;
    for (const diagnostic of diagnostics) {
      assert.ok(typeof diagnostic === "object" && diagnostic !== null && "code" in diagnostic);
      assert.equal(diagnostic.code, "typescript(method-signature-style)");
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
