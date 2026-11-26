import assert, { AssertionError } from "node:assert/strict";
import { createServer } from "node:http";
import { test } from "node:test";
import { chromium, type Browser, type BrowserContext } from "playwright";
import { sha256 } from "./pack-consumer.ts";
import type { packModularConsumer } from "./pack-modular.ts";

type Packed = Awaited<ReturnType<typeof packModularConsumer>>;
type Scenario = "normal" | "held" | "cooperative" | "pending-cleanup" | "debt" | "partial"
  | "conflict" | "denied" | "reentrant";
interface Report { readonly settled: boolean; readonly complete: boolean; readonly debts: readonly unknown[] }
interface Provider { readonly implementationId: string; readonly create: () => {
  readonly title: (revision: number) => string; readonly body: (text: string) => string;
} }
interface Hooks {
  readonly wait?: (signal: AbortSignal) => Promise<"ready" | "cancelled">;
  readonly afterAcquire?: () => Promise<void>; readonly beforeRelease?: () => Promise<void>;
}
interface Session {
  query(): unknown; edit(revision: number, text: string): unknown; publish(): Promise<unknown>;
  close(): Promise<Report>; pending(): number; isOpen(): boolean;
}
interface Owner {
  current(): Session; restart(provider: Provider, hooks?: Hooks): Promise<{ readonly status: string; readonly report?: Report }>;
  revoke(): void; dispose(): Promise<void>; stages(): readonly string[];
  readonly root: HTMLElement; readonly output: HTMLOutputElement;
  readonly stateKey: string; readonly exportsKey: string;
}
const runtimeNames = ["@fixture/portable-document", "@fixture/portable-document-gm",
  "@get-modular/core", "@get-modular/assembly", "@get-modular/resources"] as const;
const hostPath = "/hosts/dist/browser/browser-modular-host.js";
const adapterPath = "/packages/@fixture/portable-document-gm/dist/index.js";
const imports = Object.fromEntries(runtimeNames.map(name => [name, "/packages/" + name + "/dist/index.js"]));
const html = '<!doctype html><meta charset="utf-8"><title>Modular document Host</title>'
  + '<script type="importmap">' + JSON.stringify({ imports }) + '</script>';
const complete = { complete: true, settled: true, debts: [] };
const saved = { revision: 1, text: "reviewed draft" };
const closed = { status: "rejected", reason: "closed" };
const cancelled = { status: "rejected", reason: "cancelled" };

async function browserCase(browser: Browser, packed: Packed, scenario: Scenario, omitListenerCleanup = false) {
  const assets = new Map(packed.assets);
  if (omitListenerCleanup) {
    const original = assets.get(hostPath); assert.ok(original);
    const source = original.toString("utf8");
    const anchor = 'button.removeEventListener("click", onExport);';
    assert.equal(source.split(anchor).length, 2, "compiled listener mutation target changed");
    assets.set(hostPath, Buffer.from(source.replace(anchor, "/* deliberate omitted listener cleanup */")));
  }
  const server = createServer((request, response) => {
    const path = request.url ?? "";
    const body = path === "/" ? html : assets.get(path);
    if (body === undefined) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { "Content-Type": path === "/" ? "text/html; charset=utf-8" : "text/javascript; charset=utf-8", "Cache-Control": "no-store" });
    response.end(body);
  });
  await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  let context: BrowserContext | undefined;
  try {
    const address = server.address(); assert.ok(address && typeof address === "object");
    context = await browser.newContext();
    const page = await context.newPage();
    const errors: string[] = []; const responses: Promise<void>[] = []; const requested = new Set<string>();
    page.on("pageerror", error => { errors.push(error.message); });
    page.on("response", response => {
      const path = new URL(response.url()).pathname;
      const expected = assets.get(path);
      if (!expected) return;
      requested.add(path);
      responses.push(response.body().then(bytes => {
        assert.equal(response.status(), 200, "runtime asset HTTP status");
        assert.equal(sha256(bytes), sha256(expected), "browser received changed artifact: " + path);
      }));
    });
    await page.goto(`http://127.0.0.1:${address.port}/`);
    // The real browser imports independently compiled Host declarations and installed
    // public roots. These small test-facing interfaces do not import fixture source.
    const values: unknown[] = await page.evaluate(async ({ scenario, hostPath, adapterPath }) => {
      const hostModule: { openBrowserModularHost: (provider: Provider, hooks?: Hooks) => Promise<Owner> } = await import(hostPath);
      const providers: { plainFormatProvider: Provider; markedFormatProvider: Provider } = await import(adapterPath);
      const authorPath = "/hosts/dist/browser/author-format.js";
      const author: { authorFormatProvider: Provider } = await import(authorPath);
      const entered = Promise.withResolvers<void>(); const release = Promise.withResolvers<void>();
      const cleanupEntered = Promise.withResolvers<void>(); const cleanupRelease = Promise.withResolvers<void>();
      let cleanupCalls = 0; let successorFactories = 0; let aborts = 0;
      let session: Session | undefined; let reentrantClose: Promise<Report> | undefined;
      let capturedSignal: AbortSignal | undefined;
      const hooks: Hooks = {
        wait: async signal => {
          capturedSignal = signal; entered.resolve();
          if (scenario === "cooperative") return new Promise<"cancelled">(resolve => {
            const cancelled = () => { aborts += 1; resolve("cancelled"); };
            if (signal.aborted) cancelled();
            else signal.addEventListener("abort", cancelled, { once: true });
          });
          if (["held", "conflict", "denied", "reentrant"].includes(scenario)) await release.promise;
          return "ready";
        },
        beforeRelease: async () => {
          cleanupCalls += 1; cleanupEntered.resolve();
          if (scenario === "pending-cleanup") await cleanupRelease.promise;
          if (scenario === "debt") throw new Error("requested browser cleanup failure");
        },
      };
      const selected: Provider = scenario === "reentrant" ? {
        implementationId: "fixture/format/reentrant-control",
        create: () => ({ title: revision => {
          if (!session) throw new Error("missing reentrant session");
          reentrantClose = session.close(); return "Document r" + revision;
        }, body: text => text }),
      } : providers.plainFormatProvider;
      const owner = await hostModule.openBrowserModularHost(selected, hooks);
      session = owner.current();
      const a = session;
      const originalButton = owner.root.querySelector("[data-modular-export]");
      if (!(originalButton instanceof HTMLButtonElement)) throw new Error("missing real export action");
      const next: Provider = { implementationId: providers.markedFormatProvider.implementationId,
        create: () => { successorFactories += 1; return providers.markedFormatProvider.create(); } };
      const readState = (): unknown => JSON.parse(localStorage.getItem(owner.stateKey) ?? "null");
      const readExports = (): unknown => JSON.parse(localStorage.getItem(owner.exportsKey) ?? "null");
      const allStagesRemoved = () => owner.stages().every(id => document.getElementById(id) === null);
      const queryClosed = (query: () => unknown) => {
        try { query(); return false; } catch (error) { return error instanceof Error && error.message.includes("closed"); }
      };
      const domExport = () => new Promise<unknown>((resolve, reject) => {
        const button = owner.root.querySelector("[data-modular-export]");
        if (!(button instanceof HTMLButtonElement)) { reject(new Error("missing current export action")); return; }
        owner.output.value = "waiting for native action";
        const observer = new MutationObserver(() => {
          observer.disconnect();
          try { resolve(JSON.parse(owner.output.value)); } catch (error) { reject(error); }
        });
        observer.observe(owner.output, { childList: true, subtree: true, characterData: true });
        button.click();
      });
      const reached = (barrier: Promise<void>, work: Promise<unknown>) => Promise.race([
        barrier, work.then(() => { throw new Error("operation settled before required browser barrier"); }),
      ]);
      let raw: Promise<unknown> | undefined; let restarting: Promise<unknown> | undefined;
      try {
        if (scenario === "normal") {
          const query = a.query; const edit = a.edit; const publish = a.publish;
          const editResult = a.edit(0, "  reviewed draft  ");
          const first = await domExport(); const prepared = originalButton.dataset["prepared"];
          const switched = await owner.restart(next);
          const afterA = { state: readState(), removed: !originalButton.isConnected,
            queryClosed: queryClosed(query), edit: edit(1, "late"), publish: await publish() };
          owner.output.value = "retired action marker"; originalButton.click();
          // A leaked listener resolves its guarded dispatch on this microtask turn.
          await publish(); const retiredOutput = owner.output.value;
          const second = await domExport();
          const toC = await owner.restart(author.authorFormatProvider);
          const third = await domExport(); const state = owner.current().query(); const receipts = readExports();
          const c = owner.current(); const savedQuery = c.query; const savedEdit = c.edit; const savedPublish = c.publish;
          const disposing = owner.dispose();
          const closedSynchronously = [c.isOpen(), queryClosed(savedQuery), savedEdit(1, "late"), await savedPublish()];
          await disposing;
          return [retiredOutput, editResult, first, JSON.parse(prepared ?? "null"), switched, afterA,
            second, toC, third, state, receipts, closedSynchronously,
            [localStorage.getItem(owner.stateKey), localStorage.getItem(owner.exportsKey), owner.root.isConnected, allStagesRemoved()]];
        }
        if (scenario === "held" || scenario === "reentrant") {
          raw = a.publish(); await reached(entered.promise, raw);
          const close = reentrantClose ?? a.close(); const sameFlight = a.close() === close;
          restarting = owner.restart(next);
          await Promise.resolve();
          const before = [a.pending(), a.isOpen(), capturedSignal?.aborted, cleanupCalls, successorFactories,
            originalButton.isConnected, a.edit(0, "late"), await a.publish(), queryClosed(a.query)];
          release.resolve();
          const result = await raw; const report = await close; const restarted = await restarting;
          return [before, sameFlight, result, report, restarted, successorFactories, originalButton.isConnected, readExports()];
        }
        if (scenario === "cooperative") {
          raw = a.publish(); await reached(entered.promise, raw);
          const close = a.close(); const result = await raw; const report = await close;
          return [result, report, aborts, a.pending(), originalButton.isConnected, readExports()];
        }
        if (scenario === "pending-cleanup") {
          const close = a.close(); restarting = owner.restart(next);
          await reached(cleanupEntered.promise, close);
          const before = [successorFactories, originalButton.isConnected, a.isOpen()];
          cleanupRelease.resolve(); const restarted = await restarting;
          return [before, await close, restarted, successorFactories, originalButton.isConnected];
        }
        if (scenario === "debt") {
          const close = a.close(); const report = await close;
          const first = await owner.restart(next); const second = await owner.restart(next);
          const before = [report.settled, report.complete, report.debts.length, a.close() === close,
            await a.close() === report, first.status, first.report === report, second.status, second.report === report,
            cleanupCalls, successorFactories, originalButton.isConnected, readState()];
          await owner.dispose();
          return [before, cleanupCalls, report.complete, originalButton.isConnected, allStagesRemoved()];
        }
        if (scenario === "partial") {
          const edit = a.edit(0, "reviewed draft"); let acquisitions = 0; let refused = false;
          try { await owner.restart(next, { afterAcquire: async () => {
            acquisitions += 1; throw new Error("requested failure after browser acquisition");
          } }); } catch (error) { refused = error instanceof Error && error.message.includes("construction failed"); }
          return [edit, refused, acquisitions, owner.stages().length, allStagesRemoved(), a.isOpen(), readState(), readExports()];
        }
        raw = a.publish(); await reached(entered.promise, raw);
        if (scenario === "conflict") a.edit(0, "changed"); else owner.revoke();
        release.resolve();
        return [await raw, readState(), readExports()];
      } finally {
        release.resolve(); cleanupRelease.resolve();
        await Promise.allSettled([raw, restarting, reentrantClose]);
        await owner.dispose();
      }
    }, { scenario, hostPath, adapterPath });
    await Promise.all(responses);
    for (const name of runtimeNames) assert.ok(requested.has(imports[name]!), "browser did not execute " + name);
    assert.ok(requested.has(hostPath));
    assert.deepEqual(errors, [], "browser runtime failed independently of intended lifecycle oracle");
    return { values, browser: browser.version(), responses: requested.size };
  } finally {
    try { await context?.close(); assert.equal(browser.contexts().length, 0, "browser context remains"); }
    finally {
      await new Promise<void>((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections(); });
      assert.equal(server.listening, false, "browser HTTP listener remains");
    }
  }
}

function assertNormal(values: unknown[]) {
  assert.equal(values[0], "retired action marker", "closed browser Host still handles retired export");
  assert.deepEqual(values.slice(1), [
    { status: "saved", snapshot: saved },
    { status: "published", revision: 1, content: "Document r1\nreviewed draft" }, saved, { status: "started" },
    { state: saved, removed: true, queryClosed: true, edit: closed, publish: closed },
    { status: "published", revision: 1, content: "[Document r1]\n> reviewed draft" }, { status: "started" },
    { status: "published", revision: 1, content: "Author revision 1\nBy author: reviewed draft" }, saved,
    [{ revision: 1, content: "Document r1\nreviewed draft" },
      { revision: 1, content: "[Document r1]\n> reviewed draft" },
      { revision: 1, content: "Author revision 1\nBy author: reviewed draft" }],
    [false, true, closed, closed], [null, null, false, true],
  ]);
}

export function registerBrowserModularCases(getPacked: () => Packed, observations: object[]): void {
  const expectations: Record<Exclude<Scenario, "normal">, unknown[]> = {
    held: [[1, false, true, 0, 0, true, closed, closed, true], true, cancelled, complete, { status: "started" }, 1, false, []],
    reentrant: [[1, false, true, 0, 0, true, closed, closed, true], true, cancelled, complete, { status: "started" }, 1, false, []],
    cooperative: [cancelled, complete, 1, 0, false, []],
    "pending-cleanup": [[0, true, false], complete, { status: "started" }, 1, false],
    debt: [[true, false, 1, true, true, "refused", true, "refused", true, 1, 0, true, { revision: 0, text: "seed" }], 1, false, false, true],
    partial: [{ status: "saved", snapshot: saved }, true, 1, 2, true, false, saved, []],
    conflict: [{ status: "rejected", reason: "conflict" }, { revision: 1, text: "changed" }, []],
    denied: [{ status: "rejected", reason: "denied" }, { revision: 0, text: "seed" }, []],
  };
  const scenarios: Scenario[] = ["normal", "held", "cooperative", "pending-cleanup", "debt", "partial", "conflict", "denied", "reentrant"];
  for (const scenario of scenarios) {
    void test("B modular Chromium: " + scenario, { timeout: 45000 }, async () => {
      const browser = await chromium.launch({ headless: true });
      try {
        const result = await browserCase(browser, getPacked(), scenario);
        if (scenario === "normal") assertNormal(result.values);
        else assert.deepEqual(result.values, expectations[scenario], "independent browser lifecycle oracle: " + scenario);
        observations.push({ host: "browser-modular", scenario, ...result });
      } finally { await browser.close(); }
    });
  }
  void test("B native DOM oracle rejects omitted modular listener cleanup", { timeout: 45000 }, async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      await assert.rejects((async () => {
        const result = await browserCase(browser, getPacked(), "normal", true);
        assertNormal(result.values);
      })(), error => error instanceof AssertionError && error.message.includes("closed browser Host still handles retired export"));
      observations.push({ host: "browser-modular", control: "omit-listener-cleanup", rejectedBy: "closed browser Host still handles retired export" });
    } finally { await browser.close(); }
  });
}
