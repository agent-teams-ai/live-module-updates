import assert from "node:assert/strict";
import { mkdtemp, open, rm, writeFile, type FileHandle } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { required } from "@get-modular/core";
import { assemblyFor, declareModule, defineContract, implement, input, type CapabilitiesOf } from "@get-modular/assembly";
import { createScope, scoped, type ModuleContext } from "@get-modular/resources";

type Version = "A" | "B" | "F";
type Provider = { readonly read: () => Promise<string> };
type Feature = { readonly own: FileHandle; readonly stream: (gate: Promise<void>) => AsyncGenerator<string, void, void> };
const P = defineContract<Provider>()({ id: "research/provider", revision: 1 });
const V = defineContract<Feature>()({ id: "research/feature", revision: 1 });
interface Capabilities extends CapabilitiesOf<typeof P | typeof V> {}
const owner = { authority: "research", path: ["custody"] };
const providerDeclaration = declareModule({
  moduleId: "research/provider", implementationId: "research/provider/stable",
  owner, provides: [P.provide()], slots: [],
});
const borrowed = input<Capabilities>()(providerDeclaration);
const declaration = (version: Version) => declareModule({
  moduleId: "research/feature", implementationId: "research/feature/" + version.toLowerCase(),
  owner, provides: [V.provide()], slots: [P.slot("provider", required())],
});

function gate() {
  let release: () => void = () => { throw new Error("uninitialized gate"); };
  const promise = new Promise<void>(resolve => { release = resolve; });
  return { promise, release: () => { release(); } };
}
async function read(handle: FileHandle): Promise<string> {
  const buffer = Buffer.alloc(64);
  const result = await handle.read(buffer, 0, buffer.length, 0);
  return buffer.subarray(0, result.bytesRead).toString("utf8");
}
async function closed(handle: FileHandle): Promise<void> {
  await assert.rejects(handle.stat(), { code: "EBADF" });
}
function complete(report: { readonly complete: boolean; readonly settled: boolean }): void {
  assert.equal(report.complete, true);
  assert.equal(report.settled, true);
}

async function fixture() {
  const dir = await mkdtemp(join(tmpdir(), "lmu-custody-"));
  const host = createScope({ name: "owner" });
  const handles = new Map<string, FileHandle>();
  const releases: string[] = [];
  try {
    for (const name of ["P", "A", "B", "F"]) await writeFile(join(dir, name), name);
    const stable = await host.resources.setup({
      name: "stable-P",
      setup: () => open(join(dir, "P"), "r"),
      cleanup: async value => { await value.close(); releases.push("P"); },
    });
    const provider: Provider = { read: () => read(stable) };

    async function construct(version: Version) {
      const scope = host.resources.child({ name: version });
      const entry = implement<Capabilities>()(declaration(version), async (deps, { resources }: ModuleContext) => {
        // scoped() creates the module-owned child in the actual per-run scope.
        const handle = await resources.setup({
          name: "native-file",
          setup: () => open(join(dir, version), "r"),
          cleanup: async value => { await value.close(); releases.push(version); },
        });
        handles.set(version, handle);
        if (version === "F") throw new Error("deliberate candidate failure");
        const feature: Feature = {
          own: handle,
          async *stream(wait) {
            yield "start:" + version;
            await wait;
            yield (await read(handle)) + ":" + (await deps.provider.read());
          },
        };
        return { instance: feature, capabilities: { "research/feature": feature } };
      }, scoped);
      const prepared = await assemblyFor<Capabilities>().prepare({
        profileId: "research/profile", modules: [entry], roots: { feature: entry }, inputs: { stable: borrowed },
      });
      if (prepared.status !== "prepared") throw new Error("prepare rejected: " + prepared.error.code);
      const outcome = await prepared.prepared.run({
        scope: scope.resources, inputs: { stable: { "research/provider": provider } },
      });
      assert.equal(outcome.created.some(item => item.implementationId === providerDeclaration.implementationId), false);
      return { scope, outcome };
    }

    async function dispose() {
      try { complete(await host.control.close()); }
      finally { await rm(dir, { recursive: true, force: true }); }
    }
    return { construct, stable, handles, releases, dispose };
  } catch (error) {
    try { await host.control.close(); } finally { await rm(dir, { recursive: true, force: true }); }
    throw error;
  }
}

async function active(f: Awaited<ReturnType<typeof fixture>>, version: "A" | "B") {
  const candidate = await f.construct(version);
  if (candidate.outcome.status !== "succeeded") throw new Error("construction did not succeed");
  return { scope: candidate.scope, feature: candidate.outcome.roots.feature };
}

test("P1 actual A/B streams retain borrowed provider through failed F and owner retirement", { timeout: 15000 }, async () => {
  const f = await fixture();
  const pause = gate();
  let aStream: AsyncGenerator<string, void, void> | undefined;
  try {
    const a = await active(f, "A");
    aStream = a.feature.stream(pause.promise);
    assert.deepEqual(await aStream.next(), { value: "start:A", done: false });
    const b = await active(f, "B");
    const failed = await f.construct("F");
    if (failed.outcome.status !== "failed") throw new Error("candidate unexpectedly succeeded or cancelled");
    assert.equal(failed.outcome.code, "assembly.run.factory-rejected");
    complete(await failed.scope.control.close());
    const fHandle = f.handles.get("F");
    assert.ok(fHandle);
    await closed(fHandle);
    assert.equal(await read(a.feature.own), "A");
    assert.equal(await read(b.feature.own), "B");
    const bStream = b.feature.stream(Promise.resolve());
    assert.deepEqual(await bStream.next(), { value: "start:B", done: false });
    assert.deepEqual(await bStream.next(), { value: "B:P", done: false });
    assert.equal((await bStream.next()).done, true);
    pause.release();
    assert.deepEqual(await aStream.next(), { value: "A:P", done: false });
    assert.equal((await aStream.next()).done, true);
    complete(await a.scope.control.close());
    await closed(a.feature.own);
    assert.equal(await read(b.feature.own), "B");
    assert.equal(await read(f.stable), "P");
    complete(await b.scope.control.close());
    await closed(b.feature.own);
    assert.equal(await read(f.stable), "P");
    assert.deepEqual(f.releases, ["F", "A", "B"]);
  } finally {
    pause.release();
    try { await aStream?.return(undefined); } finally { await f.dispose(); }
  }
  await closed(f.stable);
  assert.deepEqual(f.releases, ["F", "A", "B", "P"]);
});

test("P2 unsafe host close does not drain an unregistered continuation", { timeout: 15000 }, async () => {
  const f = await fixture();
  const pause = gate();
  let stream: AsyncGenerator<string, void, void> | undefined;
  try {
    const a = await active(f, "A");
    stream = a.feature.stream(pause.promise);
    assert.deepEqual(await stream.next(), { value: "start:A", done: false });
    complete(await a.scope.control.close());
    await closed(a.feature.own);
    pause.release();
    await assert.rejects(stream.next(), { code: "EBADF" });
    assert.equal(await read(f.stable), "P");
  } finally {
    pause.release();
    try { await stream?.return(undefined); } finally { await f.dispose(); }
  }
});

test("P3 explicit drain before release; abandon is not closure", { timeout: 15000 }, async () => {
  const f = await fixture();
  const pause = gate();
  const terminal = gate();
  let pending: Promise<string> | undefined;
  try {
    const a = await active(f, "A");
    await a.scope.resources.setup({
      name: "drain-obligation", setup: () => "drain",
      cleanup: async () => { await terminal.promise; },
    });
    pending = (async () => {
      try { await pause.promise; return await read(a.feature.own); }
      finally { terminal.release(); }
    })();
    const abort = new AbortController();
    abort.abort();
    const abandoned = await a.scope.control.close({ abandon: abort.signal });
    assert.equal(abandoned.settled, false);
    assert.equal(abandoned.complete, false);
    assert.equal(await read(a.feature.own), "A");
    const b = await active(f, "B");
    assert.equal(await read(b.feature.own), "B");
    pause.release();
    assert.equal(await pending, "A");
    complete(await a.scope.control.close());
    assert.equal(abandoned.settled, false);
    await closed(a.feature.own);
    assert.equal(await read(b.feature.own), "B");
    assert.equal(await read(f.stable), "P");
  } finally {
    pause.release();
    try { await pending; } finally { terminal.release(); await f.dispose(); }
  }
});

test("P4 public runtime rejects pretending a dependent module is a slot-free input", () => {
  assert.throws(() => Reflect.apply(input<Capabilities>(), undefined, [declaration("A")]),
    { code: "assembly.bind.invalid-declaration" });
});
