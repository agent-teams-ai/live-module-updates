# Reusable live module updates: architecture and cross-repository contract review

Date: 2026-11-23. Status: **design proposal and source review; no production API, policy adoption, repository admission, package release or native execution is claimed**. Working project name supplied by the coordinating lane: `live-module-updates`.

> Later direction: the [continuous evolution vision](continuous-evolution-vision-2026-11-23.md)
> records the greenfield scope and a concrete GM-first reference dependency
> recommendation. The existing separate ownership and admission constraints
> remain authoritative. The earlier narrow first profile does not limit the
> long-term system-wide coverage target.

## 1. Recommendation and the unresolved delivery dependency

Build one reusable operation over supported existing mechanisms: inspect and plan an update, prepare a candidate, request authoritative publication, reconcile an uncertain outcome, coordinate old work and cleanup, and report what became useful. The consumer supplies its authorization, canonical state and publication primitives; it must not implement the operation again. This is the already confirmed direction, not a new policy decision. [EF1], [EF2]

The main unresolved implementation dependency is precise: **public Resources provides cooperative cleanup; it does not provide atomic invocation admission, generation custody or stream joining. The existing Get Modular lifecycle kernel provides a candidate bookkeeping mechanism but its current package is private.** A standalone library cannot silently copy that kernel, depend on a private import, or move the missing algorithm into every consumer. Qualification of a supported mechanism must precede a public profile claiming these guarantees. The owning repository can qualify the existing kernel; a genuinely existing host mechanism can also implement a bounded profile through a shipped bridge. An extraction or semantic change requires its own authority, not a rename in this project. [GM4], [GM5], [GM6], [GM7]

This does not require every passive module or every execution profile to use that kernel. A stateless or deliberately disruptive profile may need fewer capabilities, but its claims must be correspondingly narrower. No production default among those profiles is chosen here.

A portable OSS library should work without Agent Teams credentials, catalog schemas, PostgreSQL, native Effect, or an imposed application framework. Portability means explicit supported profiles and ordinary published JavaScript/declarations; it does not promise arbitrary languages, module formats and deployments through one universal interface. [ORG1]

## 2. Source authority and availability

### Inspected revisions

| Repository | Exact inspected revision | Meaning |
| --- | --- | --- |
| Extension Foundation | `f285333c5869b1f69070efee29b205da8fd19e49` | Current owner-confirmed direction, accepted boundaries and research navigation; local checkout inspected read-only |
| Get Modular | `850bac5fd02fa5697846cc8958ac447d5c2ee7bb` | Fresh default-branch source observation on November 23; does not upgrade any accepted consumer pin |
| Organization `.github` | `0b44c64c824f536bd1b085341e7669bcc64ef124` | Engineering Quality Standard, repository admission and immutable FMS v1.1 |
| Engineering Foundation | `e38d8444f74cceef37c366f4e28ed1918b214d4a` | Fresh source observation; published package qualification and repository adoption remain separate |

The machine-readable companion preserves source paths and Git blob identities where retrieved. A source manifest version is not registry availability; a release is not an installed-and-qualified consumer. No package was installed or executed in this lane.

| Existing mechanism | Observed public surface / status | Limit relevant to this project |
| --- | --- | --- |
| GM Core and Assembly | Source manifests `0.8.0`; public root-only construction and composition APIs | Core compiles inert declarations. Assembly constructs already authorized factories; neither supplies update authorization, readiness, disposal or recovery. |
| GM Resources | Source manifest `0.2.2`; accepted public cleanup package | Trusted cooperative cleanup, two capability facets, one close flight, explicit debts. A complete report means callbacks returned, not physical stop. |
| GM Effect | Source manifest `0.1.1`; optional public profile | Preserve native requirements, error and scope semantics; do not force a Promise-shaped approximation into the neutral profile. Exact released peer cohort needs its own qualification. |
| GM lifecycle kernel | Source manifest `0.1.0`, `private: true` | Candidate synchronous generation/call/custody bookkeeping. Its current source is not a supported external dependency. |
| Engineering Foundation and FMS tooling | Development-only source APIs and explicit profiles | Never enter product runtime imports or public declaration closure. Source support, released package and a new repository's required gates are distinct evidence. |

Manifest versions and package visibility are pinned separately: [GMP1], [GMP2], [GMP3], [GMP4], [GMP5]. The READMEs and accepted decisions define their actual scope; Foundation remains development-only. [GM2], [GM3], [GM4], [GM5], [FND1], [FND2], [FND3]

### A supersession that matters

GM ADR-0030 supersedes ADR-0028 in full: the conditional ownership package, K1, the S3 → G1 → K1 order, the two-production-scope eligibility gate and A1 were withdrawn. ADR-0029 retains its own surviving delivery, public qualification and product adoption requirements. Do not revive withdrawn eligibility gates by quoting an older paragraph; also do not infer public release from their withdrawal. The current private manifest is decisive for this design's external dependency status. [GM6], [GM7]

A search of the current EF map, standalone blueprint and OD-003 found no sentence asserting the withdrawn gate as current. The blueprint's combined row “Resources/lifecycle” can be clarified by separating cleanup from call/custody bookkeeping. Its explicit private-kernel paragraph is already correct. Historical reports and sealed evidence should retain their observed bytes.

## 3. Responsibility map: one owner for each truth

| Owner | Owns | The new library may do | Must not duplicate |
| --- | --- | --- | --- |
| Product contract owner | Business capability meaning, state schema and migration meaning | Ask for compatibility and invoke an authorized migration | A generic application schema or universal state serializer |
| Product authority | Grants, revocation, desired revision, selected head, write fencing, recovery policy | Run the complete operation through narrow atomic commit/read and authorization primitives | Another independently advancing head or authorization database |
| Get Modular | Neutral declaration, bindings, graph validation, immutable plan and construction | Adapt the existing result and construct selected entries | Another graph compiler, binding resolver or registration-order rule |
| Resource/execution owner | Actual resource handles, scopes, native lifetime, physical stop observations | Request close/stop, retain the real in-flight operation, project debts and remaining holds | A second cleanup stack, fabricated stop receipt or independent refcount cache |
| New live-update library | Reusable attempt coordination, publication reconciliation, continuity coordination and observed results | Own the technical use cases and their attempt records | Business policy or a global service locator |
| Extension Foundation | Artifact/trust/distribution identities and admitted host protocol obligations | Optional mapping and admission adapter for EF profiles | A competing artifact catalog or universal plugin SPI |
| Delivery/framework owner | Artifact delivery, module resolution, mount/unmount/HMR primitives | Use their supported APIs and expose their actual constraints | Another loader, bundler, UI reconciler or deployment platform |
| Engineering Foundation / FMS | Development-time enforcement mechanisms and architectural rules | Reuse explicit profiles, source checks, packed API checks and documentation tooling | Runtime dependencies or a second local policy authority |

A library-owned **attempt record** is legitimate technical process state: it records what this operation requested and observed. It must reference the canonical publication outcome and existing lifetime identities. It is not a second active-generation registry. An observation cache is a projection and cannot authorize writes or disposal. [EF3], [EF4], [EF5], [GM2], [GM3], [GM4], [GM5], [GM6], [GM7]

## 4. Start with one real module and owned features

The first production delivery should be a small number of real capability slices inside one distributable library module, with one supported adapter and an external consumer. Package count is a consequence of dependency and release boundaries, not a diagram target.

| Proposed ownership | Initial content | Extraction trigger |
| --- | --- | --- |
| Update operation feature | Planning coordination, attempt identity, candidate ownership, apply/reconcile, retirement coordination and result queries | Remains cohesive while these behaviors implement one transition contract |
| Planning sub-feature, if it becomes substantive | Validation of the selected profile, mapping existing composition facts, compatibility evidence and explainable effects | A real independently used planner or separate ownership; no new graph semantics |
| Observation surface of the operation | Read-only status, reasoned progress, debt and useful-adoption facts | A distinct reusable observer capability or integration lifecycle, not merely event formatting |
| Execution/state/view adapters | Provider mapping behind feature-owned ports | Native dependency, distinct supported platform, independent release or demonstrated external provider contract |
| Conformance fixtures | Black-box operation cases, adapter capability claims and independent external consumer | Separately published testing surface only when actually useful and appropriately admitted |

This is a proposed ownership map, not permission to scaffold empty feature folders. First implementation may keep planning and observation within the operation feature. Do not create one feature per verb, one package per port, a top-level `core/shared/utils`, or a plugin registry to configure the library itself. [ORG2]

The organization requires new production repositories to adopt the full immutable FMS v1.1 in their first reviewed bootstrap, including actual features and native enforcement. A research transfer directory or private package envelope does not satisfy that admission. Existing EF's FMS pin is unchanged. [ORG2], [ORG3]

### Dependency direction

- Inner application use cases own the ports and semantic input/output models. Provider SDKs, Node/DOM globals, Effect types, Get Modular registration types and transport schemas stay outside.
- Concrete adapters implement those ports; the application composition root selects them. The root wires behavior rather than becoming the update algorithm.
- Public transport contracts and internal application models are distinct where serialization, compatibility, authorization or privacy differs. Do not import transport DTOs into inner application code to save a mapper.
- An optional external adapter gets only its narrow supported provider surface. A broad SPI barrel or public package is not justified by one internal implementation.
- A Get Modular adoption follows the consumer's exact accepted CMS scope. CMS places GM declarations and package imports in outer composition; adapters receive values or consumer-owned ports. That stricter rule must be reflected by the integration layout, not bypassed by importing GM throughout application code.
- Production declarations must not expose optional provider dependencies merely because TypeScript erased the implementation imports. Qualify both runtime and declaration dependency closure.

These directions follow the existing FMS/CMS contracts. The proposed feature arrangement does not alter them. [ORG2], [GM3]

## 5. Keep identities and compatibility dimensions separate

| Identity / fact | Question it answers | Incorrect substitution |
| --- | --- | --- |
| Capability ID and revision | Which contract must caller and provider satisfy? | Package SemVer or JavaScript structural similarity |
| Composition plan identity | Which exact providers and bindings were compiled? | Artifact digest or current active head |
| Artifact/import closure identity | Which executable bytes and lazy assets can be loaded? | A mutable URL, package label or entry-file digest alone |
| Runtime generation / exact instance | Which constructed execution cohort owns these handles? | Stable plugin ID or artifact version |
| Update attempt identity | Which request may be reconciled or retried? | A newly generated ID after a timeout |
| Authority head revision | Which publication may replace the current selection? | Local completion order or greatest candidate version |
| State baseline / schema | Which state may this candidate interpret and update? | Successful module evaluation |
| Realm/shared-contract identity | Which runtime objects, shared singletons and ABI values are actually compatible? | Equal type names, equal text descriptors or a fresh loader instance |
| Client/session adoption evidence | Which users or sessions obtained useful behavior? | Published manifest, downloaded bytes or selected head |

The plan must bind the relevant facts and identify which observations become stale. New grants, revoked artifacts, an intervening head, changed state baseline or a changed dependency cohort can invalidate a previously acceptable plan. The library should explain the invalidation and produce a new plan under current authority; it should not silently reuse old evidence.

The update closure is not automatically a package, a source file, a feature folder or a GM static group. It combines declared dependency semantics with consumer contract/state constraints and execution sharing facts. The library may request a closure from the existing composition owner and add profile-specific constraints; it should not maintain a shadow import graph with divergent binding semantics. [EF4], [GM2], [GM3]

### Colocated update-eligibility dossier

For each **eligible boundary**, propose an inert dossier next to the owning module/feature declaration, following ADR-0014's colocation principle. This is product-owned evidence and configuration, not a new generic Plugin SPI or an automatic schema extension to Get Modular. Executable loaders remain target-local and separate from inert declarations. [EF4]

| Dossier fact | Semantic owner / purpose |
| --- | --- |
| Owning feature, contract and supported implementation | Identifies who may change meaning; feature path, package identity and capability revision remain distinct |
| Supported execution/loader profile and exact artifact closure | States what can actually be loaded and observed; includes shared-realm/contract assumptions |
| Eligible replacement boundary and dependency constraints | Explains affected contributions and unavailable combinations without a second binding compiler |
| Preparation, readiness and useful-adoption observations | Defines what successful construction, safe publication and meaningful user benefit each require |
| State subjects and baseline/compatibility rules | Names durable state, drafts, editor history or session data; points to owner-held migration primitives |
| Admitted work, continuation and resource obligations | States the required affinity/drain/stop guarantee and its real mechanism; does not duplicate runtime handle ownership |
| Cleanup and retention observations | References exact-instance cleanup debt, history, artifact and old-client holds |
| Fallback and disallowed transitions | Identifies controlled remount, restart or rejection where live replacement is not qualified; does not silently select a product policy |
| Evidence and review trigger | Pins the actual profile, contract/adapter versions and rejecting cases; changes invalidate affected claims |

Do not add a universal hot flag to every module. The same application can contain live-replaceable contributions, controlled-restart boundaries and ordinary fixed dependencies. Broad use across all the owner's projects means a consistent way to express and validate those boundaries, with honest fallbacks. It does not make an arbitrary closure, database migration or shared object replaceable. The first dossier should describe a real selected consumer; generalize only the facts that independent uses actually share. Reference the authoritative declaration, artifact and state contract rather than copying their schemas into another manifest. A surrounding attempt scope cannot capture arbitrary unregistered top-level side effects; cooperative TS eligibility requires owned effects, while isolation remains a separate execution/trust choice.

## 6. Complete operation and semantic ports

The names below describe responsibilities, **not a selected public API**. Ports should be split only where a capability is genuinely independent. A mandatory interface with twenty no-op methods is a failed profile design.

| Operation / port responsibility | Required semantic content | Distinct outcome or limit |
| --- | --- | --- |
| Inspect and plan | Explicit target, expected predecessor, existing composition result, grants, compatibility facts, state and sharing constraints | Applicable plan, unsupported guarantee, invalid input or stale basis; inspection must not execute candidate code |
| Prepare a candidate | A strong attempt owner before evaluation; exact loader/closure; held acquisition custody; constructed roots and readiness evidence | Prepared candidate or preparation failure plus still-owned work and debts; construction success alone is insufficient |
| Authorize and publish | Consumer authorization, expected-revision mutation, exact attempt/candidate identity and receiver-side fencing where required | Committed, conflict/rejected, or unknown; a timeout is not rejection |
| Reconcile publication | Authoritative lookup of the original attempt and the evidence needed by the selected recovery profile | Known committed, known not committed, or unresolved; never destroy a possibly active candidate on guessed failure |
| Admit and retain work | Atomic selection/admission/custody boundary supplied by the qualified mechanism; immutable cohort affinity across awaits | Rejected admission or a real retained operation; reading a head and later retaining it is insufficient |
| Coordinate state handoff | Owner-selected schema/migration, state baseline, conflict behavior and commit relationship | Compatible, conflict, failed, or unknown application; no assertion that code rollback reverses state or external writes |
| Request quiesce / retire | Existing invocation and lifetime owner; explicit admission and effect-authority consequences | Closed new admission, retired effect authority and outstanding custody are separate facts |
| Request cleanup / stop | Actual resource or executor owner, retained original close flight and scope-specific observations | Cooperative completion, debt, physical stop, interrupted waiting and unsupported termination are distinct |
| Observe useful adoption | Product/UI acknowledgement of meaningful functioning, with instance/attempt identity | Publication can succeed before visible usefulness; some profiles need a restart or user action |
| Evaluate retention | Existing state/history/artifact/session owners supply holds and policy facts | Deletion eligibility is a conjunction of relevant holds, not a generation counter alone |

### Proposed internal coordination sequence

1. Validate the requested guarantee and existing authority/profile facts; obtain an explainable plan without importing executable candidates.
2. Establish attempt ownership before imports, factory acquisition or asynchronous work can escape.
3. Construct using the selected mechanism; retain resources and continuations with their real owner; collect declared readiness and state-compatibility results.
4. Revalidate mutable authority and state facts at the actual publication/effect boundary. Execute no candidate callback inside a consumer database transaction.
5. Request publication through the owner's primitive. An uncertain outcome enters reconciliation of the same attempt, not a new blind update.
6. Apply the selected continuity contract to visible contributions and admitted work. Record selected, useful and degraded observations independently.
7. Request the allowed quiesce/retirement/cleanup steps; retain evidence until the relevant work and resources are actually released. Failure to clean the predecessor must not erase successful successor publication.
8. Return/query a structured result containing both publication/adoption and cleanup/recovery facts. A single boolean cannot represent the meaningful outcomes.

This is a responsibility sequence, not an adopted total ordering for every profile. State migration, exclusive resources, client coordination and distributed publication can require different preparation points. The library must ship the supported operation variant; the consumer supplies policy values and primitives rather than recoding this sequence.

## 7. Failure model and recovery invariants

**Before publication:** a candidate that fails preparation stays owned until late acquisitions and cleanup are observed. The library cannot release an attempt just because an observer abandoned waiting. Existing useful code remains selected where the actual loader/framework supports non-destructive preparation; a destructive framework path must declare a disruptive profile rather than promise this invariant.

**At publication:** cancellation cannot erase an external outcome. An operation must retain the original attempt identity, ask the authoritative owner, and preserve a possibly active candidate. Compare-and-swap rejects an obsolete expected head; it is not a transaction across databases, views and receivers. Use the admitted profile's receiver-side authority rather than pretending a local pointer update fences remote effects. [EF3]

**After publication:** failed view adoption or predecessor cleanup creates a qualified degraded result. The host may keep the candidate, compensate, retry cleanup or request a fresh authorized transition under its chosen policy. None is selected here. Returning old bytes is a new generation with current grants and state compatibility, not a rewind.

**On process restart:** a profile claiming recovery must retain enough durable attempt, candidate, publication and resource ownership facts to reconcile. An in-memory profile must explicitly say it cannot resume an operation after host loss. The consumer may supply storage and canonical facts; it must not reconstruct the library's recovery state machine in business code. One bounded persisted schema/recovery policy is materially different from a generic durable workflow platform.

**At cleanup:** retries can repeat partially completed callbacks. Native ownership determines safe retries and actual release. A close callback that returned, an idempotent second close, an abandoned wait and a terminated process are different observations. In particular, optional Effect integration must preserve the real original finalization result; an idempotent API is not automatically a joinable cleanup receipt. The freshly inspected Effect source documents that a second close may return while earlier finalizers run. This is source evidence, not a new executed profile. [EFFECT2]

### Adverse-case result contract

The rows define what a supported profile must distinguish. They do not select product recovery policy or freeze result field names.

| Adverse case | Owner retains / observes | Library result must preserve | Incorrect shortcut |
| --- | --- | --- | --- |
| Plan becomes stale before apply | Canonical head, grants, state baseline | Rejection or replan reason before unsupported effects | Applying an older permission/state snapshot |
| Candidate import or setup fails | Exact attempt, partially constructed resources, late acquisition | Preparation failed plus owned pending work/debt | Deleting the attempt on the first rejected Promise |
| Caller cancels while preparation continues | Actual construction/custody owner | Caller stopped waiting versus construction settled | Treating abort as released resource evidence |
| Publication response is lost | Canonical attempt lookup and receiver authority | Explicit unknown outcome, same-attempt reconciliation | Starting a new update or cleaning the candidate as failed |
| Two updates race | Canonical expected-revision owner | Observed publication outcome and a conflict or unresolved peer | Local last-completed-wins selection |
| Old call produces a delayed write | Exact generation affinity and receiver-owned permission | Completion or rejection under the admitted policy | Checking permission only at initial dispatch |
| Returned stream remains active | Continuation and actual retained dependency cohort | A remaining hold after the initial function returned | Releasing resources when the outer Promise resolves |
| Successor selected but a view is stale | Product/view contribution owner | Selected generation and useful-adoption gap separately | Reporting manifest version as universal UI success |
| Predecessor finalizer runs late | Exact registration owner | Successor remains selected; old cleanup cannot delete it | Clearing registry by stable plugin ID alone |
| Cleanup fails or second close returns early | Original native close flight and debt | Known callback result, pending finalization or physical stop fact | Equating idempotent close with joined cleanup |
| State migration conflicts or partly applies | State owner and admitted transaction/reconciliation primitive | Conflict/unknown outcome and recovery constraints | Pretending old code restores prior state |
| Old client requests a lazy asset | Artifact/client retention owner | Retained availability or unsupported-client outcome | Garbage collection from local instance count alone |
| Host restarts | Selected profile's durable attempt/custody facts | Reconcile only where supported; otherwise an explicit limit | Asking business code to recreate recovery orchestration |

## 8. Profile matrix: orthogonal choices, qualified combinations

| Dimension | Candidate mechanisms | Required boundary |
| --- | --- | --- |
| Composition | Fixed typed factories; optional GM Core/Assembly | Ordinary fixed libraries do not need runtime graph nodes. A GM consumer keeps one composition authority. |
| Code delivery / loader | Native ESM/build output; Module Federation; SystemJS/import maps; Native Federation | Resolution and evaluation semantics, module/shared caches, immutable closure and rollback limitations must be explicit. |
| Frontend contributions | Existing React/framework lifecycle; Piral; single-spa; OpenComponents where fitting | Actual contribution readiness, registration ownership, mount/unmount and state identity; no universal UI atomically-updated flag. |
| Ordinary TS resource lifetime | Public GM Resources, with a separately qualified admission/custody mechanism where needed | Trusted cooperative cleanup; no lease or physical termination inference. |
| Native Effect | Native Scope/Layer and fitting GM Effect integration | Native environment/error/interruption and memoization ownership; optional dependency and separately qualified cohort. |
| Isolated JS | Worker or process through an existing platform/task/RPC mechanism | Explicit protocol, backpressure, continuation ownership, physical stop observations and trust scope. |
| Wasm | Extism; Component Model tools such as jco/Wasmtime | Different ABI/tooling families; retain actual instance lifetime, host-call authority, conversion limits and runtime-specific guarantees. |
| State and history | Consumer state store and migrations; existing editor/CRDT where already needed | Canonical ownership, exact state baseline and retained history; no mandatory CRDT or generic heap migration. |
| Delivery/admission | Existing consumer release path; optional EF artifact/trust adapter | Artifact closure, grants and retention; OCI/catalog requirements apply to their admitted EF profile, not every OSS consumer. |
| Durable operation hosting | Existing authoritative store; a workflow engine only when the deployment needs one | Durable reconciliation semantics without mandatory database/Temporal/Restate/Golem infrastructure. |

Qualify named combinations of these dimensions. Independent adapter capability flags do not establish that their arbitrary combination satisfies a shared-state or continuity guarantee. These are not eleven packages to build. Module Federation and Native Federation are loader/composition delivery technologies; Piral and single-spa add application lifecycle; OpenComponents addresses a different component delivery/rendering model. They are not interchangeable execution engines behind `load/unload`, and none is automatically a secure realm. The detailed industry lane retains their source pins and bounded evidence.

Native Effect's existing layer memoization can be reused where the selected profile permits sharing. Equal source version does not prove equal layer object identity, and native sharing does not decide the product's update cohort. No new cache/refcount mechanism should be created to imitate it. The inspected forkMemoMap/buildWithMemoMap and layer-object-keyed implementation are at Effect commit e3aca1f1484e623cee09b7f3fa18d6ff5d66c0e8. This does not upgrade GM’s accepted Effect peer or qualify a new consumer. [EFFECT1]

### Native Effect architecture without a second policy engine

The existing standalone blueprint proposes shared decisions/receipt semantics with a native driver, not a mandatory Effect core hidden behind a Promise facade. Preserve that boundary: ordinary TS has its ordinary execution path; an optional native profile keeps native requirements, errors, interruption and scopes in its own driver and entrypoint. Shared technical transition rules and outcome interpretation must have one owner. Two drivers cannot independently decide what publication, reconciliation or cleanup completion means. [EF7]

The actual interpreter shape is deferred until a real native consumer requires it. A reusable pure decision function and explicit receipts may be sufficient; an abstract higher-kinded effect algebra is not justified merely by anticipating another runtime. Conversely, wrapping native execution in a Promise and claiming equivalent cancellation/error/lifetime guarantees would fail the profile. Reuse native mechanism adapters and the existing decision model; qualify the preserved semantics with an independent failure case before exposing the profile.

## 9. UI usefulness, old versions and state are first-class boundaries

The library should provide enough facts for a product to show the target, current useful generation, update stage, impacted contributions, blocked state migration, retained old work and cleanup debt. A projection can present “candidate selected; two views still on the previous generation” without claiming failure or full adoption.

A meaningful first UI contract must identify which state is retained: durable document, unsaved draft, selection/caret, undo history, focus, subscriptions, background operation or framework component state. It must distinguish preserved value from preserved object identity. A view may continue to hold an old service or callback after the loader reports the new version. The UI adapter and contract owner must either preserve that supported affinity or require a defined replacement boundary.

Reference replacement also has a simple but consequential ownership rule: a predecessor's finalizer may clear a selected reference only if it still owns that exact reference. Late cleanup must not remove the successor's registration. This applies to command registries, DOM/event contributions and framework slots, not only service handles. Such a check protects a reference; it does not establish atomic replacement of a whole cohort.

Old-version retention has at least five distinct subjects: executable runtime instances, in-flight operations/streams, persistent state/history, immutable artifacts/lazy assets, and old/offline clients. Their owners and eligibility criteria differ. A reference count reaching zero for the local runtime proves nothing about an old client fetching a lazy chunk tomorrow. Bounded budgets and supported client windows need explicit product choices, not an unbounded library cache.

## 10. Concrete cross-repository proposals

All rows are proposed deltas. No accepted ADR, current pin, external repository or production code was modified in this review.

| Owner / repository | Proposed delta | Why / condition | What should stay unchanged |
| --- | --- | --- | --- |
| New standalone library | Record ownership, first supported profile, complete-operation guarantee and capability limits; implement one real feature with an external consumer | Makes the design independently reviewable and installable | Q1–Q7 remain open until explicitly resolved; working name is not admission/publication |
| Get Modular | Qualify a supported public invocation/custody mechanism for the concrete TS profile, if that profile requires it | Existing private kernel is the first reuse candidate; compare actual invariants and packed-root consumer evidence | Do not copy/rename kernel, reopen passive scopes or assign physical cleanup to it |
| Get Modular | Clarify current navigation around ADR-0030 supersession and the separate Resources/kernel roles where genuinely ambiguous | Reduces misreading of historical references | Preserve accepted predecessor bytes and frozen evidence; withdrawal is not release |
| Get Modular | Verify the public plan/declaration data suffices for the standalone library's update planner, as a consumer of Get Modular, and declared continuation affinity | A missing public fact belongs to the existing semantic owner | No new generic update-cohort metadata, graph engine or native dependency without demonstrated need |
| Get Modular / integration docs | Provide one real recipe combining immutable plan, public Resources and supported lifetime mechanism | Makes the safe path reusable and keeps GM imports in accepted outer composition | Recipe is not a production host policy or universal plugin SPI |
| Extension Foundation | Add a dated navigation record linking the standalone design and qualified adapter scope; split the ambiguous Resources/lifecycle reuse-table row | Current ownership map is already substantially correct | Neutral cores stay independent; artifact rules, host obligations and stable-SPI gates remain their existing scope |
| Engineering Foundation | Reuse released source/declaration/dev-only/configuration checks and FMS runner; add a capability only if an actual uncovered invariant is portable | Avoids another import parser, API checker, scaffold generator or docs protocol | Development-only; no live-update runtime engine or product policy in tooling |
| Organization `.github` | After actual repository admission, add a concise catalog/ownership route and exact supported adoption instructions | Discoverability and consistent bootstrap | Do not make GM/live updates mandatory for all repositories or edit immutable FMS v1/v1.1 |
| Consumer product | Record accepted scope, adapter/profile pins, canonical authority/state primitives, meaningful UI contract and actual readiness criteria | Closes deployment-specific truth while retaining reusable orchestration | Business code does not implement update/reconcile/cleanup state machines anew |

FMS already supports ordinary fixed dependencies, consumer-owned ports, dynamic validated composition, feature ownership and extraction by demonstrated need. This architecture does not currently justify a successor standard. A reusable adapter or typed factory is a feature until release/dependency/lifecycle evidence warrants a module. [ORG2]

### New-repository bootstrap is a separate qualification claim

The current central repository-admission policy requires full FMS v1.1, explicit repository-owned profiles, strict source coverage, real positive/negative fixtures, complete native gates, exact callers and separately observed enforcement. A configuration check returns `configured_not_qualified`; a private package envelope, installed package or successful research probe is not admission. [ORG3]

Three cohorts must remain separate: the source revision inspected here; a published development package release; and a centrally eligible, actually executed documentation/quality cohort. The coordinating lane observed newer release metadata (Foundation 3.1.0, FMS 0.3.2 and Stack Toolchain 0.2.0), while the current central recommended Docs cohort retains older exact roots. Those observations do not authorize either an automatic upgrade or a blind downgrade. The retained central admission text also names a specifically reviewed Stack Toolchain 0.1.1 path; a newer release needs its actual recognition/qualification checked. Exact package pins and receipts belong to the bootstrap lane, not an inferred decision in this design.

A useful Foundation follow-up, **if an actual gap is demonstrated**, is an optional development profile validating the dossier's owned data/contract links, evidence references and adapter qualification claims. Reuse existing executable-specification, source-graph, dev-only, public-declaration and profile mechanisms first. It must not create a runtime supervisor, infer business eligibility, or certify every module as hot-replaceable. Foundation's scaffold recipe creates an envelope; the same production bootstrap must contain the real owned feature and its actual gate.

### Patterns, owners and rejecting examples

The prior blueprint is the detailed comparison authority; this table maps patterns to this proposal rather than selecting another framework. [EF7]

| Pattern or candidate | Actual owner / use | Rejecting example |
| --- | --- | --- |
| Explicit technical transition decisions, written as typed functions or through a fitting existing state-machine tool such as XState | The live-update operation owns attempt decisions; runtime drivers reuse those decisions and receipt semantics. The implementation choice is open. | One driver maps unknown publication to failure while another maps it to success; a generic workflow DSL duplicates the existing generation kernel. |
| Ports and adapters | The operation feature owns narrow semantic ports; composition selects real implementations. | A service locator, provider SDK in inner application code, leaked optional public declaration type, or no-op method pretending to satisfy a guarantee. |
| Expected-head compare-and-swap plus same-attempt reconciliation | Product authority owns atomic publication and authoritative lookup; the library drives the full use case. | Local last-finished-wins head, new retry identity after lost acknowledgement, or destructive cleanup before the outcome is known. |
| Exact-instance custody and native scopes | Supported generation/lifetime mechanism owns admission/holds; Resources or native runtime owns handles and finalization. | Releasing after caller timeout, treating a returned stream as finished, copying a counter, or old cleanup clearing a successor registration. |
| Read-only projection / read model | Library and product presentation derive correlated facts from actual owners. | Cached status authorizes a write, a manifest label proves UI adoption, or a complete cleanup callback proves physical stop. |
| Anti-corruption mapping at a real boundary | EF adapter maps artifact/admission facts; GM adapter maps composition facts; the consumer retains business meaning. | Treating an artifact digest as plan identity, reusing transport DTOs as domain state, or a broad universal plugin descriptor absorbing both owners. |
| Existing durable process host, only for an admitted deployment | Native workflow/storage owner supplies durable mechanics; the library keeps its supported transition/reconciliation semantics. | Mandatory durable infrastructure for an in-memory UI profile, or consumer business code rebuilding missing recovery. |

## 11. Qualification plan and falsifiers

No new test was executed in this architecture lane. The list is a bounded plan for the first real supported profile, not evidence of readiness.

| Boundary | Useful discriminator | What would falsify the design claim |
| --- | --- | --- |
| Public dependency availability | Packed standalone consumer imports only supported roots, with real dependency/declaration inspection | A deep import, copied private kernel or provider SDK leaking through the ordinary declaration entrypoint |
| Whole-plan rejection | Invalid binding/compatibility/loader selection fails before candidate evaluation | Any candidate side effect before complete inert validation |
| Select/admit/retain | Interleave selection change, async acquisition and delayed continuation | A call admitted without retaining the exact selected cohort, or a released generation still able to begin work |
| Candidate failure | Real framework prepares successor, then setup fails after resource acquisition | Predecessor destroyed despite a promised non-destructive preparation guarantee, or orphaned candidate resource |
| Unknown publication | Commit occurs but response is lost; reconcile original attempt | Cleanup of the possibly active candidate, blind replay of a side effect or a new attempt mistaken for the original |
| Resource result | Cleanup fails or waiting is abandoned while work remains | Success inferred from timeout/second close or loss of the original close flight |
| View and state | Useful UI change while draft/undo/selection and old callback identity are observed | New version label with stale behavior, accidental state loss, or predecessor cleanup deleting successor registration |
| Shared identity | Actual loader/shared-dependency cohort; same names with incompatible runtime identity | Treating a fresh loader instance or equal version text as fresh/compatible realm |
| Durable recovery, if claimed | Restart at retained attempt/publication boundaries | Recovery delegated to consumer business workflow or loss of ownership facts |
| Ordinary external usability | One real consumer plus an independently authored disposable consumer | Required organization catalog/credentials, duplicate orchestration, excessive registration or hidden framework dependency |

A passing probe qualifies only its named mechanism and fixture. The retained research's MF/SystemJS/Resources/PG/editor results remain their original scoped evidence. A forthcoming Piral or Effect probe is pending until its own receipt; this report does not assume it passed. Comparative end-to-end validation against a ready stack remains a separate unexecuted benchmark unless a later receipt states otherwise.

## 12. Seven owner choices remain open

The existing Q1–Q7 remain the owner discussion surface. Do not add a generic list of twenty configuration decisions or resolve these through a sample default. [EF2]

| Choice | Architecture that can be designed now | Before which claim an answer is needed |
| --- | --- | --- |
| Q1 trust boundary | Separate cooperative TS from actual isolation/host authority; explicit profile capability | First production execution profile |
| Q2 shared dependencies / update unit | Preserve graph, contract, realm and cohort identities; explain closure and unsupported combinations | First supported replacement guarantee |
| Q3 state continuity | Owner-schema/baseline/migration port and explicit unsupported transitions | First stateful vertical slice |
| Q4 visible adoption | Separate selected and useful observations; existing view lifecycle integration | User-facing product promise; synthetic diagnostic UI can stay bounded |
| Q5 admitted work | Exact invocation/custody and continuation boundary, explicit interruption outcomes | First calls/streams/session continuity promise |
| Q6 return-to-old semantics | Fresh authorized transition, current state/grant checks and retained artifact evidence | Public rollback promise |
| Q7 old clients | Separate local lifetime from artifact/client retention | First offline/multi-client support window and deletion policy |

The owner can authorize a narrow experimental fixture without choosing the production policy. A stable public contract must describe its supported combinations and rejecting behavior. The aim is to reduce later structural changes; zero refactoring cannot be promised before real consumers exercise the seams.

## 13. Scope, size and maintenance risk

The existing research estimated authored nonempty, non-comment production TypeScript/TSX, excluding dependencies, generated code and tests: focused complete-operation MVP **3,000–6,000 SLOC**, stable bounded TS scope **7,000–14,000**, broader selected-runtime product **15,000–30,000**. Tests/fixtures/E2E and consumer integration were counted separately. These are conditional research estimates, not measured implementation or accepted scope. [EF6]

This review does not justify raising those ranges merely because the architecture diagram has more rows. It sharpens three exclusions: a first stable scope should not quietly become a generic durable workflow engine; supporting one UI/host profile does not qualify a cross-product matrix; public lifetime qualification is real work even when the kernel already exists. Library adapters and conformance integration count as maintained code, while upstream loader/resource/framework implementations do not.

The largest multipliers are incompatible state migrations, process-crash recovery, mixed shared realms, long-lived streams, offline clients, untrusted plugins, multi-host publication and platform-specific stop semantics. If required together, re-estimate that explicit scenario instead of stretching the word “stable.” Conversely, a fitting ready stack that already meets the actual application contract may eliminate much of the proposed library's value. The benchmark should measure consumer coordination and failure behavior, not only reload latency.

## 14. Final review questions for the first implementation

1. Can an ordinary consumer perform and inspect an update with the shipped operation and adapters, supplying only authority/state/policy primitives?
2. Can we name the sole owner of each head, generation, retained operation, resource and durable state fact?
3. Does every public guarantee map to a real mechanism and a rejecting example, including what happens after timeout or host loss?
4. Can a native Effect, isolated execution or framework adapter be added without importing its types into the ordinary public surface or changing business contracts?
5. Does the selected profile reject an unsupported guarantee before execution rather than satisfy an interface with no-op methods?
6. Are state preservation, visible usefulness and artifact retention independently observable?
7. Can we remove the adapter without leaving a copied kernel, hidden registry or second authority behind?

These are architecture fitness questions and review gates, not a claim that the current design or research packets already satisfy them.

## Source index

[EF1]: https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/architecture/live-extension-system-map.md
[EF2]: https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/open-decisions/OD-003-module-runtime-and-public-spi-choices.md
[EF3]: https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/decisions/0011-extension-admission-custody-and-retirement-closure.md
[EF4]: https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/decisions/0014-product-local-module-authoring-composition-and-generation-guardrails.md
[EF5]: https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/decisions/0015-authorize-get-modular-semantic-extraction.md
[EF6]: https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/research/live-update-value-competition-and-implementation-size-2026-11-22.md
[GM1]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/README.md
[GM2]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/docs/architecture/system-boundary.md
[GM3]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/docs/architecture/common-assembly.md
[GM4]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/resources/README.md
[GM5]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/lifecycle-kernel/README.md
[GM6]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/docs/decisions/0029-admit-an-optional-lifecycle-kernel-candidate.md
[GM7]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/docs/decisions/0030-admit-the-module-resource-scope-package.md
[GM8]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/assembly/README.md
[ORG1]: https://github.com/agent-teams-ai/.github/blob/0b44c64c824f536bd1b085341e7669bcc64ef124/docs/engineering-quality-standard.md
[ORG2]: https://github.com/agent-teams-ai/.github/blob/0b44c64c824f536bd1b085341e7669bcc64ef124/docs/architecture/feature-module-standard/v1.1.md
[ORG3]: https://github.com/agent-teams-ai/.github/blob/0b44c64c824f536bd1b085341e7669bcc64ef124/docs/repository-admission.md
[FND1]: https://github.com/agent-teams-ai/engineering-foundation/blob/e38d8444f74cceef37c366f4e28ed1918b214d4a/README.md
[FND2]: https://github.com/agent-teams-ai/engineering-foundation/blob/e38d8444f74cceef37c366f4e28ed1918b214d4a/packages/engineering-foundation/README.md
[FND3]: https://github.com/agent-teams-ai/engineering-foundation/blob/e38d8444f74cceef37c366f4e28ed1918b214d4a/packages/feature-module-standard/README.md

[EFFECT1]: https://github.com/Effect-TS/effect/blob/e3aca1f1484e623cee09b7f3fa18d6ff5d66c0e8/packages/effect/src/Layer.ts
[EFFECT2]: https://github.com/Effect-TS/effect/blob/e3aca1f1484e623cee09b7f3fa18d6ff5d66c0e8/packages/effect/src/Scope.ts

[EF7]: https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/research/standalone-live-plugin-library-blueprint-2026-11-22.md
[GMP1]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/core/package.json
[GMP2]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/assembly/package.json
[GMP3]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/resources/package.json
[GMP4]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/effect/package.json
[GMP5]: https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/lifecycle-kernel/package.json
