import assert, { AssertionError } from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { after, before, test } from "node:test";
import { chromium, type Browser, type BrowserContext } from "playwright";
import { evidenceRoot, packConsumer, sha256, verifyPackageBytes } from "./pack-consumer.ts";
import { packModularConsumer } from "./pack-modular.ts";
import { registerNodeModularCases } from "./node-modular-cases.ts";
import { registerBrowserModularCases } from "./browser-modular-cases.ts";
import { registerFeatureContractCases } from "./feature-contract-cases.ts";
import { registerInstalledFeatureCases } from "./installed-feature-cases.ts";

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
const initialSnapshot = { revision: 0, text: "seed" };
const expectedSnapshot = { revision: 1, text: "reviewed draft" };
const invalidEdits = [
  [-1, "negative revision"], [0.5, "fractional revision"],
  [Number.NaN, "non-numeric revision"], [Number.POSITIVE_INFINITY, "infinite revision"],
  [Number.MAX_SAFE_INTEGER + 1, "unsafe revision"], [1, "x".repeat(81)],
] as const;

function mutateOnce(source: string, anchor: string, replacement: string): string {
  assert.equal(source.split(anchor).length, 2, "compiled mutation target changed");
  return source.replace(anchor, replacement);
}
const expectedResults = [
  { revision: 0, text: "seed" },
  { status: "saved", snapshot: { revision: 1, text: "reviewed draft" } },
  { status: "rejected", reason: "conflict" },
  { status: "rejected", reason: "invalid" },
  { status: "rejected", reason: "denied" },
  { revision: 1, text: "reviewed draft" },
];
let packed: Awaited<ReturnType<typeof packConsumer>>;
let modular: Awaited<ReturnType<typeof packModularConsumer>>;
const observations: object[] = [];
before(async () => {
  packed = await packConsumer();
  modular = await packModularConsumer(packed);
});
after(async () => {
  try { await writeFile(join(evidenceRoot, "observations.json"), JSON.stringify(observations, null, 2) + "\n"); }
  finally {
    try {
      if (modular) {
        await modular.dispose();
        assert.equal(existsSync(modular.root), false, "isolated modular consumer root remains");
      }
    } finally {
      if (packed) {
        await packed.dispose();
        assert.equal(existsSync(packed.root), false, "isolated installed consumer root remains");
      }
    }
  }
});

test("M1 installed public composition contracts reject wrong wiring, revision and missing dependencies", async () => {
  const entry = pathToFileURL(join(modular.root, "dist/node/composition-contract.js")).href;
  const { verifyCompositionContracts }: { verifyCompositionContracts: () => Promise<unknown> } = await import(entry);
  const result = await verifyCompositionContracts();
  assert.deepEqual(result, {
    providers: ["fixture/format/plain", "fixture/format/marked", "fixture/format/author"], contractCases: 6,
    namespaceRejected: true, wrongSelectionRejected: true, wrongRevisionRejected: true, missingDependencyRejected: true,
    effectsBeforeRun: 0, positiveControl: { factories: 1, acquired: 1, effects: 1, released: 1 },
  });
  observations.push({ profile: "modular-composition", result });
});

test("M2 optional adapter artifact oracle rejects changed nested bytes and extra files", async () => {
  await verifyPackageBytes(modular.adapterRoot, modular.adapterBuilt);
  for (const [path, reason] of [
    ["dist/features/format/composition/format.module.js", "package bytes differ:"],
    ["dist/extra.js", "package dist inventory"],
  ] as const) {
    const root = await mkdtemp(join(tmpdir(), "modular-artifact-control-"));
    try {
      const candidate = join(root, "package");
      await cp(modular.adapterRoot, candidate, { recursive: true, errorOnExist: true });
      await writeFile(join(candidate, path), "deliberate adapter substitution");
      await assert.rejects(verifyPackageBytes(candidate, modular.adapterBuilt), error =>
        error instanceof AssertionError && error.message.includes(reason));
      observations.push({ control: "adapter-" + path, rejectedBy: reason });
    } finally { await rm(root, { recursive: true, force: true }); }
  }
  await verifyPackageBytes(modular.adapterRoot, modular.adapterBuilt);
  await verifyPackageBytes(modular.coreRoot, packed.built);
});

test("M3 actual public composition root passes complete smoke and rejects invalid ports and cleanup", async () => {
  const entry = pathToFileURL(join(modular.root, "dist/node/composition-smoke.js")).href;
  const { verifyCompositionSmoke }: { verifyCompositionSmoke: () => Promise<unknown> } = await import(entry);
  const result = await verifyCompositionSmoke();
  assert.deepEqual(result, {
    providers: ["fixture/format/plain", "fixture/format/marked", "fixture/format/author"],
    smokeSteps: 21, acquisitions: 9, releases: 9, remainingLeases: 0,
    prototype: { code: "conformance.ports.prototype-member", steps: 1,
      acquisitions: 1, releases: 1, remainingLeases: 0 },
    cleanup: { code: "conformance.smoke.failed", steps: 7, failedDebts: 3,
      acquisitions: 3, cleanupAttempts: 3, releases: 0, heldLeases: 3,
      reclaimedLeases: 3, remainingLeases: 0 },
  });
  observations.push({ profile: "modular-composition-smoke", result });
});

registerFeatureContractCases(() => modular, observations);
registerInstalledFeatureCases(() => modular, observations);
registerNodeModularCases(() => modular, observations);
registerBrowserModularCases(() => modular, observations);

async function nodeCase(label: string, aliasReceipt = false) {
  const parent = await mkdtemp(join(tmpdir(), "document-node-case-"));
  const borrowed = join(parent, "borrowed.txt");
  // The actual independently compiled consumer supplies this test-facing shape.
  let host: NodeHost | undefined;
  try {
    await writeFile(borrowed, "borrowed owner survives");
    let entry = join(packed.root, "dist", "node", "node-host.js");
    if (aliasReceipt) {
      const mutant = mutateOnce(await readFile(entry, "utf8"),
        "receipts.push({ ...snapshot });", "receipts.push(snapshot);");
      entry = join(packed.root, "dist", "node", "receipt-alias-mutant.js");
      await writeFile(entry, mutant, { flag: "wx" });
    }
    const { openNodeHost }: { openNodeHost: (parent: string) => NodeHost } =
      await import(pathToFileURL(entry).href);
    const active = openNodeHost(parent);
    host = active;
    assert.equal(sha256(await readFile(fileURLToPath(active.entry))), packed.artifacts.entrySha256);
    const checkOwner = async (snapshot: Snapshot, receipts: readonly Snapshot[]) => {
      assert.deepEqual(JSON.parse(await readFile(active.stateFile, "utf8")), snapshot);
      assert.deepEqual(active.receipts(), receipts);
    };
    const prepared = active.commands.query();
    const results: unknown[] = [prepared];
    await checkOwner(initialSnapshot, []);
    const accepted = active.commands.edit(prepared.revision, "  reviewed draft  ");
    results.push(accepted);
    await checkOwner(expectedSnapshot, [expectedSnapshot]);
    results.push(active.commands.edit(prepared.revision, "stale edit"));
    await checkOwner(expectedSnapshot, [expectedSnapshot]);
    results.push(active.commands.edit(1, "   "));
    await checkOwner(expectedSnapshot, [expectedSnapshot]);
    for (const [revision, text] of invalidEdits) {
      assert.deepEqual(active.commands.edit(revision, text), { status: "rejected", reason: "invalid" });
      await checkOwner(expectedSnapshot, [expectedSnapshot]);
    }
    const beforeRevocation = active.commands.query();
    active.revoke();
    results.push(active.commands.edit(beforeRevocation.revision, "denied edit"), active.commands.query());
    assert.deepEqual(results, expectedResults);
    await checkOwner(expectedSnapshot, [expectedSnapshot]);

    // A readonly TypeScript result is not an immutable runtime object. Neither
    // a returned result nor a read of the receipt ledger may alter owner facts.
    const observedResults = structuredClone(results);
    assert.ok(typeof accepted === "object" && accepted !== null && "snapshot" in accepted);
    const returned = accepted.snapshot;
    assert.ok(typeof returned === "object" && returned !== null);
    Reflect.set(returned, "text", "forged");
    Reflect.set(returned, "revision", 99);
    assert.deepEqual(active.receipts(), [expectedSnapshot], "caller result altered owner receipt");
    const receipt = active.receipts()[0];
    assert.ok(receipt);
    Reflect.set(receipt, "text", "forged again");
    await checkOwner(expectedSnapshot, [expectedSnapshot]);
    host.close();
    assert.equal(existsSync(host.root), false, "Node owned state root remains after close");
    assert.deepEqual(host.commands.edit(1, "late edit"), { status: "rejected", reason: "closed" });
    const commands = host.commands;
    assert.throws(() => commands.query(), /Node Host is closed/);
    assert.equal(await readFile(borrowed, "utf8"), "borrowed owner survives");
    observations.push({ host: "node", label, results: observedResults, receipts: host.receipts(), invalidControls: invalidEdits.length, detachedReceipt: true, ownedRootRemoved: true });
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

const cleanupControls = ["save", "query", "revoke", "close"] as const;
type CleanupControl = typeof cleanupControls[number];
const cleanupMutations: Record<CleanupControl, string> = {
  save: 'save.removeEventListener("click", onSave);',
  query: 'query.removeEventListener("click", onQuery);',
  revoke: 'revoke.removeEventListener("click", onRevoke);',
  close: 'close.removeEventListener("click", onClose);',
};
type BrowserMutation = CleanupControl | "revision" | "grant";

async function browserCase(browser: Browser, label: string, mutation?: BrowserMutation) {
  const entryBytes = await readFile(packed.entry);
  const packageAssets = new Map([...packed.built].filter(([path]) => path.startsWith("dist/") && path.endsWith(".js"))
    .map(([path, bytes]) => ["/package/" + path.slice(5), bytes]));
  let hostBytes = await readFile(join(packed.root, "dist", "browser", "browser-host.js"), "utf8");
  if (mutation === "revision") {
    hostBytes = mutateOnce(hostBytes, "if (current.revision !== expectedRevision)", "if (false)");
  } else if (mutation === "grant") {
    hostBytes = mutateOnce(hostBytes, "if (!allowed)", "if (false)");
  } else if (mutation !== undefined) {
    hostBytes = mutateOnce(hostBytes, cleanupMutations[mutation], "/* deliberate unsafe adapter mutation */");
  }
  const server = createServer((request, response) => {
    const path = request.url;
    const body = path === "/" ? html : path === "/host.js" ? hostBytes : packageAssets.get(path ?? "");
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
    const checkOwner = async (snapshot: Snapshot, receipts: readonly Snapshot[]) => {
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("portable-document-fixture") ?? "null")), snapshot);
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("portable-document-receipts") ?? "null")), receipts);
    };
    await checkOwner(initialSnapshot, []);
    const edit = async (revision: string, text: string) => {
      await page.locator("#revision").fill(revision);
      await page.locator("#text").fill(text);
      await page.locator("#save").click();
      return result();
    };
    results.push(await edit("0", "  reviewed draft  "));
    await checkOwner(expectedSnapshot, [expectedSnapshot]);
    const stale = await edit("0", "stale edit");
    assert.deepEqual(stale, { status: "rejected", reason: "conflict" }, "stale edit escaped revision authority");
    results.push(stale);
    await checkOwner(expectedSnapshot, [expectedSnapshot]);
    results.push(await edit("1", "   "));
    await checkOwner(expectedSnapshot, [expectedSnapshot]);
    for (const [revision, text] of invalidEdits) {
      assert.deepEqual(await edit(String(revision), text), { status: "rejected", reason: "invalid" });
      await checkOwner(expectedSnapshot, [expectedSnapshot]);
    }
    // Prepare an action while authorized, then revoke before actual dispatch.
    await page.locator("#revision").fill("1");
    await page.locator("#text").fill("denied edit");
    await page.locator("#revoke").click();
    assert.equal(await page.locator("#output").innerText(), "revoked");
    await page.locator("#save").click();
    const denied = await result();
    assert.deepEqual(denied, { status: "rejected", reason: "denied" }, "prepared edit escaped revoked authority");
    results.push(denied);
    await checkOwner(expectedSnapshot, [expectedSnapshot]);
    await page.locator("#query").click();
    results.push(await result());
    assert.deepEqual(results, expectedResults);
    assert.deepEqual(errors, [], "browser runtime failed independently of the intended oracle");

    await page.locator("#close").click();
    assert.equal(await page.locator("#output").innerText(), "closed");
    await page.locator("#text").fill("late edit");
    for (const control of cleanupControls) {
      // Actual DOM dispatch, not a count of registrations. A unique marker
      // distinguishes even a repeated close from an ignored action.
      const observed = await page.evaluate((id) => {
        const output = document.querySelector("#output");
        const button = document.getElementById(id);
        if (!(output instanceof HTMLOutputElement) || !(button instanceof HTMLButtonElement)) {
          throw new Error("post-close controls unavailable");
        }
        const errors: string[] = [];
        const onError = (event: ErrorEvent) => { errors.push(event.message); };
        window.addEventListener("error", onError);
        try {
          output.value = "closed:" + id;
          button.click();
          return { output: output.value, errors };
        } finally { window.removeEventListener("error", onError); }
      }, control);
      assert.deepEqual(observed, { output: "closed:" + control, errors: [] },
        "closed browser Host still handles " + control);
      await checkOwner(expectedSnapshot, [expectedSnapshot]);
    }
    assert.deepEqual(errors, [], "post-close browser error");
    observations.push({ host: "browser", label, results, entrySha256: sha256(entryBytes), browser: browser.version(), invalidControls: invalidEdits.length, postCloseControlsIgnored: cleanupControls });
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

test("F2 artifact oracle rejects changed installed bytes and inventory", async () => {
  await verifyPackageBytes(packed.packageRoot, packed.built);
  const controls = [
    ["dist/index.js", "package bytes differ: dist/index.js"],
    ["dist/index.d.ts", "package bytes differ: dist/index.d.ts"],
    ["package.json", "package bytes differ: package.json"],
    ["dist/extra.js", "package dist inventory"],
    ["missing", "package dist inventory"],
  ] as const;
  for (const [path, reason] of controls) {
    const root = await mkdtemp(join(tmpdir(), "document-artifact-control-"));
    try {
      const candidate = join(root, "package");
      await cp(packed.packageRoot, candidate, { recursive: true, errorOnExist: true });
      if (path === "missing") {
        await rm(join(candidate, "dist", "index.js"));
      } else {
        await writeFile(join(candidate, path), "deliberate byte substitution");
      }
      await assert.rejects(verifyPackageBytes(candidate, packed.built), error =>
        error instanceof AssertionError && error.message.includes(reason));
      observations.push({ control: "artifact-" + path, rejectedBy: reason });
    } finally { await rm(root, { recursive: true, force: true }); }
  }
  await verifyPackageBytes(packed.packageRoot, packed.built);
});

test("Q1 packed declarations and isolated Node Host preserve state, grants and owned cleanup", async () => {
  await nodeCase("node-first");
  await nodeCase("fresh-node-reset");
});

test("Q1b owner receipt oracle rejects a returned-result alias", async () => {
  await assert.rejects(nodeCase("deliberate-node-receipt-alias", true), error =>
    error instanceof AssertionError && error.message.includes("caller result altered owner receipt"));
  observations.push({ control: "return-owner-receipt-alias", rejectedBy: "caller result altered owner receipt" });
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

test("Q3 browser lifetime oracle rejects omitted listener cleanup", { timeout: 120000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const control of cleanupControls) {
      const reason = "closed browser Host still handles " + control;
      await assert.rejects(browserCase(browser, "deliberate-cleanup-" + control, control), error =>
        error instanceof AssertionError && error.message.includes(reason));
      observations.push({ control: "omit-browser-listener-" + control, rejectedBy: reason });
    }
  } finally { await browser.close(); }
});

test("F2 authority oracle rejects omitted revision and grant guards", { timeout: 90000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [mutation, reason] of [
      ["revision", "stale edit escaped revision authority"],
      ["grant", "prepared edit escaped revoked authority"],
    ] as const) {
      await assert.rejects(browserCase(browser, "deliberate-" + mutation, mutation), error =>
        error instanceof AssertionError && error.message.includes(reason));
      observations.push({ control: "omit-" + mutation + "-guard", rejectedBy: reason });
    }
  } finally { await browser.close(); }
});
