import { createScope, type Resources } from "@get-modular/resources";
import type {
  PreparationContext, PreparationPort, PreparedGeneration,
} from "../application/ports/preparation.ts";

/**
 * Optional public Resources adapter. open() creates only an inert native owner;
 * the operation captures it before prepare() may evaluate or acquire anything.
 */
export function createResourcesPreparation<Args extends readonly unknown[], Result>(prepare: (
  context: PreparationContext,
  resources: Resources,
) => PreparedGeneration<Args, Result> | PromiseLike<PreparedGeneration<Args, Result>>): PreparationPort<Args, Result> {
  if (typeof prepare !== "function") { throw new TypeError("Resources preparation requires a typed preparation callback"); }
  return Object.freeze({
    open(context: PreparationContext) {
      const scope = createScope({ name: `lmu:${context.domainId}:${context.request.candidate.generationId}` });
      let started = false;
      return Object.freeze({
        prepare() {
          if (started) { throw new Error("this preparation owner has already been used"); }
          if (scope.resources.signal.aborted) { throw new Error("this preparation owner has already closed"); }
          started = true;
          // Actual raw preparation is supervised by the operation, not another
          // adapter flight or cleanup stack. All acquisitions use this native scope.
          return prepare(context, scope.resources);
        },
        close: () => scope.control.close(),
      });
    },
  });
}
