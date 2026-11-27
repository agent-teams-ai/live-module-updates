import assert from "node:assert/strict";
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { compiler, compilerVersion, digest, evidence, object, pack, root, run } from "./pack-operation.ts";
import { composedCohort, portableAdapterInputs, portableCoreInputs, summaryInputs, type ComposedArchive, type ComposedSource } from "./composed-inputs.ts";
import { checkComposedConsumers, checkComposedSource } from "../../scripts/check-composed-source.ts";

const oldFixture = "tests/qualification/portable-document";
export const reference = "tests/qualification/composed-document";
const commonCompiler = {
  target: "ES2024", module: "NodeNext", moduleResolution: "NodeNext", strict: true,
  noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true, verbatimModuleSyntax: true,
  erasableSyntaxOnly: true, rewriteRelativeImportExtensions: true, skipLibCheck: false,
};

async function sourceFiles(directory: string): Promise<readonly string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { recursive: true, withFileTypes: true })) {
    assert.ok(!entry.isSymbolicLink(), "reference sources cannot be links");
    if (entry.isDirectory()) {
      assert.ok((await readdir(join(entry.parentPath, entry.name))).length > 0, "empty reference source directory");
    }
    if (entry.isFile()) {
      assert.ok(entry.name.endsWith(".ts"), "maintained reference source must be TypeScript");
      result.push(relative(directory, join(entry.parentPath, entry.name)));
    }
  }
  return result.toSorted();
}

async function copySources(source: string, target: string, paths: readonly string[], renameIndex = false): Promise<readonly ComposedSource[]> {
  const output: ComposedSource[] = [];
  for (const path of paths) {
    const origin = join(source, path);
    const staged = join(target, renameIndex && path === "index.ts" ? "summary.ts" : path);
    assert.ok((await lstat(join(root, origin))).isFile(), "source must be an ordinary file: " + origin);
    const bytes = await readFile(join(root, origin));
    await mkdir(dirname(staged), { recursive: true });
    await writeFile(staged, bytes, { flag: "wx" });
    assert.deepEqual(await readFile(staged), bytes, "borrowed behavior changed during staging");
    output.push({ source: origin, staged, sha256: digest(bytes) });
  }
  return output;
}

async function archive(directory: string, destination: string): Promise<ComposedArchive> {
  const manifest = object(JSON.parse(await readFile(join(directory, "package.json"), "utf8")));
  const name = manifest["name"]; const version = manifest["version"];
  assert.ok(typeof name === "string" && typeof version === "string");
  const result = await pack(directory, destination);
  assert.ok(typeof result.integrity === "string");
  return { name, version, ...result, integrity: result.integrity };
}

async function install(directory: string, archives: readonly ComposedArchive[]): Promise<string> {
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "package.json"), JSON.stringify({ name: "composed-artifact-consumer", private: true,
    type: "module", dependencies: Object.fromEntries(archives.map(item => [item.name, "file:" + item.path])) }));
  run("npm", ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund"], directory);
  const bytes = await readFile(join(directory, "package-lock.json"));
  const packages = object(object(JSON.parse(bytes.toString("utf8")))["packages"]);
  assert.deepEqual(Object.keys(packages).toSorted(), ["", ...archives.map(item => "node_modules/" + item.name)].toSorted());
  for (const item of archives) {
    const installed = object(packages["node_modules/" + item.name]);
    assert.equal(installed["version"], item.version);
    assert.equal(installed["integrity"], item.integrity, "installed archive integrity: " + item.name);
    assert.equal(digest(await readFile(item.path)), item.sha256, "archive changed during installation");
  }
  return digest(bytes);
}

async function compilePackage(directory: string, sources: readonly ComposedSource[], portable: boolean) {
  await writeFile(join(directory, "tsconfig.json"), JSON.stringify({ compilerOptions: { ...commonCompiler,
    lib: portable ? ["ES2024"] : ["ES2024", "ESNext.Disposable", "DOM"], types: [],
    rootDir: "src", outDir: "dist", declaration: true }, include: ["src/**/*.ts"] }));
  run(compiler, ["-p", "tsconfig.json"], directory);
  const inputs = run(compiler, ["-p", "tsconfig.json", "--listFilesOnly"], directory).trim().split(/\r?\n/u);
  assert.deepEqual(inputs.filter(path => !path.endsWith(".d.ts")).map(path => resolve(path)).toSorted(),
    sources.map(item => item.staged).toSorted(), "compiler implementation inputs must be the explicit copied inventory");
  return inputs;
}

async function compileReferenceApplication(directory: string, sources: readonly ComposedSource[]) {
  const files = sources.filter(item => item.staged.includes("/application/")).map(item => item.staged);
  assert.ok(files.length > 0, "reference portable application scope must be real");
  const config = "tsconfig.portable.json";
  await writeFile(join(directory, config), JSON.stringify({ compilerOptions: { ...commonCompiler,
    lib: ["ES2024"], types: [], noEmit: true }, files }));
  run(compiler, ["-p", config], directory);
  const inputs = run(compiler, ["-p", config, "--listFilesOnly"], directory).trim().split(/\r?\n/u);
  assert.deepEqual(inputs.filter(path => !path.endsWith(".d.ts")).map(path => resolve(path)).toSorted(),
    files.toSorted(), "portable reference code cannot import an outer implementation");
  return inputs;
}

async function readonlyContract(consumer: string) {
  const file = "readonly-contract.ts";
  const config = "tsconfig.readonly.json";
  const valid = 'import type { DocumentInvocation } from "@fixture/composed-document";\n'
    + 'export function use(port: DocumentInvocation): void { void port; }\n';
  await writeFile(join(consumer, config), JSON.stringify({ compilerOptions: { ...commonCompiler,
    lib: ["ES2024", "ESNext.Disposable", "DOM"], types: [], noEmit: true }, files: [file] }));
  try {
    await writeFile(join(consumer, file), valid, { flag: "wx" });
    run(compiler, ["-p", config, "--pretty", "false"], consumer);
    await writeFile(join(consumer, file), valid.replace("void port;", "port.invoke = port.invoke;"));
    const diagnostic = run(compiler, ["-p", config, "--pretty", "false"], consumer, 1).trim();
    assert.match(diagnostic, /^readonly-contract\.ts\(2,\d+\): error TS2540: Cannot assign to 'invoke' because it is a read-only property\.$/u);
    return { validSetup: "passed", expectedCode: "TS2540", diagnostic };
  } finally { await rm(join(consumer, file)); await rm(join(consumer, config)); }
}

async function verifyInstalled(directory: string, archives: readonly ComposedArchive[], builds: ReadonlyMap<string, string>): Promise<void> {
  for (const item of archives) {
    const original = builds.get(item.name);
    assert.ok(original);
    const packageRoot = join(directory, "node_modules", item.name);
    const entries = await readdir(packageRoot, { recursive: true, withFileTypes: true });
    assert.ok(entries.every(entry => !entry.isSymbolicLink()), "installed archive contains a symbolic link");
    assert.deepEqual(entries.filter(entry => entry.isFile()).map(entry => relative(packageRoot, join(entry.parentPath, entry.name))).toSorted(),
      [...item.files].toSorted(), "installed archive inventory must be closed: " + item.name);
    for (const path of item.files) {
      assert.deepEqual(await readFile(join(packageRoot, path)), await readFile(join(original, path)),
        "installed package byte mismatch: " + item.name + "/" + path);
    }
  }
}

async function compileConsumers(consumer: string) {
  const owned = await copySources(join(reference, "hosts"), join(consumer, "hosts"), await sourceFiles(join(root, reference, "hosts")));
  const borrowed: ComposedSource[] = [...await copySources(join(oldFixture, "consumer"), join(consumer, "hosts"), ["author-format.ts"])];
  for (const filename of ["host-contract.ts", "native-node-authority.ts", "native-browser-authority.ts"]) {
    const source = "tests/module/" + filename;
    const original = await readFile(join(root, source), "utf8");
    assert.equal(original.split("../../src/index.ts").length, 2, "one deliberate public LMU import relink");
    const output = original.replace("../../src/index.ts", "live-module-updates");
    const staged = join(consumer, "hosts/authority", filename);
    await mkdir(dirname(staged), { recursive: true }); await writeFile(staged, output, { flag: "wx" });
    borrowed.push({ source, staged, sha256: digest(original), stagedSha256: digest(output) });
  }
  const sources = [...owned, ...borrowed];
  const allInputs = new Map<string, readonly string[]>();
  const implementation = new Set<string>();
  for (const target of ["node", "browser"] as const) {
    const config = "tsconfig." + target + ".json";
    await writeFile(join(consumer, config), JSON.stringify({ compilerOptions: { ...commonCompiler,
      lib: target === "node" ? ["ES2024", "ESNext.Disposable"] : ["ES2024", "ESNext.Disposable", "DOM", "DOM.Iterable"],
      types: target === "node" ? ["node"] : [],
      ...(target === "node" ? { typeRoots: [join(root, "node_modules/@types")] } : {}),
      declaration: true, rootDir: "hosts", outDir: "out/" + target }, include: ["hosts/" + target + "-host.ts"] }));
    run(compiler, ["-p", config], consumer);
    const inputs = run(compiler, ["-p", config, "--listFilesOnly"], consumer).trim().split(/\r?\n/u);
    for (const file of inputs.filter(path => !path.endsWith(".d.ts"))) { implementation.add(resolve(file)); }
    allInputs.set(target, inputs);
    for (const name of ["@fixture/portable-document", "@fixture/composed-document", "live-module-updates"]) {
      assert.ok(inputs.includes(join(consumer, "node_modules", name, "dist/index.d.ts")), "public declarations were not consumed: " + name);
    }
  }
  assert.deepEqual([...implementation].toSorted(), sources.map(item => item.staged).toSorted(),
    "both native compilers together cover every maintained consumer implementation, with no checkout source");
  await writeFile(join(consumer, "tsconfig.json"), JSON.stringify({ compilerOptions: { ...commonCompiler,
    lib: ["ES2024", "ESNext.Disposable", "DOM", "DOM.Iterable"], types: ["node"], typeRoots: [join(root, "node_modules/@types")],
    noEmit: true }, include: ["hosts/**/*.ts"] }));
  return { sources, owned: owned.map(item => item.staged), inputs: Object.fromEntries(allInputs) };
}

/** One package build followed by a second clean installation; no child graph or source aliases. */
export async function prepareComposedFixture() {
  const temporary = await mkdtemp(join(tmpdir(), "lmu-composed-document-"));
  const destination = join(evidence, "composed-document");
  await mkdir(destination, { recursive: true });
  try {
    const actualCompiler = compilerVersion();
    assert.equal(process.version, "v24.22.3");
    const library = join(temporary, "lmu"); await mkdir(library);
    for (const filename of ["package.json", "README.md", "LICENSE"]) { await cp(join(root, filename), join(library, filename)); }
    const libraryCompiler = ["-p", join(root, "tsconfig.build.json"), "--outDir", join(library, "dist")];
    run(compiler, libraryCompiler, root);
    const libraryInputs = run(compiler, [...libraryCompiler, "--listFilesOnly"], root).trim().split(/\r?\n/u);
    const archivesDirectory = join(temporary, "archives"); await mkdir(archivesDirectory);
    const archives: ComposedArchive[] = [await archive(library, archivesDirectory)];
    const builds = new Map([["live-module-updates", library]]);
    for (const [name, version] of Object.entries(composedCohort)) {
      const installed = await realpath(join(root, "node_modules", name));
      assert.equal(object(JSON.parse(await readFile(join(installed, "package.json"), "utf8")))["version"], version);
      const stage = join(temporary, "public", name);
      await cp(installed, stage, { recursive: true });
      archives.push(await archive(stage, archivesDirectory)); builds.set(name, stage);
    }
    const build = join(temporary, "build"); await mkdir(build);
    const core = join(build, "core"); await mkdir(core);
    await cp(join(root, oldFixture, "artifact/package.json"), join(core, "package.json"));
    const coreSources = await copySources(join(oldFixture, "core"), join(core, "src"), portableCoreInputs);
    const coreInputs = await compilePackage(core, coreSources, true);
    archives.push(await archive(core, archivesDirectory)); builds.set("@fixture/portable-document", core);
    await install(build, archives);
    const adapter = join(build, "adapter"); await mkdir(adapter);
    await cp(join(root, oldFixture, "adapter/package.json"), join(adapter, "package.json"));
    const adapterSources = await copySources(join(oldFixture, "adapter/src"), join(adapter, "src"), portableAdapterInputs);
    const adapterInputs = await compilePackage(adapter, adapterSources, false);
    archives.push(await archive(adapter, archivesDirectory)); builds.set("@fixture/portable-document-gm", adapter);
    await install(build, archives);
    const composed = join(build, "reference"); await mkdir(composed);
    await cp(join(root, reference, "reference.package.json"), join(composed, "package.json"));
    const reused = await copySources(join(oldFixture, "consumer/author-entry"), join(composed, "src"), summaryInputs, true);
    const owned = await copySources(join(reference, "src"), join(composed, "src"), await sourceFiles(join(root, reference, "src")));
    const referenceInputs = await compilePackage(composed, [...reused, ...owned], false);
    const referenceApplicationInputs = await compileReferenceApplication(composed, [...reused, ...owned]);
    const sourceProfile = await checkComposedSource(composed, [...reused, ...owned].map(item => item.staged), run, owned.map(item => item.staged));
    archives.push(await archive(composed, archivesDirectory)); builds.set("@fixture/composed-document", composed);
    const consumer = join(temporary, "consumer");
    const consumerLockSha256 = await install(consumer, archives);
    assert.equal((await readdir(consumer)).includes("src"), false, "second consumer must contain no build source");
    await verifyInstalled(consumer, archives, builds);
    const consumers = await compileConsumers(consumer);
    const contractControl = await readonlyContract(consumer);
    const consumerQuality = await checkComposedConsumers(consumer, consumers.owned, run);
    const observedArchive = (name: string): string => {
      const entry = archives.find(item => item.name === name); assert.ok(entry); return entry.sha256;
    };
    const author = consumers.sources.find(item => item.source === oldFixture + "/consumer/author-format.ts");
    assert.ok(author);
    const artifactInputs = { coreArchive: observedArchive("@fixture/portable-document"), adapterArchive: observedArchive("@fixture/portable-document-gm"),
      referenceArchive: observedArchive("@fixture/composed-document"), authorSource: author.sha256 };
    for (const item of archives) { await cp(item.path, join(destination, basename(item.path))); }
    await cp(join(consumer, "package-lock.json"), join(destination, "consumer-lock.json"));
    const identities = { source: process.env["QUALIFICATION_SOURCE_SHA"] ?? "local-unpublished", node: process.version,
      compiler: actualCompiler, rootLockSha256: digest(await readFile(join(root, "pnpm-lock.yaml"))), consumerLockSha256,
      cohort: composedCohort, archives: archives.map(({ path, ...item }) => ({ ...item, filename: basename(path) })),
      sourceProfile, consumerQuality, contractControl, artifactInputs,
      sources: [...coreSources, ...adapterSources, ...reused, ...owned, ...consumers.sources].map(item => ({ ...item, staged: relative(temporary, item.staged) })),
      compilerInputs: { lmu: libraryInputs, core: coreInputs, adapter: adapterInputs, reference: referenceInputs,
        referenceApplication: referenceApplicationInputs, consumers: consumers.inputs } };
    await writeFile(join(destination, "identities.json"), JSON.stringify(identities, null, 2) + "\n");
    return { temporary, consumer, destination, identities, archives, artifactInputs, build,
      dispose: () => rm(temporary, { recursive: true, force: true }) };
  } catch (cause) { await rm(temporary, { recursive: true, force: true }); throw cause; }
}
