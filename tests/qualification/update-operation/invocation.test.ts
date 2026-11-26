import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import test from "node:test";
import { chromium } from "playwright";
import type { AuthorityFactory, AuthorityOptions, CaseEvidence } from "./authority/contract.js";

const root = dirname(fileURLToPath(import.meta.url));
const build = resolve(root, ".qualification/build");
const evidenceRoot = resolve(root, ".qualification/evidence");
const resourcesEntry = fileURLToPath(import.meta.resolve("@get-modular/resources"));
const resourcesDist = await realpath(dirname(resourcesEntry));
const require = createRequire(import.meta.url);
const pinned = { node: "v24.22.3", typescript: "7.0.2", playwright: "1.65.1", resources: "0.2.2" } as const;

async function digest(path: string): Promise<string> {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function inventory(rootPath: string): Promise<readonly { readonly path: string; readonly sha256: string }[]> {
  const paths = (await readdir(rootPath, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
    .map((entry) => resolve(entry.parentPath, entry.name))
    .sort();
  return Promise.all(paths.map(async (path) => ({ path: path.slice(rootPath.length + 1).split(sep).join("/"), sha256: await digest(path) })));
}

async function artifact() {
  const resourcesPackage: unknown = JSON.parse(await readFile(resolve(resourcesDist, "../package.json"), "utf8"));
  assert.ok(typeof resourcesPackage === "object" && resourcesPackage !== null && "version" in resourcesPackage);
  assert.equal(resourcesPackage.version, pinned.resources);
  assert.equal(process.version, pinned.node);
  assert.equal((require("typescript/package.json") as { version: string }).version, pinned.typescript);
  assert.equal((require("playwright/package.json") as { version: string }).version, pinned.playwright);
  return {
    qualification: "L1 TEST candidate; not an admitted production package",
    commit: process.env.QUALIFICATION_SOURCE_SHA ?? process.env.GITHUB_SHA ?? "working-tree",
    candidateSha256: await digest(resolve(build, "candidate/invocation.js")),
    artifactInventory: await inventory(build),
    resourcesInventory: await inventory(resourcesDist),
    versions: pinned,
  };
}

function checkEvidence(invocation: readonly CaseEvidence[], authority: readonly CaseEvidence[], coupled: CaseEvidence): void {
  assert.equal(invocation.length, 10, "every invocation discriminator must execute");
  assert.equal(authority.length, 18, "every native authority discriminator must execute");
  assert.equal(coupled.outcome, "passed");
  for (const row of [...invocation, ...authority, coupled]) assert.equal(row.outcome, "passed", row.name);
  assert.deepEqual(invocation.flatMap((row) => row.witness ?? []), ["qualification.use-after-release", "qualification.wrong-generation"]);
}

async function saveEvidence(name: string, value: unknown): Promise<void> {
  await mkdir(evidenceRoot, { recursive: true });
  await writeFile(resolve(evidenceRoot, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`);
}

test("L1 native Node invocation, canonical authority and negative controls", { timeout: 30_000 }, async () => {
  const built = await artifact();
  const invocationModule = await import(pathToFileURL(resolve(build, "invocation-cases.js")).href) as {
    runInvocationCases(): Promise<readonly CaseEvidence[]>;
    runInvocationAuthorityCase(factory: AuthorityFactory): Promise<CaseEvidence>;
  };
  const authorityModule = await import(pathToFileURL(resolve(build, "authority/authority-cases.js")).href) as {
    runAuthorityCases(factory: AuthorityFactory): Promise<readonly CaseEvidence[]>;
  };
  const nodeModule = await import(pathToFileURL(resolve(build, "authority/node-authority.js")).href) as { createNodeAuthority: AuthorityFactory };
  const invocation = await invocationModule.runInvocationCases();
  const authority = await authorityModule.runAuthorityCases(nodeModule.createNodeAuthority);
  const coupled = await invocationModule.runInvocationAuthorityCase(nodeModule.createNodeAuthority);
  checkEvidence(invocation, authority, coupled);
  await saveEvidence("l1-node", { ...built, runtime: process.version, invocation, authority, coupled });
});

test("L1 native Chromium executes identical candidate bytes with independent browser authority", { timeout: 90_000 }, async () => {
  const built = await artifact();
  // Exact pinned Playwright browser. No system-browser fallback or mock DOM.
  const browser = await chromium.launch({ headless: true });
  const origin = "https://update-operation.fixture.invalid";
  try {
    const context = await browser.newContext();
    await context.route(`${origin}/**`, async (route) => {
      const pathname = new URL(route.request().url()).pathname;
      if (pathname === "/") {
        await route.fulfill({ contentType: "text/html", body: `<!doctype html><meta charset="utf-8"><title>L1 native qualification</title><script type="importmap">{"imports":{"@get-modular/resources":"${origin}/resources/index.js"}}</script>` });
        return;
      }
      const assetRoot = pathname.startsWith("/build/") ? build : pathname.startsWith("/resources/") ? resourcesDist : undefined;
      if (!assetRoot) { await route.fulfill({ status: 404, body: "unknown qualification asset" }); return; }
      const relative = pathname.slice(pathname.indexOf("/", 1) + 1);
      const path = resolve(assetRoot, relative);
      if (!path.startsWith(`${assetRoot}${sep}`) || !path.endsWith(".js")) {
        await route.fulfill({ status: 403, body: "outside qualification asset inventory" }); return;
      }
      await route.fulfill({ contentType: "text/javascript", body: await readFile(path) });
    });
    const page = await context.newPage();
    await page.goto(origin);
    const observed = await page.evaluate(async (qualificationOrigin) => {
      const entry = `${qualificationOrigin}/build/invocation-cases.js`;
      const cases = `${qualificationOrigin}/build/authority/authority-cases.js`;
      const adapter = `${qualificationOrigin}/build/authority/browser-authority.js`;
      const invocationModule = await import(entry) as {
        runInvocationCases(): Promise<readonly CaseEvidence[]>;
        runInvocationAuthorityCase(factory: AuthorityFactory): Promise<CaseEvidence>;
      };
      const authorityModule = await import(cases) as {
        runAuthorityCases(factory: AuthorityFactory): Promise<readonly CaseEvidence[]>;
        runBrowserStorageCases(storage: Storage, factory: AuthorityFactory): Promise<readonly CaseEvidence[]>;
      };
      const browserModule = await import(adapter) as { createBrowserAuthority(storage: Storage, options: AuthorityOptions): ReturnType<AuthorityFactory> };
      const create = (options: AuthorityOptions) => browserModule.createBrowserAuthority(sessionStorage, options);
      const invocation = await invocationModule.runInvocationCases();
      const authority = await authorityModule.runAuthorityCases(create);
      const coupled = await invocationModule.runInvocationAuthorityCase(create);
      const storage = await authorityModule.runBrowserStorageCases(sessionStorage, create);
      const candidate = await (await fetch(`${qualificationOrigin}/build/candidate/invocation.js`)).arrayBuffer();
      const hash = await crypto.subtle.digest("SHA-256", candidate);
      const candidateSha256 = [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
      return { invocation, authority, coupled, storage, candidateSha256, userAgent: navigator.userAgent };
    }, origin);
    assert.equal(observed.candidateSha256, built.candidateSha256, "browser executes the same qualified candidate artifact bytes");
    checkEvidence(observed.invocation, observed.authority, observed.coupled);
    assert.equal(observed.storage.length, 1, "native storage replacement cleanup witness must execute");
    assert.equal(observed.storage[0]?.outcome, "passed");
    await saveEvidence("l1-chromium", { ...built, runtime: browser.version(), ...observed });
  } finally { await browser.close(); }
});
