import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { isPromise } from "node:util/types";
import { required } from "@get-modular/core";
import * as A from "@get-modular/assembly";
import * as ACopy from "@research/assembly-copy";
import * as R from "@get-modular/resources";
import * as RCopy from "@research/resources-copy";

const owner = { authority: "research", path: ["identity"] };
const value = A.defineContract<string>()({ id: "research/value", revision: 1 });
interface Values extends A.CapabilitiesOf<typeof value> {}
const declaration = A.declareModule({
  moduleId: "research/value", implementationId: "research/value/default",
  owner, provides: [value.provide()], slots: [],
});
const product = { instance: "ok", capabilities: { "research/value": "ok" } };

function record(value: unknown): asserts value is Record<string, unknown> {
  assert.ok(typeof value === "object" && value !== null);
}
function gate() {
  let release: () => void = () => { throw new Error("uninitialized"); };
  const promise = new Promise<void>(resolve => { release = resolve; });
  return { promise, release: () => release() };
}

test("P5 byte-identical Resources copies reject a foreign scope before executing the factory", { timeout: 15000 }, async t => {
  const original = R.createScope({ name: "original" });
  const duplicate = RCopy.createScope({ name: "duplicate" });
  const signal = new AbortController().signal;
  let calls = 0;
  const originalFactory = R.scoped("m", async () => { calls++; return "original"; });
  const duplicateFactory = RCopy.scoped("m", async () => { calls++; return "duplicate"; });
  try {
    assert.notEqual(R.createScope, RCopy.createScope);
    assert.notEqual(import.meta.resolve("@get-modular/resources"), import.meta.resolve("@research/resources-copy"));
    assert.throws(() => originalFactory(undefined, { signal, scope: duplicate.resources }), { code: "resources.scoped.invalid-run-scope" });
    assert.throws(() => duplicateFactory(undefined, { signal, scope: original.resources }), { code: "resources.scoped.invalid-run-scope" });
    assert.equal(calls, 0);
    assert.equal(await originalFactory(undefined, { signal, scope: original.resources }), "original");
    assert.equal(await duplicateFactory(undefined, { signal, scope: duplicate.resources }), "duplicate");
    assert.equal(calls, 2);
    t.diagnostic(JSON.stringify({ foreignRefusals: 2, bodyCallsBeforeLocalControls: 0, localSuccesses: calls }));
  } finally {
    const reports = await Promise.all([original.control.close(), duplicate.control.close()]);
    assert.ok(reports.every(report => report.complete && report.settled));
  }
});

test("P6 identical Assembly copies do not share authenticated entry identity", { timeout: 15000 }, async t => {
  const foreignValue = ACopy.defineContract<string>()({ id: "research/value", revision: 1 });
  interface ForeignValues extends ACopy.CapabilitiesOf<typeof foreignValue> {}
  const foreignDeclaration = ACopy.declareModule({
    moduleId: "research/value", implementationId: "research/value/default",
    owner, provides: [foreignValue.provide()], slots: [],
  });
  let calls = 0;
  const foreignEntry = ACopy.implement<ForeignValues>()(foreignDeclaration, async () => { calls++; return product; });
  const localEntry = A.implement<Values>()(declaration, async () => { calls++; return product; });
  assert.deepEqual(foreignDeclaration, declaration);
  assert.notEqual(A.implement, ACopy.implement);
  assert.notEqual(import.meta.resolve("@get-modular/assembly"), import.meta.resolve("@research/assembly-copy"));
  // Deliberate runtime misuse control. No type assertion turns the foreign handle into a valid entry.
  const bad: unknown = await Reflect.apply(A.assemblyFor<Values>().prepare, undefined, [{
    profileId: "research/profile", modules: [foreignEntry], roots: { root: foreignEntry },
  }]);
  record(bad);
  assert.equal(bad.status, "failed");
  record(bad.error);
  assert.equal(bad.error.code, "assembly.prepare.handles");
  assert.equal(calls, 0);
  const local = await A.assemblyFor<Values>().prepare({
    profileId: "research/profile", modules: [localEntry], roots: { root: localEntry },
  });
  const foreign = await ACopy.assemblyFor<ForeignValues>().prepare({
    profileId: "research/profile", modules: [foreignEntry], roots: { root: foreignEntry },
  });
  if (local.status !== "prepared" || foreign.status !== "prepared") throw new Error("own-copy control rejected");
  const one = await local.prepared.run();
  const two = await foreign.prepared.run();
  if (one.status !== "succeeded" || two.status !== "succeeded") throw new Error("own-copy construction rejected");
  assert.equal(one.roots.root, "ok");
  assert.equal(two.roots.root, "ok");
  assert.equal(calls, 2);
  t.diagnostic(JSON.stringify({ equalDeclarations: true, foreignError: bad.error.code, ownCopyCalls: calls }));
});

test("P7 unsupported foreign Promise is rejected after factory has run and does not settle its detached work", { timeout: 15000 }, async t => {
  const observed: string[] = [];
  const held: { release?: (() => void) | undefined; actual?: Promise<unknown> } = {};
  const entry = A.implement<Values>()(declaration, () => {
    observed.push("factory-entered");
    // A tiny deliberately foreign-realm syntax fixture. No untrusted code or sandbox claim.
    const foreign: unknown = runInNewContext("new Promise(resolve => hold(() => { effect(); resolve(product); }))", {
      hold: (action: () => void) => { held.release = action; },
      effect: () => { observed.push("late-effect"); },
      product,
    });
    assert.ok(isPromise(foreign));
    assert.notEqual(Object.getPrototypeOf(foreign), Promise.prototype);
    held.actual = foreign;
    // A structural TS Promise type cannot distinguish a realm. This is the negative input.
    return foreign as Promise<typeof product>;
  });
  const prepared = await A.assemblyFor<Values>().prepare({
    profileId: "research/profile", modules: [entry], roots: { root: entry },
  });
  if (prepared.status !== "prepared") throw new Error("prepare rejected before the discriminator");
  try {
    const result = await prepared.prepared.run();
    if (result.status !== "failed") throw new Error("foreign carrier accepted");
    assert.equal(result.code, "assembly.run.unsupported-carrier");
    assert.deepEqual(result.created, []);
    assert.equal(result.returned, undefined);
    assert.deepEqual(observed, ["factory-entered"]);
    assert.ok(held.release);
    assert.ok(held.actual);
    held.release();
    await held.actual;
    held.release = undefined;
    assert.deepEqual(observed, ["factory-entered", "late-effect"]);
    t.diagnostic(JSON.stringify({ error: result.code, created: result.created.length, returned: "absent", observed }));
  } finally {
    held.release?.();
    await held.actual;
  }
});

type Revision = "A" | "B";
type Provider = { readonly read: () => Revision };
type Logic = {
  readonly repeated: (wait: Promise<void>) => Promise<string>;
  readonly snapshot: (wait: Promise<void>) => Promise<string>;
};
const ProviderContract = A.defineContract<Provider>()({ id: "research/provider", revision: 1 });
const LogicContract = A.defineContract<Logic>()({ id: "research/logic", revision: 1 });
interface Host extends A.CapabilitiesOf<typeof ProviderContract | typeof LogicContract> {}
const stableInput = A.input<Host>()(A.declareModule({
  moduleId: "research/provider", implementationId: "research/provider/stable",
  owner, provides: [ProviderContract.provide()], slots: [],
}));

test("P8 same borrowed provider reference does not pin mutable semantic revision", { timeout: 15000 }, async t => {
  let revision: Revision = "A";
  const provider: Provider = { read: () => revision };
  async function construct(version: Revision) {
    const d = A.declareModule({
      moduleId: "research/logic", implementationId: "research/logic/" + version.toLowerCase(),
      owner, provides: [LogicContract.provide()], slots: [ProviderContract.slot("provider", required())],
    });
    const entry = A.implement<Host>()(d, async deps => {
      const instance: Logic = {
        async repeated(wait) {
          const first = deps.provider.read();
          await wait;
          return first + "/" + deps.provider.read();
        },
        async snapshot(wait) {
          const saved = deps.provider.read();
          await wait;
          return saved + "/" + saved;
        },
      };
      return { instance, capabilities: { "research/logic": instance } };
    });
    const p = await A.assemblyFor<Host>().prepare({
      profileId: "research/profile", modules: [entry], roots: { logic: entry }, inputs: { stable: stableInput },
    });
    if (p.status !== "prepared") throw new Error("prepare rejected");
    const r = await p.prepared.run({ inputs: { stable: { "research/provider": provider } } });
    if (r.status !== "succeeded") throw new Error("construction rejected");
    return r.roots.logic;
  }
  const a = await construct("A");
  const pause = gate();
  const oldRepeated = a.repeated(pause.promise);
  const oldSnapshot = a.snapshot(pause.promise);
  try {
    revision = "B";
    const b = await construct("B");
    const current = await b.repeated(Promise.resolve());
    assert.equal(current, "B/B");
    pause.release();
    const mixed = await oldRepeated;
    const retained = await oldSnapshot;
    assert.equal(mixed, "A/B");
    assert.equal(retained, "A/A");
    t.diagnostic(JSON.stringify({ repeatedReads: mixed, oneSnapshot: retained, successor: current }));
  } finally {
    pause.release();
    await Promise.allSettled([oldRepeated, oldSnapshot]);
  }
});
