import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { Browser } from "playwright";
import type { prepareComposedFixture } from "./composed-fixture.ts";
import type { ComposedRunOptions } from "./composed-mutants.ts";
import { javascriptInventory } from "./operation-fixture.ts";
import { digest, object } from "./pack-operation.ts";

type ArtifactInputs = Awaited<ReturnType<typeof prepareComposedFixture>>["artifactInputs"];
interface BrowserAsset { readonly file: string; readonly sha256: string }

export function composedReportProgram(call: string): string {
  return `function failure(value, seen = new Set()) {
    if (!(value instanceof Error)) { return { name: typeof value, message: String(value) }; }
    const result = { name: value.name, message: value.message };
    if (typeof value.code === "string") { result.code = value.code; }
    if (seen.has(value)) { return { ...result, repeated: true }; }
    seen.add(value);
    if (value instanceof AggregateError) { result.errors = value.errors.map(item => failure(item, seen)); }
    if (value.cause !== undefined) { result.cause = failure(value.cause, seen); }
    return result;
  }
  function primary(error) {
    return Array.isArray(error.errors) && error.errors.length > 0 ? primary(error.errors[0]) : error;
  }
  try {
    const rows = ${call};
    finish({ status: "passed", entered: true, rows });
  } catch (cause) {
    const error = failure(cause);
    finish({ status: "rejected", entered: true, primary: primary(error), error });
  }`;
}

async function browserAssets(consumer: string, packageNames: readonly string[]): Promise<ReadonlyMap<string, BrowserAsset>> {
  const assets = new Map<string, BrowserAsset>();
  const directories = [[join(consumer, "out/browser"), "/out"],
    ...packageNames.map(name => [join(consumer, "node_modules", name, "dist"), "/packages/" + name])];
  for (const [directory, prefix] of directories) {
    assert.ok(directory !== undefined && prefix !== undefined);
    for (const [path, sha256] of await javascriptInventory(directory)) {
      const pathname: string = prefix + "/" + path.replaceAll("\\", "/");
      assert.equal(assets.has(pathname), false, "browser inventory paths must be unique");
      assets.set(pathname, Object.freeze({ file: join(directory, path), sha256 }));
    }
  }
  return assets;
}

function browserImportMap(packageNames: readonly string[]): string {
  return JSON.stringify({ imports: {
    ...Object.fromEntries(packageNames.map(name => [name, "/packages/" + name + "/index.js"])),
    "live-module-updates/resources": "/packages/live-module-updates/resources.js",
    "live-module-updates/testing": "/packages/live-module-updates/testing.js",
  } });
}

/** Resolve Playwright's own pinned dependency; the executor may also expose a different global copy. */
export async function composedBrowserPin() {
  const require = createRequire(import.meta.url);
  const playwrightPath = require.resolve("playwright/package.json");
  const corePath = createRequire(playwrightPath).resolve("playwright-core/package.json");
  const playwright = object(JSON.parse(await readFile(playwrightPath, "utf8")));
  const core = object(JSON.parse(await readFile(corePath, "utf8")));
  assert.equal(playwright["version"], "1.65.1");
  assert.equal(core["version"], "1.65.1");
  const metadata = object(JSON.parse(await readFile(join(dirname(corePath), "browsers.json"), "utf8")));
  assert.ok(Array.isArray(metadata["browsers"]));
  const entries = metadata["browsers"].map((value: unknown) => object(value));
  const chromium = entries.find(value => value["name"] === "chromium");
  const shell = entries.find(value => value["name"] === "chromium-headless-shell");
  assert.ok(chromium !== undefined && shell !== undefined);
  assert.equal(chromium["revision"], "1255");
  assert.equal(shell["revision"], "1255");
  assert.equal(chromium["browserVersion"], "159.0.8154.6");
  assert.equal(shell["browserVersion"], "159.0.8154.6");
  return Object.freeze({ playwright: playwright["version"], playwrightCore: core["version"],
    revision: chromium["revision"], browserVersion: chromium["browserVersion"],
    launch: Object.freeze({ browser: "chromium", headless: true, selection: "Playwright pinned default" }) });
}

export async function runComposedChromium(options: {
  readonly browser: Browser;
  readonly consumer: string;
  readonly artifactInputs: ArtifactInputs;
  readonly packageNames: readonly string[];
  readonly run?: ComposedRunOptions;
}): Promise<Record<string, unknown>> {
  const context = await options.browser.newContext();
  const origin = "https://composed-operation.fixture.invalid";
  const served = new Map<string, string>();
  const received = new Map<string, string>();
  const responseFlights: Promise<void>[] = [];
  const responseErrors: unknown[] = [];
  const runOptions = options.run ?? {};
  const importMap = browserImportMap(options.packageNames);
  const program = 'import { runBrowserCases } from "/out/browser-host.js";\n'
    + 'const finish = value => { document.querySelector("#result").textContent = JSON.stringify(value); document.documentElement.dataset.complete = "yes"; };\n'
    + composedReportProgram("await runBrowserCases(" + JSON.stringify(options.artifactInputs) + ", " + JSON.stringify(runOptions) + ")");
  try {
    const assets = await browserAssets(options.consumer, options.packageNames);
    await context.route(origin + "/**", async route => {
      const path = new URL(route.request().url()).pathname;
      if (path === "/") {
        await route.fulfill({ contentType: "text/html", body: '<!doctype html><meta charset="utf-8"><title>Composed module qualification</title><script type="importmap">'
          + importMap + '</script><pre id="result"></pre><script type="module" src="/entry.js"></script>' });
      } else if (path === "/entry.js") {
        await route.fulfill({ contentType: "text/javascript", body: program });
      } else {
        const asset = assets.get(path);
        if (asset === undefined) { await route.fulfill({ status: 404, body: "asset outside installed/emitted inventory" }); return; }
        const bytes = await readFile(asset.file);
        assert.equal(digest(bytes), asset.sha256, "browser source changed after inventory");
        served.set(path, asset.sha256);
        await route.fulfill({ contentType: "text/javascript", body: bytes });
      }
    });
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on("pageerror", cause => { pageErrors.push(cause.message); });
    page.on("response", response => {
      const url = new URL(response.url());
      const asset = url.origin === origin ? assets.get(url.pathname) : undefined;
      if (asset === undefined) { return; }
      const flight = (async () => {
        try {
          const bytes = await response.body();
          assert.equal(response.status(), 200);
          const sha256 = digest(bytes);
          assert.equal(sha256, asset.sha256, "native browser received different installed/emitted bytes");
          received.set(url.pathname, sha256);
        } catch (cause) { responseErrors.push(cause); }
      })();
      responseFlights.push(flight);
    });
    await page.goto(origin);
    await page.waitForFunction(() => document.documentElement.dataset["complete"] === "yes", undefined, { timeout: 30_000 });
    await Promise.all(responseFlights);
    assert.deepEqual(pageErrors, [], "browser import/setup failed before a case oracle");
    assert.deepEqual(responseErrors, [], "browser response hashing failed");
    assert.deepEqual([...received].toSorted((left, right) => left[0].localeCompare(right[0])),
      [...served].toSorted((left, right) => left[0].localeCompare(right[0])), "every served module must have a measured native response");
    for (const name of options.packageNames) {
      assert.ok(received.has("/packages/" + name + "/index.js"), "missing installed entry: " + name);
    }
    assert.ok(received.has("/packages/live-module-updates/features/update-operation/application/generation.js"));
    if (runOptions.caseName === undefined) {
      assert.ok(received.has("/packages/live-module-updates/testing.js"), "the baseline must execute installed public Host laws");
    }
    const result = object(JSON.parse(await page.locator("#result").innerText()));
    return { ...result, userAgent: await page.evaluate(() => navigator.userAgent),
      driverSha256: digest(program), importMapSha256: digest(importMap),
      expectedModules: Object.fromEntries([...assets].map(([path, asset]) => [path, asset.sha256])),
      served: Object.fromEntries(served), received: Object.fromEntries(received) };
  } finally { await context.close(); }
}
