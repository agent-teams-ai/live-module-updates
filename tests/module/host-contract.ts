import type {
  CandidateDescription, ModuleEntry, PublicationReceipt, PublicationRequest, UpdateAuthority, UpdateHandle, UpdateRuntime,
} from "../../src/index.ts";

export type Command =
  | { readonly kind: "view" }
  | { readonly kind: "edit"; readonly expected: number; readonly text: string }
  | { readonly kind: "held-view" | "nested"; readonly barrier: string }
  | { readonly kind: "held-edit"; readonly barrier: string; readonly expected: number; readonly text: string };
export interface DocumentState { readonly revision: number; readonly text: string }
export type Effect =
  | { readonly status: "written"; readonly revision: number }
  | { readonly status: "refused"; readonly reason: "stale-generation" | "grant-denied" | "revision-conflict" | "schema-conflict" };
export type EffectPermission = { readonly status: "allowed" } | Extract<Effect, { readonly status: "refused" }>;
export type Reply =
  | { readonly kind: "view"; readonly generation: string; readonly text: string; readonly revision: number }
  | { readonly kind: "effect"; readonly effect: Effect };
export type Entry = ModuleEntry<readonly [Command], Reply>;
export type PublicationMode = "normal" | "lost-ack" | "delayed";
export interface NativeAuthority extends UpdateAuthority {
  /** TEST observation of the native routing record, independently of the port's read method. */
  readonly observeHead: () => PublicationRequest["expectedHead"];
  readonly document: () => DocumentState;
  /** The TEST receiver calls this immediately before its synchronous native effect. */
  readonly checkEffect: (generation: string, expected: number) => EffectPermission;
  readonly write: (generation: string, expected: number, text: string) => Effect;
  readonly grant: (allowed: boolean) => void;
  readonly schema: (revision: string) => void;
  readonly schemaVersion: () => string;
  readonly publicationMode: (mode: PublicationMode) => void;
  readonly finishPending: () => void;
  readonly beforeMutation: (callback: () => void) => void;
  readonly publicationCalls: () => number;
  readonly receipts: () => readonly PublicationReceipt[];
  readonly dispose: () => void;
}
export interface GenerationEnvironment {
  readonly generation: () => string;
  readonly read: () => DocumentState;
  readonly write: (expected: number, text: string) => Effect;
  readonly wait: (name: string) => Promise<void>;
  readonly use: () => void;
}
export interface NativeHost {
  readonly kind: "node" | "chromium";
  readonly authority: NativeAuthority;
  readonly runtime: UpdateRuntime<readonly [Command], Reply>;
  readonly entered: (name: string) => Promise<void>;
  readonly onNextUse: (callback: () => void) => void;
  readonly resume: (name: string) => void;
  readonly prepareAfter: (generation: string, barrier: string) => void;
  readonly failPreparation: (generation: string) => void;
  readonly failCleanup: (generation: string, enabled: boolean) => void;
  readonly alive: (generation: string) => boolean;
  readonly registered: () => string | undefined;
  readonly releases: (generation: string) => number;
  readonly foreignIntact: () => boolean;
  readonly dispose: (attempts: readonly UpdateHandle[]) => Promise<void>;
}
export interface HostOptions {
  readonly domain: string;
  readonly retained?: number;
  readonly unsafeEffects?: boolean;
  readonly unsafeRemoval?: boolean;
}
export type HostFactory = (options: HostOptions) => Promise<NativeHost>;

export function candidate(generation: string): CandidateDescription {
  return { generationId: generation, closureId: "fixture-closure/" + generation,
    contract: { id: "document-operation", revision: "1" }, profile: "cooperative-operation-v1" };
}
export function publicationKey(request: PublicationRequest): string {
  return JSON.stringify([request.domainId, request.attemptId, request.expectedHead.generationId,
    request.expectedHead.revision, request.basis, request.candidate.generationId, request.candidate.closureId,
    request.candidate.contract.id, request.candidate.contract.revision, request.candidate.profile]);
}
export function expect(condition: boolean, code: string): void {
  if (!condition) { throw new Error(code); }
}
export function equal(actual: unknown, expected: unknown, code: string): void {
  expect(JSON.stringify(actual) === JSON.stringify(expected), code);
}

export function createBarriers() {
  const entries = new Map<string, { entered: PromiseWithResolvers<void>; resume: PromiseWithResolvers<void> }>();
  function entry(name: string) {
    let value = entries.get(name);
    if (value === undefined) {
      value = { entered: Promise.withResolvers<void>(), resume: Promise.withResolvers<void>() };
      entries.set(name, value);
    }
    return value;
  }
  return {
    entered: (name: string) => entry(name).entered.promise,
    wait: (name: string) => { const value = entry(name); value.entered.resolve(); return value.resume.promise; },
    resume: (name: string) => { entry(name).resume.resolve(); },
    releaseAll: () => { for (const value of entries.values()) { value.resume.resolve(); } },
  };
}
