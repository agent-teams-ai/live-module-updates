import assert from "node:assert/strict";
import { lstat, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { digest } from "./pack-operation.ts";

export interface ComposedRunOptions {
  readonly caseName?: string;
  readonly unsafeEffects?: boolean;
  readonly unsafeRemoval?: boolean;
  readonly unsafeParentFirst?: boolean;
  readonly unsafeOmitRelease?: boolean;
}

interface ByteDefect {
  readonly id: string;
  readonly target: "packed-reference-package" | "emitted-test-consumer";
  readonly file: string;
  readonly browserPath: string;
  readonly edits: readonly { readonly marker: string; readonly replacement: string }[];
  readonly caseName: string;
  readonly oracle: string;
  readonly baselineCase: "construction-plain";
}

export const composedByteDefects = Object.freeze([
  Object.freeze({
    id: "wrong-provider-wiring", target: "packed-reference-package",
    file: "node_modules/@fixture/composed-document/dist/composition/closure.js",
    browserPath: "/packages/@fixture/composed-document/composition/closure.js",
    edits: [
      { marker: 'import { documentComposition } from "@fixture/portable-document-gm";',
        replacement: 'import { documentComposition, plainFormatProvider } from "@fixture/portable-document-gm";' },
      { marker: "const base = documentComposition(provider);", replacement: "const base = documentComposition(plainFormatProvider);" },
    ],
    caseName: "construction-marked", oracle: "conformance.wiring.mismatch", baselineCase: "construction-plain",
  }),
  Object.freeze({
    id: "mixed-closure-after-await", target: "emitted-test-consumer",
    file: "out/<target>/generation-owner.js", browserPath: "/out/generation-owner.js",
    edits: [{ marker: "const output = port.body(text);",
      replacement: "const output = bindings.find(value => value.candidate.generationId === environment.authority.observeHead().generationId).provider.create().body(text);" }],
    caseName: "held-whole-closure", oracle: "c.whole-closure-affinity", baselineCase: "construction-plain",
  }),
  Object.freeze({
    id: "plan-only-factory-reuse", target: "emitted-test-consumer",
    file: "out/<target>/generation-owner.js", browserPath: "/out/generation-owner.js",
    edits: [{ marker: "const port = binding.provider.create();", replacement: "const port = bindings[0].provider.create();" }],
    caseName: "same-plan-distinct-factories", oracle: "c.original-factory-binding", baselineCase: "construction-plain",
  }),
] satisfies readonly ByteDefect[]);

export const composedFaultyHosts = Object.freeze([
  Object.freeze({ id: "receiver-permission-bypass", target: "native-host", caseName: "receiver-grant",
    oracle: "c.effect-permission", options: Object.freeze({ unsafeEffects: true }), packageBytes: "unchanged" }),
  Object.freeze({ id: "parent-aborts-before-admission-seal", target: "native-host", caseName: "external-parent-held-shutdown",
    oracle: "c.external-admission-cutoff", options: Object.freeze({ unsafeParentFirst: true }), packageBytes: "unchanged" }),
  Object.freeze({ id: "remove-registration-by-name", target: "native-host", caseName: "held-whole-closure",
    oracle: "c.registration-identity", options: Object.freeze({ unsafeRemoval: true }), packageBytes: "unchanged" }),
  Object.freeze({ id: "omit-owned-native-release", target: "native-host", caseName: "whole-closure-transitions",
    oracle: "c.original-retirement", options: Object.freeze({ unsafeOmitRelease: true }), packageBytes: "unchanged" }),
]);

interface InventoryFile {
  readonly path: string;
  readonly sha256: string;
  readonly bytes: number;
}

/** Only immutable installed/emitted inputs: native data and generated launchers are separate. */
export async function composedInventory(root: string): Promise<readonly InventoryFile[]> {
  const output: InventoryFile[] = [];
  for (const directory of ["node_modules", "out"]) {
    const directoryPath = resolve(root, directory);
    assert.equal(await realpath(directoryPath), directoryPath, "qualification input root must not be a symlink");
    const entries = await readdir(directoryPath, { recursive: true, withFileTypes: true });
    assert.ok(entries.every(entry => entry.isFile() || entry.isDirectory()), "qualification inputs must be ordinary files and directories");
    for (const entry of entries) {
      if (!entry.isFile()) { continue; }
      const path = resolve(entry.parentPath, entry.name);
      const bytes = await readFile(path);
      output.push(Object.freeze({ path: path.slice(root.length + 1).split(sep).join("/"), sha256: digest(bytes), bytes: bytes.length }));
    }
  }
  return output.toSorted((left, right) => left.path.localeCompare(right.path));
}

async function requireIsolatedFile(original: string, copy: string): Promise<void> {
  assert.equal(await realpath(copy), copy, "mutation cannot follow a symbolic link");
  const [source, target] = await Promise.all([lstat(original), lstat(copy)]);
  assert.ok(source.isFile() && target.isFile());
  assert.equal(target.nlink, 1, "mutation cannot edit a shared hard link");
  assert.ok(source.dev !== target.dev || source.ino !== target.ino, "baseline and mutant must be distinct physical files");
}

/** Edits an already copied consumer, never the source checkout or the retained archive. */
export async function createComposedMutant(options: {
  readonly originalConsumer: string;
  readonly mutantConsumer: string;
  readonly platform: "node" | "browser";
  readonly defect: (typeof composedByteDefects)[number];
}) {
  const { defect } = options;
  const originalRoot = await realpath(options.originalConsumer);
  const root = await realpath(options.mutantConsumer);
  assert.equal(root, resolve(options.mutantConsumer));
  assert.ok(root !== originalRoot && !root.startsWith(originalRoot + sep) && !originalRoot.startsWith(root + sep));
  const original = await composedInventory(originalRoot);
  assert.deepEqual(await composedInventory(root), original, "mutant must begin as the exact installed/emitted baseline");
  const file = defect.file.replace("<target>", options.platform);
  const originalFile = resolve(originalRoot, file);
  const mutantFile = resolve(root, file);
  assert.ok(originalFile.startsWith(originalRoot + sep) && mutantFile.startsWith(root + sep) && mutantFile.endsWith(".js"));
  await requireIsolatedFile(originalFile, mutantFile);
  const source = await readFile(originalFile, "utf8");
  let changed = source;
  for (const edit of defect.edits) {
    assert.equal(source.split(edit.marker).length - 1, 1, "exactly one compiled marker required: " + defect.id);
    assert.equal(changed.split(edit.marker).length - 1, 1, "earlier edits cannot change a subsequent marker");
    changed = changed.replace(edit.marker, edit.replacement);
  }
  assert.notEqual(changed, source, "the negative control must change executable bytes");
  await writeFile(mutantFile, changed);
  const mutated = await composedInventory(root);
  assert.deepEqual(mutated.map(value => value.path), original.map(value => value.path));
  const changedFiles = mutated.filter((value, index) => value.sha256 !== original[index]?.sha256).map(value => value.path);
  assert.deepEqual(changedFiles, [file], "only the selected installed/emitted file may change");
  const receipt = Object.freeze({
    defect: defect.id, target: defect.target, caseName: defect.caseName, oracle: defect.oracle, file, browserPath: defect.browserPath,
    edits: defect.edits.map(edit => Object.freeze({ ...edit, markerCount: 1 })),
    originalFileSha256: digest(source), mutatedFileSha256: digest(changed),
    originalInputInventorySha256: digest(JSON.stringify(original)), mutatedInputInventorySha256: digest(JSON.stringify(mutated)),
    changedFiles: Object.freeze(changedFiles),
  });
  async function verifyOriginal(): Promise<void> {
    assert.deepEqual(await composedInventory(originalRoot), original, "execution or mutation changed the read-only baseline");
  }
  async function verifyMutation(): Promise<void> {
    assert.deepEqual(await composedInventory(root), mutated, "execution changed another installed/emitted input");
    await verifyOriginal();
  }
  await verifyOriginal();
  return Object.freeze({ root, file: mutantFile, receipt, verifyOriginal, verifyMutation });
}
