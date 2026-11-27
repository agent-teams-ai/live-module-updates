import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join, normalize, sep } from "node:path";
import { cohort, javascriptInventory } from "./operation-fixture.ts";
import { compiler, compilerVersion, digest, evidence, object, pack, root, run } from "./pack-operation.ts";

const retainedVersions: Readonly<Record<string, string>> = {
  "@extension-foundation/node-artifact": "0.0.0", "es-module-lexer": "3.0.5",
};
const lexerIntegrity = "sha512-RNq2lKJw53c7z9QRHeiKeA6Ez0oikOqiBGdmxQhKDxEiOX1g5QJR4IoFVwicn8uCZcRWNrXC3NZaJihgK7aEbg==";
const inputsDirectory = join(root, "tests/module/fixtures/ef");
type Archive = { readonly name: string; readonly version: string; readonly path: string; readonly sha256: string; readonly integrity: string };
type EfPackageIdentities = {
  readonly source: string; readonly node: string; readonly compiler: string;
  readonly producerInputs: Readonly<Record<string, unknown>>; readonly producerInputsSha256: string;
  readonly archives: Readonly<Record<string, { readonly version: string; readonly sha256: string; readonly integrity: string }>>;
  readonly rootLockSha256: string; readonly consumerLockSha256: string; readonly consumers: Readonly<Record<string, string>>;
};
export interface EfPackageFixture {
  readonly temporary: string; readonly consumer: string; readonly destination: string; readonly identities: EfPackageIdentities;
  readonly dispose: () => Promise<void>;
}

function text(record: Record<string, unknown>, key: string): string {
  const value = record[key]; assert.equal(typeof value, "string", "missing string: " + key);
  assert.ok(typeof value === "string"); return value;
}
function inspectProducer(value: unknown): void {
  const producer = object(value);
  assert.equal(producer["repository"], "agent-teams-ai/extension-foundation");
  assert.equal(producer["workflow"], ".github/workflows/package-conformance.yml");
  assert.equal(producer["proofStep"], "Artifact conformance proof");
  for (const field of ["sourceSha", "workflowBlobSha"]) { assert.match(text(producer, field), /^[a-f0-9]{40}$/u); }
  for (const field of ["runId", "jobId", "artifactId"]) { assert.match(text(producer, field), /^[1-9]\d*$/u); }
  assert.ok(typeof producer["runAttempt"] === "number" && Number.isSafeInteger(producer["runAttempt"]) && producer["runAttempt"] > 0);
  assert.match(text(producer, "artifactDigest"), /^sha256:[a-f0-9]{64}$/u);
}
async function retainedArchive(value: unknown, directory: string): Promise<Archive> {
  const input = object(value);
  const name = text(input, "name"); const version = text(input, "version");
  assert.ok(Object.hasOwn(retainedVersions, name)); assert.equal(version, retainedVersions[name]);
  const relative = text(input, "file");
  assert.ok(!isAbsolute(relative) && relative === normalize(relative) && !relative.split(sep).includes("..") && relative.endsWith(".tgz"));
  const path = join(directory, relative);
  assert.equal(await realpath(path), path, "retained archive must be an ordinary file inside the receipt directory");
  assert.ok((await lstat(path)).isFile());
  const bytes = await readFile(path);
  const sha256 = text(input, "sha256"); const integrity = text(input, "integrity");
  assert.equal(digest(bytes), sha256, "retained archive SHA256 changed: " + name);
  assert.equal("sha512-" + createHash("sha512").update(bytes).digest("base64"), integrity, "retained archive SRI changed: " + name);
  if (name === "es-module-lexer") { assert.equal(integrity, lexerIntegrity); }
  const manifest = object(JSON.parse(run("tar", ["-xOzf", path, "package/package.json"], directory)));
  assert.equal(manifest["name"], name); assert.equal(manifest["version"], version);
  assert.deepEqual(manifest["dependencies"] ?? {}, name === "es-module-lexer" ? {} : { "es-module-lexer": "3.0.5" });
  assert.deepEqual(manifest["optionalDependencies"] ?? {}, {}); assert.deepEqual(manifest["peerDependencies"] ?? {}, {});
  return { name, version, path, sha256, integrity };
}
async function readInputs(): Promise<{ readonly record: Record<string, unknown>; readonly bytes: Buffer; readonly archives: readonly Archive[] }> {
  const directory = await realpath(inputsDirectory);
  const bytes = await readFile(join(directory, "package-inputs.json"));
  const record = object(JSON.parse(bytes.toString("utf8")));
  assert.equal(record["schemaVersion"], 1); inspectProducer(record["producer"]);
  const entries = record["archives"]; assert.ok(Array.isArray(entries));
  const archives = await Promise.all(entries.map((entry: unknown) => retainedArchive(entry, directory)));
  assert.deepEqual(archives.map(archive => archive.name).toSorted(), Object.keys(retainedVersions).toSorted());
  // The reviewed receipt records producer qualification. This installer does not issue online admission.
  return { record, bytes, archives };
}
async function stageRegistryPackage(name: string, version: string, temporary: string): Promise<Archive> {
  const installed = await realpath(join(root, "node_modules", name));
  const manifest = object(JSON.parse(await readFile(join(installed, "package.json"), "utf8")));
  assert.equal(manifest["name"], name); assert.equal(manifest["version"], version);
  const staged = join(temporary, "registry", name);
  await cp(installed, staged, { recursive: true });
  const archive = await pack(staged, temporary); assert.ok(typeof archive.integrity === "string");
  return { name, version, ...archive, integrity: archive.integrity };
}
async function installConsumer(consumer: string, archives: readonly Archive[]): Promise<Buffer> {
  await mkdir(consumer);
  await writeFile(join(consumer, "package.json"), JSON.stringify({ name: "ef-installed-operation", private: true, type: "module",
    dependencies: Object.fromEntries(archives.map(archive => [archive.name, "file:" + archive.path])) }));
  run("npm", ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund"], consumer);
  const lockBytes = await readFile(join(consumer, "package-lock.json"));
  const packages = object(object(JSON.parse(lockBytes.toString("utf8")))["packages"]);
  assert.deepEqual(Object.keys(packages).toSorted(), ["", ...archives.map(archive => "node_modules/" + archive.name)].toSorted());
  for (const archive of archives) {
    const installed = object(packages["node_modules/" + archive.name]);
    assert.equal(installed["integrity"], archive.integrity); assert.equal(installed["version"], archive.version);
  }
  return lockBytes;
}
async function compileConsumer(consumer: string, filenames: readonly string[]): Promise<void> {
  assert.ok(filenames.length > 0 && new Set(filenames).size === filenames.length);
  for (const filename of filenames) {
    assert.ok(filename === basename(filename) && filename.endsWith(".ts"));
    const original = await readFile(join(root, "tests/module", filename), "utf8");
    const source = original.replaceAll("../../src/index.ts", "live-module-updates").replaceAll("../../src/resources.ts", "live-module-updates/resources");
    assert.equal(source.includes("../../src/"), false);
    await writeFile(join(consumer, filename), source);
  }
  await writeFile(join(consumer, "tsconfig.json"), JSON.stringify({ compilerOptions: {
    target: "ES2024", module: "NodeNext", moduleResolution: "NodeNext", lib: ["ES2024", "ESNext.Disposable"],
    types: ["node"], typeRoots: [join(root, "node_modules/@types")], strict: true,
    noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true, verbatimModuleSyntax: true,
    erasableSyntaxOnly: true, rewriteRelativeImportExtensions: true, skipLibCheck: false, noEmitOnError: true,
    declaration: true, outDir: "out",
  }, files: filenames }));
  const inputs = run(compiler, ["-p", "tsconfig.json", "--listFiles"], consumer).trim().split(/\r?\n/u);
  for (const name of ["live-module-updates", "@extension-foundation/node-artifact"]) {
    assert.ok(inputs.includes(join(consumer, "node_modules", name, "dist/index.d.ts")), "actual installed public declaration missing: " + name);
  }
  const copiedInputs = new Set(filenames.map(filename => join(consumer, filename)));
  assert.ok(inputs.every(path => /\.d\.[cm]?ts$/u.test(path) || copiedInputs.has(path)),
    "compiler implementation input escaped the deliberately copied consumer files");
}

/** Uses the unchanged qualified EF archive; compilation never evaluates the signed fixture payload. */
export async function prepareEfPackageFixture(options: { readonly consumerFiles: readonly string[] }): Promise<EfPackageFixture> {
  const inputs = await readInputs();
  assert.equal(process.version, "v24.22.3");
  const actualCompiler = compilerVersion();
  const temporary = await mkdtemp(join(tmpdir(), "lmu-ef-operation-"));
  const destination = join(evidence, "ef-operation");
  try {
    await mkdir(destination, { recursive: true });
    const library = await pack(root, temporary); assert.ok(typeof library.integrity === "string");
    const manifest = object(JSON.parse(await readFile(join(root, "package.json"), "utf8")));
    const archives: Archive[] = [{ name: "live-module-updates", version: text(manifest, "version"), ...library, integrity: library.integrity }, ...inputs.archives];
    for (const [name, version] of Object.entries(cohort)) { archives.push(await stageRegistryPackage(name, version, temporary)); }
    const consumer = join(temporary, "consumer");
    const lockBytes = await installConsumer(consumer, archives);
    for (const path of library.files) {
      assert.deepEqual(await readFile(join(consumer, "node_modules/live-module-updates", path)), await readFile(join(root, path)), "installed library byte mismatch: " + path);
    }
    await compileConsumer(consumer, options.consumerFiles);
    for (const archive of archives) {
      assert.equal(digest(await readFile(archive.path)), archive.sha256, "input archive changed during qualification setup");
      await cp(archive.path, join(destination, basename(archive.path)));
    }
    await writeFile(join(destination, "producer-inputs.json"), inputs.bytes);
    await writeFile(join(destination, "consumer-lock.json"), lockBytes);
    const identities: EfPackageIdentities = {
      source: process.env["QUALIFICATION_SOURCE_SHA"] ?? "local-unpublished", node: process.version, compiler: actualCompiler,
      producerInputs: inputs.record, producerInputsSha256: digest(inputs.bytes),
      archives: Object.fromEntries(archives.map(({ name, version, sha256, integrity }) => [name, { version, sha256, integrity }])),
      rootLockSha256: digest(await readFile(join(root, "pnpm-lock.yaml"))), consumerLockSha256: digest(lockBytes),
      consumers: Object.fromEntries(await javascriptInventory(join(consumer, "out"))),
    };
    await writeFile(join(destination, "identities.json"), JSON.stringify(identities, null, 2) + "\n");
    return { temporary, consumer, destination, identities, dispose: () => rm(temporary, { recursive: true, force: true }) };
  } catch (cause) { await rm(temporary, { recursive: true, force: true }); throw cause; }
}
