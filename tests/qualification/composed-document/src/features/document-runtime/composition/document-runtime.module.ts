import { implement } from "@get-modular/assembly";
import { scoped } from "@get-modular/resources";
import type { RuntimeCapabilities } from "./document-runtime.contracts.js";
import { runtimeDeclaration } from "./document-runtime.declaration.js";
import { constructDocumentRuntime } from "./document-runtime.owner.js";

export const runtimeModule = implement<RuntimeCapabilities>()(runtimeDeclaration, async (dependencies, { resources }) => {
  const runtime = await constructDocumentRuntime(resources, dependencies);
  return { instance: runtime, capabilities: {
    "reference/document-runtime/invocation": Object.freeze({ invoke: runtime.invoke }),
  } };
}, scoped);
