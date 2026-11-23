import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { resolve } from "node:path";
import { after, test } from "node:test";
import { chromium, type Page } from "playwright";

type Version = "A" | "B";
type Receipt = { readonly text: string; readonly result: string; readonly effects: number };
function gate() {
  let release: () => void = () => { throw Error("uninitialized gate"); };
  const promise = new Promise<void>(resolveGate => { release = resolveGate; });
  return { promise, release: () => release() };
}
function reply(res: ServerResponse, status: number, type: string, data: string | Buffer): void {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(data);
}
function json(res: ServerResponse, status: number, data: unknown): void {
  reply(res, status, "application/json", JSON.stringify(data));
}

function htmlDocument(version: Version): string {
  const buttons = ["switch", "legacy-query", "compatible-query", "lazy", "slow-safe", "slow-unsafe", "submit", "fresh-id"];
  const output = ["ready", "view", "result", "query-result", "lazy-result", "slow-status", "command-result", "effects", "error"];
  return '<!doctype html><meta charset="utf-8"><title>Disposable cross-tier fixture</title>' +
    '<body data-version="' + version + '"><label>Draft <input id="draft"></label>' +
    buttons.map(id => '<button id="' + id + '">' + id + '</button>').join("") +
    output.map(id => '<div id="' + id + '"></div>').join("") +
    '<script type="module" src="/assets/client.js"></script></body>';
}

async function requestBody(req: IncomingMessage): Promise<unknown> {
  const parts: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of req) {
    const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    bytes += part.length;
    if (bytes > 4096) throw Error("fixture request limit");
    parts.push(part);
  }
  return JSON.parse(Buffer.concat(parts).toString("utf8")) as unknown;
}
async function fixture() {
  const state = { version: "A" as Version, retainA: true, allowed: true, dropOnce: true };
  const receipts = new Map<string, Receipt>();
  const effects: string[] = [];
  const hits: { path: string; version: Version; status: number }[] = [];
  const entered = gate();
  const resume = gate();
  const errors: string[] = [];
  const assets = new Set(["client.js", "view-a.js", "view-b.js", "late-a.js", "late-b.js"]);

  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const path = req.url ?? "";
    const admitted = state.version;
    const observe = (status: number) => hits.push({ path, version: admitted, status });
    if (path === "/") {
      observe(200); reply(res, 200, "text/html; charset=utf-8", htmlDocument(admitted)); return;
    }
    if (path.startsWith("/assets/")) {
      const name = path.slice("/assets/".length);
      if (!assets.has(name) || (name === "late-a.js" && !state.retainA)) {
        observe(404); reply(res, 404, "text/plain", "asset unavailable"); return;
      }
      const content = await readFile(resolve("dist/browser", name));
      observe(200); reply(res, 200, "text/javascript", content); return;
    }
    if (path === "/api/preview" || path === "/api/v1/preview" || path === "/api/v2/preview") {
      const old = path === "/api/v1/preview" || (path === "/api/preview" && admitted === "A");
      observe(200);
      json(res, 200, old ? { summary: admitted + "-via-v1" } : { label: admitted + "-via-v2" }); return;
    }
    if (path === "/api/slow") {
      entered.release();
      await resume.promise;
      observe(200); reply(res, 200, "text/plain", admitted + "-late"); return;
    }
    if (path === "/api/effects") {
      observe(200); json(res, 200, { count: effects.length, texts: effects }); return;
    }
    if ((path === "/api/v1/command" || path === "/api/v2/command") && req.method === "POST") {
      const body = await requestBody(req);
      if (typeof body !== "object" || body === null) { json(res, 400, {}); return; }
      const id: unknown = Reflect.get(body, "requestId");
      const text: unknown = Reflect.get(body, "text");
      if (typeof id !== "string" || typeof text !== "string" || !id || !text) { json(res, 400, {}); return; }
      if (!state.allowed) { observe(403); json(res, 403, {}); return; }
      const old = receipts.get(id);
      if (old) {
        if (old.text !== text) { observe(409); json(res, 409, {}); return; }
        observe(200); json(res, 200, old); return;
      }
      // Synthetic in-memory owner. Neither a durable outbox nor a DB transaction.
      effects.push(text);
      const receipt = { text, result: "accepted:" + effects.length, effects: effects.length };
      receipts.set(id, receipt);
      if (state.dropOnce) {
        state.dropOnce = false;
        // Incomplete receipt after the effect is committed. No socket-reset retry ambiguity.
        observe(200);
        reply(res, 200, "application/json", '{"result":');
        return;
      }
      observe(200); json(res, 200, receipt); return;
    }
    observe(404); reply(res, 404, "text/plain", "not found");
  }

  const server = createServer((req, res) => {
    void handle(req, res).catch((error: unknown) => {
      errors.push(String(error));
      if (!res.headersSent) reply(res, 500, "text/plain", "fixture error");
      else res.destroy();
    });
  });
  await new Promise<void>((ok, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => { server.off("error", reject); ok(); });
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = "http://127.0.0.1:" + address.port;
  const context = await browser.newContext();
  const pageErrors: string[] = [];
  async function page(): Promise<Page> {
    const p = await context.newPage();
    p.on("pageerror", error => pageErrors.push(String(error)));
    await p.goto(url);
    await expectText(p, "ready", "ready");
    return p;
  }
  async function close() {
    resume.release();
    try { await context.close(); }
    finally { await new Promise<void>((ok, reject) => server.close(error => error ? reject(error) : ok())); }
    assert.deepEqual(errors, []);
    assert.deepEqual(pageErrors, []);
  }
  return { state, effects, hits, entered, resume, page, close, url };
}

async function expectText(page: Page, id: string, text: string): Promise<void> {
  try {
    await page.waitForFunction(({ selector, expected }) =>
      document.getElementById(selector)?.textContent === expected, { selector: id, expected: text }, { timeout: 10000 });
  } catch (cause) {
    throw new Error("DOM observation " + id + ": expected " + text + "; actual " +
      await page.locator("#" + id).textContent() + "; page error " +
      await page.locator("#error").textContent(), { cause });
  }
  assert.equal(await page.locator("#" + id).textContent(), text);
}
async function click(page: Page, id: string): Promise<void> {
  await page.locator("#" + id).click();
}
async function switchView(page: Page): Promise<void> {
  // Update notification does not steal focus from the editor.
  await page.evaluate(() => document.getElementById("switch")?.click());
  await expectText(page, "view", "B");
  await expectText(page, "result", "mounted:B");
}
const browser = await chromium.launch({ headless: true });
console.log("Actual Chromium:", browser.version());
after(async () => { await browser.close(); });

test("X1 actual old/new browser clients and incompatible/compatible backend paths", { timeout: 40000 }, async t => {
  const f = await fixture();
  try {
    const a = await f.page();
    await expectText(a, "view", "A");
    await click(a, "legacy-query");
    await expectText(a, "query-result", "A-via-v1");
    f.state.version = "B";
    const b = await f.page();
    await expectText(b, "view", "B");
    await click(a, "legacy-query");
    await expectText(a, "query-result", "incompatible-response");
    await click(a, "compatible-query");
    await expectText(a, "query-result", "B-via-v1");
    await click(b, "compatible-query");
    await expectText(b, "query-result", "B-via-v2");
    assert.ok(f.hits.some(x => x.path === "/api/v1/preview" && x.version === "B" && x.status === 200));
    assert.ok(f.hits.some(x => x.path === "/api/v2/preview" && x.version === "B" && x.status === 200));
    t.diagnostic(JSON.stringify({ oldClient: "A", backend: "B", unversioned: "incompatible-response", oldCompatible: "B-via-v1", newCompatible: "B-via-v2" }));
  } finally { await f.close(); }
});

test("X2 retained lazy assets serve both generations; premature removal breaks a real old tab", { timeout: 40000 }, async t => {
  const f = await fixture();
  try {
    const oldRetained = await f.page();
    const oldUnloaded = await f.page();
    f.state.version = "B";
    const b = await f.page();
    await click(oldRetained, "lazy");
    await expectText(oldRetained, "lazy-result", "A-lazy");
    await click(b, "lazy");
    await expectText(b, "lazy-result", "B-lazy");
    f.state.retainA = false;
    await click(oldUnloaded, "lazy");
    await expectText(oldUnloaded, "lazy-result", "unavailable");
    assert.ok(f.hits.some(x => x.path === "/assets/late-a.js" && x.status === 200));
    assert.ok(f.hits.some(x => x.path === "/assets/late-a.js" && x.status === 404));
    assert.ok(f.hits.some(x => x.path === "/assets/late-b.js" && x.status === 200));
    t.diagnostic(JSON.stringify({ oldRetained: "A-lazy", new: "B-lazy", prematurelyRemoved: "unavailable", realAsset404: true }));
  } finally { await f.close(); }
});

test("X3 real late A HTTP result, switched B view, and stable dirty input/focus", { timeout: 40000 }, async t => {
  for (const guarded of [false, true]) {
    const f = await fixture();
    try {
      const a = await f.page();
      await click(a, guarded ? "slow-safe" : "slow-unsafe");
      await f.entered.promise;
      await a.locator("#draft").fill("unsaved draft");
      await a.locator("#draft").focus();
      const before = await a.evaluate(() => {
        const input = document.getElementById("draft");
        if (!(input instanceof HTMLInputElement)) throw Error("missing draft");
        input.setSelectionRange(2, 5);
        return { text: input.value, start: input.selectionStart, end: input.selectionEnd, focus: document.activeElement?.id, origin: performance.timeOrigin };
      });
      f.state.version = "B";
      await switchView(a);
      f.resume.release();
      await expectText(a, "slow-status", guarded ? "stale-ignored" : "applied");
      await expectText(a, "result", guarded ? "mounted:B" : "A-late");
      const after = await a.evaluate(() => {
        const input = document.getElementById("draft");
        if (!(input instanceof HTMLInputElement)) throw Error("missing draft");
        return { text: input.value, start: input.selectionStart, end: input.selectionEnd, focus: document.activeElement?.id, origin: performance.timeOrigin };
      });
      assert.deepEqual(after, before);
      assert.equal(after.text, "unsaved draft");
      assert.equal(after.focus, "draft");
      assert.equal(after.start, 2);
      assert.equal(after.end, 5);
      t.diagnostic(JSON.stringify({ guarded, lateResult: guarded ? "stale-ignored" : "A-late overwritten", preserved: { draft: after.text, focus: after.focus, start: after.start, end: after.end, sameDocument: true } }));
    } finally { await f.close(); }
  }
});

test("X4 actual incomplete HTTP receipt, original command identity across backend switch, and grant refusal", { timeout: 40000 }, async t => {
  const f = await fixture();
  try {
    const a = await f.page();
    await a.locator("#draft").fill("same logical intent");
    await click(a, "submit");
    await expectText(a, "command-result", "unknown");
    assert.deepEqual(await (await fetch(f.url + "/api/effects")).json(), { count: 1, texts: ["same logical intent"] });
    assert.ok(f.hits.some(x => x.path === "/api/v1/command" && x.version === "A" && x.status === 200));
    f.state.version = "B";
    await click(a, "submit");
    await expectText(a, "command-result", "accepted:1");
    await expectText(a, "effects", "1");
    assert.equal(f.effects.length, 1);
    await a.locator("#draft").fill("changed intent");
    await click(a, "submit");
    await expectText(a, "command-result", "rejected:409");
    assert.equal(f.effects.length, 1);
    await a.locator("#draft").fill("same logical intent");
    await click(a, "fresh-id");
    await expectText(a, "command-result", "fresh-id");
    await click(a, "submit");
    await expectText(a, "command-result", "accepted:2");
    assert.equal(f.effects.length, 2);
    f.state.allowed = false;
    await click(a, "fresh-id");
    await expectText(a, "command-result", "fresh-id");
    await click(a, "submit");
    await expectText(a, "command-result", "rejected:403");
    assert.deepEqual(await (await fetch(f.url + "/api/effects")).json(), { count: 2, texts: ["same logical intent", "same logical intent"] });
    assert.ok(f.hits.some(x => x.path === "/api/v1/command" && x.version === "B" && x.status === 200));
    t.diagnostic(JSON.stringify({ incompleteReceipt: "unknown", sameIdAfterSwitch: "accepted:1", conflictingIntent: 409, freshIdDuplicates: true, revokedNewCommand: 403, effects: f.effects.length }));
  } finally { await f.close(); }
});
