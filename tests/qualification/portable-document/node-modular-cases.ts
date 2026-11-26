import assert, { AssertionError } from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, open, readFile, readdir, readlink, rm, writeFile, type FileHandle } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { test } from "node:test";
import { setImmediate as turn } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import type { packModularConsumer } from "./pack-modular.ts";
import { assertConstructionTrace, constructionOrderingFailure, constructionTrace } from "./construction-controls.ts";
import type { ConstructionObservation } from "./consumer/construction-probe.ts";

type Packed = Awaited<ReturnType<typeof packModularConsumer>>;
interface Snapshot { readonly revision: number; readonly text: string }
interface Report { readonly settled: boolean; readonly complete: boolean; readonly debts: readonly unknown[] }
interface Provider { readonly implementationId: string; readonly create: () => {
  readonly title: (revision: number) => string; readonly body: (text: string) => string;
} }
interface Hooks {
  readonly wait?: (signal: AbortSignal) => Promise<"ready" | "cancelled">;
  readonly afterAcquire?: (signal: AbortSignal) => Promise<void>; readonly beforeRelease?: () => Promise<void>;
}
interface Session {
  query(): Snapshot; edit(revision: number, text: string): unknown; publish(): Promise<unknown>;
  close(): Promise<Report>; pending(): number; isOpen(): boolean;
}
interface Owner {
  current(): Session; restart(provider: Provider, hooks?: Hooks): Promise<{ readonly status: string; readonly report?: Report }>;
  revoke(): void; dispose(): Promise<void>; stages(): readonly string[];
  readonly root: string; readonly stateFile: string; readonly exportsFile: string;
}
interface Providers { readonly plainFormatProvider: Provider; readonly markedFormatProvider: Provider; readonly authorFormatProvider: Provider }
const complete = { complete: true, settled: true, debts: [] };
const saved = { revision: 1, text: "reviewed draft" };
const barrier = () => Promise.withResolvers<void>();
const json = async (path: string): Promise<unknown> => JSON.parse(await readFile(path, "utf8"));
const reached = (entered: Promise<void>, raw: Promise<unknown>) => Promise.race([
  entered, raw.then(() => { throw new Error("operation settled before the required barrier"); }),
]);

/** Linux's descriptor table remains observable even after an open file was unlinked. */
async function descriptorsUnder(root: string): Promise<string[]> {
  assert.equal(process.platform, "linux", "this native descriptor profile requires Linux");
  const paths: string[] = [];
  for (const fd of await readdir("/proc/self/fd")) {
    let target: string;
    try { target = (await readlink("/proc/self/fd/" + fd)).replace(/ \(deleted\)$/u, ""); }
    catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") continue;
      throw error;
    }
    if (target === root || target.startsWith(root + sep)) paths.push(target);
  }
  return paths.sort();
}
async function noDescriptors(root: string) {
  assert.deepEqual(await descriptorsUnder(root), [], "native descriptor remains after cleanup");
}
async function closedStages(root: string, paths: readonly string[]) {
  for (const path of paths) assert.equal(existsSync(path), false, "owned stage remains after cleanup");
  assert.deepEqual((await descriptorsUnder(root)).filter(path => paths.includes(path)), [], "closed stage retains a native descriptor");
}
async function liveStages(root: string, paths: readonly string[]) {
  const descriptors = await descriptorsUnder(root);
  for (const path of paths) {
    assert.equal(existsSync(path), true, "raw operation lost its owned stage");
    assert.ok(descriptors.includes(path), "raw operation lost its native descriptor");
  }
}
async function withOwner(packed: Packed, body: (owner: Owner, providers: Providers, borrowed: string) => Promise<void>,
  options: { readonly hooks?: Hooks; readonly provider?: Provider; readonly entry?: string } = {}) {
  const { openNodeModularHost }: { openNodeModularHost: (parent: string, provider: Provider, hooks?: Hooks) => Promise<Owner> } =
    await import(pathToFileURL(join(packed.root, "dist/node", options.entry ?? "node-modular-host.js")).href);
  const providers: Omit<Providers, "authorFormatProvider"> = await import(pathToFileURL(join(packed.adapterRoot, "dist/index.js")).href);
  const author: Pick<Providers, "authorFormatProvider"> = await import(pathToFileURL(join(packed.root, "dist/node/author-format.js")).href);
  const parent = await mkdtemp(join(tmpdir(), "modular-node-case-"));
  const borrowed = join(parent, "borrowed.txt");
  let owner: Owner | undefined;
  try {
    await writeFile(borrowed, "borrowed parent survives");
    owner = await openNodeModularHost(parent, options.provider ?? providers.plainFormatProvider, options.hooks);
    await body(owner, { ...providers, ...author }, borrowed);
  } finally {
    try {
      await owner?.dispose();
      await noDescriptors(parent);
      assert.equal(await readFile(borrowed, "utf8"), "borrowed parent survives");
    } finally { await rm(parent, { recursive: true, force: true }); }
  }
}
function mutateOnce(source: string, anchor: string, replacement: string): string {
  assert.equal(source.split(anchor).length, 2, "compiled mutation target changed");
  return source.replace(anchor, replacement);
}

async function heldDrainCase(packed: Packed, entry = "node-modular-host.js") {
  const entered = barrier(); const release = barrier();
  let cleanupStarted = false; let successorFactories = 0;
  await withOwner(packed, async (owner, providers) => {
    const current = owner.current(); const stages = owner.stages();
    let raw: Promise<unknown> | undefined; let restarting: Promise<unknown> | undefined;
    try {
      raw = current.publish();
      await reached(entered.promise, raw);
      const close = current.close();
      assert.equal(current.close(), close, "close must preserve its original flight");
      restarting = owner.restart({ implementationId: providers.markedFormatProvider.implementationId,
        create: () => { successorFactories += 1; return providers.markedFormatProvider.create(); } });
      await turn();
      assert.equal(cleanupStarted, false, "resource cleanup started before raw operation settlement");
      assert.equal(current.pending(), 1);
      assert.equal(successorFactories, 0, "successor constructed before drain");
      await liveStages(owner.root, stages);
      release.resolve();
      assert.deepEqual(await raw, { status: "rejected", reason: "cancelled" });
      assert.deepEqual(await close, complete);
      assert.deepEqual(await restarting, { status: "started" });
      assert.equal(successorFactories, 1);
      await closedStages(owner.root, stages);
    } finally {
      release.resolve();
      await Promise.allSettled([raw, restarting]);
    }
  }, { entry, hooks: {
    wait: async () => { entered.resolve(); await release.promise; return "ready"; },
    beforeRelease: async () => { cleanupStarted = true; },
  } });
}

async function constructionCase(packed: Packed, signal: AbortSignal, entry = "node-modular-construction.js") {
  const { constructionProbes }: { readonly constructionProbes: readonly { read: () => ConstructionObservation }[] } =
    await import(pathToFileURL(join(packed.root, "dist/node", entry)).href);
  const firstProbe = constructionProbes.length;
  const entered = barrier(); const release = barrier(); const aborted = barrier();
  const unblock = () => { release.resolve(); };
  signal.addEventListener("abort", unblock, { once: true });
  if (signal.aborted) unblock();
  let trace: ReturnType<typeof constructionTrace> | undefined;
  let setupReason: unknown;
  try {
    await withOwner(packed, async (owner, providers) => {
      const a = owner.current();
      assert.deepEqual(a.edit(0, "reviewed draft"), { status: "saved", snapshot: saved });
      let restarting: Promise<unknown> | undefined; let disposing: Promise<void> | undefined;
      try {
        restarting = owner.restart(providers.markedFormatProvider, { afterAcquire: async setupSignal => {
          const observeAbort = () => { setupReason = setupSignal.reason; aborted.resolve(); };
          if (setupSignal.aborted) observeAbort();
          else setupSignal.addEventListener("abort", observeAbort, { once: true });
          entered.resolve();
          await release.promise;
        } });
        await reached(entered.promise, restarting);
        const stages = owner.stages().slice(1);
        assert.equal(stages.length, 1, "B did not acquire its real stage");
        disposing = owner.dispose();
        await reached(aborted.promise, Promise.all([restarting, disposing]));
        await liveStages(owner.root, stages);
        assert.deepEqual(await json(owner.stateFile), saved, "disposal removed borrowed state before construction settled");
        assert.deepEqual(await json(owner.exportsFile), []);
        assert.equal(owner.current(), a, "pending B escaped as a published facade");
        assert.equal(a.isOpen(), false);
        assert.throws(a.query, /closed/);
        assert.deepEqual(a.edit(1, "late"), { status: "rejected", reason: "closed" });
        assert.deepEqual(await a.publish(), { status: "rejected", reason: "closed" });
        release.resolve();
        const failure: unknown = await restarting.then(
          () => { throw new Error("cancelled construction unexpectedly published B"); }, error => error,
        );
        await disposing;
        assert.equal(constructionProbes.length, firstProbe + 2);
        const probe = constructionProbes[firstProbe + 1]; assert.ok(probe);
        const observation = probe.read();
        assert.ok(failure instanceof Error);
        assert.equal(failure.cause, observation.outcome, "Host lost the actual Assembly construction outcome");
        trace = constructionTrace(observation, setupReason);
        assert.equal(owner.current(), a, "cancelled B became current");
        await closedStages(owner.root, stages);
        await noDescriptors(owner.root);
        assert.equal(existsSync(owner.root), false, "explicit disposal left its owned root");
        assert.deepEqual(await a.close(), complete);
      } finally {
        release.resolve();
        await Promise.allSettled([restarting, disposing]);
      }
    }, { entry });
  } finally { release.resolve(); signal.removeEventListener("abort", unblock); }
  assert.ok(trace);
  return trace;
}

export function registerNodeModularCases(getPacked: () => Packed, observations: object[]): void {
  const run = (name: string, body: () => Promise<void>) => {
    void test(name, { timeout: 30000 }, async () => {
      await body(); observations.push({ host: "node-modular", name, passed: true });
    });
  };

  run("N1 native descriptor oracle rejects an unlinked but still open real file", async () => {
    const root = await mkdtemp(join(tmpdir(), "modular-fd-oracle-"));
    const path = join(root, "held"); let handle: FileHandle | undefined;
    try {
      handle = await open(path, "wx+");
      assert.deepEqual(await descriptorsUnder(root), [path]);
      await rm(path);
      assert.equal(existsSync(path), false);
      await assert.rejects(noDescriptors(root), error => error instanceof AssertionError
        && error.message.includes("native descriptor remains after cleanup"));
    } finally {
      try { await handle?.close(); await noDescriptors(root); }
      finally { await rm(root, { recursive: true, force: true }); }
    }
  });

  run("N2 packed A, B and fresh author C preserve borrowed state and revoke saved Host methods", async () => {
    await withOwner(getPacked(), async (owner, providers, borrowed) => {
      const a = owner.current(); const stages = owner.stages();
      const savedQuery = a.query; const savedEdit = a.edit; const savedPublish = a.publish;
      assert.deepEqual(a.edit(0, "  reviewed draft  "), { status: "saved", snapshot: saved });
      assert.deepEqual(await a.publish(), { status: "published", revision: 1, content: "Document r1\nreviewed draft" });
      const close = a.close(); assert.equal(a.close(), close);
      assert.deepEqual(await close, complete);
      await closedStages(owner.root, stages);
      assert.deepEqual(await json(owner.stateFile), saved);
      assert.throws(savedQuery, /closed/);
      assert.deepEqual(savedEdit(1, "late"), { status: "rejected", reason: "closed" });
      assert.deepEqual(await savedPublish(), { status: "rejected", reason: "closed" });
      assert.deepEqual(await owner.restart(providers.markedFormatProvider), { status: "started" });
      assert.deepEqual(owner.current().query(), saved);
      assert.deepEqual(await owner.current().publish(), { status: "published", revision: 1, content: "[Document r1]\n> reviewed draft" });
      assert.deepEqual(await owner.restart(providers.authorFormatProvider), { status: "started" });
      assert.deepEqual(owner.current().query(), saved);
      assert.deepEqual(await owner.current().publish(), { status: "published", revision: 1, content: "Author revision 1\nBy author: reviewed draft" });
      assert.deepEqual(await json(owner.exportsFile), [
        { revision: 1, content: "Document r1\nreviewed draft" },
        { revision: 1, content: "[Document r1]\n> reviewed draft" },
        { revision: 1, content: "Author revision 1\nBy author: reviewed draft" },
      ]);
      assert.equal(await readFile(borrowed, "utf8"), "borrowed parent survives");
    });
  });

  run("N3 held raw work retains its actual file and prevents successor construction", () => heldDrainCase(getPacked()));

  run("N4 cooperative cancellation settles actual pending work before file cleanup", async () => {
    const entered = barrier(); let aborts = 0;
    await withOwner(getPacked(), async owner => {
      const current = owner.current(); const stages = owner.stages();
      const raw = current.publish(); await reached(entered.promise, raw);
      const close = current.close();
      assert.deepEqual(await raw, { status: "rejected", reason: "cancelled" });
      assert.deepEqual(await close, complete);
      assert.equal(aborts, 1); assert.equal(current.pending(), 0);
      await closedStages(owner.root, stages);
    }, { hooks: { wait: signal => new Promise(resolve => {
      const cancelled = () => { aborts += 1; resolve("cancelled"); };
      if (signal.aborted) cancelled();
      else signal.addEventListener("abort", cancelled, { once: true });
      entered.resolve();
    }) } });
  });

  run("N5 pending cleanup prevents B; dispose synchronously seals saved B methods", async () => {
    const entered = barrier(); const release = barrier(); let successors = 0;
    await withOwner(getPacked(), async (owner, providers) => {
      const a = owner.current(); const stages = owner.stages(); let restarting: Promise<unknown> | undefined;
      try {
        const close = a.close(); assert.equal(a.close(), close);
        restarting = owner.restart({ implementationId: providers.markedFormatProvider.implementationId,
          create: () => { successors += 1; return providers.markedFormatProvider.create(); } });
        await reached(entered.promise, close);
        assert.equal(successors, 0); await liveStages(owner.root, stages);
        release.resolve(); assert.deepEqual(await restarting, { status: "started" });
        assert.equal(successors, 1); await closedStages(owner.root, stages);
        const b = owner.current(); const query = b.query; const edit = b.edit; const publish = b.publish;
        const disposing = owner.dispose();
        assert.equal(b.isOpen(), false); assert.throws(query, /closed/);
        assert.deepEqual(edit(0, "late"), { status: "rejected", reason: "closed" });
        assert.deepEqual(await publish(), { status: "rejected", reason: "closed" });
        await disposing;
      } finally { release.resolve(); await Promise.allSettled([restarting]); }
    }, { hooks: { beforeRelease: async () => { entered.resolve(); await release.promise; } } });
  });

  run("N6 cleanup debt retains its report, refuses restart and never silently retries", async () => {
    let cleanups = 0; let successors = 0;
    await withOwner(getPacked(), async (owner, providers) => {
      const a = owner.current(); const stages = owner.stages();
      const close = a.close(); const report = await close;
      assert.equal(report.settled, true); assert.equal(report.complete, false); assert.equal(report.debts.length, 1);
      assert.equal(a.close(), close); assert.equal(await a.close(), report);
      const provider = { implementationId: providers.markedFormatProvider.implementationId,
        create: () => { successors += 1; return providers.markedFormatProvider.create(); } };
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const refusal = await owner.restart(provider);
        assert.equal(refusal.status, "refused"); assert.equal(refusal.report, report);
      }
      assert.equal(cleanups, 1); assert.equal(successors, 0);
      await liveStages(owner.root, stages);
      assert.deepEqual(await json(owner.stateFile), { revision: 0, text: "seed" });
      await owner.dispose();
      await closedStages(owner.root, stages);
      assert.equal(cleanups, 1); assert.equal(report.complete, false);
    }, { hooks: { beforeRelease: async () => { cleanups += 1; throw new Error("requested cleanup failure"); } } });
  });

  run("N7 failed B setup closes its unreturned native file and preserves canonical state", async () => {
    await withOwner(getPacked(), async (owner, providers) => {
      assert.deepEqual(owner.current().edit(0, "reviewed draft"), { status: "saved", snapshot: saved });
      let acquisitions = 0;
      await assert.rejects(owner.restart(providers.markedFormatProvider, { afterAcquire: async () => {
        acquisitions += 1; throw new Error("requested failure after native acquisition");
      } }), /construction failed/);
      assert.equal(acquisitions, 1); assert.equal(owner.stages().length, 2);
      await closedStages(owner.root, owner.stages()); await noDescriptors(owner.root);
      assert.deepEqual(await json(owner.stateFile), saved);
      assert.deepEqual(await json(owner.exportsFile), []);
    });
  });

  for (const reason of ["conflict", "denied"] as const) {
    run("N8 final export receiver refuses " + reason + " after actual asynchronous preparation", async () => {
      const entered = barrier(); const release = barrier();
      await withOwner(getPacked(), async owner => {
        const raw = owner.current().publish();
        try {
          await reached(entered.promise, raw);
          if (reason === "conflict") assert.deepEqual(owner.current().edit(0, "changed"), {
            status: "saved", snapshot: { revision: 1, text: "changed" },
          });
          else owner.revoke();
          release.resolve();
          assert.deepEqual(await raw, { status: "rejected", reason });
          assert.deepEqual(await json(owner.exportsFile), []);
          assert.deepEqual(await json(owner.stateFile), reason === "conflict"
            ? { revision: 1, text: "changed" } : { revision: 0, text: "seed" });
        } finally { release.resolve(); await Promise.allSettled([raw]); }
      }, { hooks: { wait: async () => { entered.resolve(); await release.promise; return "ready"; } } });
    });
  }

  run("N9 reentrant close during Format.title still sees the admitted raw operation", async () => {
    const entered = barrier(); const release = barrier();
    let session: Session | undefined; let close: Promise<Report> | undefined; let cleanup = false;
    const provider: Provider = { implementationId: "fixture/format/reentrant-control", create: () => ({
      title: revision => { assert.ok(session); close = session.close(); return "Document r" + revision; },
      body: text => text,
    }) };
    await withOwner(getPacked(), async owner => {
      session = owner.current(); let raw: Promise<unknown> | undefined;
      try {
        raw = session.publish(); assert.ok(close); assert.equal(session.pending(), 1);
        await reached(entered.promise, raw); await turn();
        assert.equal(cleanup, false, "reentrant close lost the admitted operation");
        await liveStages(owner.root, owner.stages());
        release.resolve(); assert.deepEqual(await raw, { status: "rejected", reason: "cancelled" });
        assert.deepEqual(await close, complete); assert.equal(session.pending(), 0);
        await closedStages(owner.root, owner.stages());
      } finally { release.resolve(); await Promise.allSettled([raw, close]); }
    }, { provider, hooks: {
      wait: async () => { entered.resolve(); await release.promise; return "ready"; },
      beforeRelease: async () => { cleanup = true; },
    } });
  });

  run("N10 actual drain oracle rejects cleanup of a still-held raw operation", async () => {
    const packed = getPacked(); const directory = join(packed.root, "dist/node");
    const helper = join(directory, "invocation-owner-no-drain.js");
    const host = join(directory, "node-modular-host-no-drain.js");
    const mutated = mutateOnce(await readFile(join(directory, "invocation-owner.js"), "utf8"),
      "await Promise.all(retained);", "/* deliberate missing drain */");
    const hostSource = mutateOnce(await readFile(join(directory, "node-modular-host.js"), "utf8"),
      '"./invocation-owner.js"', '"./invocation-owner-no-drain.js"');
    try {
      await writeFile(helper, mutated, { flag: "wx" }); await writeFile(host, hostSource, { flag: "wx" });
      await assert.rejects(heldDrainCase(packed, "node-modular-host-no-drain.js"), error =>
        error instanceof AssertionError && error.message.includes("resource cleanup started before raw operation settlement"));
    } finally { await rm(helper, { force: true }); await rm(host, { force: true }); }
  });

  void test("N11 disposal retains actual construction until cancellation settles", { timeout: 30000 }, async context => {
    const trace = await constructionCase(getPacked(), context.signal);
    observations.push({ host: "node-modular", scenario: "construction", trace });
    assertConstructionTrace(trace, "Node");
  });

  void test("N12 construction oracle rejects omitted custody with cancellation intact", { timeout: 30000 }, async context => {
    await assert.rejects((async () => {
      const trace = await constructionCase(getPacked(), context.signal, "node-modular-construction-no-custody.js");
      observations.push({ host: "node-modular", control: "omit-construction-custody", trace });
      assertConstructionTrace(trace, "Node");
    })(), error => error instanceof AssertionError && error.message.includes(constructionOrderingFailure));
  });
}
