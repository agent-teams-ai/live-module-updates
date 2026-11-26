import assert from "node:assert/strict";
import { lstat, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { digest } from "./pack-operation.ts";

export type OperationCaseName =
  | "selection-race" | "held-cohort" | "lost-publication"
  | "receiver-fence" | "registration-identity" | "cleanup-debt";

interface PackedDefect {
  readonly id: string;
  readonly target: "library";
  readonly path: string;
  readonly marker: string;
  readonly replacement: string;
  readonly caseName: OperationCaseName;
  readonly oracle: string;
}

export const packedOperationMutants = Object.freeze([
  Object.freeze({
    id: "split-selection", target: "library",
    path: "dist/features/update-operation/application/invocation.js",
    marker: "return entry.start(args);",
    replacement: "return Promise.resolve().then(() => entry.start(args));",
    caseName: "selection-race", oracle: "b6.selection-affinity",
  }),
  Object.freeze({
    id: "early-release", target: "library",
    path: "dist/features/update-operation/application/generation.js",
    marker: "await this.#drained();",
    replacement: "await Promise.resolve(); // Deliberate defect: skip actual admitted-work drain.",
    caseName: "held-cohort", oracle: "b6.held-native-owner",
  }),
  Object.freeze({
    id: "lost-publication-rejected", target: "library",
    path: "dist/features/update-operation/application/update-operation.js",
    marker: "attempt.publication = Object.freeze({ status: \"unknown\", ...(cause !== undefined ? { cause } : {}) });",
    replacement: "acceptReceipt(coordinator, attempt, { status: \"refused\", reason: \"mutant classified unknown publication as rejection\" });",
    caseName: "lost-publication", oracle: "b6.unknown-custody",
  }),
  Object.freeze({
    id: "discard-original-debt", target: "library",
    path: "dist/features/update-operation/application/generation.js",
    marker: "if (original) {\n            this.#originalAttempt = attempt;\n        }",
    replacement: "this.#originalAttempt = attempt;",
    caseName: "cleanup-debt", oracle: "b6.original-cleanup-debt",
  }),
] satisfies readonly PackedDefect[]);

/** These defects belong to the real receiver/resource adapter, not the LMU package. */
export const faultyHostProfiles = Object.freeze([
  Object.freeze({
    id: "receiver-guard-bypass", target: "native-host", caseName: "receiver-fence", oracle: "b6.receiver-fence",
    options: Object.freeze({ unsafeEffects: true }), packageBytes: "unchanged",
  }),
  Object.freeze({
    id: "stable-name-removal", target: "native-host", caseName: "registration-identity", oracle: "b6.registration-identity",
    options: Object.freeze({ unsafeRemoval: true }), packageBytes: "unchanged",
  }),
]);

interface PackageFile {
  readonly path: string;
  readonly sha256: string;
  readonly bytes: number;
}

export interface PackedMutationReceipt {
  readonly defect: string;
  readonly target: "packed-library-copy";
  readonly caseName: OperationCaseName;
  readonly oracle: string;
  readonly file: string;
  readonly marker: string;
  readonly replacement: string;
  readonly markerCount: 1;
  readonly originalFileSha256: string;
  readonly mutatedFileSha256: string;
  readonly originalPackageInventorySha256: string;
  readonly mutatedPackageInventorySha256: string;
  readonly changedFiles: readonly string[];
}

async function inventory(root: string): Promise<readonly PackageFile[]> {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  assert.ok(entries.every((entry) => entry.isFile() || entry.isDirectory()), "installed package copies must not contain symlinks or special files");
  const paths = entries.filter((entry) => entry.isFile()).map((entry) => resolve(entry.parentPath, entry.name)).toSorted();
  return Promise.all(paths.map(async (path) => {
    const bytes = await readFile(path);
    return Object.freeze({ path: path.slice(root.length + 1).split(sep).join("/"), sha256: digest(bytes), bytes: bytes.length });
  }));
}

async function isolatedFile(source: string, target: string): Promise<void> {
  assert.equal(await realpath(target), target, "mutation target must be a real isolated file, not a symbolic link");
  const [original, copy] = await Promise.all([lstat(source), lstat(target)]);
  assert.ok(original.isFile() && copy.isFile(), "mutation targets must be ordinary package files");
  assert.equal(copy.nlink, 1, "refuse to modify a file linked into another package copy");
  assert.ok(original.dev !== copy.dev || original.ino !== copy.ino, "original and mutant must not share a physical file");
}

/**
 * The caller first creates an isolated complete consumer copy. This helper edits
 * only that copy's installed package; it never repacks or edits the source tarball.
 * Import the mutated copy only after this returns, so an ESM cache cannot conceal it.
 */
export async function createOperationMutant(options: {
  readonly installedPackageRoot: string;
  readonly mutantRoot: string;
  readonly defect: (typeof packedOperationMutants)[number];
}) {
  const { defect } = options;
  const originalRoot = await realpath(options.installedPackageRoot);
  const root = await realpath(options.mutantRoot);
  assert.equal(root, resolve(options.mutantRoot), "mutant package root must not redirect to a shared installation");
  assert.ok(root !== originalRoot && !root.startsWith(originalRoot + sep) && !originalRoot.startsWith(root + sep), "original and mutant package roots must be disjoint");
  const original = await inventory(originalRoot);
  assert.deepEqual(await inventory(root), original, "mutant must start with exactly the clean installed package bytes");
  const sourceFile = resolve(originalRoot, defect.path);
  const mutantFile = resolve(root, defect.path);
  assert.ok(sourceFile.startsWith(originalRoot + sep) && mutantFile.startsWith(root + sep) && mutantFile.endsWith(".js"));
  await isolatedFile(sourceFile, mutantFile);
  const source = await readFile(sourceFile, "utf8");
  const markerCount = source.split(defect.marker).length - 1;
  assert.equal(markerCount, 1, `defect ${defect.id} requires exactly one production marker`);
  const changed = source.replace(defect.marker, defect.replacement);
  assert.notEqual(changed, source, "a deliberate defect must actually change executable bytes");
  await writeFile(mutantFile, changed);
  const mutated = await inventory(root);
  assert.deepEqual(mutated.map((file) => file.path), original.map((file) => file.path), "mutation cannot change the installed inventory");
  const changedFiles = mutated.filter((file, index) => file.sha256 !== original[index]?.sha256).map((file) => file.path);
  assert.deepEqual(changedFiles, [defect.path], "exactly the selected production file must change");
  const receipt: PackedMutationReceipt = Object.freeze({
    defect: defect.id, target: "packed-library-copy", caseName: defect.caseName, oracle: defect.oracle,
    file: defect.path, marker: defect.marker, replacement: defect.replacement, markerCount: 1,
    originalFileSha256: digest(source), mutatedFileSha256: digest(changed),
    originalPackageInventorySha256: digest(JSON.stringify(original)),
    mutatedPackageInventorySha256: digest(JSON.stringify(mutated)), changedFiles: Object.freeze(changedFiles),
  });
  async function verifyOriginal(): Promise<void> {
    assert.deepEqual(await inventory(originalRoot), original, "read-only original package was changed");
  }
  let restored = false;
  async function restore(): Promise<void> {
    await verifyOriginal();
    if (restored) { return; }
    await isolatedFile(sourceFile, mutantFile);
    assert.equal(digest(await readFile(mutantFile)), receipt.mutatedFileSha256, "do not overwrite an independently changed mutant");
    await writeFile(mutantFile, source);
    assert.deepEqual(await inventory(root), original, "restored copy differs from the original installed package");
    restored = true;
  }
  await verifyOriginal();
  return Object.freeze({ root, receipt, verifyOriginal, restore });
}
