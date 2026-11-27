import type { FeatureModuleInput } from "@agent-teams/feature-module-standard";

/** Fixture-local adoption; this does not admit the LMU research repository. */
export const sourceAuthority = {
  fms: {
    id: "agent-teams.feature-module-standard", version: "v1.1",
    digest: "sha256:cfa088ef7396139554fe5e3bcc839271b23299c6b60c569a3a7f1cd7c9f0bc6c",
  },
  cms: "https://github.com/agent-teams-ai/get-modular/blob/a5f41853200aed26d692e89d768185013d629a12/docs/architecture/common-assembly.md#consumer-module-standard",
  tools: {
    "@agent-teams/engineering-foundation": "4.0.3",
    "@agent-teams/feature-module-standard": "0.4.4",
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
  {
    id: "author-entry", root: "consumer/author-entry",
    features: {
      featuresRoots: ["consumer/author-entry/features"],
      featureRoots: ["consumer/author-entry/features/export-summary"],
      roleRoots: [
        { root: "consumer/author-entry/features/export-summary/application", role: "application" },
        { root: "consumer/author-entry/features/export-summary/composition", role: "composition" },
      ],
      surfaces: {
        compositionContract: ["consumer/author-entry/features/export-summary/composition/export-summary.contracts.ts"],
        compositionSurface: [
          "consumer/author-entry/features/export-summary/composition/export-summary.group.ts",
          "consumer/author-entry/features/export-summary/composition/export-summary.module.ts",
        ],
      },
      moduleComposition: ["consumer/author-entry/index.ts"],
      useEdges: [],
    },
  },
] satisfies readonly { readonly id: string; readonly root: string; readonly features: Structure }[];
