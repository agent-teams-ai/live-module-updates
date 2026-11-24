# Live Module Updates

Controlled replacement of application modules and plugins while an application
continues serving useful work.

The project is being designed as a portable TypeScript library. Its central
operation will plan and prepare an update, coordinate authoritative switching,
reconcile uncertainty, manage supported continuity and report remaining cleanup.
Applications supply narrow authorization and state primitives. Existing loaders,
composition systems, resource scopes and executors retain their responsibilities.

## Current status

**Research and proposed specification. No public production package or accepted
public API is delivered by this packet.** Ordinary TypeScript implementations
are the confirmed first direction. Native Effect, isolated execution and
Wasm/Extism are separate candidate profiles. Module Federation, Piral,
Native Federation and OpenComponents are considered at their actual delivery,
loading and contribution boundaries.

Executed research includes the original Piral/Resources and Effect campaign,
public Get Modular custody/identity controls, and actual browser/HTTP version
skew. The [research map](docs/research/README.md) routes exact inputs, raw results,
original failures and limits. The complete production library, real product
cutover and common comparison with ready stacks remain unqualified.

The public [GitHub repository](https://github.com/agent-teams-ai/live-module-updates)
was created by the owner on November 23, 2026. Initial main source is
5ba2eca9a175b3cff40fd9725b86b658aece1c47; its first push omitted
CLAUDE.md due to the owner's global gitignore. Creation is not admission:
organization classification, applicable quality/Docs gates and production
qualification remain distinct. Read [bootstrap status](BOOTSTRAP.md)
before any adoption; no public runtime is shipped.

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
| Which choices need the owner and which need another experiment? | [Concrete decision packet](docs/decisions/open-decisions.md#decision-packet-for-the-first-useful-delivery) |
| Greenfield continuous evolution, future-trend evidence and concrete GM-first foundation | [Continuous evolution vision](docs/architecture/continuous-evolution-vision-2026-11-23.md) |
| Complete operation, ports and failure outcomes | [Operation proposal](docs/architecture/operation.md) |
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

Start with substantive representative behavior, independently specified
acceptance and real package/runtime boundaries in purpose-built test Hosts.
For the complete update operation, qualify its actual mechanisms in those
Hosts before product adoption. Extract packages where dependency, release or
ownership evidence warrants them. Do not
copy an upstream private lifecycle kernel, build another module resolver, or
make every consumer reconstruct the update state machine.

Public Resources already supplies cooperative cleanup. Profiles promising atomic
invocation admission and generation custody need a separately qualified public
mechanism. That availability gap remains explicit in the design.

The retained historical research is stored as separate immutable packets. New
findings refine current proposals without rewriting old results or treating
source inspection as native execution. Original packet manifests identify their
frozen transfer contents; they are not a live inventory of later repository
changes or repository admission evidence.

Transferred project material retains the existing Apache-2.0 license. Original
third-party notices remain with their historical archives and experiment
evidence. No dependency, browser or compiler binary is a production deliverable.
