import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import type { EfCaseName, EfFixtureInput } from "./ef-contract.ts";
import { prepareEfPackageFixture } from "./ef-package-fixture.ts";
import { changeSignature, createEfRegistry, nativeReleases, runNative, selectedRegistryTools, sha256 } from "./ef-registry.ts";
import { object } from "./pack-operation.ts";

const consumerFiles = ["ef-contract.ts", "ef-document.ts", "ef-host.ts", "ef-consumer.ts",
  "host-contract.ts", "native-node-authority.ts", "generation-composition.ts"];

async function runCase(consumer: string, input: EfFixtureInput, name: EfCaseName): Promise<Record<string, unknown>> {
  // Each case has its own native process/module cache. The signed source is never imported by this runner.
  const program = 'import { runEfConsumer } from "./out/ef-consumer.js";\n'
    + "console.log(JSON.stringify(await runEfConsumer(" + JSON.stringify(input) + ", " + JSON.stringify(name) + ")));\n";
  await writeFile(join(consumer, "ef-entry.mjs"), program);
  const execution = await runNative(process.execPath, ["ef-entry.mjs"], { cwd: consumer, timeout: 60_000, maxBuffer: 2 * 1024 * 1024 });
  const result = object(JSON.parse(execution.stdout));
  assert.equal(result["name"], name); assert.equal(result["outcome"], "passed");
  return result;
}

await test("qualified EF bytes become one useful installed LMU generation in a native Node Host", { timeout: 240_000 }, async context => {
  assert.equal(process.platform, "linux", "the declared joint profile is native Linux x64");
  assert.equal(process.arch, "x64");
  const directory = process.env["EF_ARTIFACT_TOOLS_DIR"];
  assert.ok(directory !== undefined && directory.length > 0, "the producer's pinned real native tools must be installed; no skip or substitute");
  const tools = await selectedRegistryTools(directory);
  const fixture = await prepareEfPackageFixture({ consumerFiles });
  let registry: Awaited<ReturnType<typeof createEfRegistry>> | undefined;
  context.after(async () => {
    // Never remove the publisher's files while its actual native process may still run.
    if (registry !== undefined) { await registry.close(); }
    await fixture.dispose();
  });
  const publisher = join(fixture.temporary, "publisher"); await mkdir(publisher);
  const ownedRegistry = await createEfRegistry(publisher, tools);
  registry = ownedRegistry;
  const source = await readFile(join(fixture.consumer, "out/ef-document.js"), "utf8");
  const good = await ownedRegistry.publish("signed-document", source);
  const nativeTools = { oras: tools.oras, cosign: tools.cosign };
  const rows: Record<string, unknown>[] = [];
  for (const name of ["signed-overlap", "tampered-signature", "revoked-evaluation", "closed-before-evaluation"] as const) {
    await context.test(name, async () => {
      rows.push(await runCase(fixture.consumer, { tools: nativeTools, artifact: name === "tampered-signature" ? changeSignature(good) : good }, name));
    });
  }
  await context.test("tampered-bytes", async () => {
    const path = await ownedRegistry.moduleBlob(good);
    const original = await readFile(path);
    const changed = Buffer.from(original);
    assert.ok(changed.length > 0); changed[0] = (changed[0] ?? 0) ^ 1;
    assert.notEqual(sha256(changed), sha256(original)); assert.equal(changed.length, original.length);
    try {
      await writeFile(path, changed);
      rows.push(await runCase(fixture.consumer, { tools: nativeTools, artifact: good }, "tampered-bytes"));
    } finally { await writeFile(path, original); }
  });
  assert.equal(rows.length, 5, "every signed/refusal case must finish after actual native setup");
  await ownedRegistry.close();
  await writeFile(join(fixture.destination, "node.json"), JSON.stringify({ ...fixture.identities,
    profile: "trusted-self-contained-esm/cooperative-operation-v1/linux-x64", tools: nativeReleases,
    artifact: { repository: good.repository, digest: good.digest, executableSha256: sha256(source),
      signatureSha256: sha256(Buffer.from(good.signatureBytes)), publisher: good.trustedPublisher.id,
      publisherKeyDigest: good.trustedPublisher.keyDigest, expected: good.expected }, rows,
    lifetime: "Fresh process per case; Node ESM cache remains process-owned until exit; no module unload claim",
  }, null, 2) + "\n");
  context.diagnostic("Actual signed EF archive join: five native cases passed on " + process.version + "; no producer admission claim issued by this fixture");
});
