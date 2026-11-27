import { defineContract, type CapabilitiesOf } from "@get-modular/assembly";
import type { CandidateDescription, CompatibilityPort, PreparationPort, UpdateAuthority, UpdateLimits, UpdateRuntime } from "live-module-updates";
import type { DocumentCommand, DocumentInvocation, DocumentReply } from "../application/ports/document-operation.js";

export type DocumentRuntimeRecovery = Pick<UpdateRuntime<readonly [DocumentCommand], DocumentReply>, "close" | "retryCleanup" | "inspect">;

export interface DocumentRuntimeSettings {
  readonly domainId: string;
  readonly initialCandidate: CandidateDescription;
  readonly limits: UpdateLimits;
  /** The Host retains recovery controls before dependent roots can fail to publish. */
  readonly captureOwner: (owner: DocumentRuntimeRecovery) => void;
}

export interface DocumentRuntimeInputs {
  readonly authority: UpdateAuthority;
  readonly compatibility: CompatibilityPort;
  readonly preparation: PreparationPort<readonly [DocumentCommand], DocumentReply>;
  readonly settings: DocumentRuntimeSettings;
}

export const Invocation = defineContract<DocumentInvocation>()({ id: "reference/document-runtime/invocation", revision: 1 });
export const Authority = defineContract<UpdateAuthority>()({ id: "reference/document-runtime/authority", revision: 1 });
export const Compatibility = defineContract<CompatibilityPort>()({ id: "reference/document-runtime/compatibility", revision: 1 });
export const Preparation = defineContract<PreparationPort<readonly [DocumentCommand], DocumentReply>>()({ id: "reference/document-runtime/preparation", revision: 1 });
export const Settings = defineContract<DocumentRuntimeSettings>()({ id: "reference/document-runtime/settings", revision: 1 });

export type RuntimeContracts = typeof Invocation | typeof Authority | typeof Compatibility | typeof Preparation | typeof Settings;
export interface RuntimeCapabilities extends CapabilitiesOf<RuntimeContracts> {}
