import { input } from "@get-modular/assembly";
import type { ExportCapabilities } from "./export.contracts.js";
import { exportDeliveryDeclaration } from "./export.declaration.js";

export const exportDeliveryInput = input<ExportCapabilities>()(exportDeliveryDeclaration);
