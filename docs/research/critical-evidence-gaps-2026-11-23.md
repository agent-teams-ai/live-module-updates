# Critical evidence gaps before a complete live-module updater

**Observation date:** 2026-11-23. **Status:** independent research synthesis and proposed falsifiers, NOT an adopted design, implementation, comparative product test, or qualification. **Scope:** a reusable open-source TypeScript update-operation library that can work without Agent Teams infrastructure. Maintained production/test code added here: **zero**.

## Read this beside the existing evidence

The existing [operation](../architecture/operation.md), [critical industry register](industry-patterns.md), [executed Piral/Effect observations](validation.md), [open Q1-Q7](../decisions/open-decisions.md), and [source-pinned cross-repository review](../architecture/cross-repository-review.md) remain authoritative for their respective claims. This note does not rerun the November 23 experiment or revise its 3 tests / 6 named cases / 66 comparisons. It isolates **what the earlier successful probes cannot establish** and makes the next research and eventual consumer tests falsifiable.

The maintained cross-product [Engineering Research index](https://github.com/agent-teams-ai/engineering-research/blob/eaaac0a4bab203f242cdbb833006f1ff1f486ed2/docs/studies/plugin-system-research-index.md) records general patterns and counterexamples. Detailed proposed adapter contracts and the first consumer's qualification belong **here**; Get Modular, Extension Foundation, Engineering Foundation and each product retain their own implementation/adoption authority. Source classifications below: **E** = executed in the earlier bounded campaign; **S** = inspected source/public documentation only; **H** = design hypothesis or derived risk, not executed.

**Subsequent deeper evidence:** [Cutover, Admission and State Custody](cutover-admission-and-state-custody-2026-11-23.md) inspects the actual Get Modular/Agent Runtime boundaries and reports an executed finite-ordering model and a disposable SQLite transaction witness. These are new bounded research results; they are not installed-library, PostgreSQL, or whole-updater qualification. The S1-S7 table below retains its originally proposed native scope.

## The most consequential unproven invariant

A module update must never confuse five distinct events: **candidate prepared**, **authoritative target committed**, **new behavior usefully adopted**, **old admitted work released**, and **old physical resources/artifacts eligible for disposal**.

A real result can be committed but not yet adopted, useful but still holding cleanup debt, or timed out while its publication may already have committed. None of these facts is a single "success" Boolean. Treat the following as independent, owner-qualified evidence, with one canonical authority per fact.

| Fact / identity | Proposed authoritative owner | Evidence that would qualify a result | Wrong shortcut |
| --- | --- | --- | --- |
| Desired head / publication commit | Consumer's existing authoritative storage and authorization boundary | Original attempt ID, expected predecessor, CAS outcome, same-attempt lookup after lost acknowledgement | A library-local mutable generation registry |
| Prepared candidate and attempt ownership | Library operation using a loader/physical custody owner | First ownership receipt **before** execution/import; acquired resources accounted for on rejection/cancellation | Resolving import() and treating it as safely reversible |
| Actual invocation and version affinity | Qualified existing execution/admission mechanism | Atomic select-and-admit under one agent/realm; retain across await, stream and callback | Reading current head and incrementing a counter afterward |
| Useful adoption | Consumer-specific usable operation/view | A generation-labelled real request or user-visible action; state baseline and owner acknowledged | New bundle downloaded or UI mounted |
| Final cleanup and reclamation | Existing scope, executor, session, artifact and history owners | First/actual close completion, failed debt, client/stream retention and physical stop as appropriate | Retrying an idempotent close and assuming every handle vanished |

**Cross-process limit:** a synchronous one-agent call lease does not fence a request already sent to a remote system. The receiver/external-effect owner needs its own version/idempotency/authority contract. Do not claim distributed exactly-once or universal fencing from a local mutex, in-process token or canonical SQL update.

## P0 risks: decide the supported guarantee before selecting an adapter

| ID | Prior evidence | Still unproven / proposed rejecting example | Owner and disposition |
| --- | --- | --- | --- |
| G01 — module evaluation before admission | S: ordinary ESM import evaluates code; E: Piral rejected setup and cleaned a registered listener | Import has an unregistered top-level timer, network write or global mutation; rejected prepare cannot undo it. Trusted cooperative profile must declare limitations; untrusted profile needs **real** isolation and bounded capabilities | Loader/EF trust profile + execution owner. Never treat import as an effect-free preview |
| G02 — atomic call selection | S: Get Modular Resources public; lifecycle-kernel private candidate | New selection races an old invocation at the exact handoff; no call disappears or executes with an unretained generation | Get Modular or existing qualified host mechanism; do not copy private kernel or require every consumer to write this algorithm |
| G03 — physical effect authority | H: remote invocations may outlive local selection and remain capable of writing | An old request already in flight writes after publication; target authority/fence/idempotency must reject or deliberately admit it per profile | Product's receiver and effects, library coordinates/proves only supported policy |
| G04 — unknown publication | H: timeout is not proof of abort | Canonical compare-and-swap commits, acknowledgement is lost, caller retries under the **same** attempt identity; no duplicate effect, no premature candidate deletion | Library reconciliation over consumer's original-attempt lookup |
| G05 — state schema and ownership | E: earlier browser draft preservation in a disposable fixture, not arbitrary migration | Successor reads incompatible persisted state or sees a concurrent write after its snapshot; explain rejection, expand/contract or owner-approved migration; code rollback must not claim to undo external effects | Real state owner, with no library-owned generic serializer or business aggregate |
| G06 — mutable shared dependencies | S: webpack Module Federation share scope can retain an already loaded shared version | Two remotes choose different contracts for one singleton, or loader selects the new remote but keeps incompatible old shared runtime; reject unsupported mixed realm | Real bundler/loader plus Get Modular dependency semantics; no second resolver |
| G07 — old generation finalization | E: Piral delayed page disposer removed successor; E: Effect repeated close returned early | Late old disposer must not remove B; original cleanup still pending or failed; debt stays observable while B operates | Registration adapter and native scope/executor; exact-instance owner, not route/name-only |
| G08 — untrusted plugin execution | S: Node explicitly says node:vm is not a security mechanism | A plugin tries filesystem/network/process APIs, indefinite CPU/worker activity or unsafe native addon. No "secure plugin sandbox" promise using vm or ordinary Worker alone | Qualified isolated execution owner; **not** in the default trusted in-process profile |
| G09 — host loss after commit | H: durable profile not chosen | Process terminates between persisted publication and activating the candidate; restarted owner reconciles original attempt and re-establishes a known useful generation | Durable consumer authority + library's selected durable operation, not a mandatory database for every OSS user |

### Material implication of Node ESM and Module Federation

- **Node ESM source semantics (S):** modules resolve/cache by URL; a new query/fragment can instantiate a second module, but the ESM loader has a separate cache from CommonJS. Deleting require.cache cannot unload ESM or revoke function closures already handed to callers. Neither a cache-busting URL nor a new import namespace proves that old timers, module singletons and acquired external handles were released. [N1]
- **Webpack Module Federation (S):** shared modules join a named share scope, and an already-loaded shared version is not replaced simply because a new remote is offered. This is a **genuine available reuse mechanism**, not a reason to write another remote loader. The replacement plan must bind exact loaded share-scope facts and reject incompatible singleton/realm transitions. A fresh remote URL alone is not proof of full dependency replacement. [W1]
- **Consequent rule (H):** pin the *actual closure of executable code, shared dependencies, state contracts and execution realm* when selecting a generation. A source package version or the Get Modular composition digest alone cannot prove the runtime loader's resolved identity. Test with conflicting shared versions and at least one genuinely retained old callback.

## P1 risks: cross-client, operational and security semantics

| ID | Useful existing mechanism | Missing invariant / specific test | Owner |
| --- | --- | --- | --- |
| G10 — browser UI replacement | S: single-spa offers async bootstrap/mount/unmount/unload and optional waiting to unload; E: Piral renders useful UI | Preserve an actual draft/selection across replacement and reload; an old disposer must not remove successor; unmount/reload is not domain-state migration | Framework adapter + state owner |
| G11 — service-worker and old-client cohorts | S: new service worker normally waits for existing clients; skipWaiting can activate early | Two open tabs, one old and one new bundle; a prematurely deleted chunk or forced cache takeover must not make old session unreadable | Client deployment/cache and artifact-retention owners |
| G12 — versioned long-running work | S: Temporal Worker Versioning pins a workflow to a worker code version | Old stream/workflow keeps appropriate code while new requests use successor; a local token cannot pin a remote service without remote support | Work/executor owner; Temporal is a conditional existing backend, not a required library dependency |
| G13 — multi-host availability | S: Kubernetes RollingUpdate budgets control pod counts, not business-state migration or in-flight writes | Two hosts with mixed revisions, network partition, stale leader and conflicting publication; separate service readiness from useful behavior | Deployment and canonical authority owners |
| G14 — soft retirement | S: Erlang soft_purge refuses to remove code still held by processes while purge may terminate them | Old work persists, then cleanup either completes or reports explicit retention debt; no silent conversion to forced interruption | Execution owner; borrow the semantic distinction, not an Erlang runtime |
| G15 — desktop/native variants | S/H: Electron renderer, main/preload, native addons have different restart/physical-lifetime boundaries | Clearly label "renderer live replacement", "managed main process update", "window restart", "process restart" and "unsupported" as different guarantees | Desktop application and executor; no universal Electron hard dependency |
| G16 — library/public package independence | H: no complete library or packed adopter exists | Plain consumer imports the **packed published surface**, no private monorepo import, Agent Teams credentials, mandatory Effect, PostgreSQL or framework | Standalone library (future delivery) with independent conformance |
| G17 — retention and memory pressure | H: unlimited old generations accumulate | Long stream, unreachable offline tab, failed cleanup and pinned history each have explicit hold, time/space budget and owner action; cleanup does not silently delete live bytes | Runtime, client and history owners, coordinated by library |
| G18 — truthful telemetry | H: same progress label hides different failures | A dashboard can show committed + useful + cleanup debt without misleading success, preserve original attempt and evidence after reconnect | Library read model, product observation; no duplicate publishing authority |

### Platform-specific runtime limits from primary documentation

A pure JS updater must not advertise "reload anything" even in a cooperating desktop application:

| Target | Inspected platform contract (S) | Honest proposed support label / negative control |
| --- | --- | --- |
| Node ESM | Imports use an ESM URL/module cache distinct from require.cache; different URLs can yield different module instances | **Cooperative generation switch**, not an in-place overwrite/unload; old reference and listener survival must be tested |
| Node native .node addon | The CommonJS cache documentation warns that reloading a native addon by deleting require.cache results in an error | **No in-process native addon reload claim**; process-boundary restart/isolation is a separate capability and must be qualified |
| Electron renderer | Renderer runs as a separate web process; security requires isolation and narrowly exposed privileged APIs | **Renderer contribution switch** only if the actual renderer adapter demonstrates usable behavior and preserved owner state |
| Electron preload | Preload executes before document content and exposes IPC through contextBridge; it is not merely another application component | **Window/navigation restart or unsupported**, unless a native qualified host path proves a stronger guarantee |
| Electron main/update installer | Main owns windows/Node privileges; Electron's built-in autoUpdater quitAndInstall closes windows and restarts the application to install the update | **Explicit process restart**, not "all main-process code live-replaced". App updates and feature updates are distinct operations |

This is a *taxonomy for future profiles*, not a claim that the proposed library has any of these adapters. Do not use an Electron security feature (contextIsolation or preload sandbox) as evidence of arbitrary third-party plugin containment. [Electron process model](https://www.electronjs.org/docs/latest/tutorial/process-model), [Electron preload](https://www.electronjs.org/docs/latest/tutorial/tutorial-preload), [Electron application updater](https://www.electronjs.org/docs/latest/api/auto-updater), [Node CommonJS caching](https://nodejs.org/api/modules.html#caching).

### Why the established stacks do not remove the entire problem

| Ready stack | Credit the actual shipped feature | Boundary **not** established by that feature | Fit to a first trusted TypeScript library |
| --- | --- | --- | --- |
| **Get Modular Resources + Assembly** | Explicit composition and cooperative cleanup; native scoped resources | Public Resources does not atomically choose/admit an invocation; kernel public qualification is pending | **Strong foundation to reuse**; keep responsibility with its owner |
| **Piral** | Real UI contributions and existing setup/teardown; bridge experiment actually executed | Its declared teardown is synchronous; old route disposer and useful-readiness ordering need explicit bridges; no arbitrary server-state migration | Good **UI-specific** adapter if the product actually uses Piral |
| **single-spa** | Promise-based application lifecycle and unloadApplication with optional waiting | Unload alone neither pins a backend call nor migrates business state, nor guarantees retained old assets | Good optional UI lifecycle, not a complete general update engine |
| **Module Federation / Native Federation** | Load remote modules, reuse shared dependencies; separate Native Federation staged rollback available in prior inspected source | Loader rollback != rolled-back database/effects; already-loaded share scope may stay old; independent dependency closure needs evidence | Good loader choices; do not rebuild the loader |
| **Effect** | Native Scope/Layer acquisition, memoization and typed errors/interruptions | Repeated close outcome can differ from original flight; no consumer-specific publication authority | Good **optional native** driver, not a mandatory core dependency |
| **OSGi / OTP** | Mature bind/unbind and code-retention semantics; OTP has preparation/atomic load within its own runtime | Guarantees belong to the native runtime, not arbitrary JS and multi-host business state | Transfer tests and invariants, not an enforced dependency |
| **Temporal / Kubernetes** | Pinned workflow worker revisions / controlled deployment availability | Neither automatically replaces loaded JS closures, migrates application state or fences all external effects | Reuse **only where existing host infrastructure warrants** |
| **Node vm / Worker** | In-process contexts / parallel JavaScript workers | vm explicitly not a security boundary; Worker is not a general untrusted-code sandbox | Reject as a blanket trust/isolation solution |

The table is a **capability-fit map**, not a single numerical leaderboard: these projects solve different jobs and no common end-to-end application comparison was executed. Avoid counting uninspected vendor claims or independent-source review as native test executions.

## Consequences for Q1–Q7 without selecting product policy

| Open choice | Most economical conditional first hypothesis | What would invalidate it |
| --- | --- | --- |
| Q1 trust | A **trusted, cooperative** TypeScript module in a declared host boundary, with explicit effects | Requirement to load arbitrary third-party/untrusted code or guarantee physical kill |
| Q2 unit/sharing | One feature-local contribution, explicit dependency and realm closure | Shared mutable singleton or incompatible consumer contracts requiring cohort switch |
| Q3 state | Host-owned state reconstruction with explicit schema/version checks | Live in-memory session that cannot be safely rebuilt, or incompatible persisted schema |
| Q4 useful adoption | A successful real next request/view action after authorized switch | Requirement for coordinated all-client cutover or a visible uninterrupted session |
| Q5 old work | Retain already admitted work **where supported**, stop new old admissions, fence selected writes | Unknown/unbounded stream lifetime or unqualified remote executor versioning |
| Q6 rollback | New authorized forward transition to older compatible code; **not** an undo of effects | Incompatible current persisted state or irrevocable external side effects |
| Q7 old clients | Explicit bounded support window with pinned immutable assets | Required offline support longer than the storage/compatibility budget |

These are **research hypotheses**, not adopted defaults, Q1–Q7 decisions or a concealed implementation contract. The owner chooses the first real consumer and which promises its profile must prove. A weak profile must reject stronger requested guarantees before candidate evaluation.

## Falsification-first next campaign (proposals only; zero new executions here)

Each candidate spike has a **single question, a negative control and a positive control**, records frozen source/runtime/lock identities and stores both raw failures and successful observations. Stop after a decisive result: do not build the full updater, fake a native host or create a private parallel kernel to make a test pass.

| Priority | Next bounded test | Positive control | Negative / failure oracle | Gaps closed if actually executed |
| --- | --- | --- | --- | --- |
| **P0 / S1** | Source-built Node 24/26 ESM real-bundle identity + versioned import, common dependency/closure and retained callback | New unique candidate executes while explicit old callback remains bound to A | New URL still uses unexpected shared singleton or deleting require.cache fails to retire old ESM; report exact identities and retained effects | G01, G06 |
| **P0 / S2** | Public Get Modular admission/retention feasibility audit, ideally through a packed independent consumer; no private deep import | Atomic select+admit/custody exported and exercised | Lost version affinity between select and await; unsupported peer pin; private-only API blocks claim | G02, G07, G16 |
| **P0 / S3** | Real host-owned expected-revision store with controlled lost-ACK and two contender attempts | One authoritative head, original attempt reconciled exactly once | New attempt invented on retry; duplicate effect or cleanup of live candidate | G03, G04, G09 |
| **P1 / S4** | Browser multi-tab versioned chunks with service-worker activation and offline old tab | Old tab stays useful through supported retention window | One stale tab needs an evicted chunk; forced new service worker breaks old-version assumptions | G10, G11, G17 |
| **P1 / S5** | State owner schema transition and real edit during A/B selection | Compatible state preserved and one useful successor action | Lost edit, mislabelled rollback or silently unreadable persisted schema | G05, G10 |
| **P1 / S6** | Long stream plus request already sent to a remote receiver | Old call affinity and server-supported fence/idempotency enforce declared policy | Old write accepted after authority loss; stream lost despite reported drained status | G03, G12, G17 |
| **P2 / S7** | Physical stop of a real process/Worker (only if Q1 requires it) | Exit and resource reaping actually observed | Merely closing a logical scope is reported as physical isolation | G08, G15 |

**Go/no-go for eventual implementation (not met yet):** chosen Q1–Q7 subset and real consumer; supported public invocation/custody mechanism if promised; exact candidate-execution trust class; one canonical publication authority with same-attempt reconciliation; a specific state/compatibility contract; native physical-lifetime limits; and an independently packaged end-to-end consumer scenario. Docs and self-review alone do not qualify any of these.

## Integration and architecture decisions to preserve now

1. **Clean Architecture:** inner operation expresses decisions/receipts; outer adapters hold framework, storage, loader, renderer and network API knowledge. No import from Engineering Foundation into production runtime.
2. **SOLID:** one owner per semantic fact. An update attempt is not the business aggregate; publication authority and data owners remain with the consumer. A port exists only for a behavior actually required by the chosen profile.
3. **DDD:** feature-local replacement boundary, compatibility, state and work ownership. Avoid rewriting the Get Modular graph, declaring every file a plugin or elevating all deployment details into one universal domain model.
4. **DRY:** reuse Get Modular's published Resources and typed composition, ready loaders and native scopes; any future shared admission gap is qualified at its existing owner first. Independent test oracles **must not** reuse the algorithm under test.
5. **Framework-agnostic core:** ordinary TypeScript first; native Effect and optional Wasm/Extism/desktop adapters retain native semantics without leaking into base consumer declarations.
6. **Quality gates:** a new production-library bootstrap in this organization must follow the central full FMS v1.1, development-only Engineering Foundation and native gates. This *research-only* repository is not automatically an admitted production consumer simply because it has a public main branch.

## Publication and evidence discipline

The standalone GitHub repository was created by its owner at **main 5ba2eca9a175b3cff40fd9725b86b658aece1c47**, with the current transferred research packet. That establishes a real public repository, not full organization registration, required-check enforcement, live-update functionality or complete-system E2E. At that base the standalone's README/BOOTSTRAP still contains its historical "remote not yet created" wording; this is superseded by actual repository metadata, not by altering preserved history. CLAUDE.md was excluded from the owner's first commit by a global gitignore and is an independent navigation/publishing cleanup item; do not assume it is tracked or the original file is disposable.

No new production code, dependency pin, accepted organization policy, package release or product adoption is part of this evidence update.

## Source ledger (primary sources and exact ownership)

- **[L1: already executed]** [Piral / Resources / Effect results](https://github.com/agent-teams-ai/extension-foundation/blob/10deea1a11748df1fcbfc2766033c462fce3acd0/docs/research/live-module-update-design-validation-2026-11-23.md), [native run 45208310980](https://github.com/agent-teams-ai/extension-foundation/actions/runs/45208310980); executed commit b86e05988334f657d933fa412a02572b455dcd7e.
- **[L2: owner source]** [Get Modular public Resources](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/resources/README.md) and [private lifecycle kernel candidate](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/lifecycle-kernel/README.md), inspected on 2026-11-23; no public-kernel release claim.
- **[N1: public runtime docs]** [Node ECMAScript modules](https://nodejs.org/api/esm.html#urls) and [ESM/CommonJS cache difference](https://nodejs.org/api/esm.html#no-requirecache). Read on 2026-11-23; no independent Node cache probe was run in this update.
- **[W1: public bundler docs]** [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/), particularly share scopes and "already loaded" versions; source documentation, not the selected app's installed graph.
- **[S1: public UI docs]** [single-spa application lifecycle](https://single-spa.js.org/docs/building-applications/) and [unloadApplication](https://single-spa.js.org/docs/api/).
- **[S2: public client docs]** [Service worker update behavior](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) and [skipWaiting](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting).
- **[S3: runtime trust docs]** [Node vm safety warning](https://nodejs.org/api/vm.html) and [Worker semantics](https://nodejs.org/api/worker_threads.html); neither provides a reviewed hostile-plugin sandbox for this project.
- **[S4: mature code-retention docs]** [Erlang/OTP code soft_purge and purge](https://www.erlang.org/doc/apps/kernel/code.html).
- **[S5: hosted execution docs]** [Temporal worker versioning guidance](https://docs.temporal.io/best-practices/worker); no Temporal consumer was run here.
- **[S6: deployment docs]** [Kubernetes rolling Deployment](https://kubernetes.io/docs/tasks/run-application/update-deployment-rolling/); pod availability does not prove application/update-operation semantic safety.
- **[ORG1: binding organization policy]** [Repository admission and full FMS bootstrap](https://github.com/agent-teams-ai/.github/blob/0b44c64c824f536bd1b085341e7669bcc64ef124/docs/repository-admission.md); new repository still needs classification/admission evidence.
