import type { Resources } from "@get-modular/resources";
import { createUpdateRuntime, type AuthoritySnapshot, type CleanupReport, type UpdateRuntime } from "live-module-updates";
import type { DocumentCommand, DocumentReply } from "../application/ports/document-operation.js";
import type { DocumentRuntimeInputs } from "./document-runtime.contracts.js";

interface OwnerCell {
  initialClose?: (() => Promise<CleanupReport>) | undefined;
  runtime?: UpdateRuntime<readonly [DocumentCommand], DocumentReply>;
  failure?: { readonly cause: unknown };
}

async function closeCell(cell: OwnerCell): Promise<void> {
  if (cell.runtime !== undefined) {
    const original = await cell.runtime.close();
    if (!cell.runtime.inspect().ownershipReleased) {
      throw new Error("composed runtime still owns unresolved custody", { cause: original });
    }
  } else {
    const original = await cell.initialClose?.();
    if (original !== undefined && !original.complete) {
      throw new Error("composed initial preparation still owns native custody", { cause: original });
    }
  }
}

function requireInitialCompatibility(inputs: DocumentRuntimeInputs, baseline: AuthoritySnapshot): void {
  const result = inputs.compatibility.check({ candidate: inputs.settings.initialCandidate, current: baseline });
  if (result.status !== "compatible") { throw new Error("initial document closure is incompatible", { cause: result }); }
}

/** Native pending setup owns initial acquisition; only successful construction transfers it. */
export async function constructDocumentRuntime(resources: Resources, inputs: DocumentRuntimeInputs): Promise<UpdateRuntime<readonly [DocumentCommand], DocumentReply>> {
  const cell: OwnerCell = {};
  const built = await resources.setup({ name: "document-runtime-owner", setup: async () => {
    try {
      const baseline = inputs.authority.read();
      requireInitialCompatibility(inputs, baseline);
      const initial = inputs.preparation.open({ domainId: inputs.settings.domainId,
        request: { attemptId: "initial", candidate: inputs.settings.initialCandidate }, baseline });
      const closeInitial = initial.close.bind(initial);
      cell.initialClose = closeInitial;
      const prepareInitial = initial.prepare.bind(initial);
      const prepared = await prepareInitial();
      resources.signal.throwIfAborted();
      requireInitialCompatibility(inputs, inputs.authority.read());
      const invokeInitial = prepared.invoke.bind(prepared);
      const runtime = createUpdateRuntime({ domainId: inputs.settings.domainId, authority: inputs.authority,
        compatibility: inputs.compatibility, preparation: inputs.preparation, limits: inputs.settings.limits,
        initial: { candidate: inputs.settings.initialCandidate, invoke: invokeInitial, release: closeInitial } });
      cell.runtime = runtime;
      cell.initialClose = undefined;
      inputs.settings.captureOwner(Object.freeze({ close: runtime.close, retryCleanup: runtime.retryCleanup, inspect: runtime.inspect }));
    } catch (cause) { cell.failure = { cause }; }
    return cell;
  }, cleanup: closeCell });
  if (built.failure !== undefined) { throw built.failure.cause; }
  if (built.runtime === undefined) { throw new Error("GM setup returned no owned runtime"); }
  return built.runtime;
}
