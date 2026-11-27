import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { compiler, compilerVersion, digest, evidence, object, pack, root, run } from "./pack-operation.ts";

export const hostSources = ["host-contract.ts", "host-cases.ts", "native-node-authority.ts", "native-browser-authority.ts",
  "generation-composition.ts", "node-host.ts", "browser-host.ts"] as const;
export const cohort = { "@get-modular/core": "0.8.0", "@get-modular/assembly": "0.8.0",
  "@get-modular/resources": "0.2.2", "@get-modular/conformance": "0.5.2" } as const;
export const expectedCases = ["actual-gm-conformance", "normal-update", "selection-race", "reentrant-close", "held-cohort", "receiver-fence",
  "revoked-grant", "lost-publication", "late-publication", "unknown-superseded", "failed-preparation", "late-preparation",
  "unsupported-contract", "state-basis-change", "schema-basis-change", "grant-basis-change", "attempt-replay", "racing-updates",
  "cleanup-debt", "retention-capacity", "registration-identity", "abandoned-waiter", "incompatible-state", "unknown-closure",
  "multiple-delayed-attempts", "receipt-capacity", "pending-receipt-capacity", "attempt-capacity", "independent-domains-both-orders"] as const;

export function checkRows(value: unknown): void {
  assert.ok(Array.isArray(value));
  assert.deepEqual(value.map((row: unknown) => { const name = object(row)["name"]; assert.ok(typeof name === "string"); return name; }).toSorted(), [...expectedCases].toSorted());
  assert.ok(value.every((row: unknown) => object(row)["outcome"] === "passed"));
}
export async function javascriptInventory(directory: string): Promise<ReadonlyMap<string, string>> {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  const output = new Map<string, string>();
  for (const entry of entries) {
    assert.ok(!entry.isSymbolicLink(), "qualification artifacts cannot contain source links");
    if (entry.isFile() && entry.name.endsWith(".js")) {
      const path = join(entry.parentPath, entry.name);
      output.set(path.slice(directory.length + 1), digest(await readFile(path)));
    }
  }
  return output;
}

/** Installs real archives; only test entry imports are deliberately relinked to public exports. */
export async function prepareOperationFixture() {
  const temporary = await mkdtemp(join(tmpdir(), "lmu-complete-operation-"));
  const destination = join(evidence, "complete-operation");
  await mkdir(destination, { recursive: true });
  try {
    const actualCompiler = compilerVersion();
    assert.equal(process.version, "v24.22.3");
    const artifact = await pack(root, temporary);
    const archives: Record<string, string> = { "live-module-updates": artifact.path };
    const digests: Record<string, string> = { "live-module-updates": artifact.sha256 };
    for (const [name, version] of Object.entries(cohort)) {
      const installed = await realpath(join(root, "node_modules", name));
      assert.equal(object(JSON.parse(await readFile(join(installed, "package.json"), "utf8")))["version"], version);
      const staged = join(temporary, "registry", name);
      await cp(installed, staged, { recursive: true });
      const peer = await pack(staged, temporary);
      archives[name] = peer.path; digests[name] = peer.sha256;
    }
    const consumer = join(temporary, "consumer"); await mkdir(consumer);
    await writeFile(join(consumer, "package.json"), JSON.stringify({ name: "complete-installed-operation", private: true, type: "module",
      dependencies: Object.fromEntries(Object.entries(archives).map(([name, path]) => [name, "file:" + path])) }));
    run("npm", ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund"], consumer);
    const lockBytes = await readFile(join(consumer, "package-lock.json"));
    const packages = object(object(JSON.parse(lockBytes.toString("utf8")))["packages"]);
    assert.deepEqual(Object.keys(packages).toSorted(), ["", ...Object.keys(archives).map(name => "node_modules/" + name)].toSorted());
    assert.equal(object(packages["node_modules/live-module-updates"])["integrity"], artifact.integrity);
    for (const path of artifact.files) {
      assert.deepEqual(await readFile(join(consumer, "node_modules/live-module-updates", path)), await readFile(join(root, path)), "artifact byte mismatch: " + path);
    }
    for (const filename of hostSources) {
      const original = await readFile(join(root, "tests/module", filename), "utf8");
      const source = original.replaceAll("../../src/index.ts", "live-module-updates").replaceAll("../../src/resources.ts", "live-module-updates/resources");
      assert.equal(source.includes("../../src/"), false);
      await writeFile(join(consumer, filename), source);
    }
    const common = { target: "ES2024", module: "NodeNext", moduleResolution: "NodeNext", strict: true,
      noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true, verbatimModuleSyntax: true,
      erasableSyntaxOnly: true, rewriteRelativeImportExtensions: true, skipLibCheck: false, declaration: true };
    for (const target of ["node", "browser"] as const) {
      await writeFile(join(consumer, "tsconfig." + target + ".json"), JSON.stringify({ compilerOptions: { ...common,
        lib: target === "node" ? ["ES2024", "ESNext.Disposable"] : ["ES2024", "ESNext.Disposable", "DOM", "DOM.Iterable"],
        types: target === "node" ? ["node"] : [], ...(target === "node" ? { typeRoots: [join(root, "node_modules/@types")] } : {}),
        outDir: "out/" + target }, include: [target === "node" ? "node-host.ts" : "browser-host.ts", "host-cases.ts"] }));
      run(compiler, ["-p", "tsconfig." + target + ".json"], consumer);
    }
    for (const path of Object.values(archives)) { await cp(path, join(destination, basename(path))); }
    await cp(join(consumer, "package-lock.json"), join(destination, "consumer-lock.json"));
    const identities = { source: process.env["QUALIFICATION_SOURCE_SHA"] ?? "local-unpublished", node: process.version,
      compiler: actualCompiler, cohort, archives: digests, libraryIntegrity: artifact.integrity,
      rootLockSha256: digest(await readFile(join(root, "pnpm-lock.yaml"))), consumerLockSha256: digest(lockBytes),
      hosts: Object.fromEntries(await javascriptInventory(join(consumer, "out"))) };
    await writeFile(join(destination, "identities.json"), JSON.stringify(identities, null, 2) + "\n");
    return { temporary, consumer, destination, identities, dispose: () => rm(temporary, { recursive: true, force: true }) };
  } catch (cause) { await rm(temporary, { recursive: true, force: true }); throw cause; }
}
