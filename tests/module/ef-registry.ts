import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { createHash, createPublicKey } from "node:crypto";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { isAbsolute, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { promisify } from "node:util";
import type { Sha256 } from "@extension-foundation/node-artifact";
import { artifactContract, type RegistryTools, type SignedArtifact } from "./ef-contract.ts";

export const runNative = promisify(execFile);
export const sha256 = (value: Uint8Array | string): Sha256 => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/** The producer's selected Linux x64 executables; its pinned installer provisions them. */
export const nativeReleases = Object.freeze({
  oras: { version: "1.4.0", digest: "sha256:d1aea546c0f929151358925ff7b9693ea9c5ec9c13881ce13bcc71484a561ecd" },
  cosign: { version: "3.1.6", digest: "sha256:318a99ade4156a0c4113aa983b46c0a0830fa7896a096c63121ee47b610a94c6" },
  registry: { version: "3.1.2", digest: "sha256:7f9e0df42bd028efb1a11eb7f92ef494156bf308770303a256d3acdcadb378cd" },
});

export async function selectedRegistryTools(directory: string): Promise<RegistryTools> {
  assert.ok(isAbsolute(directory), "EF_ARTIFACT_TOOLS_DIR must name the actual producer-installed tools");
  const select = async (name: keyof typeof nativeReleases) => {
    const path = join(directory, name);
    const metadata = await lstat(path);
    assert.ok(metadata.isFile() && !metadata.isSymbolicLink(), "missing or aliased native tool: " + name);
    const digest = sha256(await readFile(path));
    assert.equal(digest, nativeReleases[name].digest, "wrong native executable bytes: " + name);
    return { path, digest };
  };
  return { oras: await select("oras"), cosign: await select("cosign"), registry: await select("registry") };
}

async function freePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const address = server.address();
  assert.ok(address !== null && typeof address !== "string");
  await new Promise<void>((resolve, reject) => {
    server.close(cause => { if (cause !== undefined) { reject(cause); } else { resolve(); } });
  });
  return address.port;
}

async function startRegistry(directory: string, tools: RegistryTools) {
  const storage = join(directory, "registry");
  const config = join(directory, "registry.yaml");
  const registryConfig = join(directory, "registry-auth.json");
  const port = await freePort();
  await mkdir(storage);
  await writeFile(registryConfig, JSON.stringify({ auths: {} }), { mode: 0o600 });
  await writeFile(config, "version: 0.1\nlog:\n  level: error\nstorage:\n  filesystem:\n    rootdirectory: "
    + JSON.stringify(storage) + "\nhttp:\n  addr: 127.0.0.1:" + port + "\n");
  const child = spawn(tools.registry.path, ["serve", config], { stdio: ["ignore", "pipe", "pipe"] });
  let ended = false;
  let spawnError: Error | undefined;
  let output = "";
  const capture = (value: Buffer) => { output = (output + value.toString("utf8")).slice(-4096); };
  child.stdout.on("data", capture); child.stderr.on("data", capture);
  const closed = new Promise<void>(resolve => {
    child.once("error", cause => { spawnError = cause; });
    child.once("close", () => { ended = true; resolve(); });
  });
  const close = async (): Promise<void> => {
    if (ended) { return; }
    child.kill("SIGTERM");
    const stopped = await Promise.race([closed.then(() => true), delay(3000, false, { ref: false })]);
    if (!stopped) { child.kill("SIGKILL"); await closed; }
    assert.ok(ended, "registry process must actually terminate before removing its files");
  };
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      assert.equal(ended, false, "registry exited before startup: " + output);
      assert.equal(spawnError, undefined, "registry spawn failed: " + output);
      ready = await fetch("http://127.0.0.1:" + port + "/v2/", { signal: AbortSignal.timeout(1000) })
        .then(response => response.status === 200, () => false);
      if (ready) { break; }
      await delay(50);
    }
    assert.ok(ready, "registry startup deadline: " + output);
    return { storage, registryConfig, repository: "127.0.0.1:" + port + "/lmu-document", close };
  } catch (cause) {
    const failures = [cause];
    try { await close(); } catch (cleanup) { failures.push(cleanup); }
    if (failures.length > 1) { throw new AggregateError(failures, "registry startup and cleanup failed", { cause }); }
    throw cause;
  }
}

async function createPublisher(directory: string, tools: RegistryTools) {
  const keyPrefix = join(directory, "publisher");
  const signing = join(directory, "signing.json");
  await runNative(tools.cosign.path, ["generate-key-pair", "--output-key-prefix", keyPrefix], {
    timeout: 30_000, maxBuffer: 1024 * 1024, env: { ...process.env, COSIGN_PASSWORD: "" },
  });
  await runNative(tools.cosign.path, ["signing-config", "create", "--out", signing], { timeout: 30_000 });
  const publicKeyPem = await readFile(keyPrefix + ".pub", "utf8");
  return { keyPrefix, signing, trustedPublisher: { id: "publisher/lmu-joint-fixture", publicKeyPem,
    keyDigest: sha256(createPublicKey(publicKeyPem).export({ type: "spki", format: "der" })) } };
}

/** Native fixture provisioning only; all verification/evaluation remains in the installed EF package. */
export async function createEfRegistry(directory: string, tools: RegistryTools) {
  const registry = await startRegistry(directory, tools);
  try {
    const publisher = await createPublisher(directory, tools);
    const flags = ["--plain-http", "--registry-config", registry.registryConfig];
    const blobPath = (digest: string): string => {
      assert.match(digest, /^sha256:[a-f0-9]{64}$/u);
      const hex = digest.slice(7);
      return join(registry.storage, "docker/registry/v2/blobs/sha256", hex.slice(0, 2), hex, "data");
    };
    const publish = async (name: string, source: string): Promise<SignedArtifact> => {
      assert.match(name, /^[a-z][a-z0-9-]*$/u);
      const candidate = join(directory, name);
      await mkdir(candidate);
      await writeFile(join(candidate, "entry.mjs"), source);
      const annotations = { ...artifactContract, revision: String(artifactContract.revision),
        publisher: publisher.trustedPublisher.id, entry: "entry.mjs" };
      await runNative(tools.oras.path, ["push", ...flags, "--artifact-type", "application/vnd.extension-foundation.esm-bundle.v1",
        ...Object.entries(annotations).flatMap(([key, value]) => ["--annotation", "dev.extension-foundation." + key + "=" + value]),
        registry.repository + ":" + name, "entry.mjs:text/javascript"], { cwd: candidate, timeout: 30_000, maxBuffer: 1024 * 1024 });
      const resolved = await runNative(tools.oras.path, ["resolve", ...flags, registry.repository + ":" + name], { timeout: 30_000 });
      const identity = resolved.stdout.trim(); assert.match(identity, /^sha256:[a-f0-9]{64}$/u);
      const fetched = await runNative(tools.oras.path, ["manifest", "fetch", ...flags, registry.repository + "@" + identity],
        { timeout: 30_000, encoding: "buffer" });
      const digest = sha256(fetched.stdout); assert.equal(digest, identity);
      const manifest = join(candidate, "manifest.json"); const bundle = join(candidate, "signature.json");
      await writeFile(manifest, fetched.stdout);
      await runNative(tools.cosign.path, ["sign-blob", "--yes", "--key", publisher.keyPrefix + ".key", "--signing-config", publisher.signing,
        "--bundle", bundle, manifest], { timeout: 30_000, maxBuffer: 1024 * 1024, env: { ...process.env, COSIGN_PASSWORD: "" } });
      return { repository: registry.repository, digest, transport: "loopback-http", registryConfig: registry.registryConfig,
        signatureBytes: [...await readFile(bundle)], trustedPublisher: publisher.trustedPublisher, expected: artifactContract };
    };
    const moduleBlob = async (artifact: SignedArtifact): Promise<string> => {
      const parsed: unknown = JSON.parse(await readFile(blobPath(artifact.digest), "utf8"));
      assert.ok(isRecord(parsed) && Array.isArray(parsed["layers"]));
      const layers: readonly unknown[] = parsed["layers"];
      assert.equal(layers.length, 1, "the signed document fixture has one executable layer");
      const entry = layers[0];
      assert.ok(isRecord(entry) && typeof entry["digest"] === "string");
      return blobPath(entry["digest"]);
    };
    return { publish, moduleBlob, close: registry.close };
  } catch (cause) {
    const failures = [cause];
    try { await registry.close(); } catch (cleanup) { failures.push(cleanup); }
    if (failures.length > 1) { throw new AggregateError(failures, "publisher setup and registry cleanup failed", { cause }); }
    throw cause;
  }
}

export function changeSignature(artifact: SignedArtifact): SignedArtifact {
  const bundle: unknown = JSON.parse(Buffer.from(artifact.signatureBytes).toString("utf8"));
  assert.ok(isRecord(bundle) && isRecord(bundle["messageSignature"]) && typeof bundle["messageSignature"]["signature"] === "string");
  const signature = bundle["messageSignature"]["signature"];
  const changed = { ...bundle, messageSignature: { ...bundle["messageSignature"],
    signature: (signature.startsWith("A") ? "B" : "A") + signature.slice(1) } };
  return { ...artifact, signatureBytes: [...Buffer.from(JSON.stringify(changed))] };
}
