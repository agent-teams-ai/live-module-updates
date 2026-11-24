import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const fixtureRoot = fileURLToPath(new URL(".", import.meta.url));
export const evidenceRoot = join(fixtureRoot, ".qualification", "evidence");
export const sha256 = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");
const packagePaths = ["dist/index.d.ts", "dist/index.js", "package.json"] as const;

async function snapshotPackage(root: string): Promise<ReadonlyMap<string, Buffer>> {
  assert.ok((await lstat(root)).isDirectory(), "package root must be a real directory");
  const top = await readdir(root, { withFileTypes: true });
  assert.deepEqual(top.map(entry => entry.name).sort(), ["dist", "package.json"], "package root inventory");
  assert.ok(top.find(entry => entry.name === "dist")?.isDirectory(), "package dist must be a real directory");
  assert.ok(top.find(entry => entry.name === "package.json")?.isFile(), "package manifest must be a regular file");
  const dist = await readdir(join(root, "dist"), { withFileTypes: true });
  assert.deepEqual(dist.map(entry => entry.name).sort(), ["index.d.ts", "index.js"], "package dist inventory");
  assert.ok(dist.every(entry => entry.isFile()), "package outputs must be regular files");
  return new Map(await Promise.all(packagePaths.map(async path =>
    [path, await readFile(join(root, path))] as const)));
}

/** Verify the closed installed fixture against bytes captured before packing. */
export async function verifyPackageBytes(root: string, built: ReadonlyMap<string, Buffer>): Promise<void> {
  const actual = await snapshotPackage(root);
  assert.equal(built.size, packagePaths.length, "incomplete build inventory");
  for (const path of packagePaths) {
    const expected = built.get(path);
    const bytes = actual.get(path);
    assert.ok(expected && bytes && bytes.equals(expected), "package bytes differ: " + path);
  }
}

function run(program: string, args: string[], cwd: string): string {
  return execFileSync(program, args, { cwd, encoding: "utf8", timeout: 60000, maxBuffer: 1024 * 1024 });
}

export async function packConsumer() {
  await mkdir(evidenceRoot, { recursive: true });
  assert.equal(process.version, "v24.22.3");
  const tsc = join(fixtureRoot, "node_modules", ".bin", "tsc");
  assert.equal(run(tsc, ["--version"], fixtureRoot).trim(), "Version 7.0.2");
  run(tsc, ["-p", "tsconfig.core.json"], fixtureRoot);
  const artifactRoot = join(fixtureRoot, "artifact");
  const built = await snapshotPackage(artifactRoot);
  const packLog = run("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", evidenceRoot], artifactRoot);
  const pack: unknown = JSON.parse(packLog);
  assert.ok(Array.isArray(pack) && pack.length === 1);
  const item: unknown = pack[0];
  assert.ok(typeof item === "object" && item !== null && "filename" in item && typeof item.filename === "string");
  assert.equal(basename(item.filename), item.filename);
  const tarball = join(evidenceRoot, item.filename);
  assert.ok("files" in item && Array.isArray(item.files));
  const files: readonly unknown[] = item.files;
  const packedPaths = files.map(file => {
    assert.ok(typeof file === "object" && file !== null && "path" in file && typeof file.path === "string");
    return file.path;
  });
  assert.deepEqual(packedPaths.sort(), [...packagePaths].sort(), "pack file inventory");
  assert.ok("integrity" in item && typeof item.integrity === "string");
  const archive = await readFile(tarball);
  const archiveDigest = sha256(archive);
  const integrity = "sha512-" + createHash("sha512").update(archive).digest("base64");
  assert.equal(item.integrity, integrity, "pack integrity differs from actual archive");
  await verifyPackageBytes(artifactRoot, built);
  const root = await mkdtemp(join(tmpdir(), "portable-document-consumer-"));
  try {
    await writeFile(join(root, "package.json"), JSON.stringify({
      name: "isolated-document-consumer", private: true, type: "module",
      dependencies: { "@fixture/portable-document": `file:${tarball}` },
    }, null, 2));
    const installLog = run("npm", ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund"], root);
    const packageRoot = join(root, "node_modules", "@fixture", "portable-document");
    await verifyPackageBytes(packageRoot, built);
    const lock: unknown = JSON.parse(await readFile(join(root, "package-lock.json"), "utf8"));
    assert.ok(typeof lock === "object" && lock !== null && "packages" in lock
      && typeof lock.packages === "object" && lock.packages !== null);
    const packages = lock.packages;
    assert.deepEqual(Object.keys(packages).sort(), ["", "node_modules/@fixture/portable-document"],
      "unexpected installed dependency closure");
    assert.ok("node_modules/@fixture/portable-document" in packages);
    const installed = packages["node_modules/@fixture/portable-document"];
    assert.ok(typeof installed === "object" && installed !== null && "integrity" in installed);
    assert.equal(installed.integrity, integrity, "consumer lock does not bind the packed archive");
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
    await verifyPackageBytes(packageRoot, built);
    assert.equal(sha256(await readFile(tarball)), archiveDigest, "archive changed after packing");
    const entry = join(packageRoot, "dist", "index.js");
    const manifest: unknown = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
    assert.ok(typeof manifest === "object" && manifest !== null);
    assert.equal("dependencies" in manifest, false);
    assert.equal("peerDependencies" in manifest, false);
    const artifacts = {
      tarball: { name: basename(tarball), sha256: archiveDigest, integrity },
      builtFiles: Object.fromEntries([...built].map(([path, bytes]) => [path, sha256(bytes)])),
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
    return { root, packageRoot, entry, built, artifacts, dispose: () => rm(root, { recursive: true, force: true }) };
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}
