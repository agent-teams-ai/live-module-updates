import { group } from "@get-modular/assembly";
import { documentClient } from "./document-client.module.js";
import { runtimeModule } from "./document-runtime.module.js";

export const documentRuntimeGroup = group("document-runtime", [
  documentClient,
  runtimeModule,
]);
export { runtimeModule, documentClient };
