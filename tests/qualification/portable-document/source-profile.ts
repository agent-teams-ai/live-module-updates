import type { FeatureModuleInput } from "@agent-teams/feature-module-standard";

/** Fixture-local adoption; this does not admit the LMU research repository. */
export const sourceAuthority = {
  fms: {
    id: "agent-teams.feature-module-standard", version: "v1.1",
    digest: "sha256:cfa088ef7396139554fe5e3bcc839271b23299c6b60c569a3a7f1cd7c9f0bc6c",
  },
  cms: "https://github.com/agent-teams-ai/get-modular/blob/ae2418b186119c3c84736a6217a9ef25bbfe86cb/docs/architecture/common-assembly.md#consumer-module-standard",
  tools: {
    "@agent-teams/engineering-foundation": "3.0.0",
    "@agent-teams/feature-module-standard": "0.3.0",
    "@get-modular/conformance": "0.5.2",
    typescript: "7.0.2",
  },
} as const;

const features = ["document", "format", "export"] as const;
type Structure = Omit<FeatureModuleInput, "files" | "emptyDirectories" | "imports">;

// Both artifacts have three features. Their identical names are separate module
// identities, never one six-feature graph with duplicated feature identities.
export const sourceProfiles = [
  {
    id: "ordinary-core", root: "core",
    features: {
      featuresRoots: ["core/features"],
      featureRoots: features.map(name => `core/features/${name}`),
      roleRoots: features.flatMap(name => [
        { root: `core/features/${name}/application`, role: "application" },
        { root: `core/features/${name}/composition`, role: "composition" },
      ]),
      surfaces: { compositionSurface: features.map(name => `core/features/${name}/composition/${name}.ts`) },
      moduleComposition: ["core/index.ts"],
      useEdges: [],
    },
  },
  {
    id: "gm-adapter", root: "adapter/src",
    features: {
      featuresRoots: ["adapter/src/features"],
      featureRoots: features.map(name => `adapter/src/features/${name}`),
      roleRoots: features.map(name => ({ root: `adapter/src/features/${name}/composition`, role: "composition" })),
      surfaces: {
        compositionContract: features.map(name => `adapter/src/features/${name}/composition/${name}.contracts.ts`),
        compositionSurface: [
          ...features.flatMap(name => [
            `adapter/src/features/${name}/composition/${name}.group.ts`,
            `adapter/src/features/${name}/composition/${name}.module.ts`,
          ]),
          "adapter/src/features/document/composition/document.inputs.ts",
          "adapter/src/features/export/composition/export.inputs.ts",
        ],
      },
      moduleComposition: ["adapter/src/index.ts", "adapter/src/composition/root.ts"],
      useEdges: [{ from: "export", to: "document" }, { from: "export", to: "format" }],
    },
  },
] satisfies readonly { readonly id: string; readonly root: string; readonly features: Structure }[];
