# Repository bootstrap status

## Current production-source checkpoint, 2026-11-26

The repository now contains substantive `update-operation` implementation and
clean installed consumers in the single [LMU PR #9](https://github.com/agent-teams-ai/live-module-updates/pull/9).
[ADR-0002](docs/decisions/0002-production-source-adoption.md) records the first
production-source adoption, and the [source ownership guide](docs/architecture/source-ownership.md)
defines its one immutable FMS v1.1 profile, complete compiler/source coverage,
strict quality route and native positive/negative controls. `pnpm check` runs
the complete native route; individual fixture results do not replace it.

The private packed package contains substantive behavior. Its ordinary entry
has no runtime dependencies; Resources is an optional peer for the separate
adapter entry. The initial native tooling graph is Foundation 3.0.0, FMS 0.3.0,
Stack 0.1.1 and TypeScript 7.0.2. Compiler resolution is checked through the
actual tooling graph. No earlier production quality profile existed to downgrade.
The attempted newer Foundation inspection was not adopted or represented as a
managed Docs cohort. The ADR records why this exact graph fits the current
native source-admission schema.

The current central source inspected is
[`89b5d7c`](https://github.com/agent-teams-ai/.github/tree/89b5d7c512d9c4b5ae63709857a0d71cb2e6d178).
Its repository checker reports `configured_not_qualified` with no configuration
issues for this source. That is not positive qualification. Separate facts:

- The exact central repository-admission and commit-identity callers are
  configured; hosted results belong to the actual source revision.
- Central registration of this repository and managed Docs initialization are
  still pending. The observed stable33 producer cohort is `QUALIFIED` for its
  named canary, not `RECOMMENDED` for arbitrary consumers; it is not silently
  adopted here. No Docs exemption or copied consumer identity is introduced.
- The rulesets endpoint returns no rulesets. The GitHub integration cannot read
  legacy branch protection (HTTP 403), so remote enforcement is unverified.
  Successful CI does not establish enforced protection.
- The missing tracked `CLAUDE.md` was added as a short route to `AGENTS.md` after
  confirming it was absent in this checkout. No owner-local ignored file was
  overwritten.
- npm publication, stronger runtime profiles and product adoption remain
  separate owner decisions and qualification tasks.

The [qualification matrix](docs/research/foundation-qualification-matrix.md)
owns runtime evidence. The source adoption, exact checks, managed Docs,
registration, remote enforcement and public delivery are distinct axes.

## Historical creation and research bootstrap, 2026-11-23

The following observations describe the initial research packet. Their
research-only status is superseded by the production-source checkpoint above;
their original source identities and capability limitations remain historical.

The original creation-capability check was **2026-11-23, 16:39 UTC**.
The owner's subsequent real GitHub creation supersedes that original limitation.

## Verified new repository identity (2026-11-23)

- Public organization repository: [agent-teams-ai/live-module-updates](https://github.com/agent-teams-ai/live-module-updates).
- GitHub repository ID: **1469193941**; visibility **public**; default branch **main**.
- Initial committed main HEAD: **5ba2eca9a175b3cff40fd9725b86b658aece1c47**.
- The first main tree contains **17 regular project files**; the transfer manifest describes **18**, including CLAUDE.md. The owner reports that a global .gitignore excluded their local CLAUDE.md. This research change does not overwrite that local ignored file.
- Creation and initial research transfer are observed; central **classification / pending registration**, required-check enforcement and production FMS/Docs/quality admission are **not** established by these facts.
- This directory remains a **research/specification** repository. No runtime package, accepted public API, library E2E or release is implied by its existence.

## What is prepared

This directory provides current architecture, a critical industry register,
reviewed experiment evidence, unresolved choices and immutable history routes.
The library scope is portable and intended for open-source consumers. The
maintained qualification fixtures exercise real package/runtime boundaries
before products exist; their test packages are not released runtime packages.
The [qualification matrix](docs/research/foundation-qualification-matrix.md)
separates those results from production bootstrap and consumer adoption.

The name describes the capability without an Agent Teams or framework prefix.
**Historical note:** before the owner's action, the recovery lookup returned
HTTP 404, and the earlier agent could not observe a remote. That finding was
correct at its inspection time but is **superseded** by the verified repository
identity above. A missing repository is never inferred from an unauthenticated
search result alone.

## Historical creation capability observed (before the owner action)

At the recheck, the active GitHub connector could publish to the existing
authorized research repository but exposed no repository-creation operation.
`gh auth status` reported no authenticated CLI account. The available browser
operation reported:

> Browser access requires the originating browser context. Open ChatGPT in the
> browser with the connected extension and try again.

This historical check did **not** create the remote. The owner later created
and pushed it through their authenticated CLI; the immutable repository ID and
initial commit are now recorded above. The fact of creation does **not** imply
that a central ruleset, organization registration or qualification was installed.
The original native results still belong to Extension Foundation at
`cc07959309f65ab2401f838c982911743075fe1e`.

## Onboarding sequence after actual creation

1. **Observed, research-only:** the owner created the public repository, pushed
   initial main, and the repository identity was independently read. The source
   Apache-2.0 license and notices remain part of the transferred packet.
2. **Partially complete:** main contains 17 of the 18 manifest-listed current
   files. Resolve CLAUDE.md through a reviewed tracked-file addition after
   checking the owner's unchanged local contents; do not discard or overwrite
   the globally ignored local file. Historical packets remain referenced as
   immutable sibling evidence; they are not blindly unpacked over current files.
3. Classify and register the actual repository through the central pending
   registration route. Individual registration is not a complete organization
   census or positive qualification.
4. In the first production bootstrap, adopt full immutable FMS v1.1 with the real
   feature, layer/source mappings, strict compiler coverage, suppression policy,
   positive/negative fixtures and complete native gates. Foundation remains
   development-only. No stub public package or empty feature precedes its
   substantive behavior and consumer proof.
5. Choose an eligible exact documentation/tooling graph through its owning
   admission process. Use reviewed preview/apply for Docs initialization and
   the exact central identity/admission callers. Do not copy this research
   source repository's managed consumer identity.
6. Observe checks on actual final source, then separately observe required-check
   enforcement. A configured caller, successful local checker or package
   release does not establish enforced remote protection.

The source authority is the organization
[repository admission](https://github.com/agent-teams-ai/.github/blob/0b44c64c824f536bd1b085341e7669bcc64ef124/docs/repository-admission.md)
and [registration](https://github.com/agent-teams-ai/.github/blob/0b44c64c824f536bd1b085341e7669bcc64ef124/docs/repository-registration.md)
guidance inspected for this preparation. Recheck current guidance when the
repository actually enters that process; do not reinterpret a dated observation
as permanent authorization of a changed tool graph.

## Historical tooling-graph observation

The inspected central registry's last RECOMMENDED cohort is
`docs-2026-10-03-stable31`: Docs Protocol 0.6.2, Agent Teams preset 0.3.2 and
Engineering Foundation 1.7.2, with its exact transitive closure and workflow.
Current public release metadata separately lists Foundation 3.1.0, FMS tooling
0.3.2 and stack-toolchain 0.2.0. Those facts do not prove that the newer combined
graph is eligible for managed consumer admission.

Reconcile a production implementation's quality requirements with an eligible
cohort. The bounded test fixture records its own exact compiler/runtime graph;
that execution does not silently admit a production tooling profile. Do not independently mix those pins, downgrade an adopted quality
profile, or declare a blanket Docs exemption to obtain a green bootstrap.
Producer graph qualification and consumer admission have their existing owners.
This research task changes neither the central registry nor existing pins.

## What the original research packet did not assert

There is no accepted public API, package release, FMS conformance, managed Docs
admission, production host adoption or whole-library comparative E2E here.
Executed mechanism results retain their exact limited scope in
[validation](docs/research/validation.md). Representative test Hosts do not
wait for product selection. Applicable Q1-Q7 choices for a complete update
profile and later production adoption remain explicit, not scaffold defaults.
