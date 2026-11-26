import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../../", import.meta.url));
export const evidence = join(root, ".qualification/evidence");
export const compiler = join(root, "node_modules/.bin/tsc");
export const digest = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");

export function run(command: string, args: readonly string[], cwd: string, status = 0): string {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", timeout: 60_000, maxBuffer: 2 * 1024 * 1024 });
  assert.equal(result.error, undefined);
  assert.equal(result.signal, null);
  assert.equal(result.status, status, result.stdout + result.stderr);
  return result.stdout;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function object(value: unknown): Record<string, unknown> {
  assert.ok(isRecord(value));
  return value;
}
export async function pack(directory: string, destination: string) {
  const output: unknown = JSON.parse(run("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", destination], directory));
  assert.ok(Array.isArray(output) && output.length === 1);
  const item = object(output[0]);
  const filename = item["filename"];
  assert.ok(typeof filename === "string" && filename === basename(filename));
  assert.ok(Array.isArray(item["files"]));
  const files = item["files"].map((entry: unknown) => {
    const path = object(entry)["path"];
    assert.ok(typeof path === "string");
    return path;
  }).toSorted();
  const path = join(destination, filename);
  const bytes = await readFile(path);
  assert.equal(item["integrity"], "sha512-" + createHash("sha512").update(bytes).digest("base64"));
  return { path, files, sha256: digest(bytes), integrity: item["integrity"] };
}


export function compilerVersion(): string {
  const actual = run(compiler, ["--version"], root).trim();
  assert.equal(actual, "Version 7.0.2", "installed compiler differs from the qualified cohort");
  return actual.slice("Version ".length);
}
