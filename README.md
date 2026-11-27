# Live Module Updates

Controlled replacement of application modules and plugins while an application
continues serving useful work.

The project implements a portable TypeScript library. Its central operation
plans and prepares an update, coordinates authoritative switching, reconciles
uncertainty, manages supported continuity and reports remaining cleanup.
Applications supply narrow authorization and state primitives. Existing loaders,
composition systems, resource scopes and executors retain their responsibilities.

## Current status

**Qualified private implementation delivered through [PR #9](https://github.com/agent-teams-ai/live-module-updates/pull/9).
No npm release or product adoption is claimed.** The selected
[cooperative operation profile](docs/decisions/0001-cooperative-update-profile.md)
supports finite trusted work in one Node process or Chromium realm, with
explicit Host authority, generation-bound calls and borrowed state. The primary
package entry has no mandatory GM, EF, UI, Node or DOM dependency. The optional
`live-module-updates/resources` entry adapts public Resources cleanup.
The optional `live-module-updates/testing` entry provides portable authority
contract cases for a consumer's own test runner. Neither optional entry changes
the ordinary root's dependency boundary.

The successor [Programme C](docs/plans/composed-module-adoption-plan.md) in
[Draft PR #11](https://github.com/agent-teams-ai/live-module-updates/pull/11)
adds sound public function-property contracts, current runtime ownership after
cleanup recovery and actual authority-flight retention. Its
[composed reference](tests/qualification/composed-document/README.md) joins the
complete Document/Format/Export/Summary closure to a genuine GM-owned LMU runtime.
The [current evidence](docs/research/foundation-qualification-matrix.md#3e-composed-modules-and-gm-owned-lmu)
distinguishes published native checkpoints from the unfinished composed campaign.

The installed dependent-feature checkpoint passed in Node with the existing
browser regression. The invocation/authority discriminators passed on their
exact source in Node and actual Chromium.
The complete packed production operation has now passed in both independent
Node and Chromium Hosts: 29 named scenarios and six deliberate defect controls
per target. The [qualification matrix](docs/research/foundation-qualification-matrix.md#3c-complete-packed-operation)
binds that result to exact source, archive and native resources. The
[signed EF artifact join](docs/research/foundation-qualification-matrix.md#3d-signed-ef-artifact-through-the-complete-operation)
also passed in the selected Linux x64 Node Host. Its full native run passed
58/58 tests, including the Node/Chromium operation and five real signed/refusal
scenarios. The producer's package-admission and product-adoption decisions remain
with their owners.
Native Effect, isolated execution and
Wasm/Extism are separate candidate profiles. Module Federation, Piral,
Native Federation and OpenComponents are considered at their actual delivery,
loading and contribution boundaries.

Executed research includes the original Piral/Resources and Effect campaign,
public Get Modular custody/identity controls, and actual browser/HTTP version
skew. The [research map](docs/research/README.md) routes exact inputs, raw results,
original failures and limits. Real product cutover, stronger execution profiles
and common comparison with ready stacks remain separate qualification work.

The maintained [modular authoring reference](tests/qualification/portable-document/README.md)
shows Document, Format and Export, an ordinary core, an optional GM adapter and
independently wired Node/Chromium Hosts. The
[qualification matrix](docs/research/foundation-qualification-matrix.md#3-exact-portable-document-result)
records its exact-source results, including construction, contracts, artifact
identity, authority and cleanup controls. The earlier six-test result at
`6083e89` remains a historical ordinary-library checkpoint. This is bounded
fixture evidence; it does not substitute for qualification of the new runtime.
The [first-operation implementation plan](docs/plans/first-operation-implementation-plan.md)
now breaks the remaining work into steps, dependencies, adverse checks, estimates
and scoped open questions, and records the implementation assignment and exits.

The public [GitHub repository](https://github.com/agent-teams-ai/live-module-updates)
was created by the owner on November 23, 2026. Initial main source is
5ba2eca9a175b3cff40fd9725b86b658aece1c47; its first push omitted
CLAUDE.md due to the owner's global gitignore. Creation is not admission:
organization classification, applicable quality/Docs gates and production
qualification remain distinct. Read [bootstrap status](BOOTSTRAP.md)
before any adoption; no public npm runtime is shipped.

## Strategic direction and product scope

The owner clarified on 2026-11-23 that new Agent Teams products are greenfield
in the owning organization repositories. The old
[777genius/agent-teams-ai](https://github.com/777genius/agent-teams-ai)
application is a behavior and UX reference, not the default implementation
or first integration target; do not modify it for this research.

The long-term objective is continuous evolution across frontend, backend and
the foundation itself through qualified replacement paths. A narrow first
profile is a delivery discriminator, not a permanent vision limit.
See the [continuous evolution vision](docs/architecture/continuous-evolution-vision-2026-11-23.md)
for the proposed GM-first dependency and ownership map.

On 2026-11-24 the owner clarified the delivery order: qualify the shared
foundation through representative fixtures and independently wired test Hosts,
before waiting applications adopt it. A real product feature is not a
prerequisite. Browser, Desktop and untrusted third-party plugins are confirmed
architecture targets now; each supported profile still needs its own evidence.
Read the [qualification matrix](docs/research/foundation-qualification-matrix.md)
for the current executable slice and the remaining discriminating tests.

## Read by responsibility

| Question | Entry |
| --- | --- |
| How do we qualify the foundation before applications exist? | [Documentation map](docs/README.md), [foundation guide](docs/architecture/application-foundation.md) and [qualification matrix](docs/research/foundation-qualification-matrix.md) |
| What is available, published or still awaiting qualification? | [Dated status and source map](docs/status.md) |
| How can the same behavior work across apps with optional custom/declarative UI? | [Headless plugins and UI](docs/architecture/headless-plugins-and-ui.md) |
| What work unblocks applications before full live replacement? | [Foundation delivery plan](docs/plans/foundation-delivery-plan.md) |
| How should I write and qualify a modular feature now? | [Maintained authoring reference](tests/qualification/portable-document/README.md), [critical construction/conformance review](docs/plans/module-authoring-critical-review-plan.md), [complete contracts and storage boundary](docs/plans/module-authoring-contract-storage-plan.md) |
| Which choices need the owner and which need another experiment? | [Concrete decision packet](docs/decisions/open-decisions.md#decision-packet-for-the-first-useful-delivery) |
| Greenfield continuous evolution, future-trend evidence and concrete GM-first foundation | [Continuous evolution vision](docs/architecture/continuous-evolution-vision-2026-11-23.md) |
| Complete operation, ports and failure outcomes | [Operation proposal](docs/architecture/operation.md) |
| How does a project use the implemented cooperative operation? | [Usage and ownership contracts](docs/architecture/cooperative-operation-usage.md) |
| How should an implementing agent proceed phase by phase? | [Programme C: composition and Host ownership](docs/plans/composed-module-adoption-plan.md); [completed first-operation plan](docs/plans/first-operation-implementation-plan.md) |
| Which experiment addresses a particular risk? | [Research and evidence map](docs/research/README.md) |
| What changed after independent critique? | [Consolidation review](docs/reviews/foundation-consolidation-2026-11-24.md) |
| What corrects the earlier product-first sequence? | [Fixture-first successor review](docs/reviews/fixture-first-foundation-2026-11-24.md) |
| Original material and transfer identities | [Provenance](provenance/README.md) |
| Immutable historical and campaign packets | [Source registry](history/SOURCES.json) |
| Organization bootstrap and external consumer independence | [Bootstrap](BOOTSTRAP.md) |

The design supports eligible built-in features as well as independently
distributed plugins. The replacement boundary, shared dependencies, state
ownership and supported fallback are explicit. An ordinary external consumer
will not require Agent Teams catalog credentials, a particular database or
mandatory Effect.

## Implementation discipline

Production source adopts the complete immutable standard through the
[single FMS profile](architecture/feature-module-profile.json),
[ADR-0002](docs/decisions/0002-production-source-adoption.md) and
[source ownership guide](docs/architecture/source-ownership.md).
The root `pnpm check` is its complete native quality route. Fixture qualification,
managed Docs admission, required-check enforcement and npm publication retain
their separate evidence and owners.

Start with substantive representative behavior, independently specified
acceptance and real package/runtime boundaries in purpose-built test Hosts.
For the complete update operation, qualify its actual mechanisms in those
Hosts before product adoption. Extract packages where dependency, release or
ownership evidence warrants them. Do not
copy an upstream private lifecycle kernel, build another module resolver, or
make every consumer reconstruct the update state machine.

Public Resources supplies cooperative cleanup. LMU owns invocation admission and
generation custody for its selected cooperative operation profile; the
[dual-target mechanism evidence](docs/research/foundation-qualification-matrix.md#3a-native-invocation-and-authority-discriminator)
records the precursor checks. Full operation qualification uses the packed
implementation, including its retained-work and cleanup failure cases.

The retained historical research is stored as separate immutable packets. New
findings refine current proposals without rewriting old results or treating
source inspection as native execution. Original packet manifests identify their
frozen transfer contents; they are not a live inventory of later repository
changes or repository admission evidence.

Transferred project material retains the existing Apache-2.0 license. Original
third-party notices remain with their historical archives and experiment
evidence. No dependency, browser or compiler binary is a production deliverable.
