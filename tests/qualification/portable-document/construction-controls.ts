import assert from "node:assert/strict";
export { constructionTrace } from "./consumer/construction-probe.ts";

export const constructionOrderingFailure = "construction scope closed before raw Assembly run settled";
function replaceOnce(source: string, anchor: string, replacement: string): string {
  assert.equal(source.split(anchor).length, 2, "construction instrumentation target changed: " + anchor);
  return source.replace(anchor, replacement);
}

/** Generate a separately typechecked TEST Host; leave both packed artifacts untouched. */
export function instrumentConstructionHost(source: string, omitCustody = false): string {
  let observed = replaceOnce(source, "const scope = createScope(",
    "const probe = createConstructionProbe();\n    constructionProbes.push(probe);\n    const scope = createScope(");
  observed = replaceOnce(observed, "prepared.prepared.run(", "probe.run(prepared.prepared.run, ");
  observed = replaceOnce(observed, "() => scope.control.close()", "() => probe.close(() => scope.control.close())");
  if (omitCustody) observed = replaceOnce(observed, "const result = await ingress.invoke<ConstructionOutcome>(",
    "const result = await runWithoutCustody<ConstructionOutcome>(");
  return 'import { createConstructionProbe' + (omitCustody ? ", runWithoutCustody" : "")
    + ' } from "./construction-probe.js";\n'
    + "export const constructionProbes: ReturnType<typeof createConstructionProbe>[] = [];\n" + observed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function assertConstructionTrace(value: unknown, host: "Node" | "Browser"): void {
  assert.ok(isRecord(value), "missing construction observation");
  assert.equal(value["state"], "settled", "raw construction did not settle");
  assert.equal(value["status"], "failed", "held acquisition did not fail at its cancelled setup");
  assert.equal(value["phase"], "factory");
  assert.equal(value["code"], "assembly.run.factory-rejected");
  assert.equal(value["implementationId"], "fixture/export/default");
  assert.equal(value["causeMessage"], host + " setup was cancelled");
  assert.equal(value["cancellation"], true, "construction run did not observe cancellation");
  assert.equal(value["cancellationReasonMatches"], true, "run and actual setup did not observe the same cancellation");
  assert.deepEqual(value["closes"], ["settled"], constructionOrderingFailure);
}
