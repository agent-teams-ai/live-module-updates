import { group } from "@get-modular/assembly";
import { runtimeModule } from "./document-runtime.module.js";
import { documentClient } from "./document-client.module.js";

export const documentRuntimeGroup = group("document-runtime", [runtimeModule, documentClient]);
export { runtimeModule, documentClient };
