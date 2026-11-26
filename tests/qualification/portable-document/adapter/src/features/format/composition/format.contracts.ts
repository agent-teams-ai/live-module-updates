import { defineContract, type CapabilitiesOf } from "@get-modular/assembly";
import type { FormatPort } from "@fixture/portable-document";

export const Format = defineContract<FormatPort>()({ id: "fixture/format", revision: 1 });
export interface FormatCapabilities extends CapabilitiesOf<typeof Format> {}

/** A selected implementation, not a registry or a semantic contract revision. */
export interface FormatProvider {
  readonly implementationId: string;
  /** Receiver-independent callback returning own arrow-function port members. */
  readonly create: () => FormatPort;
}
