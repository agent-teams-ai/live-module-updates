import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { glob } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Expand with Node's native glob, not a platform shell that may partially
// expand ** and silently omit adjacent test files. Qualification families own
// their separate tool graphs and do not join this root test invocation.
const root = fileURLToPath(new URL("../", import.meta.url));
const files: string[] = [];
for (const pattern of ["scripts/**/*.test.ts", "tests/features/**/*.test.ts", "tests/module/**/*.test.ts"]) {
  let count = 0;
  for await (const file of glob(pattern, { cwd: root })) { files.push(file); count += 1; }
  assert.ok(count > 0, "maintained test area is empty: " + pattern);
}
const result = spawnSync(process.execPath, ["--test", ...files.toSorted()], { cwd: root, stdio: "inherit", timeout: 600_000 });
assert.equal(result.error, undefined, "native test process could not complete");
assert.equal(result.signal, null, "native test process was interrupted");
process.exitCode = result.status ?? 1;
