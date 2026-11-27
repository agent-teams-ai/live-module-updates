import type { DocumentPort, ExportDeliveryPort } from "@fixture/portable-document";
import type { SetupSpec } from "@get-modular/resources";
import type { NativeAuthority } from "./authority/host-contract.js";

export interface Delivery {
  readonly generation: string;
  readonly revision: number;
  readonly content: string;
}
export interface FormatObservation {
  readonly generation: string;
  readonly member: "title" | "body";
  readonly input: string | number;
  readonly output: string;
}
export interface NativeEnvironment {
  readonly kind: "node" | "chromium";
  readonly authority: NativeAuthority;
  readonly document: (generation: string) => DocumentPort;
  readonly delivery: (generation: string) => SetupSpec<ExportDeliveryPort>;
  readonly use: (generation: string) => void;
  readonly alive: (generation: string) => boolean;
  readonly aborted: (generation: string) => boolean;
  readonly acquired: () => readonly string[];
  readonly releases: (generation: string) => number;
  readonly registered: () => string | undefined;
  readonly foreignIntact: () => boolean;
  readonly deliveries: () => readonly Delivery[];
  readonly failCleanup: (generation: string, fail: boolean) => void;
  readonly holdDelivery: (generation: string, barrier: string) => void;
  readonly entered: (barrier: string) => Promise<void>;
  readonly wait: (barrier: string) => Promise<void>;
  readonly resume: (barrier: string) => void;
  readonly releaseBarriers: () => void;
  readonly dispose: () => void;
}
export interface EnvironmentOptions {
  readonly domain: string;
  readonly unsafeEffects?: boolean;
  readonly unsafeRemoval?: boolean;
  readonly unsafeOmitRelease?: boolean;
}
export type EnvironmentFactory = (options: EnvironmentOptions) => NativeEnvironment;

/** Measured by the archive installer, never accepted from an unverified plugin. */
export interface ArtifactInputs {
  readonly coreArchive: string;
  readonly adapterArchive: string;
  readonly referenceArchive: string;
  readonly authorSource: string;
}

export function requireFact(condition: unknown, oracle: string): asserts condition {
  if (condition !== true) { throw new Error(oracle); }
}

export function throwFailures(failures: readonly unknown[], message: string): void {
  if (failures.length === 1) { throw failures[0]; }
  if (failures.length > 1) { throw new AggregateError(failures, message); }
}
