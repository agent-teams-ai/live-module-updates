import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import test from "node:test";
import { contractVarianceRejections } from "./contract-variance-cases.ts";
import { compiler, compilerVersion, digest, evidence, object, pack, root, run } from "./pack-operation.ts";

async function qualifyContractVariance(consumer: string) {
  const filenames: string[] = [];
  for (const specification of contractVarianceRejections) {
    const filename = specification.name + ".ts";
    filenames.push(filename);
    await writeFile(join(consumer, filename), specification.source);
  }
  await writeFile(join(consumer, "tsconfig.variance.json"), JSON.stringify({
    extends: "./tsconfig.json", compilerOptions: { noEmit: true }, include: filenames,
  }));
  const output = run(compiler, ["-p", "tsconfig.variance.json", "--pretty", "false"], consumer, 1);
  const diagnostics = [...output.matchAll(/^([^\r\n]+\.ts)\((\d+),\d+\): error (TS\d+):/gmu)]
    .map(match => ({ filename: match[1], line: Number(match[2]), code: match[3] }));
  assert.equal([...output.matchAll(/error TS\d+:/gu)].length, diagnostics.length, "unmatched compiler diagnostic: " + output);
  assert.deepEqual(diagnostics.toSorted((a, b) => String(a.filename).localeCompare(String(b.filename))),
    contractVarianceRejections.map(specification => ({ filename: specification.name + ".ts", line: specification.line, code: specification.code }))
      .toSorted((a, b) => a.filename.localeCompare(b.filename)), output);
  const semantic: unknown = JSON.parse(run(process.execPath, ["--input-type=module", "-e", [
    'import { describeOutcome } from "./out/contract-variance-cases.js";',
    'console.log(JSON.stringify([',
    'describeOutcome({ status: "returned", generationId: "a", value: { status: "saved", revision: 7 } }),',
    'describeOutcome({ status: "returned", generationId: "a", value: { status: "denied", reason: "read-only" } }),',
    'describeOutcome({ status: "refused", reason: "boundary-closed" }),',
    'describeOutcome({ status: "failed", generationId: "a", cause: new Error("provider failure") })',
    ']));',
  ].join("\n")], consumer));
  assert.deepEqual(semantic, ["saved:7", "denied:read-only", "admission-refused:boundary-closed", "provider-failed"]);
  await writeFile(join(evidence, "contract-variance-diagnostics.txt"), output);
  return { positive: "passed", rejecting: diagnostics, semantic };
}

await test("packed ordinary root and optional Resources entry work in separate artifact-only installations", async () => {
  const actualCompiler = compilerVersion();
  await mkdir(evidence, { recursive: true });
  const temporary = await mkdtemp(join(tmpdir(), "lmu-installed-consumers-"));
  try {
    const artifact = await pack(root, temporary);
    assert.ok(artifact.files.includes("dist/index.js") && artifact.files.includes("dist/index.d.ts"));
    assert.ok(artifact.files.includes("dist/resources.js") && artifact.files.includes("dist/resources.d.ts"));
    assert.ok(artifact.files.includes("dist/testing.js") && artifact.files.includes("dist/testing.d.ts"));
    assert.ok(artifact.files.includes("dist/features/update-operation/application/invocation.js"), "deep-import refusal must address a real private implementation");
    assert.ok(artifact.files.every(path => path.startsWith("dist/") || ["LICENSE", "README.md", "package.json"].includes(path)));
    const peerRoot = await realpath(join(root, "node_modules/@get-modular/resources"));
    const peerStage = join(temporary, "registry-peer");
    // pnpm deduplicates identical .js/.d.ts bytes as hardlinks. npm pack/install
    // does not preserve that hardlink shape; stage unchanged ordinary files.
    await cp(peerRoot, peerStage, { recursive: true });
    const peer = await pack(peerStage, temporary);
    const observations: Record<string, unknown> = {};
    for (const kind of ["ordinary", "resources", "testing"] as const) {
      const consumer = join(temporary, kind);
      await mkdir(consumer);
      const dependencies: Record<string, string> = { "live-module-updates": "file:" + artifact.path };
      if (kind === "resources") { dependencies["@get-modular/resources"] = "file:" + peer.path; }
      await writeFile(join(consumer, "package.json"), JSON.stringify({ name: "lmu-installed-" + kind, private: true, type: "module", dependencies }));
      run("npm", ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund"], consumer);
      const lock = object(JSON.parse(await readFile(join(consumer, "package-lock.json"), "utf8")));
      const packages = object(lock["packages"]);
      assert.deepEqual(Object.keys(packages).toSorted(), ["", ...(kind === "resources" ? ["node_modules/@get-modular/resources"] : []), "node_modules/live-module-updates"]);
      assert.equal(object(packages["node_modules/live-module-updates"])["integrity"], artifact.integrity);
      const installed = join(consumer, "node_modules/live-module-updates");
      for (const path of artifact.files) {
        assert.deepEqual(await readFile(join(installed, path)), await readFile(join(root, path)), "installed bytes differ: " + path);
      }
      const filename = kind === "ordinary" ? "consumer-contract.ts" : "consumer-" + kind + ".ts";
      const imported = kind === "ordinary" ? "../../src/index.ts" : "../../src/" + kind + ".ts";
      const specifier = kind === "ordinary" ? "live-module-updates" : "live-module-updates/" + kind;
      const source = await readFile(join(root, "tests/module", filename), "utf8");
      assert.equal(source.split(imported).length, 2, "consumer needs exactly one deliberate public entry relink");
      await writeFile(join(consumer, filename), source.replace(imported, specifier));
      const sources = [filename];
      if (kind === "ordinary") {
        const contracts = await readFile(join(root, "tests/module/contract-variance-cases.ts"), "utf8");
        assert.equal(contracts.split(imported).length, 2, "contract cases need exactly one public entry relink");
        await writeFile(join(consumer, "contract-variance-cases.ts"), contracts.replace(imported, specifier));
        sources.push("contract-variance-cases.ts");
      }
      await writeFile(join(consumer, "tsconfig.json"), JSON.stringify({
        compilerOptions: { target: "ES2024", module: "NodeNext", moduleResolution: "NodeNext",
          lib: kind === "resources" ? ["ES2024", "ESNext.Disposable", "DOM"] : ["ES2024"], types: [],
          strict: true, noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true, verbatimModuleSyntax: true,
          erasableSyntaxOnly: true, skipLibCheck: false, declaration: true, outDir: "out" },
        include: sources,
      }));
      const listed = run(compiler, ["-p", "tsconfig.json", "--listFiles"], consumer).split(/\r?\n/u).filter(path => path.endsWith(".ts"));
      assert.ok(listed.includes(join(installed, "dist", kind === "ordinary" ? "index.d.ts" : kind + ".d.ts")), "compiler did not consume the installed public declarations");
      assert.deepEqual(listed.filter(path => !path.endsWith(".d.ts")).toSorted(), sources.map(path => join(consumer, path)).toSorted(), "compiler consumed implementation source outside the isolated consumer");
      const functionName = kind === "ordinary" ? "runOrdinaryConsumer" : kind === "resources" ? "runResourcesConsumer" : "runTestingConsumer";
      await writeFile(join(consumer, "run.mjs"), 'import { ' + functionName + ' } from "./out/' + filename.replace(".ts", ".js") + '";\nconsole.log(JSON.stringify(await ' + functionName + '()));\n');
      observations[kind] = JSON.parse(run(process.execPath, ["run.mjs"], consumer));
      if (kind === "ordinary") {
        observations["contracts"] = await qualifyContractVariance(consumer);
        await writeFile(join(consumer, "invalid.ts"), 'import type { UpdateRuntime } from "live-module-updates";\ndeclare const runtime: UpdateRuntime<readonly [number], number>;\nruntime.invoke("wrong");\n');
        await writeFile(join(consumer, "tsconfig.invalid.json"), JSON.stringify({ extends: "./tsconfig.json", compilerOptions: { noEmit: true }, include: ["invalid.ts"] }));
        const negative = run(compiler, ["-p", "tsconfig.invalid.json"], consumer, 1);
        assert.match(negative, /TS2345/u);
        const deep = run(process.execPath, ["--input-type=module", "-e", 'try { await import("live-module-updates/dist/features/update-operation/application/invocation.js"); process.exitCode = 1; } catch (error) { if (error.code !== "ERR_PACKAGE_PATH_NOT_EXPORTED") throw error; }'], consumer);
        assert.equal(deep, "");
      }
      await cp(join(consumer, "package-lock.json"), join(evidence, kind + "-consumer-lock.json"));
    }
    assert.deepEqual(observations["ordinary"], { value: 42, refusedAfterClose: true, releases: 1 });
    assert.deepEqual(observations["resources"], { value: 7, closed: true });
    assert.deepEqual(observations["testing"], {
      names: ["detached-read", "canonical-publication", "original-payload", "stale-head", "stale-basis", "pending-original", "lost-acknowledgement", "immutable-receipt"],
      frozen: true, acquisitionFailurePreserved: true, diagnostic: "lmu.testing.authority.detached-read",
    });
    await cp(artifact.path, join(evidence, basename(artifact.path)));
    await cp(peer.path, join(evidence, basename(peer.path)));
    await writeFile(join(evidence, "packed-consumers.json"), JSON.stringify({
      source: process.env["QUALIFICATION_SOURCE_SHA"] ?? "local-unpublished", node: process.version, compiler: actualCompiler,
      artifact: { filename: basename(artifact.path), sha256: artifact.sha256, integrity: artifact.integrity, files: artifact.files },
      peer: { package: "@get-modular/resources", version: "0.2.2", filename: basename(peer.path), sha256: peer.sha256 },
      rootLockSha256: digest(await readFile(join(root, "pnpm-lock.yaml"))), observations,
    }, null, 2) + "\n");
  } finally { await rm(temporary, { recursive: true, force: true }); }
});
