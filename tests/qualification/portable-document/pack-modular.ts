import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { adapterSources, packagePaths } from "./package-inventory.ts";
import { evidenceRoot, fixtureRoot, packArtifact, run, sha256, verifyPackageBytes, type packConsumer } from "./pack-consumer.ts";

const publicVersions = { core: "0.8.0", assembly: "0.8.0", resources: "0.2.2", conformance: "0.5.2" } as const;
const runtimeNames = ["@fixture/portable-document", "@fixture/portable-document-gm",
  "@get-modular/core", "@get-modular/assembly", "@get-modular/resources"] as const;
const inventory = [...runtimeNames, "@get-modular/conformance"].map(name => "node_modules/" + name).sort();

async function registryArtifact(name: string, version: string) {
  const raw: unknown = JSON.parse(run("npm", [
    "pack", name + "@" + version, "--ignore-scripts", "--json", "--pack-destination", evidenceRoot,
  ], fixtureRoot));
  assert.ok(Array.isArray(raw) && raw.length === 1);
  const item: unknown = raw[0];
  assert.ok(typeof item === "object" && item !== null && "filename" in item
    && typeof item.filename === "string" && "integrity" in item && typeof item.integrity === "string");
  assert.equal(basename(item.filename), item.filename);
  const tarball = join(evidenceRoot, item.filename);
  const bytes = await readFile(tarball);
  const integrity = "sha512-" + createHash("sha512").update(bytes).digest("base64");
  assert.equal(integrity, item.integrity, "public archive integrity");
  return { name, version, tarball, integrity, sha256: sha256(bytes) };
}

async function scriptAssets(root: string, prefix: string, result: Map<string, Buffer>, relative = "dist"): Promise<void> {
  for (const entry of await readdir(join(root, relative), { withFileTypes: true })) {
    const path = relative + "/" + entry.name;
    assert.ok(!entry.isSymbolicLink(), "runtime asset must not be a symlink");
    if (entry.isDirectory()) await scriptAssets(root, prefix, result, path);
    else {
      assert.ok(entry.isFile());
      if (entry.name.endsWith(".js")) result.set(prefix + "/" + path, await readFile(join(root, path)));
    }
  }
}

/** Packs the optional adapter against an already packed core in a new external consumer. */
export async function packModularConsumer(core: Awaited<ReturnType<typeof packConsumer>>) {
  const root = await mkdtemp(join(tmpdir(), "modular-document-consumer-"));
  try {
    const published = [];
    for (const [short, version] of Object.entries(publicVersions)) {
      published.push(await registryArtifact("@get-modular/" + short, version));
    }
    const coreTarball = join(evidenceRoot, core.artifacts.tarball.name);
    const runtimeDependencies = Object.fromEntries(published.filter(item => item.name !== "@get-modular/conformance")
      .map(item => [item.name, "file:" + item.tarball]));
    const conformance = published.find(item => item.name === "@get-modular/conformance");
    assert.ok(conformance);
    const manifest = {
      name: "isolated-modular-author", private: true, type: "module",
      dependencies: { "@fixture/portable-document": "file:" + coreTarball, ...runtimeDependencies },
      devDependencies: { "@get-modular/conformance": "file:" + conformance.tarball },
    };
    await writeFile(join(root, "package.json"), JSON.stringify(manifest, null, 2));
    const installArgs = ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund"];
    run("npm", installArgs, root);
    const coreRoot = join(root, "node_modules/@fixture/portable-document");
    await verifyPackageBytes(coreRoot, core.built);

    await cp(join(fixtureRoot, "adapter/src"), join(root, "adapter/src"), { recursive: true });
    await cp(join(fixtureRoot, "adapter/package.json"), join(root, "adapter/package.json"));
    await cp(join(fixtureRoot, "tsconfig.adapter.json"), join(root, "tsconfig.adapter.json"));
    const tsc = join(fixtureRoot, "node_modules/.bin/tsc");
    run(tsc, ["-p", "tsconfig.adapter.json"], root);

    // A clean staging tree separates owned source from the exact distribution inventory.
    const staging = join(root, "packed-adapter");
    await mkdir(staging);
    await cp(join(root, "adapter/dist"), join(staging, "dist"), { recursive: true });
    await cp(join(root, "adapter/package.json"), join(staging, "package.json"));
    const adapter = await packArtifact(staging, packagePaths(adapterSources));
    await writeFile(join(root, "package.json"), JSON.stringify({
      ...manifest, dependencies: { ...manifest.dependencies, "@fixture/portable-document-gm": "file:" + adapter.tarball },
    }, null, 2));
    run("npm", installArgs, root);
    const adapterRoot = join(root, "node_modules/@fixture/portable-document-gm");
    await verifyPackageBytes(adapterRoot, adapter.built);
    await verifyPackageBytes(coreRoot, core.built);

    const lock: unknown = JSON.parse(await readFile(join(root, "package-lock.json"), "utf8"));
    assert.ok(typeof lock === "object" && lock !== null && "packages" in lock
      && typeof lock.packages === "object" && lock.packages !== null);
    assert.deepEqual(Object.keys(lock.packages).sort(), ["", ...inventory].sort(), "closed modular consumer dependency inventory");
    const expectedIntegrity = new Map([
      ["node_modules/@fixture/portable-document", core.artifacts.tarball.integrity],
      ["node_modules/@fixture/portable-document-gm", adapter.integrity],
      ...published.map(item => ["node_modules/" + item.name, item.integrity] as const),
    ]);
    for (const [path, integrity] of expectedIntegrity) {
      const entry: unknown = Reflect.get(lock.packages, path);
      assert.ok(typeof entry === "object" && entry !== null && "integrity" in entry);
      assert.equal(entry.integrity, integrity, "installed archive binding: " + path);
    }

    const requiredSources = ["node-modular-host.ts", "browser-modular-host.ts",
      "invocation-owner.ts", "author-format.ts", "composition-contract.ts"];
    for (const path of requiredSources) await readFile(join(fixtureRoot, "consumer", path));
    await cp(join(fixtureRoot, "consumer"), join(root, "consumer"), { recursive: true });
    const common = {
      target: "ES2024", module: "NodeNext", moduleResolution: "NodeNext", strict: true,
      noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true, verbatimModuleSyntax: true,
      erasableSyntaxOnly: true, skipLibCheck: false, declaration: true, rootDir: "consumer",
    };
    await writeFile(join(root, "tsconfig.node.json"), JSON.stringify({
      compilerOptions: { ...common, lib: ["ES2024", "ESNext.Disposable", "DOM"], types: ["node"],
        typeRoots: [resolve(fixtureRoot, "node_modules/@types")], outDir: "dist/node" },
      include: ["consumer/node-modular-host.ts", "consumer/composition-contract.ts", "consumer/author-format.ts"],
    }, null, 2));
    await writeFile(join(root, "tsconfig.browser.json"), JSON.stringify({
      compilerOptions: { ...common, lib: ["ES2024", "ESNext.Disposable", "DOM", "DOM.Iterable"], types: [], outDir: "dist/browser" },
      include: ["consumer/browser-modular-host.ts", "consumer/author-format.ts"],
    }, null, 2));
    run(tsc, ["-p", "tsconfig.node.json"], root);
    run(tsc, ["-p", "tsconfig.browser.json"], root);
    await verifyPackageBytes(adapterRoot, adapter.built);
    await verifyPackageBytes(coreRoot, core.built);

    const adapterEntry = join(adapterRoot, "dist/index.js");
    const hostEntry = join(root, "dist/node/node-modular-host.js");
    const resolveImport = (name: string, entry: string) => fileURLToPath(run(process.execPath,
      ["--input-type=module", "--eval", "process.stdout.write(import.meta.resolve(" + JSON.stringify(name) + "))"],
      dirname(entry)));
    for (const name of runtimeNames) {
      assert.equal(await realpath(resolveImport(name, adapterEntry)), await realpath(resolveImport(name, hostEntry)),
        "one physical public runtime identity: " + name);
    }
    const assemblyEntry = resolveImport("@get-modular/assembly", hostEntry);
    assert.equal(await realpath(resolveImport("@get-modular/core", assemblyEntry)),
      await realpath(resolveImport("@get-modular/core", hostEntry)), "Assembly uses the Host's physical Core");
    const assets = new Map<string, Buffer>();
    for (const name of runtimeNames) {
      await scriptAssets(join(root, "node_modules", name), "/packages/" + name, assets);
    }
    await scriptAssets(root, "/hosts", assets, "dist/browser");
    const artifacts = {
      core: core.artifacts.tarball,
      adapter: { name: basename(adapter.tarball), sha256: adapter.archiveDigest, integrity: adapter.integrity },
      publicPackages: published.map(({ name, version, sha256, integrity }) => ({ name, version, sha256, integrity })),
      adapterFiles: Object.fromEntries([...adapter.built].map(([path, bytes]) => [path, sha256(bytes)])),
      consumerLockSha256: sha256(await readFile(join(root, "package-lock.json"))),
      assets: Object.fromEntries([...assets].map(([path, bytes]) => [path, sha256(bytes)])),
      source: process.env["QUALIFICATION_SOURCE_SHA"] ?? "local-unpublished",
    };
    await writeFile(join(evidenceRoot, "modular-artifact-identities.json"), JSON.stringify(artifacts, null, 2) + "\n");
    await cp(join(root, "package-lock.json"), join(evidenceRoot, "modular-consumer-package-lock.json"));
    await cp(join(adapterRoot, "dist"), join(evidenceRoot, "adapter"), { recursive: true });
    await cp(join(root, "dist"), join(evidenceRoot, "modular-hosts"), { recursive: true });
    return { root, coreRoot, adapterRoot, adapterBuilt: adapter.built, assets, artifacts,
      dispose: () => rm(root, { recursive: true, force: true }) };
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}
