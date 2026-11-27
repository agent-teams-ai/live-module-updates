import type {
  BoundInvocation, InvocationFacade, InvocationOutcome, ModuleEntry, PreparationCustody, PreparationPort, UpdateRuntime,
} from "../../src/index.ts";

interface ReadCommand { readonly kind: "read" }
interface WriteCommand { readonly kind: "write"; readonly text: string }
type Command = ReadCommand | WriteCommand;
interface Saved { readonly status: "saved"; readonly revision: number }
type SemanticResult = Saved | { readonly status: "denied"; readonly reason: "read-only" };

/** These positive substitutions compile from both source and the installed declarations. */
export function readConsumer(available: {
  readonly facade: InvocationFacade<readonly [Command], SemanticResult>;
  readonly continuation: BoundInvocation<readonly [Command], SemanticResult>;
  readonly runtime: UpdateRuntime<readonly [Command], SemanticResult>;
}): {
  readonly facade: InvocationFacade<readonly [ReadCommand], SemanticResult>;
  readonly continuation: BoundInvocation<readonly [ReadCommand], SemanticResult>;
  readonly runtime: UpdateRuntime<readonly [ReadCommand], SemanticResult>;
} {
  return available;
}

export function savedConsumer(available: InvocationFacade<readonly [Command], Saved>): InvocationFacade<readonly [ReadCommand], SemanticResult> {
  return available;
}

/** Provider entries keep the exact continuation contract; no bivariant shortcut is needed. */
export function prepareSameContract(
  entry: ModuleEntry<readonly [Command], SemanticResult>,
  close: PreparationCustody<readonly [Command], SemanticResult>["close"],
): PreparationPort<readonly [Command], SemanticResult> {
  return {
    open: () => ({
      prepare: () => ({ invoke: entry }),
      close,
    }),
  };
}

/** An admitted operation's returned semantic denial remains an ordinary application result. */
export function describeOutcome(outcome: InvocationOutcome<SemanticResult>): string {
  switch (outcome.status) {
    case "returned": return outcome.value.status === "saved" ? "saved:" + outcome.value.revision : "denied:" + outcome.value.reason;
    case "failed": return "provider-failed";
    case "refused": return "admission-refused:" + outcome.reason;
  }
}

const header = [
  'import type { BoundInvocation, InvocationFacade, InvocationOutcome, ModuleEntry, PreparationPort, UpdateHandle, UpdateRuntime } from "live-module-updates";',
  'type ReadCommand = { readonly kind: "read" };',
  'type Command = ReadCommand | { readonly kind: "write"; readonly text: string };',
  'type Saved = { readonly status: "saved"; readonly revision: number };',
  'type SemanticResult = Saved | { readonly status: "denied"; readonly reason: "read-only" };',
].join("\n");

/** Each diagnostic belongs to its own concrete assignment; unrelated errors cannot satisfy it. */
export const contractVarianceRejections = [
  {
    name: "narrow-facade",
    setup: "declare const narrow: InvocationFacade<readonly [ReadCommand], SemanticResult>;",
    assignment: "export const wide: InvocationFacade<readonly [Command], SemanticResult> = narrow;",
    code: "TS2322",
  },
  {
    name: "narrow-continuation",
    setup: "declare const narrow: BoundInvocation<readonly [ReadCommand], SemanticResult>;",
    assignment: "export const wide: BoundInvocation<readonly [Command], SemanticResult> = narrow;",
    code: "TS2322",
  },
  {
    name: "narrow-runtime",
    setup: "declare const narrow: UpdateRuntime<readonly [ReadCommand], SemanticResult>;",
    assignment: "export const wide: UpdateRuntime<readonly [Command], SemanticResult> = narrow;",
    code: "TS2322",
  },
  {
    name: "narrow-entry",
    setup: "declare const narrow: ModuleEntry<readonly [ReadCommand], SemanticResult>;",
    assignment: "export const wide: ModuleEntry<readonly [Command], SemanticResult> = narrow;",
    code: "TS2322",
  },
  {
    name: "entry-continuation-invariance",
    setup: "declare const wide: ModuleEntry<readonly [Command], SemanticResult>;",
    assignment: "export const narrow: ModuleEntry<readonly [ReadCommand], SemanticResult> = wide;",
    code: "TS2322",
  },
  {
    name: "preparation-continuation-invariance",
    setup: "declare const wide: PreparationPort<readonly [Command], SemanticResult>;",
    assignment: "export const narrow: PreparationPort<readonly [ReadCommand], SemanticResult> = wide;",
    code: "TS2322",
  },
  {
    name: "semantic-denial-is-preserved",
    setup: "declare const available: InvocationFacade<readonly [Command], SemanticResult>;",
    assignment: "export const successOnly: InvocationFacade<readonly [Command], Saved> = available;",
    code: "TS2322",
  },
  {
    name: "admission-outcome-is-not-semantic-result",
    setup: "declare const outcome: InvocationOutcome<SemanticResult>;",
    assignment: "export const value = outcome.value;",
    code: "TS2339",
  },
  {
    name: "facade-callable-is-readonly",
    setup: "declare const facade: InvocationFacade<readonly [Command], SemanticResult>;",
    assignment: "facade.invoke = () => Promise.resolve({ status: 'refused', reason: 'boundary-closed' });",
    code: "TS2540",
  },
  {
    name: "owner-action-is-readonly",
    setup: "declare const handle: UpdateHandle;",
    assignment: "handle.reconcile = () => Promise.resolve(handle.inspect());",
    code: "TS2540",
  },
].map(specification => ({
  name: specification.name,
  source: header + "\n" + specification.setup + "\n" + specification.assignment + "\n",
  line: 7,
  code: specification.code,
}));
