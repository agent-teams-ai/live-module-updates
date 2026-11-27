import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { version } from "typescript";

// Assert the compiler that was actually initialized, then verify each owner
// resolves that exact instance. No package-relative dynamic loader is admitted.
const expected = "7.0.2";
const require = createRequire(import.meta.url);
const rootCompiler = require.resolve("typescript");
const foundationOwner = dirname(require.resolve("@agent-teams/engineering-foundation/package.json"));
const stackOwner = dirname(require.resolve("stack-toolchain/package.json"));
assert.equal(version, expected, "root compiler differs from the qualified cohort");
assert.equal(require.resolve("typescript", { paths: [foundationOwner] }), rootCompiler,
  "Foundation does not resolve the initialized root compiler");
assert.equal(require.resolve("typescript", { paths: [stackOwner] }), rootCompiler,
  "Stack does not resolve the initialized root compiler");
process.stdout.write("Root, Foundation and Stack resolve initialized TypeScript " + expected + "\n");
