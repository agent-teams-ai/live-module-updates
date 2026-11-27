# ADR-0004: current tooling and concrete module reuse

Status: owner-authorized implementation, 2026-11-27. Native qualification and
normal bootstrap admission are tracked by [Programme D](../plans/tooling-and-module-reuse-plan.md)
and [LMU PR #12](https://github.com/agent-teams-ai/live-module-updates/pull/12).
This decision supersedes ADR-0002's initial tooling selection only after those
gates succeed. Package availability alone is not accepted source admission.

## Current exact graph

Upgrade the root development graph to Engineering Foundation **4.0.3**, Feature
Module Standard tooling **0.4.4** and Stack Toolchain **0.4.0**. Preserve
TypeScript **7.0.2**, Oxlint **1.83.0**, its TypeScript checker **7.0.2001**,
Node **24.22.3** and pnpm **11.25.0**. The maintained portable-document reference
has its own manifest and lock; upgrade its Foundation/FMS versions explicitly
while retaining its narrower source-dependency profile.

The root frozen lockfile owns the actual dependency closure. Strict peer and
engine installation must pass. The accepted immutable FMS v1.1 content and its
digest remain unchanged: tooling version and architectural standard version
are distinct authorities.

Deliver the package manager's complete generated state, including both workspace
manifests. Under pnpm 11.25's implicit age policy, normal resolution records the
selected fresh exact versions in minimumReleaseAgeExclude. Its
[native round-trip contract](https://github.com/pnpm/pnpm/blob/6d90c71efdffbc909b499490b64c66badc720327/pnpm11/pnpm/test/install/minimumReleaseAge.ts)
requires those entries for the later frozen install. The
[preparation reconciliation](../research/evidence/tooling-module-reuse-20261127/preparation-reconciliation.json)
records recovery of the actual generated three root/two reference entries after
their initial omission. The default age, other dependencies, registry/integrity
verification and ordinary frozen gates are retained. Only these exact versions
are selected; this is not a package-wide or future-version exception.

The npm publication records inspected on 2026-11-27 identify Foundation 3.0.0
as published on 2026-10-25 at 11:42:09.678 UTC and Foundation 4.0.3 on
2026-11-27 at 07:56:28.697 UTC. FMS 0.4.4 and Stack 0.4.0 were published that
morning at 07:58:50.687 and 08:02:13.133 UTC. Recheck published metadata before
any later adoption; these observations do not promise permanently latest pins.

## One authority for each native check

Follow the published
[Foundation quality-v5 migration](https://github.com/agent-teams-ai/engineering-foundation/blob/7438b7ee4429dc7798cf2b18c81e6bc7788f0f5b/docs/development/quality-v5-migration.md).

- The existing FMS profile owns production modules, features and roles.
- The coverage file adopts schema 5, explicit finite execution budgets and
  references to topology and Stack configuration. It contains no legacy
  featureProfilePath or compilerProjects authority.
- The public FMS quality-topology projection produces the committed source
  topology. Its derivedFrom receipt hashes the exact FMS and coverage bytes.
  A small repository helper generates or checks that projection and runs on
  the ordinary required route; it does not implement another topology mapper.
- One Stack configuration owns the four actual compiler projects:
  tsconfig.json, tsconfig.portable.json, tsconfig.tools.json and
  tsconfig.tests.json. The scripts/tsconfig.json and tests/tsconfig.json aliases
  remain useful to typed lint without becoming duplicate compiler owners.
- The public stack-toolchain compile --project route runs the pinned official
  TypeScript compiler. Preserve noEmit semantics for checks, the ES-only portable
  project, strict options and the existing production build.
- The existing source-dependency and suppression policies retain their actual
  scope. No unclassified production file, compiler input or maintained tool is
  silently removed to make the new graph pass.

The separate static reference retains its own source-dependency-only adoption;
root quality coverage does not falsely claim its compiler inputs. Its frozen
installation, source check, strict compiler and actual Node/Chromium route must
also pass. Historical sealed fixtures and evidence remain unchanged.

## Ordinary admission remains an upstream contract

The currently pinned Central bootstrap implementation accepts the previous
schema/Stack route. Its owning
[PR #447](https://github.com/agent-teams-ai/.github/pull/447) proposes the schema-5
reader, but the inspected unmerged head 050d47ec66717f0f177b586c36520eb09f3ab4e0
recognizes Foundation 4.0.2/FMS 0.4.3/Stack 0.3.1, not this newer graph.

Complete the independent LMU migration and native qualification. Before normal
merge, recheck the accepted upstream source and use its legitimately admitted
immutable revision once it recognizes this graph. Do not copy its checker,
invent exceptions, duplicate deprecated fields, point to an unaccepted source
or relax an existing check. The owning upstream workstream retains this change.
Central registration, enforced protections and managed Docs admission remain
separate axes described in [BOOTSTRAP](../../BOOTSTRAP.md).

A coherent rollback restores manifest, lock, profile, coverage and compiler route
together. It does not mix a Foundation 4 executable with a schema-3 contract.

## Evidence and reuse boundaries

Qualify stale derivation bytes, omitted compiler/source inputs, forbidden inward
imports and protected lint settings with corrected positives. Run the complete
frozen native route on the actual final source, including installed Node and
Chromium consumers and signed-artifact cases. Review material corrections again.

The [reuse review](../reviews/tooling-and-module-reuse-2026-11-27.md) owns the
observed CMS corrections and feature-boundary analysis. Retain one cohesive
update-operation feature with bounded private components unless an independent
semantic owner and acyclic contract justify extraction.

The existing [operation plan](../plans/first-operation-implementation-plan.md)
owns the next native GM Effect discriminator. Current D3 records concrete
mechanisms and tests; it does not add mandatory Effect dependencies or claim an
executed native Effect Host. Observation is considered when a real latest-state
subscriber is introduced; its semantics cannot replace commands or receipts.
