import assert from "node:assert/strict";
import { cp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test, { after } from "node:test";
import { chromium } from "playwright";
import { checkRows, cohort, javascriptInventory, prepareOperationFixture } from "./operation-fixture.ts";
import { createOperationMutant, faultyHostProfiles, packedOperationMutants, type OperationCaseName } from "./operation-mutants.ts";
import { digest, object, run } from "./pack-operation.ts";

type FaultOptions = { readonly unsafeEffects?: boolean; readonly unsafeRemoval?: boolean };
type NativeRunner = (consumer: string, caseName?: OperationCaseName, faults?: FaultOptions) => Promise<Record<string, unknown>>;
const fixture = await prepareOperationFixture();
after(() => fixture.dispose());

function invocation(caseName?: OperationCaseName, faults: FaultOptions = {}): string {
  return caseName === undefined ? "await runHostCases(createHost)"
    : "await runHostCase(createHost, " + JSON.stringify(caseName) + ", " + JSON.stringify(faults) + ")";
}
function reportProgram(call: string, complete: string): string {
  return `try {
    const rows = ${call};
    ${complete}({ status: "passed", rows });
  } catch (cause) {
    ${complete}({ status: "rejected", oracle: cause instanceof Error ? cause.message : String(cause),
      details: cause instanceof AggregateError ? cause.errors.map(value => value instanceof Error ? value.message : String(value)) : [] });
  }`;
}
async function runNode(consumer: string, caseName?: OperationCaseName, faults: FaultOptions = {}): Promise<Record<string, unknown>> {
  const program = 'import { runHostCase, runHostCases } from "./out/node/host-cases.js";\n'
    + 'import { createNodeHost as createHost } from "./out/node/node-host.js";\n'
    + reportProgram(invocation(caseName, faults), "finish");
  // A fresh native process loads the selected actual package bytes for every mutant.
  await writeFile(join(consumer, "node-entry.mjs"), 'const finish = value => console.log(JSON.stringify(value));\n' + program);
  return object(JSON.parse(run(process.execPath, ["node-entry.mjs"], consumer)));
}
async function browserAssets(consumer: string): Promise<ReadonlyMap<string, string>> {
  const files = new Map<string, string>();
  for (const [directory, prefix] of [[join(consumer, "out/browser"), "/out"],
    ...["live-module-updates", ...Object.keys(cohort)].map(name => [join(consumer, "node_modules", name, "dist"), "/packages/" + name])]) {
    assert.ok(directory !== undefined && prefix !== undefined);
    for (const path of (await javascriptInventory(directory)).keys()) { files.set(prefix + "/" + path, join(directory, path)); }
  }
  return files;
}
function importMap(): string {
  return JSON.stringify({ imports: {
    "live-module-updates": "/packages/live-module-updates/index.js",
    "live-module-updates/resources": "/packages/live-module-updates/resources.js",
    ...Object.fromEntries(Object.keys(cohort).map(name => [name, "/packages/" + name + "/index.js"])),
  } });
}
async function runChromium(browser: Awaited<ReturnType<typeof chromium.launch>>, consumer: string,
  caseName?: OperationCaseName, faults: FaultOptions = {}): Promise<Record<string, unknown>> {
  const context = await browser.newContext();
  const origin = "https://complete-operation.fixture.invalid";
  const files = await browserAssets(consumer);
  const served = new Map<string, string>();
  const program = 'import { runHostCase, runHostCases } from "/out/host-cases.js";\n'
    + 'import { createBrowserHost as createHost } from "/out/browser-host.js";\n'
    + 'const finish = value => { document.querySelector("#result").textContent = JSON.stringify(value); document.documentElement.dataset.complete = "yes"; };\n'
    + reportProgram(invocation(caseName, faults), "finish");
  try {
    await context.route(origin + "/**", async route => {
      const path = new URL(route.request().url()).pathname;
      if (path === "/") {
        await route.fulfill({ contentType: "text/html", body: '<!doctype html><meta charset="utf-8"><title>Installed LMU qualification</title><script type="importmap">'
          + importMap() + '</script><pre id="result"></pre><script type="module" src="/entry.js"></script>' });
      } else if (path === "/entry.js") { await route.fulfill({ contentType: "text/javascript", body: program }); }
      else {
        const source = files.get(path);
        if (source === undefined) { await route.fulfill({ status: 404, body: "asset outside qualified inventory" }); return; }
        const bytes = await readFile(source); served.set(path, digest(bytes));
        await route.fulfill({ contentType: "text/javascript", body: bytes });
      }
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", cause => { errors.push(cause.message); });
    await page.goto(origin);
    await page.waitForFunction(() => document.documentElement.dataset["complete"] === "yes", undefined, { timeout: 30_000 });
    assert.deepEqual(errors, [], "browser module setup failed before an oracle");
    const result = object(JSON.parse(await page.locator("#result").innerText()));
    assert.ok(served.has("/packages/live-module-updates/index.js"));
    assert.ok(served.has("/packages/live-module-updates/features/update-operation/application/generation.js"));
    return { ...result, userAgent: await page.evaluate(() => navigator.userAgent), served: Object.fromEntries(served) };
  } finally { await context.close(); }
}

async function campaign(target: string, execute: NativeRunner): Promise<void> {
  const baseline = await execute(fixture.consumer);
  assert.equal(baseline["status"], "passed", JSON.stringify(baseline)); checkRows(baseline["rows"]);
  const negative: unknown[] = [];
  for (const defect of packedOperationMutants) {
    const consumer = join(fixture.temporary, target + "-" + defect.id);
    await cp(fixture.consumer, consumer, { recursive: true });
    const mutation = await createOperationMutant({ installedPackageRoot: join(fixture.consumer, "node_modules/live-module-updates"),
      mutantRoot: join(consumer, "node_modules/live-module-updates"), defect });
    try {
      const result = await execute(consumer, defect.caseName);
      assert.equal(result["status"], "rejected", "deliberate defect survived: " + defect.id);
      assert.equal(result["oracle"], defect.oracle, JSON.stringify(result));
      await mutation.verifyOriginal();
      await cp(join(mutation.root, defect.path), join(fixture.destination, target + "-" + defect.id + ".js"));
      negative.push({ ...mutation.receipt, observed: result });
    } finally { await mutation.restore(); await rm(consumer, { recursive: true, force: true }); }
  }
  const original = Object.fromEntries(await javascriptInventory(join(fixture.consumer, "node_modules/live-module-updates")));
  for (const profile of faultyHostProfiles) {
    const result = await execute(fixture.consumer, profile.caseName, profile.options);
    assert.equal(result["status"], "rejected", "faulty native Host survived: " + profile.id);
    assert.equal(result["oracle"], profile.oracle, JSON.stringify(result));
    assert.deepEqual(Object.fromEntries(await javascriptInventory(join(fixture.consumer, "node_modules/live-module-updates"))), original);
    negative.push({ ...profile, observed: result, libraryInventory: original });
  }
  assert.equal(negative.length, 6);
  await writeFile(join(fixture.destination, target + ".json"), JSON.stringify({ ...fixture.identities, target, baseline, negative }, null, 2) + "\n");
}

await test("packed complete operation runs in native Node and rejects all six named defects", { timeout: 90_000 }, async () => {
  await campaign("node", runNode);
});
await test("same packed complete operation runs in native Chromium with independent Storage and DOM owners", { timeout: 120_000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await campaign("chromium", (consumer, name, faults) => runChromium(browser, consumer, name, faults));
    await writeFile(join(fixture.destination, "browser-version.json"), JSON.stringify({ version: browser.version(), launch: { browser: "chromium", headless: true, selection: "Playwright pinned default" } }) + "\n");
  } finally { await browser.close(); }
});
