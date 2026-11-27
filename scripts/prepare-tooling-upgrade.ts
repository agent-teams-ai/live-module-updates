import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

// Temporary preparation only: exact output bytes are reviewed and committed
// before the ordinary frozen native gates. This helper never writes Git refs.
const source = process.env.GITHUB_SHA;
if (source === undefined || !/^[a-f0-9]{40}$/.test(source)) {
  throw new Error("A concrete preparation source commit is required");
}
const files = [
  "pnpm-lock.yaml",
  "tests/qualification/portable-document/pnpm-lock.yaml",
  "architecture/foundation/source-topology.json",
];
const inputs = [
  "package.json", "pnpm-workspace.yaml",
  "tests/qualification/portable-document/package.json",
  "tests/qualification/portable-document/pnpm-workspace.yaml",
  "foundation.config.yaml", "architecture/feature-module-profile.json",
  "architecture/foundation/source-coverage.yaml", "toolchain.config.json",
  "scripts/check-quality-topology.ts", "scripts/prepare-tooling-upgrade.ts",
  ".github/workflows/tooling-upgrade-preparation.yml",
];
const sha256 = (bytes: Uint8Array): string =>
  createHash("sha256").update(bytes).digest("hex");
console.log("LMU_PREPARED_BEGIN " + JSON.stringify({
  schemaVersion: 1, source, node: process.version,
  inputs: inputs.map(path => ({ path, sha256: sha256(readFileSync(path)) })),
}));
for (const path of files) {
  const bytes = readFileSync(path);
  const header = Buffer.from("blob " + bytes.length + "\0");
  const blob = createHash("sha1").update(header).update(bytes).digest("hex");
  const encoded = bytes.toString("base64");
  const chunks = Math.ceil(encoded.length / 4096);
  console.log("LMU_PREPARED_FILE " + JSON.stringify({
    path, bytes: bytes.length, sha256: sha256(bytes), blob, chunks,
  }));
  for (let index = 0; index < chunks; index++) {
    console.log("LMU_PREPARED_CHUNK " + JSON.stringify({
      path, index, data: encoded.slice(index * 4096, (index + 1) * 4096),
    }));
  }
}
console.log("LMU_PREPARED_END");
