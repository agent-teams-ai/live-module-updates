import { authorityContractCases } from "live-module-updates/testing";
import { candidate } from "./authority/host-contract.js";
import { requireFact, type EnvironmentOptions, type NativeEnvironment } from "./environment.js";

/** Installed LMU laws receive actual independent native owners, not expected answers. */
export function nativeAuthorityCases(create: (options: EnvironmentOptions) => NativeEnvironment) {
  return authorityContractCases(name => {
    const environment = create({ domain: "composed/authority/" + name });
    const authority = environment.authority;
    return { authority, candidate: candidate("B"), successor: candidate("C"),
      observeHead: authority.observeHead,
      invalidateBasis: () => {
        const current = authority.document();
        requireFact(authority.write(authority.observeHead().generationId, current.revision, "actual owner basis edit").status === "written", "c.native-basis-change");
      },
      holdPublication: () => { authority.publicationMode("delayed"); },
      loseAcknowledgement: () => { authority.publicationMode("lost-ack"); },
      releasePublication: () => { authority.publicationMode("normal"); authority.finishPending(); },
      dispose: environment.dispose,
    };
  });
}
