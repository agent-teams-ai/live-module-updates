import { implement } from "@get-modular/assembly";
import { scoped, type ModuleContext } from "@get-modular/resources";
import { createExportCommands } from "@fixture/portable-document";
import type { ExportCapabilities } from "./export.contracts.js";
import { exportDeclaration } from "./export.declaration.js";

export const exportModule = implement<ExportCapabilities>()(exportDeclaration, async (dependencies, context: ModuleContext) => {
  const delivery = await context.resources.setup(dependencies.delivery);
  const port = createExportCommands({
    document: { query: dependencies.document.query },
    format: { title: dependencies.format.title, body: dependencies.format.body },
    delivery,
  });
  return { instance: port, capabilities: { "fixture/export": port } };
}, scoped);
