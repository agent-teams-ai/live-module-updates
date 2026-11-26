import { createUpdateRuntime, type UpdateAuthority, type CandidateDescription } from "../../src/index.ts";

function equal(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) { throw new Error(message); }
}

/** This exact consumer is copied to a clean installation and compiled with ES libraries only. */
export async function runOrdinaryConsumer(): Promise<{ value: number; refusedAfterClose: true; releases: number }> {
  const candidate: CandidateDescription = {
    generationId: "initial", closureId: "closure/initial", contract: { id: "double", revision: "1" },
    profile: "cooperative-operation-v1",
  };
  const authority: UpdateAuthority = {
    read: () => ({ domainId: "ordinary-consumer", head: { generationId: "initial", revision: "head/a" }, basis: "basis/a" }),
    publish: () => { throw new Error("this invocation proof does not request publication"); },
    lookup: () => ({ status: "unknown" }),
  };
  const entered = Promise.withResolvers<void>();
  const resume = Promise.withResolvers<void>();
  const owner = { releases: 0 };
  const runtime = createUpdateRuntime<readonly [number], number>({
    domainId: "ordinary-consumer", authority,
    initial: {
      candidate,
      invoke: async (_context, value) => { entered.resolve(); await resume.promise; return value * 2; },
      release: () => { owner.releases += 1; return Promise.resolve({ complete: true, settled: true, debts: [] }); },
    },
    compatibility: { check: () => ({ status: "compatible" }) },
    preparation: { open: () => { throw new Error("this invocation proof does not prepare a candidate"); } },
    limits: { maxAttempts: 2, maxCandidates: 1, maxRetainedPredecessors: 1, maxActiveWork: 4 },
  });
  const pending = runtime.invoke(21);
  await entered.promise;
  const closing = runtime.close();
  const refused = await runtime.invoke(7);
  if (refused.status !== "refused" || refused.reason !== "boundary-closed") {
    throw new Error("closing must refuse new work and retain the existing native owner");
  }
  equal(owner.releases, 0, "pending work released its owner early");
  resume.resolve();
  const result = await pending;
  const closed = await closing;
  if (result.status !== "returned" || result.value !== 42 || !closed.complete) {
    throw new Error("useful operation and actual cleanup did not complete");
  }
  equal(owner.releases, 1, "original owner was not released exactly once");
  if (runtime.close() !== closing) { throw new Error("original close observation changed"); }
  return { value: result.value, refusedAfterClose: true, releases: owner.releases };
}
