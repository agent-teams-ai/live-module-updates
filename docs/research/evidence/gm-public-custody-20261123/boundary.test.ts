import assert from "node:assert/strict";
import { mkdtemp, open, rm, writeFile, type FileHandle } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createScope } from "@get-modular/resources";

function gate() {
  let release: () => void = () => { throw new Error("uninitialized"); };
  const promise = new Promise<void>(resolve => { release = resolve; });
  return { promise, release: () => release() };
}
async function temp() {
  const dir = await mkdtemp(join(tmpdir(), "lmu-cleanup-"));
  const path = join(dir, "resource");
  await writeFile(path, "native-resource");
  return { path, remove: () => rm(dir, { recursive: true, force: true }) };
}
async function read(handle: FileHandle): Promise<string> {
  const bytes = Buffer.alloc(64);
  const result = await handle.read(bytes, 0, bytes.length, 0);
  return bytes.subarray(0, result.bytesRead).toString("utf8");
}
async function closed(handle: FileHandle) {
  await assert.rejects(handle.stat(), { code: "EBADF" });
}

test("P9 failed drain in a reverse scope does not prevent subsequent physical release", { timeout: 15000 }, async t => {
  const file = await temp();
  const owner = createScope({ name: "old" });
  const resume = gate();
  let terminal = false;
  let attempts = 0;
  let releases = 0;
  let readAttempt: Promise<string> | undefined;
  try {
    const handle = await owner.resources.setup({
      name: "dependency", setup: () => open(file.path, "r"),
      cleanup: async value => { await value.close(); releases++; },
    });
    await owner.resources.setup({
      name: "drain", setup: () => "drain",
      cleanup: () => { attempts++; if (!terminal) throw new Error("work not drained"); },
    });
    readAttempt = (async () => {
      await resume.promise;
      try { return await read(handle); }
      finally { terminal = true; }
    })();
    // The deliberate negative control keeps the operation alive while the drain fails.
    const first = await owner.control.close();
    assert.equal(first.settled, true);
    assert.equal(first.complete, false);
    assert.equal(terminal, false);
    assert.equal(first.debts.length, 1);
    assert.equal(first.debts[0]?.path.at(-1), "drain");
    assert.equal(first.debts[0]?.state, "failed");
    assert.equal(releases, 1);
    await closed(handle);
    const failedWork = assert.rejects(readAttempt, { code: "EBADF" });
    resume.release();
    await failedWork;
    assert.equal(terminal, true);
    const retry = await owner.control.close();
    assert.equal(retry.complete, true);
    assert.equal(first.complete, false);
    assert.equal(attempts, 2);
    assert.equal(releases, 1);
    t.diagnostic(JSON.stringify({ firstComplete: first.complete, oldWorkFailed: true, dependencyReleases: releases, drainAttempts: attempts, retryComplete: retry.complete }));
  } finally {
    resume.release();
    await readAttempt?.catch(() => undefined);
    try { await owner.control.close(); } finally { await file.remove(); }
  }
});

test("P10 rejected acquisition before ownership handoff leaves unregistered physical resource", { timeout: 15000 }, async t => {
  const file = await temp();
  const wrong = createScope({ name: "wrong" });
  const right = createScope({ name: "right" });
  const retained: { escaped?: FileHandle } = {};
  let wrongReleases = 0;
  let rightReleases = 0;
  try {
    await assert.rejects(wrong.resources.setup({
      name: "open-and-validate",
      setup: async () => {
        retained.escaped = await open(file.path, "r");
        throw new Error("validation failed before returning handle");
      },
      cleanup: async (handle: FileHandle) => { await handle.close(); wrongReleases++; },
    }), /validation failed/);
    const negative = await wrong.control.close();
    assert.equal(negative.complete, true);
    assert.equal(wrongReleases, 0);
    assert.ok(retained.escaped);
    assert.equal(await read(retained.escaped), "native-resource");

    // Positive control: acquisition returns its real handle first.
    const tracked = await right.resources.setup({
      name: "open", setup: () => open(file.path, "r"),
      cleanup: async handle => { await handle.close(); rightReleases++; },
    });
    await assert.rejects(async () => { throw new Error("later validation failed"); }, /later validation failed/);
    assert.equal((await right.control.close()).complete, true);
    await closed(tracked);
    assert.equal(rightReleases, 1);
    t.diagnostic(JSON.stringify({ failedSetupCloseComplete: negative.complete, unregisteredHandleStillReadable: true, wrongCleanupCalls: wrongReleases, correctCleanupCalls: rightReleases }));
  } finally {
    try {
      await retained.escaped?.close();
      await wrong.control.close();
      await right.control.close();
    } finally { await file.remove(); }
  }
});

test("P11 actual synchronous scope abort callback can observe a half-published host route", { timeout: 15000 }, async t => {
  type Route = { selected: string; admitted: string };
  async function scenario(atomic: boolean) {
    const scope = createScope({ name: "old" });
    let route: Route = { selected: "A", admitted: "A" };
    let lateAcquisitions = 0;
    let lateAttempt: Promise<unknown> | undefined;
    const observations: Route[] = [];
    scope.resources.signal.addEventListener("abort", () => {
      observations.push({ ...route });
      lateAttempt = scope.resources.setup({
        name: "late", setup: () => { lateAcquisitions++; return "late"; }, cleanup: () => {},
      }).then(() => "unexpected-success", (error: unknown) => error);
    }, { once: true });
    // No actual updater: explicit event ordering is the negative/positive test input.
    route = atomic ? { selected: "B", admitted: "B" } : { selected: "B", admitted: "A" };
    const close = scope.control.close();
    assert.equal(observations.length, 1, "actual abort listener ran in the close call");
    route = { selected: "B", admitted: "B" };
    assert.equal((await close).complete, true);
    const late = await lateAttempt;
    assert.ok(typeof late === "object" && late !== null && "code" in late);
    assert.equal(late.code, "resources.scope.closed");
    assert.equal(lateAcquisitions, 0);
    return observations[0];
  }
  const split = await scenario(false);
  const together = await scenario(true);
  assert.deepEqual(split, { selected: "B", admitted: "A" });
  assert.deepEqual(together, { selected: "B", admitted: "B" });
  t.diagnostic(JSON.stringify({ split, together, lateAcquisitions: 0 }));
});

test("P12 AsyncGenerator return waits behind an outstanding next and actual asynchronous finalization", { timeout: 15000 }, async t => {
  const file = await temp();
  const owner = createScope({ name: "iterator" });
  const resume = gate();
  const entered = gate();
  const finish = gate();
  const finalizerEntered = gate();
  let returned = false;
  let finalizing = false;
  let iterator: AsyncGenerator<string, void, void> | undefined;
  let next: Promise<IteratorResult<string, void>> | undefined;
  let cancellation: Promise<IteratorResult<string, void>> | undefined;
  try {
    const handle = await owner.resources.setup({
      name: "handle", setup: () => open(file.path, "r"),
      cleanup: value => value.close(),
    });
    async function* stream(): AsyncGenerator<string, void, void> {
      try {
        yield "ready";
        entered.release();
        await resume.promise;
        yield await read(handle);
      } finally {
        finalizing = true;
        finalizerEntered.release();
        await finish.promise;
        assert.equal((await owner.control.close()).complete, true);
      }
    }
    iterator = stream();
    assert.deepEqual(await iterator.next(), { value: "ready", done: false });
    next = iterator.next();
    await entered.promise;
    cancellation = iterator.return(undefined).then(result => { returned = true; return result; });
    assert.equal(finalizing, false);
    assert.equal(returned, false);
    assert.equal(await read(handle), "native-resource");
    resume.release();
    assert.deepEqual(await next, { value: "native-resource", done: false });
    await finalizerEntered.promise;
    assert.equal(returned, false);
    assert.equal(await read(handle), "native-resource");
    finish.release();
    assert.deepEqual(await cancellation, { value: undefined, done: true });
    assert.equal(returned, true);
    await closed(handle);
    t.diagnostic(JSON.stringify({ returnQueuedBehindNext: true, handleReadableDuringFinalizer: true, physicallyClosedAfterReturn: true }));
  } finally {
    resume.release();
    finish.release();
    try {
      await next?.catch(() => undefined);
      await cancellation?.catch(() => undefined);
      await iterator?.return(undefined);
    } finally {
      try { await owner.control.close(); } finally { await file.remove(); }
    }
  }
});
