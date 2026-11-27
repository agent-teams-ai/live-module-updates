import assert from "node:assert/strict";
import { cp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { chromium } from "playwright";
import { composedBrowserPin, composedReportProgram, runComposedChromium } from "./composed-browser.ts";
import { prepareComposedFixture } from "./composed-fixture.ts";
import { composedByteDefects, composedFaultyHosts, composedInventory, createComposedMutant,
  type ComposedRunOptions } from "./composed-mutants.ts";
import { javascriptInventory } from "./operation-fixture.ts";
import { digest, object, run } from "./pack-operation.ts";

type Fixture = Awaited<ReturnType<typeof prepareComposedFixture>>;
type NativeRunner = (consumer: string, options?: ComposedRunOptions) => Promise<Record<string, unknown>>;

const expectedPackages = ["live-module-updates", "@get-modular/core", "@get-modular/assembly", "@get-modular/resources",
  "@get-modular/conformance", "@fixture/portable-document", "@fixture/portable-document-gm", "@fixture/composed-document"] as const;
const expectedCases = [
  "construction-plain", "construction-marked", "runtime-missing-input", "runtime-contract-conflict",
  "whole-closure-transitions", "held-whole-closure", "retained-nested-summary",
  "receiver-edit", "receiver-grant", "receiver-schema", "same-plan-distinct-factories",
  "partial-native-preparation", "parent-close-during-preparation", "lost-ack-through-successor",
  "external-parent-held-shutdown", "external-parent-cleanup-debt", "captured-original-native-owner",
  "failed-root-retains-recovery", "initial-schema-before-acquisition", "initial-schema-during-preparation",
  "unknown-original-factory", "bounded-work", "bounded-candidates", "bounded-retention",
  "finite-session-history", "independent-domains",
  "authority-detached-read", "authority-canonical-publication", "authority-original-payload",
  "authority-stale-head", "authority-stale-basis", "authority-pending-original",
  "authority-lost-acknowledgement", "authority-immutable-receipt",
] as const;

function checkRows(value: unknown, names: readonly string[]): void {
  assert.ok(Array.isArray(value));
  const rows = value.map((row: unknown) => object(row));
  const actualNames = rows.map(row => { const name = row["name"]; assert.ok(typeof name === "string"); return name; });
  assert.deepEqual(actualNames.toSorted(), [...names].toSorted(), "exact independent case census");
  for (const row of rows) { assert.equal(row["outcome"], "passed"); object(row["result"]); }
}
function requirePassed(report: Record<string, unknown>, names: readonly string[]): void {
  assert.equal(report["entered"], true, "case runner was not entered");
  assert.equal(report["status"], "passed", JSON.stringify(report));
  checkRows(report["rows"], names);
}
function requireOracle(report: Record<string, unknown>, oracle: string): void {
  assert.equal(report["entered"], true, "an import/setup failure is not a negative witness");
  assert.equal(report["status"], "rejected", "the deliberately faulty path survived: " + JSON.stringify(report));
  const primary = object(report["primary"]);
  assert.equal(primary["code"] ?? primary["message"], oracle, "only the first original failure may witness the intended defect");
  object(report["error"]);
}

async function packageJavascript(consumer: string): Promise<Record<string, unknown>> {
  const entries = await Promise.all(expectedPackages.map(async name =>
    [name, Object.fromEntries(await javascriptInventory(join(consumer, "node_modules", name, "dist")))] as const));
  return Object.fromEntries(entries);
}

async function runNode(consumer: string, artifactInputs: Fixture["artifactInputs"],
  options: ComposedRunOptions = {}): Promise<Record<string, unknown>> {
  const program = 'import { runNodeCases } from "./out/node/node-host.js";\n'
    + 'const finish = value => console.log(JSON.stringify(value));\n'
    + composedReportProgram("await runNodeCases(" + JSON.stringify(artifactInputs) + ", " + JSON.stringify(options) + ")");
  await writeFile(join(consumer, "composed-node-entry.mjs"), program);
  // Each invocation gets a fresh native module cache and the selected isolated installed bytes.
  const result = object(JSON.parse(run(process.execPath, ["composed-node-entry.mjs"], consumer)));
  return { ...result, node: process.version, driverSha256: digest(program),
    emittedInventory: Object.fromEntries(await javascriptInventory(join(consumer, "out/node"))),
    packageJavascript: await packageJavascript(consumer) };
}

function requireMutatedBytes(target: "node" | "chromium", observed: Record<string, unknown>,
  receipt: Awaited<ReturnType<typeof createComposedMutant>>["receipt"]): void {
  if (target === "chromium") {
    assert.equal(object(observed["served"])[receipt.browserPath], receipt.mutatedFileSha256);
    assert.equal(object(observed["received"])[receipt.browserPath], receipt.mutatedFileSha256);
  } else if (receipt.target === "emitted-test-consumer") {
    assert.equal(object(observed["emittedInventory"])["generation-owner.js"], receipt.mutatedFileSha256);
  } else {
    const reference = object(object(observed["packageJavascript"])["@fixture/composed-document"]);
    const prefix = "node_modules/@fixture/composed-document/dist/";
    assert.ok(receipt.file.startsWith(prefix), "the changed file must belong to the measured reference package");
    assert.equal(reference[receipt.file.slice(prefix.length)], receipt.mutatedFileSha256);
  }
}

async function byteControl(fixture: Fixture, target: "node" | "chromium", execute: NativeRunner,
  defect: (typeof composedByteDefects)[number]) {
  const consumer = join(fixture.temporary, target + "-" + defect.id);
  await cp(fixture.consumer, consumer, { recursive: true });
  let mutation: Awaited<ReturnType<typeof createComposedMutant>> | undefined;
  try {
    mutation = await createComposedMutant({ originalConsumer: fixture.consumer, mutantConsumer: consumer,
      platform: target === "node" ? "node" : "browser", defect });
    const setup = await execute(consumer, { caseName: defect.baselineCase });
    requirePassed(setup, [defect.baselineCase]);
    const observed = await execute(consumer, { caseName: defect.caseName });
    requireOracle(observed, defect.oracle);
    requireMutatedBytes(target, observed, mutation.receipt);
    await mutation.verifyMutation();
    await cp(mutation.file, join(fixture.destination, target + "-" + defect.id + ".js"));
    return { ...mutation.receipt, usefulSetup: setup, observed };
  } finally {
    try { await mutation?.verifyOriginal(); }
    finally { await rm(consumer, { recursive: true, force: true }); }
  }
}

async function verifyArchives(fixture: Fixture): Promise<void> {
  assert.deepEqual(fixture.archives.map(archive => archive.name).toSorted(), [...expectedPackages].toSorted());
  for (const archive of fixture.archives) {
    assert.equal(digest(await readFile(archive.path)), archive.sha256, "retained archive changed: " + archive.name);
  }
}

async function campaign(fixture: Fixture, target: "node" | "chromium", execute: NativeRunner): Promise<void> {
  await verifyArchives(fixture);
  const original = await composedInventory(fixture.consumer);
  const negative: unknown[] = [];
  let baseline: Record<string, unknown> | undefined;
  let complete = false;
  try {
    baseline = await execute(fixture.consumer);
    requirePassed(baseline, expectedCases);
    for (const defect of composedByteDefects) { negative.push(await byteControl(fixture, target, execute, defect)); }
    for (const profile of composedFaultyHosts) {
      const observed = await execute(fixture.consumer, { caseName: profile.caseName, ...profile.options });
      requireOracle(observed, profile.oracle);
      assert.deepEqual(await composedInventory(fixture.consumer), original, "native faulty profile changed installed or emitted code");
      negative.push({ ...profile, inputInventorySha256: digest(JSON.stringify(original)), observed });
    }
    assert.equal(negative.length, 8);
    assert.deepEqual(await composedInventory(fixture.consumer), original);
    await verifyArchives(fixture);
    complete = true;
  } finally {
    await writeFile(join(fixture.destination, target + ".json"), JSON.stringify({ ...fixture.identities, target,
      status: complete ? "passed" : "incomplete", expectedCases, baseline, negative,
      installedInputInventorySha256: digest(JSON.stringify(original)) }, null, 2) + "\n");
  }
}

await test("one installed composed module closure qualifies in Node and Chromium", { timeout: 300_000 }, async context => {
  const fixture = await prepareComposedFixture();
  context.after(() => fixture.dispose());
  await context.test("native Node qualifies the whole closure and all eight independent controls", { timeout: 120_000 }, async () => {
    await campaign(fixture, "node", (consumer, options) => runNode(consumer, fixture.artifactInputs, options));
  });
  await context.test("native Chromium loads the same archives and rejects all eight controls", { timeout: 120_000 }, async () => {
    const pin = await composedBrowserPin();
    const browser = await chromium.launch({ headless: true });
    try {
      assert.equal(browser.version(), pin.browserVersion);
      await writeFile(join(fixture.destination, "browser-version.json"), JSON.stringify({ ...pin, actualVersion: browser.version() }, null, 2) + "\n");
      await campaign(fixture, "chromium", (consumer, options) => runComposedChromium({ browser, consumer,
        artifactInputs: fixture.artifactInputs, packageNames: expectedPackages, ...(options === undefined ? {} : { run: options }) }));
    } finally { await browser.close(); }
  });
});
