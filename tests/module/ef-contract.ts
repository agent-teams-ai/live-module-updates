import type { ArtifactRequest, NativeExecutable, NodeArtifactTools } from "@extension-foundation/node-artifact";

/** Test transport only; the public verifier receives its real Uint8Array request. */
export type SignedArtifact = Omit<ArtifactRequest, "signatureBundle"> & { readonly signatureBytes: readonly number[] };

export interface EfFixtureInput {
  readonly tools: NodeArtifactTools;
  readonly artifact: SignedArtifact;
}

export interface RegistryTools extends NodeArtifactTools { readonly registry: NativeExecutable }

/** This export contract belongs to the document Host, not to EF or LMU. */
export interface DocumentFormatter { readonly format: (text: string) => string }

export type EfCaseName = "signed-overlap" | "tampered-signature" | "tampered-bytes" | "revoked-evaluation" | "closed-before-evaluation";

export function artifactRequest(value: SignedArtifact): ArtifactRequest {
  const { signatureBytes, ...request } = value;
  return { ...request, signatureBundle: Uint8Array.from(signatureBytes) };
}

export function isDocumentFormatter(value: unknown): value is DocumentFormatter {
  return typeof value === "object" && value !== null && "format" in value && typeof value.format === "function";
}

export const artifactContract = Object.freeze({ target: "node/linux/x64", scope: "lmu/document",
  contract: "lmu/document-formatter", revision: 1, loader: "lmu-document-formatter-v1" });
