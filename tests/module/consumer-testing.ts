import { AuthorityContractViolation, authorityContractCases } from "../../src/testing.ts";

/** Installed entry/runner closure proof; the native Host campaigns run the laws. */
export async function runTestingConsumer() {
  const acquisition = new Error("the consumer owns fixture acquisition");
  const cases = authorityContractCases(() => { throw acquisition; });
  const first = cases[0];
  if (first === undefined) { throw new Error("the public testing entry has no cases"); }
  let preserved = false;
  try { await first.run(); } catch (cause) { preserved = cause === acquisition; }
  const violation = new AuthorityContractViolation("detached-read", "consumer diagnostic");
  return {
    names: cases.map(value => value.name), frozen: Object.isFrozen(cases) && cases.every(Object.isFrozen),
    acquisitionFailurePreserved: preserved, diagnostic: violation.code,
  };
}
