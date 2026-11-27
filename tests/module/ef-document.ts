/**
 * Compiled as one self-contained ESM fixture and signed before execution.
 * This private witness name is the fixed Host/bundle qualification protocol.
 * No import of this source may supply the consumer's executable formatter.
 */
interface Witness { evaluations: number; calls: number }
function isWitness(value: unknown): value is Witness {
  return typeof value === "object" && value !== null && "evaluations" in value && typeof value.evaluations === "number"
    && "calls" in value && typeof value.calls === "number";
}
const witness: unknown = Object.getOwnPropertyDescriptor(globalThis, "__lmuEfJointEvaluation")?.value;
if (!isWitness(witness)) {
  throw new Error("The document Host must own its evaluation witness before loading the bundle");
}
witness.evaluations += 1;

const ownedWitness: Witness = witness;
export function format(text: string): string { ownedWitness.calls += 1; return "signed:" + text; }
