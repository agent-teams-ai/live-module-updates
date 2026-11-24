# A replaceable foundation, not a universal hot-reload framework

**2026-11-23 — proposed architecture strategy for critique.** The owner wants a
shared architectural foundation on which both backend and frontend products can
evolve while useful work continues. This review does not accept Q1–Q7, alter an
accepted ADR, select a public API, create a production package, or authorize
migration. It consolidates the decision implications of the existing
[operation proposal](operation.md),
[critical gaps](../research/critical-evidence-gaps-2026-11-23.md),
[closure study](../research/closure-integrity-and-reclamation-2026-11-23.md)
and [12 native public-package cases](../research/public-runtime-identity-and-safe-drain-2026-11-23.md).
It is a decision-oriented review, not a new framework survey or duplicate
lifecycle specification.

> **Owner clarification (later on 2026-11-23):** read the
> [continuous evolution vision](continuous-evolution-vision-2026-11-23.md)
> as the current strategic refinement. Broad replaceability of the entire
> system is the long-term goal, not a capability restricted to today's
> first profile. The greenfield organization repositories are the target.
> The legacy desktop inspection in section 7 is historical reference
> evidence only, and its adoption-candidate recommendation is withdrawn.

## Executive recommendation

**Standardize replaceability as an authoring discipline; activate live
replacement only at an actual independently managed boundary.** A feature
must have clear ownership, contract, state, dependencies and lifecycle where
applicable. That is not a requirement to distribute every feature, reload
every source file, put every class into a graph, run every module in a separate
process, or adopt one frontend renderer technology.

A coherent architecture supports several different replacement mechanisms.
Stable owners and compatible protocols are the durable foundation. Use the
existing composition compiler and scopes, native renderer and deployment
mechanisms, and one reusable update operation where those mechanisms need
coordination. Preserve one product authority. **Do not make all products
depend on the runtime updater just to author ordinary features.**

The earlier research substantially improves the design's defensibility, not
its measured production reliability. The current plan has two remaining
strategic risks beyond the individual technical gaps:

1. Turning the proposed complete operation into a second product control
   plane with an enormous host SPI. It would repeat existing EF/AR/Orchestrator
   ownership and force every consumer to implement most of the operation.
2. Constraining all frontend/backend changes to one execution mechanism. A
   local JS generation, remote server deployment, browser document, agent
   execution session and desktop bootstrap have different authority, placement,
   state and physical lifetime boundaries. A lowest-common-denominator adapter
   would hide rather than solve those differences.

Preserve the ambitious system scope while removing **mechanism duplication**,
not necessary correctness.

## 1. Reconcile the current owners before adding a library

The following are actual source-authority observations, not newly accepted
decisions. In particular, the current Orchestrator baseline is Core/Assembly
0.5.0 and the exact accepted Consumer Module Standard revision; the experimental
0.8.0 cohort is not an authorized upgrade of that baseline.

| Owner | Owns exactly | Must not own again |
| --- | --- | --- |
| Organization FMS + Engineering Foundation | Feature/sub-feature visibility, declared dependencies, composition and architecture fitness; compiler/tooling/conformance gates | Runtime loading, graph selection, product state, update controller |
| Get Modular Core/Assembly | Inert declarations and binding/graph semantics, immutable plan, construction of selected authorized factories | Artifact trust, product lifecycle, durable route authority, hot update workflow |
| Get Modular Resources / Observation | Registered acquisition and cleanup flights/debt; latest-state observation and obsolete-loader handling | Admission of product calls, physical process termination, durable event/command delivery |
| Existing lifecycle-kernel candidate | Narrow local generation and lease bookkeeping under its existing owner; public admission still pending | Loader, scope engine, product graph head or operation orchestration |
| Extension Foundation | Artifact/trust/distribution/permission and lifecycle protocol constraints, conformance | Product-owned operational authority or another module resolver |
| Live Module Updates (proposed) | Reusable bounded activation/replacement operation, owned attempt observations, coordination and truthful recovery over supported primitives | A second canonical head, catalog, grant/lease system, product state machine, transport/scheduler, cleanup stack |
| Product Host | Actual desired profile, canonical selection/authorization, business data/effects, deployment and physical owners | Reimplement the entire common update protocol around a large generic hook interface |
| Agent Runtime | Agent session/operation execution authority, provider binding and handoff, process/stream custody and actual recovery | Product collaboration domain or library's code-generation identity |

**Implementation ownership is distinct from authority.** A library can execute
a reusable use case while the product owns its authority and concrete ports.
In an EF-admitted profile, map the library's activation use case onto the
existing product canonical graph publication/fences/receipts. Do not add a
second independently writable active-head table or a second transition
controller implementing the same activation. If an existing product owner
already implements part of the operation, choose which implementation is
shared or delegated; do not keep both active. Installation/catalog workflow
can invoke activation, but activation does not reimplement installation.

Sources:
[FMS v1.1](https://github.com/agent-teams-ai/.github/blob/0b44c64c824f536bd1b085341e7669bcc64ef124/docs/architecture/feature-module-standard/v1.1.md),
[GM boundary](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/docs/architecture/system-boundary.md),
[EF ADR-0015](https://github.com/agent-teams-ai/extension-foundation/blob/70f2bf21203b557e0f5a3b563a6b41eec5925fd8/docs/decisions/0015-authorize-get-modular-semantic-extraction.md),
[EF ADR-0014](https://github.com/agent-teams-ai/extension-foundation/blob/70f2bf21203b557e0f5a3b563a6b41eec5925fd8/docs/decisions/0014-product-local-module-authoring-composition-and-generation-guardrails.md),
[EF ADR-0011](https://github.com/agent-teams-ai/extension-foundation/blob/70f2bf21203b557e0f5a3b563a6b41eec5925fd8/docs/decisions/0011-extension-admission-custody-and-retirement-closure.md),
[Orchestrator ADR-0117](https://github.com/agent-teams-ai/agent-teams-orchestrator/blob/c6ce98cd1a8ac1dd27ec877c018e5aa7cd5adff7/docs/decisions/0117-reconcile-mandatory-module-composition.md),
[AR ADR-0024](https://github.com/agent-teams-ai/agent-runtime/blob/0ce60d7474159396132752a625c914ffa87c5049/docs/decisions/0024-get-modular-resource-scopes-for-ordinary-owners-and-provider-access-grants.md).

## 2. Critical choice: one authoring model, different replacement boundaries

| Change class | Default recommendation to evaluate | Stronger mechanism only on evidence |
| --- | --- | --- |
| Values, settings, flags, policies already interpreted by compatible code | Owner-controlled versioned data and existing Observation/store/flag provider; no code replacement | Version-coherent operation snapshot or authorized state transition |
| Ordinary implementation selection from shipped code | Get Modular at the actual composition seam; typed ports; no universal loader | Independent logical activation with candidate and retained invocation |
| New trusted executable feature/contribution | Immutable artifact/loader closure, explicit local replacement boundary and actual useful readiness | Optional delivery/loader adapter such as Federation where existing deployment needs it |
| UI presentation | Existing framework lifecycle and feature-owned contribution ports, stable shell/data owners | Separate view lifetime, actual state continuity, scoped assets and old-client contract |
| Long-running work, remote/native execution or untrusted code | Existing execution/process/supervisor boundary and product authority; qualify actual physical stop | Independent isolation/worker profile, not an in-process security promise |
| Host substrate, privileged bootstrap, runtime/SDK or incompatible state/protocol | Existing application update / rolling process/realm replacement with recovery anchor | Specialized handoff only when genuine continuity proof exists |

A source-defined module identity, feature identity, package/release boundary,
deployment/service role, plugin artifact, runtime generation, and tenant/agent
are **orthogonal**. One feature can use many helpers and one deployment can host
many capabilities. A plugin can contribute several modules. Do not make the
number of npm packages, processes or graphs equal to the number of features or
agents. FMS parent/sub-feature visibility still holds: an independently managed
slice needs an explicit owner surface, not a shortcut into a private sub-feature.

A module loaded by a literal bundled import can select only code shipped in that
artifact. Actual later code delivery needs its own verified immutable closure and
loader. Do not market built-in dynamic import or development HMR as production
remote code updates. Config changes that need no new executable should not incur
a new runtime generation. Feature flag evaluation can reuse an existing
provider; see [OpenFeature](https://openfeature.dev/specification/sections/flag-evaluation/).
A flag is not a capability grant.

### Alternatives reviewed

Judgment scores (1 weak, 10 strong) are design-fit assessments for the owner's
whole vision, not measured comparative reliability. A lower cost score means
more complexity. Each alternative remains bounded by actual evidence.

| Strategy | Ownership / DRY | Live UX | Practical delivery | Scale and recovery potential | Simplicity of necessary mechanisms |
| --- | ---: | ---: | ---: | ---: | ---: |
| Every product invents its own hot updater | 3 | 6 | 5 | 4 | 4 |
| Universal plugin/runtime for every feature, every tier and process | 3 | 7 | 3 | 4 | 2 |
| Only ordinary rolling deployments / full-window reloads | 8 | 4 | 9 | 8 | 9 |
| Shared authoring + bounded common operation + native owner mechanisms | 9 | 9 | 8 | 9 | 8 |

The final option is the recommended target, not an already qualified winner.
Use process rollout and static composition as strong baselines; justify local
hot replacement only where it brings user continuity or independent deployment
value. This is a layered combination, not a prohibition on process isolation
or a requirement to deploy all layers in every consumer.

## 3. Stable recovery anchor: who updates the updater?

The recovery/bootstrap root must not depend exclusively on code being replaced.
Without that anchor, a broken candidate can also destroy the mechanism needed
to select the last known good profile. This is not a demand for a new central
supervisor: reuse the actual product's bootstrap, local supervisor or deployment
controller.

- Maintain a minimal trusted recovery path: verified launch/bootstrap,
  selected authority, compatibility/readback and known-good artifact access.
  Keep its ownership explicit. It may itself be upgraded via an outer
  supported application/process deployment boundary.
- Keep host transport entrypoints and the admission mechanism stable inside
  the chosen local profile. Replace implementation capabilities behind them,
  not IPC handlers, listener addresses, React runtime or package-local
  authenticated scope identities by default.
- A runtime/host foundation upgrade is a separate rollout/restart profile.
  Prepare a successor, validate compatibility and retained state, transfer
  routing only through the actual authority, drain old work or preserve its
  owner. Do not make a generic library hot-reload itself while it owns an
  unfinished operation. No infinite hierarchy of self-updating supervisors.
- A persistent desired revision and verified previous artifact are useful
  recovery facts, not proof that code rollback is safe with current data or
  revoked permissions.

This follows directly from native P5/P6, where byte-identical physical copies
of Assembly/Resources cannot exchange authenticated handles. Also consult
[MDN dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import):
unique specifiers can accumulate module namespace/cache retention and do not
provide a manual unload primitive. Do not require memory-unload proof from a
logical route switch. Bound long-lived realms, measure repeated updates, and
provide an explicit compatible realm/process replacement at a safe point.
A memory limit never authorizes losing an admitted operation.

## 4. Backend: scope the deployment and the work independently

Respect existing Orchestrator architecture rather than moving it into LMU.
[ADR-0114](https://github.com/agent-teams-ai/agent-teams-orchestrator/blob/c6ce98cd1a8ac1dd27ec877c018e5aa7cd5adff7/docs/decisions/0114-canonical-backend-stack-and-distributed-role-adoption.md)
owns service roles, Protobuf/Connect public interfaces, private gRPC/Dapr,
direct durable JetStream delivery and PostgreSQL. Within a role, ordinary
typed calls remain appropriate. A remote endpoint is not a shared JS instance.
[ADR-0115](https://github.com/agent-teams-ai/agent-teams-orchestrator/blob/c6ce98cd1a8ac1dd27ec877c018e5aa7cd5adff7/docs/decisions/0115-canonical-fully-local-v1-adoption.md)
keeps Fully Local, self-hosted and hosted V1 profiles under shared domain
semantics but different deployment/authority boundaries. No cloud service,
PostgreSQL installation or Dapr sidecar is a mandatory dependency of the neutral
in-memory OSS library.

- In an eligible single process, keep stable transport/admission and choose a
  coherent immutable composed cohort per admitted operation. New work reaches
  the successor; old calls and streams retain exactly the allowed dependencies
  and semantic views until the terminal boundary. Do not register one
  independent dispatcher per generation at the same transport address.
- Existing distributed role deployments can use rolling replacement, versioned
  service contracts and readiness/admission checks. Kubernetes
  [RollingUpdate](https://kubernetes.io/docs/tasks/run-application/update-deployment-rolling/)
  controls availability/surge of pods, not application-state correctness.
  [gRPC graceful shutdown](https://grpc.io/docs/guides/server-graceful-stop/)
  separates draining from forceful termination. Reuse these mechanisms; LMU
  must not become a Kubernetes, Dapr or service discovery implementation.
- A session or agent command has its own execution identity, grants, stream,
  durable operation and effect receipts. A code update cannot silently create a
  new provider operation or rebind an already-running session. AR owns this
  handoff. New sessions may use B while existing supported sessions finish on
  A. Reuse the [existing execution authority](https://github.com/agent-teams-ai/agent-runtime/blob/0ce60d7474159396132752a625c914ffa87c5049/docs/architecture/execution-generation-model.md)
  and ADR-0091 rules; do not add a parallel session engine.
- Do not hold a global lock or database transaction across preparation,
  remote work, drain, or cleanup. The previous ordering and closure witnesses
  identify the short authority boundary. Shared invariants determine scope;
  genuinely unrelated domains may progress independently.

The desired unit is a useful **feature/service capability**, not a source
function. Keep a declared provider/port and existing durable owner; avoid
transport or storage leakage into the application's policy.

## 5. Frontend: replace a contribution, not the whole application state

The existing Orchestrator [OD-042](https://github.com/agent-teams-ai/agent-teams-orchestrator/blob/c6ce98cd1a8ac1dd27ec877c018e5aa7cd5adff7/docs/open-decisions/OD-042-frontend-extension-contribution-model.md)
already proposes feature-owned, framework-neutral commands, views, settings,
activity renderers and previews, with Web/Desktop environment-specific
capabilities. OD-042 and [OD-043](https://github.com/agent-teams-ai/agent-teams-orchestrator/blob/c6ce98cd1a8ac1dd27ec877c018e5aa7cd5adff7/docs/open-decisions/OD-043-extension-lifecycle-catalog-and-hot-update.md)
remain OPEN. This review proposes a direction, not their resolution.

Separate three concerns: **semantic contribution contract**, **native renderer
adapter**, and **runtime/delivery profile**. A host can own a React mount
without imposing React on the neutral update operation or all product
contracts. Do not write a universal virtual DOM, component system, routing
framework, CSS runtime or editor serializer. Use the current framework/store
and a thin adapter where the genuine host boundary warrants it.

| Concern | Proposed stable owner / requirement |
| --- | --- |
| Root shell and platform authority | Target/session identity, authentication, layout, navigation, command routing, theme/i18n/a11y, IPC bridge and recovery UI stay host-owned; a plugin receives only narrow capabilities |
| Replaceable contribution | Explicit mount/readiness/dispose and exact owner identity; prepare without unauthorized duplicate effects; late callbacks cannot remove/overwrite successor |
| Durable user intent | Existing domain/draft/editor/history owner; preserve unsent edits, attachment IDs, pending commands and undo semantics where promised; never infer from mount success |
| Ephemeral view state | Keep only the state needed for continuity at its existing feature owner; actual safe remount, focus/selection/scroll/IME or declared reset boundary |
| Subscriptions and cached queries | Existing query/store/feed owners; exact Target + query/contract identity + compatible projection/revision where necessary; abort/unsubscribe and reject stale results |
| Client delivery | Immutable asset closure; preserve old chunks while supported clients may need them, then explicit refresh/expiry/reconcile; a newly active document or service worker does not prove all old views are retired |

A renderer's own shared dependencies and execution environment must be
qualified. GM Core's
[plan emission source](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/core/src/features/plan-output/factory.ts)
uses global crypto.subtle; Observation's
[platform boundary](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/observation/src/features/delivery/platform.ts)
has optional Node native context/proxy enforcement and fallbacks.
Portable source, no Node imports, or a passing NodeNext/Bundler declaration test
does not establish actual browser behavior, availability of Promise.try,
WebCrypto in the selected origin, or equivalent async-context enforcement.
The public GM cohort's stated Node engine range and the native P1–P12 evidence
must not be extended into a browser/SSR/Electron qualification claim.
Qualify the exact packed browser path and current runtime APIs before choosing
GM in a renderer; if inert graph compilation happens at build/host side, keep
that legitimate alternative rather than copying the compiler into the browser.

React [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
provides consistency for supported external snapshots, not arbitrary state
transfer or a universal nonblocking transition. Existing React/DOM lifecycle
and external state are the first mechanisms to evaluate, not a second frontend
runtime. Development Fast Refresh is not a production continuity contract.

For trusted first-party contributions, an ordinary in-process renderer adapter
may be appropriate once qualified. Declarative contributions or isolated rich
content are additional profiles only on real need. Electron's
[security guidance](https://www.electronjs.org/docs/latest/tutorial/security)
and [context isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
remain binding platform concerns: never expose arbitrary Node/Electron APIs to
remote content. A signed UI bundle is not a grant or isolation boundary.
[VS Code extension hosts](https://code.visualstudio.com/api/advanced-topics/extension-host)
are a useful precedent for separate local/web/remote placement and lazy
activation; not an obligation to build another extension host.

## 6. Frontend/backend compatibility is a first-class rollout contract

There is no requirement for an impossible globally instantaneous update of every
open browser, renderer, service and agent. Require coherent local cutovers and
explicit cross-target compatibility. Independent activation is allowed only
where the consuming contract remains valid.

| Client / server | A | B |
| --- | --- | --- |
| Old client A | Existing supported baseline | Must be supported during its declared coexistence horizon, or explicitly recover/upgrade before unsupported use |
| New client B | Do not assume this cell is compatible; gate the new capability until supported | New supported behavior |

Proposed rollout ordering: deploy backward-compatible readers/handlers and
expanded schema first; qualify old and new contracts; activate new client
contribution when the actual server capability is present; retain compatible
old assets and effects/command identities; contract obsolete behavior only
when the relevant old clients/writers are retired or an explicit unsupported
outcome is in force. Reverse order may be valid for a purely additive UI
change; no blanket release DAG. Returning to old code revalidates current
schema, authority, old writers and already committed effects.

Use the existing [public control contracts](https://github.com/agent-teams-ai/agent-teams-orchestrator/blob/c6ce98cd1a8ac1dd27ec877c018e5aa7cd5adff7/docs/architecture/public-control-contracts.md)
for API version/capability negotiation, typed commands, request IDs and
feed semantics. [ADR-0019 resumable feeds](https://github.com/agent-teams-ai/agent-teams-orchestrator/blob/c6ce98cd1a8ac1dd27ec877c018e5aa7cd5adff7/docs/decisions/0019-resumable-feed-contracts.md)
already handles checkpoints, snapshot watermark, duplicates, expiry and
bounded buffering. Do not invent a universal update event log or use Observation
as a durable feed. A reconnect preserves the owning Target and original
request; never retry a command against another Target merely because a new
client or code generation is active.

A versioned endpoint/compatible contract can keep A useful on B without
keeping all of server A running for every old browser. Deployment pinning is an
alternative when matching server builds are actually necessary. Vercel's
[Skew Protection](https://vercel.com/docs/skew-protection) is instructive:
deployment affinity has supported request paths and retention limits, and
custom fetches need explicit participation. Do not require Vercel or a copy of
its routing platform. A client-supplied version is not authoritative
authorization, tenant identity, or proof of compatible code. Emergency security
revocation can override a compatibility/retention horizon with a truthful
failure/recovery path. Offline clients cannot be silently promised indefinite
assets, privileges or old command replay.

The hosted [cross-tier fixture plan](../research/evidence/cross-tier-skew-20261123/PLAN.md)
isolates these risks in native browser ESM plus a real local HTTP fixture. It
is not a React/IPC/Protobuf or product rollout qualification. See its run-linked
evidence separately; this strategy is not contingent on a fixture passing.

## 7. Historical legacy desktop reference (not an adoption target)

The old desktop application is a read-only architecture/behavior reference
for the greenfield design. The previously proposed first integration into
recent-projects is withdrawn by the owner's scope clarification. The
[recent-projects reference](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/src/features/recent-projects/README.md)
and its [feature standard](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/docs/FEATURE_ARCHITECTURE_STANDARD.md)
remain useful source evidence about cross-process ownership. The table
below supplies requirements and counterexamples for the **new** system;
none authorizes a legacy change.

Concrete inspected boundaries:

| Actual source | Recommended use / specific risk to qualify |
| --- | --- |
| [createRecentProjectsFeature](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/src/features/recent-projects/main/composition/createRecentProjectsFeature.ts) | Existing facade is a genuine typed query seam. An analogous greenfield cohesive query is a better update unit than a module per mapper. Cache and sources have real owners; do not duplicate scans or competing mutable caches during overlap. |
| [IPC registration](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/src/features/recent-projects/main/adapters/input/ipc/registerRecentProjectsIpc.ts), [HTTP registration](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/src/features/recent-projects/main/adapters/input/http/registerRecentProjectsHttp.ts), [preload bridge](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/src/features/recent-projects/preload/createRecentProjectsBridge.ts) | Existing transports capture the facade. For the new system, preserve its own stable transport boundary and qualified admitted invocation. Avoid re-registering endpoints on each feature change. |
| [ListDashboardRecentProjectsUseCase](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/src/features/recent-projects/core/application/use-cases/ListDashboardRecentProjectsUseCase.ts) | Existing in-flight dedupe and stale/degraded cache behavior. Source timeout uses Promise.race; response timeout cannot establish underlying source termination. Test actual owned work before retirement. |
| [Claude source adapter](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/src/features/recent-projects/main/adapters/output/sources/ClaudeRecentProjectsSourceAdapter.ts), [Codex file source](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/src/features/recent-projects/main/adapters/output/sources/CodexSessionFileRecentProjectsSourceAdapter.ts) | The facade chooses a context for its cache key; adapters separately obtain active context and the Codex source maintains an in-flight list and writes a cache file. Read-oriented user behavior is not effect-free runtime work. Qualify captured context consistency and exclusive/shared cache ownership instead of assuming all sources may overlap. This is a source-derived risk/test target, not a reproduced product bug. |
| [renderer hook](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/src/features/recent-projects/renderer/hooks/useRecentProjectsSection.ts), [client cache](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/src/features/recent-projects/renderer/utils/recentProjectsClientCache.ts), [existing context request epoch](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/src/renderer/store/utils/contextScopedRequestEpoch.ts) | Existing late-response fencing and cache identity are valuable. Reuse/compose the actual Target guard; module generation is an additional distinct compatibility basis only where required. Do not replace the global store or invent another client cache just for the updater. |

Transfer the requirements to a selected greenfield query and its own
frontend contribution: admitted old request completion, useful B output,
actual source/handle disposition, compatible response shape, unaffected
siblings and stale Target/view result refusal. No edit of the legacy
recent-projects feature is proposed. The old
[MemberExecutionLog](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/src/renderer/components/team/members/MemberExecutionLog.tsx),
[composer draft](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/src/renderer/hooks/useComposerDraft.ts)
and [app updater](https://github.com/777genius/agent-teams-ai/blob/e876918f362e2fad55dbf47996e3ba346dbc22b9/src/main/ipc/updater.ts)
are similarly reference evidence, not the new renderer, state owner or
bootstrap design. New products choose the actual owners under their own
accepted contracts. See [the corrected greenfield roadmap](continuous-evolution-vision-2026-11-23.md#5-greenfield-adoption-and-an-extensible-architectural-contract).

## 8. Scale and practical performance: preserve local fast paths

Thousands of concurrent agents is a product capacity target, not a claim
that the new updater is measured to support thousands. A few coherent
deployment/activation domains can serve many concurrent operations. Define
budgets by actual owners, not feature count:

| Dimension | Correct accounting and review |
| --- | --- |
| Composition | Compile once per exact compatible profile/version where valid; reuse the immutable verified plan. No graph compilation on each request or per agent by default. |
| Admission | A bounded local owner operation, no arbitrary callback or await in the atomic section. No per-call durable database round trip solely to choose local code; actual authority/effect checks remain mandatory where required. |
| Preparation | Bound independent staging and competing candidates; control shared/exclusive resources, I/O and memory. Stage only the affected compatible closure, not every role and tenant. |
| Retained work | Count old generation(s), work/custody, pending cleanup and shared owners separately. A/B/C coexistence is possible. Never overwrite a prior holder to fit a budget. Defer/refuse another update or use separately authorized fallback. |
| Client assets | Reuse identical verified immutable content where trust scope permits; hold exact old-client closure and bounded compatible horizon. Do not retain a whole backend deployment for each old tab if compatible handlers suffice. |
| Durability/telemetry | Keep durable attempt/receipt history where policy requires it, but derive views from existing authoritative state/feed. Bounded pending events and high-cardinality identifiers; no global event or metrics registry per agent. |

Use a baseline from the same consumer with static composition and ordinary
compatible process rollout, then compare an actual local replacement.
Measure startup/preparation/commit/publish-to-useful latency, p95/p99 admission
and request latency, error count, real retained-work completion, native memory
and handle count across repeated updates, number of retained generations,
deferred attempts, cleanup debt and asset bytes. Declare the cohort,
duration, hardware and workload. Independent domains and long-lived old
streams must be included. Set acceptance budgets from baseline and product
SLO/retention policy, not arbitrary nanosecond or percentage claims. Do not
promote small prior test durations into throughput or capacity numbers.

For a first profile consider one active generation plus one draining/staged
limit, with independent cases for A/B/C overlap and refusal. This is a
conditional policy example, not a fixed default. A safe bound on retained
generation objects is not by itself a bound on ESM module caches; a real
long-lived runtime needs repeated-update memory evidence and a planned
compatible renewal boundary.

## 9. DRY, SOLID, Clean Architecture and DDD: concrete stopping rules

| Anti-pattern | Reject in review | Keep instead |
| --- | --- | --- |
| Second graph compiler / service locator | A new runtime scans files, resolves providers or imports arbitrary services from a central registry | GM's existing compiled facts and feature-owned closed dependency ports |
| Universal plugin interface | Every module exposes unrelated setup/start/migrate/serialize/reload/hooks, with empty methods or fake support | Capability-specific supported profile and explicit rejection; ordinary code can remain plain functions |
| Package per phase / per helper | A new public package for plan, select, prepare, reconcile, retire, mapper or DTO | One cohesive update-operation feature and actual extraction triggers |
| Duplicate owner/resource manager | Parallel active-head, lease table, reference counts, scopes, cleanup retry or effect journal over the same resource | Existing canonical authority and native owners; coordinator retains observations, not second truth |
| Global event bus / workflow engine | Every query/command becomes event or workflow, or a new durable scheduler appears for local code | Explicit typed ports; existing durable command/event/replay owners for actual delivery requirements |
| Universal frontend abstraction | Own renderer, router, store or serializer duplicated to be framework neutral | Neutral contribution semantics; native framework adapter where selected |
| Runtime descriptor on every feature helper | Artificial graph nodes or direct root access to private sub-features | FMS owner hierarchy and real independently managed seams |
| One global lock / one process per module | Scope defined by deployment size rather than actual invariant or trust/lifetime | Smallest real owner domain; coarse role processes where deployment requires |
| Infinite compatibility / automatic retry | Old code/assets kept forever; unknown effect treated as safe to retry with new attempt | Bounded policy, explicit uncertainty, current grants and receiver-owned receipt |
| Self-updating bootstrap | Candidate can destroy the only path to recover a known-good version | Stable outer recovery owner and supported host/realm upgrade |

Also reject false simplicity: a single mutable enabled flag, current/previous
slot without retention refusal, cleanup completion equated with drain, old
code authority inferred from a lease, a static source digest equated to the
actual executable closure, or implicit UI/state rollback. Prior actual
negative controls justify these distinctions.

Clean Architecture means dependencies point toward owned policy; integration
ports describe the actual consumer-needed contract. SOLID means independent
responsibilities and narrow substitution boundaries; do not make a port per
private function. DDD means domain invariants and bounded context ownership
stay with the real product; update attempts are technical process facts, not
new business aggregates. DRY means one owner for semantics, not one generic
class for every similar-shaped event. Independent oracles and thin necessary
framework wiring may legitimately resemble each other. Do not share the
implementation algorithm with its own conformance oracle.

**Extraction fitness:** add an adapter/package only for real dependency,
lifecycle, isolation, release, or independently used capability needs. Review
where product-specific wiring dominates the slice or every ordinary feature
change requires Foundation changes. That is a signal to reduce coupling, not a
line-count quota that overrides safety. Preserve existing immutable ADRs and
use a successor in the owning repository when an actual semantic change is
approved. Do not install another quality framework: use the repository's
existing FMS, Engineering Foundation, exact compiler, packed surface and
native conformance gates.

## 10. Qualification and staged adoption, without coding the library now

Each stage has a bounded go/no-go; no stage silently adopts an open choice.

| Stage | Required evidence before expanding | Scope discipline |
| --- | --- | --- |
| R0: ownership and exact source baseline | Approve actual first feature + supported Q1–Q7 profile; reconcile product pins and existing upstream public-admission status; review initial API boundaries against accepted ADRs | No production bootstrap or fake public kernel. Existing static authoring follows its own accepted FMS/GM rules; do not hold it hostage to unrelated future runtime profiles. |
| R1: true local use case | Real independently packed consumer through supported atomic selection/admission, construction, useful B query, retained A, failed candidate/drain, exact shared-owner/cleanup and budget refusal | One cohesive operation; ordinary TS first. Avoid mandatory Effect, DB, remote catalog, loader zoo and workflow engine. No copied private lifecycle kernel. |
| R2: actual renderer + backend consumer | Qualified published browser/runtime cohort where needed; actual existing view replacement, stable owner state and old/new HTTP/IPC contract; stale responses and old chunks; visible usability/fallback | Keep feature-owned UI and existing store, no generic renderer manager. One real Web/Desktop environment first, then the other independently. |
| R3: existing durable product role | Canonical store and receiver transaction/reconciliation, overlapping publishers, actual crash/restart, old-client protocol and deployment scope; exact profile evidence | Reuse product-owned Protobuf/Postgres/Dapr/JetStream and local supervisor. No new canonical state or broker. |
| R4: long-lived execution and scale | Actual agent session/stream owner continuity, cancellation, stale authority, retained generation budget, load and repeated updates | AR owns provider/session semantics. Measure real workload, don't replace an entire live agent merely because a code release changes. |
| R5: independently delivered/isolated plugins and substrate renewal | EF exact artifact/permissions, real selected loader/isolation, old-client assets, revocation and native stop; separately qualify host/realm upgrade and recovery | No blanket hostile-code in-process claim or all-format adapters. Expand only on real consumer need. |

The first local operation's existing conditional estimate remains roughly
3k–6k authored production SLOC and 4k–9k tests for a focused complete operation;
an initial 900–1,800 line slice is not equivalent. Stable bounded TS scope had
a 7k–14k estimate. These prior estimates are not new measurements or a promise;
upstream public admission, actual product integrations, browser/runtime
qualification, tooling bootstrap, distribution and durable/isolated profiles
must be estimated separately after scope is selected. Prefer measuring changed
consumer glue, actual retained owner complexity and delivered guarantees to
expanding package count.

The next go/no-go is not another survey of hypothetical plugin frameworks:
the existing Get Modular lifecycle kernel has a narrow source-admitted
candidate, not a public release. Establish the supported local admission seam
with its owner, including nested/retained work and reentrancy; either qualify
the existing mechanism or prove a genuinely existing host mechanism. Do not
invent another kernel to bypass that gate. A first real product use case and
a second independent adopter test the neutral intersection before stable API
promotion; don't wait for all future platforms to complete the first bounded
proof.

**Review conclusion:** the fundamental direction is strong, but the current
proposal must retain these tighter boundaries. Existing studies support
specific native mechanisms and counterexamples, not the entire design.
No production implementation, Q1–Q7 acceptance, dependency pin migration,
public SPI, central policy change or product adoption is authorized here.

## Executed cross-tier follow-up

The [bounded browser/HTTP evidence](../research/cross-tier-version-skew-2026-11-23.md)
now records all four passing amended cases on TS 7.0.2, Node 24.22.3 and
actual Chromium 159.0.8154.6. Initial X4 timed out and is preserved; the
amended case proves incomplete application acknowledgement, not TCP reset.
Native observations support compatibility intervals, lazy-asset retention,
stale-result fencing and stable draft ownership, plus original command
identity across a backend selection. They do not qualify an actual product
or the complete proposed update operation. R0–R5 and Q1–Q7 remain distinct.
