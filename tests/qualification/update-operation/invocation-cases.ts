import { createScope, type CloseReport, type Scope } from "@get-modular/resources";
import {
  createInvocationBoundary, observeInvocation,
  type BoundInvocation, type GenerationControl, type InvocationOutcome,
} from "./candidate/invocation.ts";
import type { AuthorityFactory } from "./authority/contract.js";
import { requestFor } from "./authority/authority-cases.js";

export type CaseEvidence = { readonly name: string; readonly outcome: "passed"; readonly witness?: string };
type Command = { readonly kind: "read" | "increment" } | { readonly kind: "exercise"; readonly label: string };
type Value = { readonly generationId: string; readonly count: number };
type Context = BoundInvocation<readonly [Command], Value>;
type Hook = (context: Context, command: Command, view: () => Value, increment: () => Value) => Value | PromiseLike<Value>;
type GenerationId = "A" | "B";

function require(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function returned<T>(outcome: InvocationOutcome<T>): T {
  if (outcome.status !== "returned") throw new Error(`expected returned outcome, received ${outcome.status}`);
  return outcome.value;
}

function refused<T>(outcome: InvocationOutcome<T>, reason: string): void {
  require(outcome.status === "refused" && outcome.reason === reason, `expected refusal ${reason}`);
}

function causeCode(cause: unknown): string | undefined {
  return typeof cause === "object" && cause !== null && "code" in cause && typeof cause.code === "string"
    ? cause.code : undefined;
}

class LifetimeWitnessError extends Error {
  readonly code = "qualification.use-after-release";
}

class SelectionWitnessError extends Error {
  readonly code = "qualification.wrong-generation";
}

async function fixture(hook?: Hook, maxActiveWork = 16) {
  const owner = { count: 0 };
  const target = new EventTarget();
  const pulses = { A: 0, B: 0, foreign: 0 };
  const foreign = () => { pulses.foreign += 1; };
  target.addEventListener("pulse", foreign);
  let head: Readonly<{ generationId: string }> | undefined = Object.freeze({ generationId: "A" });
  const boundary = createInvocationBoundary<readonly [Command], Value, CloseReport>({ readHead: () => head, maxActiveWork });
  const controls = new Map<GenerationId, GenerationControl<CloseReport>>();
  const scopes = new Map<GenerationId, Scope>();
  const released = { A: false, B: false };
  const nativeCloses: Promise<CloseReport>[] = [];
  const rawEntries = new Map<GenerationId, () => Value>();
  try {
    for (const generationId of ["A", "B"] as const) {
      const scope = createScope({ name: `generation-${generationId}` });
      scopes.set(generationId, scope);
      const lease = await scope.resources.setup({
        name: "native-listener-and-view",
        setup: () => {
          const listener = () => { pulses[generationId] += 1; };
          target.addEventListener("pulse", listener);
          return { listener, active: true };
        },
        cleanup: (value) => {
          value.active = false;
          released[generationId] = true;
          target.removeEventListener("pulse", value.listener);
        },
      });
      const view = (): Value => {
        if (!lease.active) throw new LifetimeWitnessError(`generation ${generationId} was physically released before its work`);
        return { generationId, count: owner.count };
      };
      const increment = (): Value => { view(); owner.count += 1; return view(); };
      rawEntries.set(generationId, view);
      controls.set(generationId, boundary.attachGeneration({
        generationId,
        invoke: (context, command) => hook
          ? hook(context, command, view, increment)
          : command.kind === "increment" ? increment() : view(),
        release: () => {
          const close = scope.control.close();
          nativeCloses.push(close);
          return close;
        },
      }));
    }
  } catch (error) {
    await Promise.all([...scopes.values()].map((scope) => scope.control.close()));
    target.removeEventListener("pulse", foreign);
    throw error;
  }
  const control = (id: GenerationId) => {
    const value = controls.get(id);
    if (!value) throw new Error(`fixture generation ${id} missing`);
    return value;
  };
  const scope = (id: GenerationId) => {
    const value = scopes.get(id);
    if (!value) throw new Error(`fixture scope ${id} missing`);
    return value;
  };
  return {
    boundary, owner, target, pulses, released, nativeCloses, control, scope,
    setHead: (id: string | undefined) => { head = id === undefined ? undefined : Object.freeze({ generationId: id }); },
    // This deliberately unsafe composition-only reference is used solely to mutate the negative control.
    rawEntry: (id: GenerationId) => {
      const entry = rawEntries.get(id);
      if (!entry) throw new Error(`fixture raw entry ${id} missing`);
      return entry;
    },
    async close() {
      await Promise.all([...controls.values()].map((value) => value.close()));
      target.removeEventListener("pulse", foreign);
    },
  };
}

/** Same portable candidate and scenarios execute inside Node and inside a native Chromium realm. */
export async function runInvocationCases(): Promise<readonly CaseEvidence[]> {
  const evidence: CaseEvidence[] = [];
  async function scenario(name: string, run: () => Promise<string | void>) {
    try {
      const witness = await run();
      evidence.push(witness === undefined ? { name, outcome: "passed" } : { name, outcome: "passed", witness });
    } catch (cause) {
      throw new Error(`L1 invocation case failed: ${name}`, { cause });
    }
  }

  await scenario("useful operation; canonical head, borrowed state and exact cleanup", async () => {
    const f = await fixture();
    try {
      require(returned(await f.boundary.invoke({ kind: "increment" })).count === 1, "useful operation result");
      require(f.owner.count === 1, "owner state is an independent effect witness");
      f.setHead("B");
      require(returned(await f.boundary.invoke({ kind: "read" })).generationId === "B", "fresh call must use canonical B");
      const original = f.control("A").close();
      require(f.control("A").close() === original, "close must coalesce its original flight");
      require((await original).complete, "A should release after useful work");
      require(f.control("A").originalCleanup() === f.nativeCloses[0], "preserve original native close identity");
      f.target.dispatchEvent(new Event("pulse"));
      require(f.pulses.A === 0 && f.pulses.B === 1 && f.pulses.foreign === 1, "A cleanup must preserve B and foreign listeners");
      require(f.owner.count === 1, "borrowed state survives generation cleanup");
      f.setHead("A");
      refused(await f.boundary.invoke({ kind: "read" }), "admission-closed");
      f.setHead("not-attached");
      refused(await f.boundary.invoke({ kind: "read" }), "generation-unavailable");
      f.setHead(undefined);
      refused(await f.boundary.invoke({ kind: "read" }), "no-current-generation");
    } finally { await f.close(); }
  });

  await scenario("nested, reentrant and post-await work retains A while new calls use B", async () => {
    const entered = Promise.withResolvers<void>();
    const resume = Promise.withResolvers<void>();
    const nested: string[] = [];
    let escaped: Context | undefined;
    const f = await fixture(async (context, command, view) => {
      if (command.kind !== "exercise" || command.label !== "root") return view();
      escaped = context;
      nested.push(returned(await context.invoke({ kind: "exercise", label: "synchronous-child" })).generationId);
      entered.resolve();
      await resume.promise;
      // Resources remain open for legitimate acquisition by retained work after await.
      await f.scope("A").resources.setup({ name: "late-child-acquisition", setup: () => ({}), cleanup: () => {} });
      nested.push(returned(await context.invoke({ kind: "exercise", label: "post-await-child" })).generationId);
      return view();
    });
    try {
      const admitted = f.boundary.invoke({ kind: "exercise", label: "root" });
      await entered.promise;
      require(f.control("A").pending() === 1, "root remains retained after nested child settles");
      f.setHead("B");
      const closingA = f.control("A").close();
      const fresh = returned(await f.boundary.invoke({ kind: "read" }));
      require(fresh.generationId === "B", "new admission must observe B before A drain");
      require(!f.released.A && f.control("A").originalCleanup() === undefined, "A native close cannot start before raw settlement");
      resume.resolve();
      require(returned(await admitted).generationId === "A", "held root affinity");
      require(nested.join(",") === "A,A", "nested and post-await continuation affinity");
      require((await closingA).complete, "A closes after actual work");
      require(escaped !== undefined, "provider exported context only for negative lifetime probe");
      refused(await escaped.invoke({ kind: "read" }), "continuation-closed");
    } finally { resume.resolve(); await f.close(); }
  });

  await scenario("reservation and close flight precede reentrant provider callbacks", async () => {
    let original: Promise<CloseReport> | undefined;
    let nested: Promise<InvocationOutcome<Value>> | undefined;
    const f = await fixture((context, command, view) => {
      if (command.kind === "exercise") {
        require(f.boundary.pending() === 1, "record reserved before entry callback");
        original = f.control("A").close();
        require(f.control("A").close() === original, "reentrant close observes published flight");
        // The global surface is closed, but this admitted operation may finish its own work.
        nested = context.invoke({ kind: "read" });
      }
      return view();
    });
    try {
      const result = f.boundary.invoke({ kind: "exercise", label: "reentrant" });
      refused(await f.boundary.invoke({ kind: "read" }), "admission-closed");
      require(returned(await result).generationId === "A", "admitted root remains alive through reentry");
      require(nested !== undefined && returned(await nested).generationId === "A", "retained nested work may finish after seal");
      require(original !== undefined && (await original).complete, "close must wait for registered root/child");
    } finally { await f.close(); }
  });

  await scenario("observer cancellation does not settle or release raw work", async () => {
    const entered = Promise.withResolvers<void>();
    const resume = Promise.withResolvers<void>();
    const f = await fixture(async (_context, command, view, increment) => {
      if (command.kind !== "exercise") return view();
      entered.resolve();
      await resume.promise;
      return increment();
    });
    try {
      const raw = f.boundary.invoke({ kind: "exercise", label: "held" });
      await entered.promise;
      const abandon = new AbortController();
      const waiting = observeInvocation(raw, abandon.signal);
      const close = f.control("A").close();
      abandon.abort();
      require((await waiting).status === "abandoned", "caller may stop waiting");
      require(f.boundary.pending() === 1 && !f.released.A && f.owner.count === 0, "observer cancellation changes no work/ownership facts");
      resume.resolve();
      require(returned(await raw).count === 1 && Number(f.owner.count) === 1, "raw operation really finishes after observer abandoned");
      require((await close).complete, "cleanup follows actual raw settlement");
    } finally { resume.resolve(); await f.close(); }
  });

  await scenario("registered descendants outliving raw parent stay retained", async () => {
    const childEntered = Promise.withResolvers<void>();
    const childResume = Promise.withResolvers<void>();
    const f = await fixture(async (context, command, view) => {
      if (command.kind !== "exercise") return view();
      if (command.label === "root") {
        void context.invoke({ kind: "exercise", label: "child" });
        return view(); // Deliberately omit await: completion still includes registered descendants.
      }
      childEntered.resolve();
      await childResume.promise;
      return view();
    });
    try {
      const root = f.boundary.invoke({ kind: "exercise", label: "root" });
      let rootSettled = false;
      void root.then(() => { rootSettled = true; });
      await childEntered.promise;
      await Promise.resolve();
      const close = f.control("A").close();
      require(f.boundary.pending() === 2 && !rootSettled && !f.released.A, "parent and unawaited child remain owned");
      childResume.resolve();
      require(returned(await root).generationId === "A", "complete call includes registered child completion");
      require((await close).complete, "native close follows descendant completion");
    } finally { childResume.resolve(); await f.close(); }
  });

  await scenario("capacity counts all generations and descendants before entry", async () => {
    const resume = Promise.withResolvers<void>();
    let providerEntries = 0;
    const children: Promise<InvocationOutcome<Value>>[] = [];
    const f = await fixture(async (context, command, view) => {
      providerEntries += 1;
      if (command.kind === "exercise" && command.label === "root") {
        for (let index = 0; index < 15; index += 1) children.push(context.invoke({ kind: "exercise", label: "child" }));
        refused(await context.invoke({ kind: "read" }), "work-capacity");
      }
      await resume.promise;
      return view();
    });
    try {
      const root = f.boundary.invoke({ kind: "exercise", label: "root" });
      require(f.boundary.pending() === 16 && providerEntries === 16, "root plus 15 descendants fill explicit domain budget");
      f.setHead("B");
      refused(await f.boundary.invoke({ kind: "read" }), "work-capacity");
      require(providerEntries === 16, "refused B callback was never entered");
      resume.resolve();
      returned(await root);
      await Promise.all(children);
      require(f.boundary.pending() === 0, "all capacity released only after settlement");
      require(returned(await f.boundary.invoke({ kind: "read" })).generationId === "B", "capacity recovers after real completion");
    } finally { resume.resolve(); await f.close(); }
  });

  await scenario("synchronous failure releases work accounting without swallowing cause", async () => {
    const failure = new Error("fixture provider failure");
    const f = await fixture(() => { throw failure; });
    try {
      const result = await f.boundary.invoke({ kind: "read" });
      require(result.status === "failed" && result.cause === failure, "provider failure identity preserved");
      require(f.boundary.pending() === 0, "failed raw body settles its actual work record");
      require((await f.control("A").close()).complete, "failed operation still cleans owned resources");
    } finally { await f.close(); }
  });

  await scenario("native cleanup debt remains original; explicit retry is a distinct attempt", async () => {
    const scope = createScope({ name: "retry-witness" });
    const failure = new Error("first physical release failed");
    const retryResume = Promise.withResolvers<void>();
    let cleanupCalls = 0;
    await scope.resources.setup({ name: "release", setup: () => ({}), cleanup: async () => {
      cleanupCalls += 1;
      if (cleanupCalls === 1) throw failure;
      await retryResume.promise;
    } });
    const nativeFlights: Promise<CloseReport>[] = [];
    const boundary = createInvocationBoundary<readonly [], number, CloseReport>({ readHead: () => ({ generationId: "A" }), maxActiveWork: 16 });
    const generation = boundary.attachGeneration({ generationId: "A", invoke: () => 1, release: () => {
      const native = scope.control.close(); nativeFlights.push(native); return native;
    } });
    try {
      require(returned(await boundary.invoke()) === 1, "useful setup succeeds before cleanup mutation");
      const original = generation.close();
      const report = await original;
      require(report.settled && !report.complete && report.debts.length === 1, "original native debt report preserved");
      require(report.debts[0]?.state === "failed" && report.debts[0].cause === failure, "original cleanup cause retained");
      require(generation.close() === original && cleanupCalls === 1, "observation cannot silently retry");
      require(generation.originalCleanup() === nativeFlights[0], "original native promise remains captured");
      const retry = generation.retryCleanup();
      require(generation.retryCleanup() === retry && retry !== original, "explicit retry coalesces one different flight");
      retryResume.resolve();
      require((await retry).complete, "retry can actually release retained debt");
      require(await original === report && !report.complete, "later success does not rewrite original failure");
      require(nativeFlights.length === 2, "exactly original plus one intentional native retry");
    } finally { retryResume.resolve(); await scope.control.close(); }
  });

  await scenario("negative control: premature release is detected after successful setup", async () => {
    const entered = Promise.withResolvers<void>();
    const resume = Promise.withResolvers<void>();
    const f = await fixture(async (_context, command, view, increment) => {
      if (command.kind !== "exercise") return view();
      entered.resolve(); await resume.promise; return increment();
    });
    try {
      require(returned(await f.boundary.invoke({ kind: "read" })).count === 0, "successful baseline before mutation");
      const work = f.boundary.invoke({ kind: "exercise", label: "negative" });
      await entered.promise;
      // Deliberate faulty owner: close the real Resources scope while admitted work is suspended.
      require((await f.scope("A").control.close()).complete, "mutation physically released the resource");
      resume.resolve();
      const outcome = await work;
      require(outcome.status === "failed" && causeCode(outcome.cause) === "qualification.use-after-release", "independent lifetime witness must reject premature release");
      require(f.owner.count === 0, "invalid late effect never reached borrowed owner");
      return "qualification.use-after-release";
    } finally { resume.resolve(); await f.close(); }
  });

  await scenario("negative control: split selection and raw entry bypass are observable", async () => {
    const f = await fixture();
    try {
      require(returned(await f.boundary.invoke({ kind: "increment" })).count === 1, "successful useful baseline before mutation");
      const staleSelection = f.rawEntry("A");
      await Promise.resolve(); // Deliberately create the forbidden selection/admission gap.
      f.setHead("B");
      require(returned(await f.boundary.invoke({ kind: "read" })).generationId === "B", "real boundary follows canonical head");
      let rejected = false;
      try {
        const stale = staleSelection();
        if (stale.generationId !== "B") throw new SelectionWitnessError("fresh invocation executed stale selected generation");
      } catch (cause) { rejected = causeCode(cause) === "qualification.wrong-generation"; }
      require(rejected, "wrong-generation witness must detect intentionally split raw invocation");
      return "qualification.wrong-generation";
    } finally { await f.close(); }
  });

  return evidence;
}

/** Publication and invocation share the actual native Host head, including lost acknowledgment. */
export async function runInvocationAuthorityCase(createAuthority: AuthorityFactory): Promise<CaseEvidence> {
  const authority = createAuthority({ domainId: "invocation-coupling", generationId: "A", text: "before", storageKey: "l1-invocation-coupling" });
  const entered = Promise.withResolvers<void>();
  const resume = Promise.withResolvers<void>();
  type Result = { readonly generationId: string; readonly nestedGeneration?: string; readonly staleWriteRefused?: boolean };
  const boundary = createInvocationBoundary<readonly ["read" | "held"], Result, CloseReport>({
    readHead: () => authority.read().head,
    maxActiveWork: 16,
  });
  const controls = new Map<GenerationId, GenerationControl<CloseReport>>();
  const scopes: Scope[] = [];
  try {
    for (const generationId of ["A", "B"] as const) {
      const scope = createScope({ name: `authority-coupled-${generationId}` });
      scopes.push(scope);
      const resource = await scope.resources.setup({ name: "cohort-lifetime", setup: () => ({ active: true }), cleanup: (value) => { value.active = false; } });
      controls.set(generationId, boundary.attachGeneration({ generationId,
        invoke: async (context, command) => {
          if (!resource.active) throw new LifetimeWitnessError("coupled native scope released early");
          if (command === "read") return { generationId };
          entered.resolve();
          await resume.promise;
          const nested = returned(await context.invoke("read"));
          const late = authority.write(generationId, authority.read().state.revision, "stale-A-effect");
          return { generationId, nestedGeneration: nested.generationId, staleWriteRefused: late.status === "rejected" && late.reason === "stale-generation" };
        },
        release: () => scope.control.close(),
      }));
    }
    require(returned(await boundary.invoke("read")).generationId === "A", "useful native authority setup");
    const workA = boundary.invoke("held");
    await entered.promise;
    const request = requestFor(authority, "coupled-lost-ack", "B");
    // Real native publication runs through a deliberately faulty transport, which
    // withholds the reply. No activate-after-ack callback runs anywhere.
    const missingReply = new Error("fixture publication acknowledgment lost");
    const publishDroppingReply = () => { authority.publish(request); throw missingReply; };
    let replyLost = false;
    try { publishDroppingReply(); } catch (cause) { replyLost = cause === missingReply; }
    require(replyLost && authority.read().head.generationId === "B", "native owner committed while transport withheld its reply");
    const closingA = controls.get("A")?.close();
    require(closingA !== undefined, "exact old generation is retained by invocation owner");
    require(returned(await boundary.invoke("read")).generationId === "B", "lost acknowledgment cannot leave facade routing a shadow A head");
    resume.resolve();
    const old = returned(await workA);
    require(old.generationId === "A" && old.nestedGeneration === "A", "retained continuation still selects coherent A");
    require(old.staleWriteRefused && authority.read().state.text === "before", "retained invocation is not current receiver authority");
    const known = authority.lookup(request.attemptId);
    require(known.status === "known" && known.receipt.status === "committed" && known.receipt.head.generationId === "B", "same native attempt receipt reconciles committed B");
    require((await closingA).complete, "original A lifetime releases after raw operation");
    return { name: "native publication immediately routes B despite lost acknowledgment; A retains affinity without write authority", outcome: "passed" };
  } finally {
    resume.resolve();
    await Promise.all([...controls.values()].map((control) => control.close()));
    await Promise.all(scopes.map((scope) => scope.control.close()));
    authority.dispose();
  }
}
