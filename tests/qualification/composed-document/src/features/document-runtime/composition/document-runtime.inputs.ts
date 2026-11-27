import { input } from "@get-modular/assembly";
import type { RuntimeCapabilities } from "./document-runtime.contracts.js";
import { authorityDeclaration } from "./document-authority.declaration.js";
import { compatibilityDeclaration } from "./document-compatibility.declaration.js";
import { preparationDeclaration } from "./document-preparation.declaration.js";
import { settingsDeclaration } from "./document-settings.declaration.js";

export const runtimeInputs = {
  authority: input<RuntimeCapabilities>()(authorityDeclaration),
  compatibility: input<RuntimeCapabilities>()(compatibilityDeclaration),
  preparation: input<RuntimeCapabilities>()(preparationDeclaration),
  settings: input<RuntimeCapabilities>()(settingsDeclaration),
};
