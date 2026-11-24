import assert, { AssertionError } from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { after, before, test } from "node:test";
import { chromium, type Browser, type BrowserContext } from "playwright";
import { evidenceRoot, packConsumer, sha256 } from "./pack-consumer.ts";

interface Snapshot { readonly revision: number; readonly text: string }
interface NodeHost {
  readonly root: string;
  readonly stateFile: string;
  readonly entry: string;
  readonly commands: { query(): Snapshot; edit(revision: number, text: string): unknown };
  receipts(): readonly Snapshot[];
  revoke(): void;
  close(): void;
}
const expectedSnapshot = { revision: 1, text: "reviewed draft" };
const expectedResults = [
  { revision: 0, text: "seed" },
  { status: "saved", snapshot: { revision: 1, text: "reviewed draft" } },
  { status: "rejected", reason: "conflict" },
  { status: "rejected", reason: "invalid" },
  { status: "rejected", reason: "denied" },
  { revision: 1, text: "reviewed draft" },
];
let packed: Awaited<ReturnType<typeof packConsumer>>;
const observations: object[] = [];
before(async () => { packed = await packConsumer(); });
after(async () => {
  try { await writeFile(join(evidenceRoot, "observations.json"), JSON.stringify(observations, null, 2) + "\n"); }
  finally {
    if (packed) {
      await packed.dispose();
      assert.equal(existsSync(packed.root), false, "isolated installed consumer root remains");
    }
  }
});

async function nodeCase(label: string) {
  const parent = await mkdtemp(join(tmpdir(), "document-node-case-"));
  const borrowed = join(parent, "borrowed.txt");
  // The actual independently compiled consumer supplies this test-facing shape.
  let host: NodeHost | undefined;
  try {
    await writeFile(borrowed, "borrowed owner survives");
    const { openNodeHost }: { openNodeHost: (parent: string) => NodeHost } =
      await import(pathToFileURL(join(packed.root, "dist", "node", "node-host.js")).href);
    host = openNodeHost(parent);
    assert.equal(sha256(await readFile(fileURLToPath(host.entry))), packed.artifacts.entrySha256);
    const results = [host.commands.query(), host.commands.edit(0, "  reviewed draft  "),
      host.commands.edit(0, "stale edit"), host.commands.edit(1, "   ")];
    host.revoke();
    results.push(host.commands.edit(1, "denied edit"), host.commands.query());
    assert.deepEqual(results, expectedResults);
    assert.deepEqual(JSON.parse(await readFile(host.stateFile, "utf8")), expectedSnapshot);
    assert.deepEqual(host.receipts(), [expectedSnapshot]);
    host.close();
    assert.equal(existsSync(host.root), false, "Node owned state root remains after close");
    assert.deepEqual(host.commands.edit(1, "late edit"), { status: "rejected", reason: "closed" });
    const commands = host.commands;
    assert.throws(() => commands.query(), /Node Host is closed/);
    assert.equal(await readFile(borrowed, "utf8"), "borrowed owner survives");
    observations.push({ host: "node", label, results, receipts: host.receipts(), ownedRootRemoved: true });
  } finally {
    try { host?.close(); }
    finally { await rm(parent, { recursive: true, force: true }); }
  }
  assert.equal(existsSync(parent), false, "Node case namespace was not reset");
}

const html = `<!doctype html><meta charset="utf-8"><title>Portable document fixture</title>
<label>Text <input id="text"></label><label>Revision <input id="revision" value="0"></label>
<button id="save">Save</button><button id="query">Query</button><button id="revoke">Revoke</button>
<button id="close">Close</button><output id="output"></output>
<script type="importmap">{"imports":{"@fixture/portable-document":"/package/index.js"}}</script>
<script type="module" src="/host.js"></script>`;

async function browserCase(browser: Browser, label: string, omitCleanup = false) {
  const entryBytes = await readFile(packed.entry);
  let hostBytes = await readFile(join(packed.root, "dist", "browser", "browser-host.js"), "utf8");
  if (omitCleanup) {
    const cleanup = 'save.removeEventListener("click", onSave);';
    assert.equal(hostBytes.split(cleanup).length, 2, "cleanup mutation target changed");
    hostBytes = hostBytes.replace(cleanup, "/* deliberate unsafe adapter mutation */");
  }
  const server = createServer((request, response) => {
    const path = request.url;
    const body = path === "/" ? html : path === "/host.js" ? hostBytes : path === "/package/index.js" ? entryBytes : undefined;
    if (body === undefined) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { "Content-Type": path === "/" ? "text/html; charset=utf-8" : "text/javascript; charset=utf-8", "Cache-Control": "no-store" });
    response.end(body);
  });
  await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  let context: BrowserContext | undefined;
  try {
    const address = server.address();
    assert.ok(address && typeof address === "object");
    context = await browser.newContext();
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", error => { errors.push(error.message); });
    const artifactResponse = page.waitForResponse(response => response.url().endsWith("/package/index.js"));
    await page.goto(`http://127.0.0.1:${address.port}/`);
    assert.equal(sha256(await (await artifactResponse).body()), packed.artifacts.entrySha256, "browser executed a different core artifact");
    await page.locator("#output").filter({ hasText: "seed" }).waitFor();
    const result = async (): Promise<unknown> => JSON.parse(await page.locator("#output").innerText());
    const results = [await result()];
    const edit = async (revision: string, text: string) => {
      await page.locator("#revision").fill(revision);
      await page.locator("#text").fill(text);
      await page.locator("#save").click();
      return result();
    };
    results.push(await edit("0", "  reviewed draft  "), await edit("0", "stale edit"), await edit("1", "   "));
    await page.locator("#revoke").click();
    results.push(await edit("1", "denied edit"));
    await page.locator("#query").click();
    results.push(await result());
    assert.deepEqual(results, expectedResults);
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("portable-document-fixture") ?? "null")), expectedSnapshot);
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("portable-document-receipts") ?? "null")), [expectedSnapshot]);
    await page.locator("#close").click();
    await page.locator("#text").fill("late edit");
    await page.locator("#save").click();
    assert.deepEqual(errors, [], "browser runtime failed independently of the intended oracle");
    assert.equal(await page.locator("#output").innerText(), "closed", "closed browser Host still handles edit");
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("portable-document-fixture") ?? "null")), expectedSnapshot);
    observations.push({ host: "browser", label, results, entrySha256: sha256(entryBytes), browser: browser.version(), postCloseActionIgnored: true });
  } finally {
    try {
      await context?.close();
      assert.equal(browser.contexts().length, 0, "owned browser context remains");
    }
    finally {
      await new Promise<void>((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections(); });
      assert.equal(server.listening, false, "owned HTTP listener remains");
    }
  }
}

test("Q1 packed declarations and isolated Node Host preserve state, grants and owned cleanup", async () => {
  await nodeCase("node-first");
  await nodeCase("fresh-node-reset");
});

test("Q2 same packed core executes in independent Node/browser Hosts in both orders", { timeout: 90000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await nodeCase("node-before-browser");
    await browserCase(browser, "browser-after-node");
    await browserCase(browser, "fresh-browser-before-node");
    await nodeCase("node-after-browser");
  } finally { await browser.close(); }
});

test("Q3 browser lifetime oracle rejects omitted listener cleanup", { timeout: 60000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await assert.rejects(browserCase(browser, "deliberate-cleanup-mutation", true), error =>
      error instanceof AssertionError && error.message.includes("closed browser Host still handles edit"));
    observations.push({ control: "omit-browser-listener-cleanup", rejectedBy: "closed browser Host still handles edit" });
  } finally { await browser.close(); }
});
