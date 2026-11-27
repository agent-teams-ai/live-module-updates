import { baseline, invoke, published, summary } from "./live-cases.js";
import { createComposedRuntime } from "./runtime-host.js";
import { requireFact, throwFailures, type ArtifactInputs, type EnvironmentFactory, type NativeEnvironment } from "./environment.js";

export async function qualifyIndependentDomains(create: EnvironmentFactory, artifacts: ArtifactInputs) {
  for (const order of [0, 1]) {
    const first = create({ domain: "composed/independent/first/" + String(order) });
    let second: NativeEnvironment;
    try { second = create({ domain: "composed/independent/second/" + String(order) }); }
    catch (cause) {
      const failures = [cause]; try { first.dispose(); } catch (cleanup) { failures.push(cleanup); }
      throwFailures(failures, "second native environment failed"); throw cause;
    }
    const left = createComposedRuntime(first, { artifacts }); const right = createComposedRuntime(second, { artifacts });
    const held = order === 0 ? left : right; const free = order === 0 ? right : left;
    const failures: unknown[] = [];
    try {
      await left.construct(); await right.construct(); await baseline(left); await baseline(right);
      const pending = invoke(held, { kind: "held-view", barrier: "independent" });
      await held.environment.entered("independent");
      const retained = await published(held, "B");
      await (await published(free, "B")).completion; await (await published(free, "C")).completion;
      await summary(free, "C", "Author revision 0\nBy author: seed");
      requireFact(held.environment.alive("A") && !free.environment.alive("A"), "c.independent-native-custody");
      held.environment.resume("independent"); await pending; await retained.completion;
      requireFact((await held.closeParent()).complete, "c.independent-first-close");
      await summary(free, "C", "Author revision 0\nBy author: seed");
      requireFact(free.environment.alive("C") && free.environment.foreignIntact(), "c.independent-owner-survival");
    } catch (cause) { failures.push(cause); }
    for (const result of await Promise.allSettled([left.dispose(), right.dispose()])) {
      if (result.status === "rejected") { failures.push(result.reason); }
    }
    for (const environment of [first, second]) { try { environment.dispose(); } catch (cause) { failures.push(cause); } }
    throwFailures(failures, "independent domains and/or native disposal failed");
  }
  return { orders: 2, independentHeads: true, exactNativeOwners: true };
}
