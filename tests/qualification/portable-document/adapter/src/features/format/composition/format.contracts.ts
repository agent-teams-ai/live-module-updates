import { defineContract, type CapabilitiesOf } from "@get-modular/assembly";
import type { FormatPort } from "@fixture/portable-document";

export const Format = defineContract<FormatPort>()({ id: "fixture/format", revision: 1 });
export type FormatContracts = typeof Format;
export interface FormatCapabilities extends CapabilitiesOf<FormatContracts> {}

/** A selected implementation, not a registry or a semantic contract revision. */
export interface FormatProvider {
  readonly implementationId: string;
  /** Receiver-independent callback returning own arrow-function port members. */
  readonly create: () => FormatPort;
}
