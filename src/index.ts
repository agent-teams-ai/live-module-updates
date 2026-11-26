/** Portable cooperative update operation. Concrete resource integration is optional. */
export { createUpdateRuntime } from "./features/update-operation/composition/create-update-runtime.ts";
export type {
  InitialGeneration, UpdateRuntime, UpdateRuntimeOptions,
} from "./features/update-operation/composition/create-update-runtime.ts";
export type {
  AdoptionState, AuthoritySnapshot, CandidateDescription, CloseSnapshot, Head,
  PlanningState, PreparationState, PublicationReceipt, PublicationRequest,
  PublicationResult, PublicationState, ReceiptLookup, RuntimeSnapshot,
  StartRefusal, StartUpdateResult, UpdateHandle, UpdateHold, UpdateLimits,
  UpdateRequest, UpdateSnapshot,
} from "./features/update-operation/application/models.ts";
export type { AdoptionProbe } from "./features/update-operation/application/ports/adoption.ts";
export type { UpdateAuthority } from "./features/update-operation/application/ports/authority.ts";
export type {
  BoundInvocation, InvocationFacade, InvocationOutcome, InvocationRefusal, ModuleEntry,
} from "./features/update-operation/application/ports/invocation.ts";
export type {
  CleanupReport, CleanupState, GenerationSnapshot,
} from "./features/update-operation/application/ports/lifetime.ts";
export type {
  CompatibilityPort, CompatibilityResult, PreparationContext, PreparationCustody,
  PreparationPort, PreparedGeneration,
} from "./features/update-operation/application/ports/preparation.ts";
