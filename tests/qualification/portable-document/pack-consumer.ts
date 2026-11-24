import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const fixtureRoot = fileURLToPath(new URL(".", import.meta.url));
export const evidenceRoot = join(fixtureRoot, ".qualification", "evidence");
export const sha256 = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");

function run(program: string, args: string[], cwd: string): string {
  return execFileSync(program, args, { cwd, encoding: "utf8", timeout: 60000, maxBuffer: 1024 * 1024 });
}

export async function packConsumer() {
  await mkdir(evidenceRoot, { recursive: true });
  assert.equal(process.version, "v24.22.3");
  const tsc = join(fixtureRoot, "node_modules", ".bin", "tsc");
  assert.equal(run(tsc, ["--version"], fixtureRoot).trim(), "Version 7.0.2");
  run(tsc, ["-p", "tsconfig.core.json"], fixtureRoot);
  const packLog = run("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", evidenceRoot], join(fixtureRoot, "artifact"));
  const pack: unknown = JSON.parse(packLog);
  assert.ok(Array.isArray(pack) && pack.length === 1);
  const item: unknown = pack[0];
  assert.ok(typeof item === "object" && item !== null && "filename" in item && typeof item.filename === "string");
  assert.equal(basename(item.filename), item.filename);
  const tarball = join(evidenceRoot, item.filename);
  const root = await mkdtemp(join(tmpdir(), "portable-document-consumer-"));
  try {
    await writeFile(join(root, "package.json"), JSON.stringify({
      name: "isolated-document-consumer", private: true, type: "module",
      dependencies: { "@fixture/portable-document": `file:${tarball}` },
    }, null, 2));
    const installLog = run("npm", ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund"], root);
    await cp(join(fixtureRoot, "consumer"), join(root, "consumer"), { recursive: true });
    const common = {
      target: "ES2022", module: "NodeNext", moduleResolution: "NodeNext", strict: true,
      noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true, verbatimModuleSyntax: true,
      erasableSyntaxOnly: true, skipLibCheck: false, declaration: true, rootDir: "consumer",
    };
    await writeFile(join(root, "tsconfig.node.json"), JSON.stringify({
      compilerOptions: { ...common, lib: ["ES2022"], types: ["node"],
        typeRoots: [resolve(fixtureRoot, "node_modules", "@types")], outDir: "dist/node" },
      include: ["consumer/node-host.ts"],
    }, null, 2));
    await writeFile(join(root, "tsconfig.browser.json"), JSON.stringify({
      compilerOptions: { ...common, lib: ["ES2022", "DOM", "DOM.Iterable"], types: [], outDir: "dist/browser" },
      include: ["consumer/browser-host.ts"],
    }, null, 2));
    // Both consumers resolve the installed package exports, never a source alias.
    run(tsc, ["-p", "tsconfig.node.json"], root);
    run(tsc, ["-p", "tsconfig.browser.json"], root);
    const packageRoot = join(root, "node_modules", "@fixture", "portable-document");
    const entry = join(packageRoot, "dist", "index.js");
    const manifest: unknown = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
    assert.ok(typeof manifest === "object" && manifest !== null);
    assert.equal("dependencies" in manifest, false);
    assert.equal("peerDependencies" in manifest, false);
    const artifacts = {
      tarball: { name: basename(tarball), sha256: sha256(await readFile(tarball)) },
      entrySha256: sha256(await readFile(entry)),
      declarationSha256: sha256(await readFile(join(packageRoot, "dist", "index.d.ts"))),
      toolLockSha256: sha256(await readFile(join(fixtureRoot, "pnpm-lock.yaml"))),
      consumerLockSha256: sha256(await readFile(join(root, "package-lock.json"))),
      node: process.version, npm: run("npm", ["--version"], root).trim(), compiler: "7.0.2",
      platform: process.platform, architecture: process.arch,
      source: process.env["QUALIFICATION_SOURCE_SHA"] ?? "local-unpublished",
      eventSource: process.env["GITHUB_SHA"] ?? null,
      pullRequestHead: process.env["QUALIFICATION_PR_HEAD"] || null,
      pullRequestBase: process.env["QUALIFICATION_PR_BASE"] || null,
      run: process.env["GITHUB_RUN_ID"] ?? null,
    };
    await writeFile(join(evidenceRoot, "artifact-identities.json"), JSON.stringify(artifacts, null, 2) + "\n");
    await writeFile(join(evidenceRoot, "pack.json"), packLog);
    await writeFile(join(evidenceRoot, "consumer-install.log"), installLog);
    await cp(join(root, "package-lock.json"), join(evidenceRoot, "consumer-package-lock.json"));
    await cp(join(packageRoot, "dist"), join(evidenceRoot, "core"), { recursive: true });
    await cp(join(root, "dist"), join(evidenceRoot, "hosts"), { recursive: true });
    return { root, entry, artifacts, dispose: () => rm(root, { recursive: true, force: true }) };
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}
