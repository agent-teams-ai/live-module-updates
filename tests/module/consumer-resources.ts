import { createResourcesPreparation } from "../../src/resources.ts";

function equal(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) { throw new Error(message); }
}

/** Separate peer consumer: its DOM-shaped native Resources declarations never enter the ordinary root. */
export async function runResourcesConsumer(): Promise<{ value: number; closed: true }> {
  const lifetime = { active: false };
  const preparation = createResourcesPreparation<readonly [], number>(async (_context, resources) => {
    await resources.setup({
      name: "installed-peer-resource",
      setup: () => { lifetime.active = true; return { token: "exact-instance" }; },
      cleanup: (instance) => {
        if (instance.token !== "exact-instance") { throw new Error("wrong cleanup instance"); }
        lifetime.active = false;
      },
    });
    return { invoke: () => lifetime.active ? 7 : 0 };
  });
  const candidate = { generationId: "next", closureId: "closure/next", contract: { id: "peer", revision: "1" },
    profile: "cooperative-operation-v1" as const };
  const owner = preparation.open({ domainId: "peer-consumer", request: { attemptId: "peer-attempt", candidate },
    baseline: { domainId: "peer-consumer", head: { generationId: "initial", revision: "head/a" }, basis: "basis/a" } });
  equal(lifetime.active, false, "opening the preparation owner evaluated code");
  try {
    const prepared = await owner.prepare();
    const value = await prepared.invoke({ generationId: "next", invoke: () => { throw new Error("no recursive call requested"); } });
    if (value !== 7) { throw new Error("installed Resources adapter did not acquire the native resource"); }
    const closing = owner.close();
    if (owner.close() !== closing) { throw new Error("Resources original close flight was replaced"); }
    const report = await closing;
    if (!report.complete) { throw new Error("native Resources cleanup did not finish"); }
    equal(lifetime.active, false, "native resource remained active after close");
    return { value, closed: true };
  } finally { await owner.close(); }
}
