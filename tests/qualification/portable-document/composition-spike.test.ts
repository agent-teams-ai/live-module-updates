import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, join, resolve, sep } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import type { runCompositionSpike } from "./composition-spike.ts";

const root = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const names = ["core", "assembly", "resources"] as const;
type PackageName = typeof names[number];
const expectedVersions = { core: "0.8.0", assembly: "0.8.0", resources: "0.2.2" };
const expected = { value: "public GM", close: { complete: true, settled: true, debts: [] },
  observations: ["acquired", "released"] };
const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
let temporary: string;
let compiled: Buffer;
let nodeRun: typeof runCompositionSpike;
const packages = new Map<PackageName, { root: string; entry: string; sha256: string; version: string }>();
const observations: object[] = [];

before(async () => {
  await mkdir(join(root, ".qualification/evidence"), { recursive: true });
  temporary = await mkdtemp(join(root, ".qualification/public-gm-spike-"));
  const compiler = join(dirname(require.resolve("typescript/package.json")), "bin", "tsc");
  assert.equal(execFileSync(process.execPath, [compiler, "--version"], { encoding: "utf8" }).trim(), "Version 7.0.2");
  execFileSync(process.execPath, [compiler, "--ignoreConfig", "--target", "ES2024", "--module", "NodeNext",
    "--moduleResolution", "NodeNext", "--lib", "ES2024,ESNext.Disposable,DOM",
    "--strict", "--noUncheckedIndexedAccess", "--exactOptionalPropertyTypes", "--verbatimModuleSyntax",
    "--skipLibCheck", "false", "--declaration", "--outDir", temporary, "composition-spike.ts"],
  { cwd: root, encoding: "utf8", timeout: 30000 });
  const built = join(temporary, "composition-spike.js");
  compiled = await readFile(built);
  nodeRun = (await import(pathToFileURL(built).href) as { runCompositionSpike: typeof runCompositionSpike }).runCompositionSpike;
  for (const name of names) {
    const entry = await realpath(require.resolve("@get-modular/" + name));
    const packageRoot = dirname(dirname(entry));
    const manifest: unknown = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
    assert.ok(typeof manifest === "object" && manifest !== null && "version" in manifest && typeof manifest.version === "string");
    assert.equal(manifest.version, expectedVersions[name]);
    packages.set(name, { root: packageRoot, entry, sha256: hash(await readFile(entry)), version: manifest.version });
  }
  const assembly = packages.get("assembly");
  const core = packages.get("core");
  assert.ok(assembly && core);
  assert.equal(await realpath(createRequire(assembly.entry).resolve("@get-modular/core")), core.entry,
    "Assembly and consumer must use the same physical Core");
});

after(async () => {
  try {
    await writeFile(join(root, ".qualification/evidence/composition-spike.json"), JSON.stringify({
      kind: "public-package-node-chromium-spike", source: process.env["QUALIFICATION_SOURCE_SHA"] ?? "local-unpublished",
      node: process.version, compiler: "7.0.2", packages: Object.fromEntries(packages),
      adapterSha256: compiled ? hash(compiled) : null, observations,
    }, null, 2) + "\n");
  } finally { if (temporary) await rm(temporary, { recursive: true, force: true }); }
});

test("P1 public GM composes and closes through installed exports in Node", async () => {
  const result = await nodeRun();
  assert.deepEqual(result, expected);
  observations.push({ host: "node", result, adapterSha256: hash(compiled) });
});

test("P1 identical public GM and adapter bytes execute in actual Chromium", { timeout: 90000 }, async () => {
  const imports = Object.fromEntries(names.map(name => ["@get-modular/" + name, "/modules/" + name + "/dist/index.js"]));
  const server = createServer((request, response) => {
    void (async () => {
      const url = new URL(request.url ?? "/", "http://localhost");
      if (url.pathname === "/") {
        response.setHeader("content-type", "text/html");
        response.end(`<script type="importmap">${JSON.stringify({ imports })}</script>`);
        return;
      }
      let bytes: Buffer;
      if (url.pathname === "/adapter.js") bytes = compiled;
      else {
        const match = /^\/modules\/(core|assembly|resources)\/(.+)$/u.exec(url.pathname);
        assert.ok(match && match[1] && match[2]);
        const owner = packages.get(match[1] as PackageName);
        assert.ok(owner);
        const file = resolve(owner.root, match[2]);
        assert.ok(file.startsWith(owner.root + sep) && file.endsWith(".js"));
        bytes = await readFile(file);
      }
      response.setHeader("content-type", "application/javascript");
      response.end(bytes);
    })().catch(() => { response.statusCode = 404; response.end(); });
  });
  await new Promise<void>(resolveListening => server.listen(0, "127.0.0.1", resolveListening));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const errors: string[] = [];
    const responses: Promise<readonly [string, string]>[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("response", response => {
      const path = new URL(response.url()).pathname;
      if (path === "/adapter.js" || Object.values(imports).includes(path)) {
        responses.push(response.body().then(bytes => [path, hash(bytes)] as const));
      }
    });
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    await page.goto(`http://127.0.0.1:${address.port}/`);
    const result: unknown = await page.evaluate(async () => {
      const entry = "/adapter.js";
      const module = await import(entry) as { runCompositionSpike: () => Promise<unknown> };
      return module.runCompositionSpike();
    });
    assert.deepEqual(result, expected);
    assert.deepEqual(errors, []);
    const received = Object.fromEntries(await Promise.all(responses));
    assert.equal(received["/adapter.js"], hash(compiled));
    for (const name of names) assert.equal(received["/modules/" + name + "/dist/index.js"], packages.get(name)?.sha256);
    observations.push({ host: "chromium", browser: browser.version(), result, received });
  } finally {
    try { await browser?.close(); }
    finally {
      await new Promise<void>((resolveClosed, reject) => {
        server.close(error => error ? reject(error) : resolveClosed()); server.closeAllConnections();
      });
      assert.equal(server.listening, false);
    }
  }
});
