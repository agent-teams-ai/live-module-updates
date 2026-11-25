import { input } from "@get-modular/assembly";
import type { DocumentCapabilities } from "./document.contracts.js";
import { documentStateDeclaration } from "./document.declaration.js";

export const documentStateInput = input<DocumentCapabilities>()(documentStateDeclaration);
