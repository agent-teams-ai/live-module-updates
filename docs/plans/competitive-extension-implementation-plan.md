# Competitive extension and live-evolution implementation plan

**Priority: IMPORTANT — owner-requested implementation TODO.**
Version 2, 2026-11-28. Detailed proposal; completed substantive,
owner-triggered review rounds: **2/7** (see section 12). The owner now
requires actual implementation and end-to-end delivery after the seven
planning rounds; publishing this plan alone does not complete that goal.
This is the single coordination plan for the competitive extension journey.
It is not an accepted ADR, package admission, product rollout, stable SPI,
completed E2E or authorization to implement every optional profile.

Read the [existing foundation delivery plan](foundation-delivery-plan.md),
[operation usage](../architecture/cooperative-operation-usage.md) and
[owner choices Q1–Q7](../decisions/open-decisions.md). Keep their accepted
contracts, applicable qualification gates and source evidence authoritative.
This plan selects the recommended order and bounded implementation experiments,
not another lifecycle engine or a duplicate owner decision.

## 1. Outcome, scope and stop rule

Deliver a developer- and agent-authored plugin that can be installed, used,
updated and retired with observable outcomes, without making ordinary module
development expensive or stopping unrelated useful work. Prove the same
artifact/contract in independent test Hosts where the claimed portability
requires it; product integration and public SPI qualification remain separate.

The improvement over existing industry solutions must be demonstrated through
narrower disruption, clear authoring, safe recovery, proportionate authority
and measured resource cost. Do not infer superiority from modular diagrams,
plugin counts, different trust models or projected fleet size.

**In scope:** the remaining first trusted installed journey A–F; five bounded
follow-ups G, H1, H2, I and J; early Runtime/Orchestrator/Platform contracts
that prevent expensive redesign; evidence and sequential delivery decisions.
All stronger profiles are selected at their actual dependent seam.

**Out of scope:** reimplementing GM/EF/LMU, replacing Temporal, NATS or
PostgreSQL, generic lifecycle/DI/scheduler/permission managers, arbitrary
JavaScript stack or provider-session migration, a universal UI renderer or
DSL, mandatory Wasm, a marketplace, a full multi-cell controller, a universal
state store, and unrelated legacy refactors. No product pins, dependencies,
release protections or accepted standards change by publishing this plan.

Stop a proposed extension when existing public mechanisms establish the
required behavior with smaller code. Keep ordinary statically composed
modules and the Fully Local deployment independent of the optional profiles.
Prefer a selected coherent vertical slice with native evidence to a large
platform project. Do not let an unresolved future guarantee block a smaller
already supported profile.

## 2. Critical early architecture TODOs

Resolve each row **before implementing its affected public contract, durable
schema, authority boundary or promised profile**, not before every feature.
Use the existing owner ADR/open-decision route; record a selected choice and
its actual rejecting witness there. None of these TODOs creates a new universal
gate or authorizes a silent change to an accepted owner contract.

| Critical decision | Required invariant | Owning implementation route |
| --- | --- | --- |
| P0-1. Module versus plugin versus activation domain | Ordinary helpers remain imports. Replacement uses the smallest coherent old/new affected dependency cohort, not every file. Shared mutable/resource ownership may require one larger group. | GM public composition; LMU C and G below; EF distribution |
| P0-2. Identity and authority | Distinguish semantic contract/revision, artifact digest, installation ID, module generation, deployment/realm incarnation, provider execution generation, update attempt, Run and effect/receipt ID. Never reuse an old authority epoch to roll back content. | EF admission; Host durable authority B/C; Runtime execution model |
| P0-3. Durable publication and recovery | One canonical owner commits the expected revision and original receipt. A synchronous in-memory read is not an atomic cross-process database admission operation. Close affected admission when the owner cannot establish the authoritative revision; rebuild exact bindings before reopening. | B/C and G; existing LMU E2 proposal and owner store |
| P0-4. In-flight work and compatibility | Hold exact admitted bindings and companion assets for their actual lifetime. Separate overlap, safe checkpoint, exclusive-resource transfer and restart-only modes. Retain unresolved effects and compatible readers until their obligations finish. | D/E/G/H1/H2 |
| P0-5. Agent tool and continuation contracts | Bind the exact offered tool contract and implementation to each accepted invocation. Never reinterpret pending arguments under a new same-name tool, repeat an unknown effect, or resume a stale/unauthorized turn. | Run/Agent Context and Runtime H1/H2 |
| P0-6. Trust and physical custody | A signature, manifest, separate process, Worker or UI consent is not a hostile-code sandbox or an effect grant. Name the actual enforcement and physical-release owner; receiver checks current authority. | EF plus existing executor/security owners I; Desktop/native receiver as applicable |
| P0-7. User-facing status | Distinguish verified/installed/enabled/admitted/active/useful/retiring and uncertain or failed outcomes. A read-only impact preview cannot grant or publish. | Host B/C and J |
| P0-8. Load and deployment independence | Bound work, bytes, retries, retained generations, streams, output and cleanup debt. Stable logical identities and one effect owner survive placement; real control capacity remains at saturation. No fleet dependency for one local agent. | Runtime C0–C3 and Orchestrator/Platform §9 |

Before selecting a stronger profile, resolve applicable Q1–Q7 and record the
denied guarantees. Keep the existing selected cooperative finite profile
unchanged while independent experiments proceed.

## 3. Exact baseline and industry evidence

Source inspections are not release, security or benchmark claims. Refresh
the exact package/source and owner evidence before dependent implementation.

| Baseline | What to reuse | Remaining work |
| --- | --- | --- |
| [GM e5bed69b](https://github.com/agent-teams-ai/get-modular/tree/e5bed69b096949346b9c2ffeed24850f86abd406) | Core/Assembly public composition facts, Resources, Observation, optional Effect and Conformance | No second compiler. Change public GM only after a concrete missing fact or contract is demonstrated. Do not import its private lifecycle candidate. |
| [LMU da34ba61](https://github.com/agent-teams-ai/live-module-updates/tree/da34ba61c0998acf526465ba047b4f5eab44d85b/src) | 1,529 physical TS lines in 15 production/export files at the inspected revision: finite invocation, generation ownership, prepare, publish/lookup, adoption and original cleanup | Additional profile semantics and integration; preserve ordinary package exports and guarantees. |
| [EF candidate de323977](https://github.com/agent-teams-ai/extension-foundation/tree/de323977f1320280496d2d7f4d894b4a7beaef20/packages) | 787 physical TS lines in 13 package files: contribution matching and actual artifact verification/evaluation | [#70](https://github.com/agent-teams-ai/extension-foundation/pull/70) admission and tooling are not finished; E4–E6 remain separately scoped. |
| [LMU #12](https://github.com/agent-teams-ai/live-module-updates/pull/12) | Existing tooling/reuse work and [next-profile packet at inspected head](https://github.com/agent-teams-ai/live-module-updates/blob/b7750aa3ded56dff8aa62d1f1bbd2cc71e2dcaa1/docs/plans/first-operation-implementation-plan.md#11-next-profile-implementation-readiness-2026-11-27) | E0–E5 first-discriminator details remain a proposal. Do not fold G–J implementation into #12 or bypass [Central #447](https://github.com/agent-teams-ai/.github/pull/447). |
| [Research #33](https://github.com/agent-teams-ai/engineering-research/blob/44be6dd27bd4fd26e0184365d6275aca988845b1/docs/lessons/preimplementation-decisions.md#implementation-decision-and-sizing-packet-2026-11-28) | Source inventories, alternative estimates and prior reviews | This coordination plan expands the execution and exit sequence; do not add the earlier estimates again. |

### Transfer the useful principles, not the competitor implementation

| Reference and evidence | Transferable principle | Our proposed improvement or comparison test |
| --- | --- | --- |
| [OpenClaw opt-in generation overlap](https://github.com/openclaw/openclaw/blob/de4d1cc8c1d9361da01eae3f29ef347e3631fe4c/docs/plugins/manifest.md#generation-overlap), [tool handoff](https://github.com/openclaw/openclaw/blob/de4d1cc8c1d9361da01eae3f29ef347e3631fe4c/src/agents/tools/session-tool-handoff.ts) — inspected source | Admit explicit overlap only for eligible plugins; detach self-reload; hand off at a safe model step when supported | Compare independent-work continuity, denied authority, crash recovery and exact tool identity in G/H1/H2. Do not assert all OpenClaw reloads stop all work. |
| [Paperclip plugin specification](https://github.com/paperclipai/paperclip/blob/c72c4687083db82348baa03a7d57cb6963245f44/doc/plugins/PLUGIN_SPEC.md) — specification, not independently run | Worker/plugin boundary, capability-based host calls and optional UI contributions | Keep ordinary libraries free of runtime-worker overhead. Qualify an installed lifecycle with retained old work when safe; compare only the same trust and deployment profile. |
| [OSGi R8 wiring §7](https://docs.osgi.org/specification/osgi.core/8.0.0/framework.wiring.html) — specification | In-use old revisions and reverse dependent closure survive until safe refresh | Use actual GM binding facts and resource owners; don't stop unrelated roots or assume classloader GC is Node ESM unloading. |
| [IntelliJ dynamic plugins](https://plugins.jetbrains.com/docs/intellij/dynamic-plugins.html) — SDK documentation | Explicit unload eligibility, disposers and restart fallback | Surface actionable incompatibility and held-resource causes; retain original cleanup evidence instead of fabricating unload. |
| [VS Code extension hosts](https://code.visualstudio.com/api/advanced-topics/extension-host) — SDK documentation | Execution placement and lazy activation for responsiveness | Keep cold discovery inert; compare startup cost and first useful invocation. Use existing native UI controls instead of an obligatory renderer. |
| [HashiCorp go-plugin](https://github.com/hashicorp/go-plugin/blob/main/README.md) and [Grafana backend plugins](https://grafana.com/developers/plugin-tools/key-concepts/backend-plugins) — documented RPC/subprocess models | Narrow interfaces and process failure boundaries | Qualify one replaceable compatible cohort and actual native stop. RPC/process separation is not hostile containment or proof of remote effect settlement. |
| [Grafana plugin lifecycle](https://grafana.com/developers/plugin-tools/key-concepts/plugin-lifecycle) — documented discovery/registration/init | User-facing stages and understandable activation failures | Observe real useful calls, durable installation/restart, current grants and original operation receipts, not merely installed or registered status. |
| [Temporal worker versioning](https://docs.temporal.io/best-practices/worker) and [Envoy xDS](https://www.envoyproxy.io/docs/envoy/latest/api-docs/xds_protocol) — design references | Retained workflow versions; separate delivered/accepted/observed configuration | Keep exact old behavior and recovery identities, treat ACK as distinct from useful adoption. Do not install another workflow engine or control plane. |
| [Kubernetes API priority and fairness](https://kubernetes.io/docs/concepts/cluster-administration/flow-control/) and [Agent Sandbox pool source](https://github.com/kubernetes-sigs/agent-sandbox/blob/6242490fac541912665243d67c42405be0cb692d/extensions/controllers/sandboxwarmpool_controller.go#L58-L165) | Bounded fair scheduling, delayed-cache accounting and paced replenishment | Runtime C0–C3 retains real downstream cancellation/reclaim capacity; warm pools only if measured and selected. |

Use the [existing industry register](../research/industry-patterns.md) and
[research technology comparison](https://github.com/agent-teams-ai/engineering-research/blob/842acc3452ff0cc3b873ff9ead4d8ab2e03d3fe2/docs/technologies/modularity-and-extension-contracts.md)
for deeper source history. Compare reported upstream behavior, our source,
executed fixtures and actual product behavior in separate evidence classes.
No competitor suite or common product benchmark was executed for this draft.

## 4. Delivery graph and owners

One semantic implementation owner per mechanism. Use existing FMS/CMS
composition at actual seams, not one graph node per function. Domain and
application code consume narrow owned ports; EF, GM, LMU and native transport
are wired by their actual owner. Private helpers stay private and pure where
appropriate. No new package is justified by a heading in this plan.

| Owner | Implements or provides | Does not own |
| --- | --- | --- |
| Get Modular | Public immutable composition facts, construction, resource mechanisms | Plugin trust, update coordination, grant store, process custody |
| Extension Foundation | Verified artifact, contribution compatibility, admission and installation contracts | Product grant decisions, canonical business data, duplicate LMU coordinator |
| LMU | One logical replacement operation, affected-cohort orchestration and qualified lifetime extensions | Database, conversation, global scheduler, process supervisor, generic catalog authority |
| Host / product | Canonical installation, expected revision, current grants, active routing and useful behavior | Another graph compiler or private copy of LMU |
| Runtime / existing executor | Actual native execution, receiver authorization, resource disposition and provider continuation capabilities | Orchestrator's Run/Task model, plugin catalog policy |
| Orchestrator / Agent Context | Run/turn identity, approved management intent, continuation, offered-tool selection and effect coordination | Runtime-native custody, plugin artifact verifier |
| Product presentation | Native views, accessible commands, actual owner diagnostics | Authority decisions, direct OCI tooling, universal UI renderer |
| Engineering Foundation | Existing development-only tests, conformance and qualification tooling | Production runtime dependency or duplicate test engine |

Execution dependencies (claims, not a serial all-or-nothing release):
A ordinary authoring can start independently; B durable Host and C affected
replacement can proceed after applicable owner contracts are selected.
D stream lifetime can qualify in a fixed trusted cohort independently of
multi-domain C. E realm budget starts with the finite loader.
F joins A–E where the claimed installed journey requires them.
G extends C/D/E through an actual native executor. H1 depends on a qualified
management/update and real continuation owner; H2 is additional to H1's
identity/receipt contracts and requires provider checkpoint evidence.
I can investigate the actual containment boundary independently; combine it
with G/F only for a claimed untrusted live-update journey.
J can prototype against truthful Host read projections, but full end-to-end
management depends on B/C and selected lifecycle operations.
C0–C3 fleet delivery is a separate owner lane (§9).

## 5. Foundation baseline: complete the trusted installed journey (A–F)

Do not start a duplicate implementation while EF #70 and LMU #12 are delivering
their current selected scopes. Reuse their actual published/qualified public
surfaces after admission. Work on design/independent fixtures may proceed
without inventing a consumer release or weakening a dependency.

### A — authoring and cold discovery

1. Use one independently authored useful headless capability, not a no-op toy.
   Reuse GM's typed declaration/builder and EF's existing contribution
   validator. Author supplies a contract/revision, implementation and
   applicable compatibility/permission metadata once; derive views rather than
   hand-maintain duplicate declarations.
2. Keep manifests/discovery inert. Reject unsupported required contracts
   before evaluation; omit declared optional contributions only as negotiated.
   Preserve actionable diagnostics. Build an ordinary external consumer and
   a packaged plugin using the same semantic implementation.
3. Verify root-only packed imports and supported dependency closure; measure
   author steps, hand-written adapter glue, cold discovery and first useful
   call. Avoid generator infrastructure or another SDK unless this exact
   author task demonstrates a repeated contract gap.

### B — durable installation and Host authority

1. Select one disposable Host with existing PostgreSQL/store mechanisms and
   actual signed artifact verification. Reuse EF installation/authority
   contracts under [ADR-0011](https://github.com/agent-teams-ai/extension-foundation/blob/main/docs/decisions/0011-extension-admission-custody-and-retirement-closure.md)
   and E4/E5; Host owns canonical state. Keep installed artifact and active
   generation distinct; no duplicate EF product grant database.
2. Persist the immutable attempt, semantic request fingerprint, expected
   revision, selected digest/contract, actor/scope and original outcome under
   its actual owner. Use the owner's atomic expected-revision write plus
   receipt; same identity/different meaning conflicts. No plugin/provider
   calls or arbitrary callbacks inside the transaction.
3. Evaluate compatibility and actual grants before protected effects.
   Permission expansion needs the current product's authorization/consent
   contract; decline or changed basis leaves the previous authorized behavior
   unchanged. Separate ordinary disable from emergency revocation; deny new
   work and fence actual effects according to the chosen policy.
4. Reconcile unknown commit by original identity, never mint a new request
   blindly. On startup, keep admission closed until exact canonical
   artifact/binding/native ownership is reconstructed. Ordinary uninstall
   preserves user data; physical asset disposal waits for actual holders.
   A database snapshot alone does not establish safe physical ownership.

#### B.1 — durable operation contract and linearization (round 2)

The first durable Host is a selected **single serving owner per coherent
domain** with an actual exclusion/fencing boundary, using PostgreSQL as the
owner's existing canonical transactional store. Do not assume a process
mutex, TTL, cached head, or one elected controller establishes this property.
The supported finite cooperative LMU profile stays independent and unchanged.
The stricter durable/multiple-host guarantees need their own real native proof.

Source-checked constraints:

- [LMU startUpdate/prepare/publish/reconcile at da34ba61](https://github.com/agent-teams-ai/live-module-updates/blob/da34ba61c0998acf526465ba047b4f5eab44d85b/src/features/update-operation/application/update-operation.ts):
  the synchronous part of startUpdate registers an in-memory attempt, and
  preparation can start before the caller receives its handle. Its local
  replay table is not a durable journal. Persist accepted durable intent
  **before** calling startUpdate, and bind the actual baseline to that intent.
- [Actual LMU authority port](https://github.com/agent-teams-ai/live-module-updates/blob/da34ba61c0998acf526465ba047b4f5eab44d85b/src/features/update-operation/application/ports/authority.ts):
  read is synchronous, inert and detached; publish conditionally mutates the
  same head and binds the original receipt; lookup resolves the original
  request. There is no callback for a distributed read transaction or a
  second independently mutable local head. A definite refusal means that
  exact request cannot subsequently commit.
- [Existing authority laws](https://github.com/agent-teams-ai/live-module-updates/blob/da34ba61c0998acf526465ba047b4f5eab44d85b/src/features/update-operation/testing/authority-laws.ts)
  already check stale head/basis, exact replay, changed-payload conflict,
  lost acknowledgement and immutable historical receipt. Run the existing
  laws against the new actual Host adapter; add only the process-loss and
  native visibility joins those tests do not establish.
- [EF accepted ADR-0011](https://github.com/agent-teams-ai/extension-foundation/blob/65233d072c7010938b1d641ff70b1341769d76fb/docs/decisions/0011-extension-admission-custody-and-retirement-closure.md#publication-and-lifecycle-fence-hierarchy)
  requires scope, affected artifact and source fences in canonical order;
  closure, pin promotion, head, route eligibility, fence and grant
  activation commit in one owner scope. Remote revocation and router
  convergence have distinct enforcement semantics; no lock is held across
  provider work or drain. Do not introduce another fence hierarchy.
- [Orchestrator accepted ADR-0095](https://github.com/agent-teams-ai/agent-teams-orchestrator/blob/5eab6575ff11e981c63ea5061f1a82306c4cffbd/docs/decisions/0095-extension-safety-and-ownership-invariants.md#decision)
  requires pre-effect intent, no extension code in a Unit of Work and no
  blind retry. [Runtime S2](https://github.com/agent-teams-ai/agent-runtime/blob/e8c12c5b3d659f6530d6e17c9242c180f3410ffe/docs/architecture/agent-runtime-architecture-program-s2-operations-storage.md)
  separately owns native-attempt correlation, storage and recovery.
  Reuse those owner capabilities when applicable; do not mirror native
  inventory or introduce a new product operation journal in LMU.

##### Durable records: extend existing owner contracts only

The following are logical facts to map onto existing owner tables/ports,
not a proposed mandatory physical schema, shared package or duplicate store.

| Durable fact and owner | Minimum binding and rule |
| --- | --- |
| Installation/source and graph publication (EF/actual product) | Stable scope/source/installation identity, exact artifact and contract, immutable closure, canonical head and revision, staged/active reference pins, applicable grants/fences. Use the accepted EF source/parent-artifact/graph hierarchy. |
| Management intent (Host or existing durable product operation owner) | Unique scoped attempt ID, closed request fingerprint, actor/scope, expected head/basis, candidate generation/closure, immutable affected-set/evidence references, selected profile. Store before first candidate preparation/evaluation. Do not copy grants or credentials into a generic intent payload. |
| Publication result (canonical publication owner) | Exact original request binding, committed/rejected result, previous head and resulting head where committed. Same identity/different payload is a conflict; later revisions must not overwrite a prior receipt. Use the same transaction as actual head mutation. |
| Native acquisition, effect and cleanup (actual receiver/executor/custodian) | Original operation/correlation ID allocated before dispatch; exact target/generation and incarnation; effect-specific accepted-pending, confirmed, failed, uncertain or reconciled outcome. Existing accepted native journals remain authoritative. |
| Local serving projection and observation (Host) | Exact reconstructed routing generation, local owner incarnation, authority freshness/fence and whether admission is usable. Not a second persistent active-head writer. Useful adoption, pending cleanup and degraded/unknown visibility are separate from durable publication. |

Keep identity namespaces distinct: a user's request, management attempt,
durable effect, module generation, and realm/native incarnation are not
interchangeable. Reuse the current closed request fields and canonical
owner fingerprint rules rather than a global object serializer. Where a
logical generation is reconstructed after restart, only the new admitted
physical incarnation may serve it. Reconstructing that same canonical head
does not recycle an old attempt or retired generation ID, and it cannot
silently resurrect an old grant. A newly published rollback has fresh
authority/generation, even when returning to identical artifact bytes.

##### Ordered durable Host operation

1. **Accept or replay before effects.** Authorize the real management
   request and derive its scope. Persist its immutable intent/basis under
   the owner transaction. Resolve same-ID replay from the original
   durable outcome or pending record before allowing any new preparation.
   Changed-payload reuse refuses. If acceptance commit is unknown, do not
   call startUpdate. Reconcile the original ID. For the first profile,
   allow at most one unresolved management publication per domain; other
   domains and reserved control/revocation remain independent.
2. **Capture the actual preparation owner.** With the exact admitted
   request available, compare the current synchronous authority snapshot
   to its recorded baseline immediately before startUpdate. If the basis
   changed, refuse that execution under the durable owner; re-plan only as
   a new authorized operation. Do not fabricate an LMU receipt for a call
   that never reached publication. In the selected PreparationPort, create
   the inert attempt owner synchronously; persist the actual native
   acquisition/effect identity and staged retention before any external
   preparation, process creation or evaluation it can trigger. No plugin
   code, network, provider call or wait for cleanup inside a transaction.
3. **Close affected new admission before durable switch.** The Host's
   serving-owner/exclusion contract must establish that only this current
   owner may admit for this domain. In the selected adapter, close the
   bounded local admission path synchronously before the publication
   transaction can change the head. While closed, read must not return a
   stale head as authoritative; use the current authority-unavailable
   refusal behavior rather than invent an empty or new head. Retained
   already admitted work follows its actual generation and receiver policy.
   Do not disable unrelated domains, or obstruct cancellation/revocation.
4. **Commit one canonical transaction.** Check the exact durable intent,
   expected head, all relevant basis/evidence, serving-owner fence and
   actual affected-member census. Acquire only the existing applicable
   scope/artifact/source fences in canonical order for this bounded
   transaction; revalidate affected closure and staged holds. Atomically
   commit the head, route/fence/grant/pin changes and immutable original
   publication receipt. A definite rejected/absent outcome requires proof
   that this exact original attempt cannot later commit. Never derive it
   from a client timeout or a changed current head alone. Release
   transactional locks before native work or reconciliation.
5. **Converge native visibility before reporting usable publication.**
   A durable commit is not a local invocation-ready projection. Install or
   reconcile the exact current canonical generation under the same valid
   serving-owner/authority fence, using the candidate registered by the
   existing LMU preparation. Keep admission closed when ownership or
   visibility is uncertain. A response/lookup exposed to the current
   LMU operation must satisfy its existing same-head authority laws;
   reconcile the projection before returning that committed receipt.
   Preserve the durable receipt even if the local adapter cannot yet
   satisfy its live protocol. Report the known durable commit and
   unavailable serving status through distinct owner observations;
   transport/operation uncertainty is not a new durable rejection.
   Do not silently change the meaning of LMU's unknown/known results.
   A historical receipt must never rewind a newer native head. If the
   current adapter cannot preserve these laws, retain the closed domain
   and qualify an explicit successor contract instead of lying to LMU.
   Only reopen when the actual current head, fence, receiver policy and
   installed binding permit it. If a revoke wins after commit, do not
   claim useful B or restore an obsolete grant just to make the adoption
   probe succeed.
6. **Drain and reconcile outside the transaction.** On committed
   publication, the existing LMU operation coordinates original native
   predecessor retirement; on proven rejected publication, it retires
   the candidate. On unknown publication retain both relevant obligations.
   Call the exact original effect/cleanup owner; independently observe
   success, authoritative absence where applicable, pending or debt. The
   owner persists the actual disposition. Never use timeout, local
   generation removal, process exit or receipt existence as proof that
   an external effect settled. Do not delete companion bytes while
   retained work, staged pins or actual state attachments still hold them.
7. **Recover after process loss.** Boot with ingress closed. Reconcile the
   actual prior native incarnation and outstanding intent/effects using
   their stable keys and existing native custody contract. Read the
   canonical current head and reconstruct its exact verified closure;
   only rerun preparation/evaluation under a supported idempotent or
   explicitly restart-safe construction contract. Do not deserialize a
   vanished JavaScript promise or automatically rerun startUpdate for
   a previously accepted unknown attempt. If custody/exclusion or
   compatible reconstruction is unproved, preserve debt and refuse
   activation for that domain. Only authoritative reconciliation can
   permit a fresh attempt. The existing process cannot reacquire live
   authority through a late reply.

Use finite applicable decision/membership leases, freshness and receiver
fences exactly as ADR-0011 requires; a local barrier by itself does not
provide remote revocation or multi-serving-owner safety. Emergency
revocation retains a bounded control path even while management publication
is pending. A permanently held SQL/advisory lock across evaluation or drain,
an eventually consistent cache treated as canonical, and a second
distributed coordinator are rejected.

##### Recovery cases and alternatives

| Injected failure at actual owner boundary | Required durable and native observation |
| --- | --- |
| Intent commit response lost, before candidate preparation | Original intent lookup; no extra acquisition, no fresh attempt to escape uncertainty. |
| Candidate acquired or preparation fails, before head commit | Previous valid head remains; original staged custody survives until actual cleanup/reconciliation. |
| Canonical commit succeeds, process/reply lost before local projection | Durable new head and original receipt remain; no stale old admission; successor reconstructs exact authorized generation or stays unavailable. |
| Projection installed before original receipt reaches caller | Original immutable receipt available through lookup. No new publication, no predecessor/candidate disposed solely due to missing acknowledgement. |
| Effect accepted before acknowledgement or cleanup fails | Original effect-specific state and actual held owner retained; no blind repeat or premature asset disposal. |
| Competing publish, stale basis, retire/attach or revoke | One canonical winner; rejected stale facts and late former owner; current revoke enforcement, no resurrection of unrelated or retired source. |

Reuse one native PostgreSQL/process fixture with independent DB/receiver
observations and actual crash barriers, not six separate full-stack systems.
Existing authority conformance covers ordinary replay/conflict and equality
laws; add a small distinct transaction/process-loss matrix and a real
interleaving of publication/visibility/admission. Verify that a pending
transaction can still commit before treating a missing receipt as absence.
For receipts and assets, declare the actual retry/restore/replay horizon and
terminal non-resurrection rule before pruning. Unknown obligations are not
evictable; use bounded admission or explicit reconciliation at capacity.

| First durable profile option | R/U/C | Incremental P/T | Decision |
| --- | --- | --- | --- |
| Single exclusively fenced serving owner per domain, existing owner transaction and fail-closed visibility barrier | 9/8/6 | 1,200–2,400 / 1,700–3,200 (B; includes visibility/recovery join) | Recommended investigation and first bounded target. Requires actual exclusion/fence proof. |
| Multi-serving-owner authoritative asynchronous selection/reservation | 8/5/9 | 2,000–4,500 / 3,000–6,000 for a narrowly selected alternative, not added to B | Defer until an actual concurrent-host need; requires explicit successor API, real admission and receiver proof. |
| In-memory mirror with eventual refresh and DB CAS only | 4/9/3 | 150–400 / 200–500 for plumbing, not a valid durable profile | Reject. Cannot satisfy current authoritative read/admission or revocation contract. |
| Lock held during remote effects or drain | 4/8/7 | No responsible implementation estimate for the rejected guarantee | Reject, conflicts with accepted ownership/transaction floor and creates resource/availability risk. |

Round 2 executed a small **abstract** single-domain interleaving model (no
actual database, process, lease, external revocation or implementation).
With commit, local installation, reply, call and lookup, 28/40 valid
unguarded event orders violated stale-admission or receipt-visibility
conditions. With admission closed before commit, guarded lookup and
installation/open ordered before reply, 0/42 modeled orders violated those
conditions. This is a design discriminator for the selected barrier, not
native E2E, correctness of a PostgreSQL adapter, or a proof of crash/fence
behavior. An illustrative lost-ACK replay with a fresh ID duplicated the
effect; atomic owner receipt observation did not. Unknown external effects
still require their actual receiver evidence. Do not add this toy model as
another production test harness.

B budget remains the earlier range. Allocate approximately 250–500 P to
closed owner facts/mapping, 350–700 P to atomic intent/publication/receipt
adapter, 350–700 P to native visibility/cold recovery and 250–500 P to
installation/grant/retirement joins. These partition one B estimate; reduce
where existing owner code suffices. C keeps its affected-set/preflight work;
F owns only the uncovered joined native journey, not duplicate B tests.
SQL/config remain the §10 separate allowance. If actual native exclusion,
durable management owner or restart-safe acquisition is missing, identify
that owning prerequisite and re-estimate; do not implement an imitation
inside LMU. R/U/C and LOC are conditional estimates, not achieved guarantees.

### C — affected cohort, preflight and publication

1. Use existing GM compilation, then compare old/new selections, exact
   artifact/implementation identities, ordered bindings, roots and resource/
   state ownership. Follow reverse consumer edges in the union of old/new
   resolved graphs from changed bindings/implementations. Include removed and
   newly selected dependents; if an owner cannot split safely, enlarge the
   coherent group or refuse the selective mode.
2. Bound nodes/edges and use full admitted plans first. One linear affected-set
   traversal over indexed facts suffices; no new resolver, incremental
   compiler or per-agent graph rebuild. Maintain one owner per coherent
   update domain. Prepare B before disturbing A where overlap is supported.
3. Preview exposes basis, affected/retained owners, grant/compatibility
   differences, chosen mode and known blockers. It is read-only and may
   become stale. Actual apply revalidates against the same owner and expected
   revision; stale plans refuse/recompute, not silently broaden scope.
4. Current LMU select/retain assumes a synchronous inert authoritative read.
   For this first durable profile use a single exclusively fenced serving
   owner per domain; hold a bounded domain admission barrier around uncertain
   publication/local visibility, then reconstruct/reconcile exact state.
   A stale process-local mirror cannot authorize work. If multiple serving
   owners are necessary, separately qualify actual authoritative async
   admission and receiver fencing through a reviewed successor, not a cast.
   No global lock or pause of unrelated domains. Cross-domain atomic update
   is not promised; shared unsplittable ownership makes one cohort.
5. Observe actual useful B and retained permitted A, then original native
   cleanup. If publication succeeds but useful adoption fails, report
   active-but-degraded/unknown and use a fresh authorized compatible return
   or fix-forward. Never declare rollback of an external effect.

#### C.1 — source-checked affected-set implementation, not a second compiler

Round 1 source review: the actual public [GM wire model](https://github.com/agent-teams-ai/get-modular/blob/e5bed69b096949346b9c2ffeed24850f86abd406/packages/core/src/features/authoring/wire-types.ts#L32-L72)
contains roots, selections keyed by module ID, implementation IDs, slot bindings
with **ordered** provider implementation IDs, exact compatibility and dependency
order. The [plan emitter](https://github.com/agent-teams-ai/get-modular/blob/e5bed69b096949346b9c2ffeed24850f86abd406/packages/core/src/features/plan-output/factory.ts)
hashes this inert plan, not executable bytes, mutable state or runtime owners.
The [Assembly run](https://github.com/agent-teams-ai/get-modular/blob/e5bed69b096949346b9c2ffeed24850f86abd406/packages/assembly/src/features/construction/run.ts)
constructs its selected entries for the run and treats declared inputs as
borrowed. It is not a partially mutable live container. The actual
[LMU model](https://github.com/agent-teams-ai/live-module-updates/blob/da34ba61c0998acf526465ba047b4f5eab44d85b/src/features/update-operation/application/models.ts#L4-L34)
and [invocation boundary](https://github.com/agent-teams-ai/live-module-updates/blob/da34ba61c0998acf526465ba047b4f5eab44d85b/src/features/update-operation/application/invocation.ts)
own a **single Host-authoritative domain/head** and reserve the selected
generation without suspending. They do not provide multi-domain atomic
publication. Do not extend either library on the strength of its name alone.

**Recommended first implementation:** replace a complete, already coherent
update domain, with explicit stable borrowed inputs, then qualify selective
replacement across independently composed domains. Do not construct an
incremental factory executor that assembles arbitrary subgraphs of a prepared
GM run. Ordinary immutable assembly remains the only construction authority.
Move an independently reusable capability into an explicit Host-owned
borrowed-input boundary only when a real lifetime or update need warrants it.
Changing or removing that shared provider still requires considering every
affected consumer. The code path must not dispose the borrowed provider.

Use a small inert Host-local projection derived from existing owner records
and admitted plan facts, not another persisted service registry:

| Input to the affected-set calculation | Authoritative source / matching rule |
| --- | --- |
| Old and candidate admitted plan, exact digest and selected roots | GM compiler output; identify a node within its actual composition occurrence, resolve implementation IDs through its selected module map. |
| Actual executable/implementation revision and applicable state compatibility | EF/Host artifact and product contract owner; compare exact selected facts, not display names or equal GM digest. |
| Actual instance/custody and ownership boundary | Host's existing constructed owner and declared borrowed-input map; bind the physical owner/instance to its real scope. Identical module IDs in two independent installations are not one instance. |
| Active and retained consumer census | Host's admitted routing/retirement owners, including other affected active roots/domains and old still-held generations; no discovery scan of arbitrary process objects. |
| Expected revision and relevant condition basis | Existing authority owner's opaque head/basis (not a new global version or permission token). Retain the exact admitted impact inputs; compare them at apply. |

For the first bounded selected profile:

1. Capture complete old and proposed admitted input facts under the existing
   owner revision. Resolve roots and selected implementations to **scoped
   logical occurrences** before matching old/new graphs. Reject incomplete,
   ambiguous or stale facts; a plugin ID alone does not locate one live owner.
   Use the Host's already admitted set, not a fleet-wide census.
2. Index the old and new bindings by scoped consumer occurrence and slot,
   resolve ordered provider occurrences and compare compatibility tokens.
   Seed added/removed/rebound/changed implementations, artifact revisions and
   affected state/resource ownership units. A changed ordered-many binding
   is meaningful even if the provider set is equal. A new artifact at the
   same implementation ID and plan digest is still a changed candidate.
3. Follow provider-to-consumer edges of the union of old/new resolved graphs
   and include unsplittable ownership units. Use bounded visited sets and
   worklists for a fixed point; each indexed occurrence, edge and ownership
   membership is processed at most a constant number of times. This is
   linear in the admitted input facts, not a proof of global fleet cost.
   Reverse edges identify **affected consumers**, not resources to dispose.
   Retained old generations contribute holds; they are not new routes.
4. Map affected occurrences to existing update domains. If one domain covers
   them, reuse one LMU operation and the actual complete assembly. If
   several already independent domains are affected, **do not** pretend
   multiple LMU calls form an atomic commit or merge their active heads.
   Refuse a promised atomic selective change across those domains unless an
   existing qualified common ownership boundary actually supports it. A
   compatible, separately selected ordered migration may be designed by
   the product owner; no distributed coordinator in this slice.
5. Return an inert proposed scope and bounded refusal reason; keep disposal
   and actual execution with their original owners. At apply, revalidate
   authoritative head/basis, selected artifact/contract and all relevant
   sharing/custody inputs, including new admissions that change the
   retirement budget. If stale, recompute/reconfirm. Do not lock unrelated
   domains or reserve a physical resource merely to show a preview.
6. Reuse the existing compatibility/preparation/publication ports to install
   the new **whole selected domain**. Keep unaffected domains on their
   existing owner and invocation facade. Retain exact old held work and
   resources; do not call another root's cleanup. Measure actual original
   settlement and useful successor behavior independently.

Design stop conditions: no source change in GM for these existing public
facts; no mandatory GM dependency in LMU's ordinary root; no deep/private
imports, arbitrary object graph traversal, runtime-global lookup table,
per-module live registry, cross-domain transaction engine or automatic
split of a live shared mutable owner. If a required scope/owner fact is
missing, first supply it via the current Host contract. Ask the relevant
owner to review a public successor only if a concrete negative case cannot
be expressed with existing APIs. No automatic re-partitioning of active
domains; select boundaries before construction.

C budget remains **650–1,300 P / 900–1,800 T** within §10, not additional
code: approximately 150–300 P for projection/index/diff, 200–400 P for the
selected Host/domain integration and shared-custody checks, 150–300 P for
preflight and exact revalidation, 150–300 P for the remaining narrowly
necessary adapters/refusals. These are overlapping implementation risks
to verify against actual code; the row partitions estimates, not mandatory
new packages or file sizes. If the chosen initial profile uses one fixed
domain with no dynamic impact surface, reduce C to the needed subset.

**Minimal distinct tests (extend the existing composed reference):**
- A compact deterministic plan-fact table: changed artifact with equal GM
  digest, changed ordered-many binding, removed provider and scope separation
  for identical module IDs. Reject an omitted dependent and incomplete
  borrowed-owner census with independent expected affected roots.
- One joined native scenario: roots C and D depend transitively/directly on
  A, another root has an unrelated owner, and an unchanged borrowed owner
  is held by retained work. Update A, prove both affected roots are covered,
  unrelated useful work continues and held borrowed resource remains
  available. Fail if any original owner's disposal is misattributed.
- Reuse B/F's actual stale-basis race and add the distinct late affected
  membership/ownership change or multiple-domain refusal to that same
  scenario. No duplicate CRUD, graph or cleanup suite per consumer.
  If a cross-domain compatible migration is later selected, it needs its
  own partial-apply and recovery evidence, not this single-domain proof.

### D — explicit stream lifetime

Start with one consumer, one outstanding pull, finite bounds and explicit
close in the existing composed-document or execution-session reference.
Reserve before exposing the stream; retain exact generation, nested calls,
pending pulls and original finalizer through real settlement. Demand controls
buffer count/bytes; choose bounded refusal/wait instead of silent loss.
Abort, consumer return and deadline are requests/observations, not physical
completion. Keep never-started acquisition absent; an opened abandoned
stream remains owned until actual disposition. A stream that cannot establish
the guarantee refuses stronger update mode. Do not put escaped iterators
inside the existing finite Promise contract. Use LMU's E1 proposal and
qualified native Resources/Effect only where its real semantics match.

### E — finite loader/retention budget

Count actual cumulative evaluations and retained bytes before execution,
including failed export validation after top-level code may run. Keep
generation, source and companion asset holds with their real owner; never
delete held bytes or decrement residency just because logical retirement
finished. Bound attempts, active work, predecessors, admitted assets, cleanup
debt and actual realm lifetime. Refuse or perform a qualified controlled
restart at exhaustion. Measure heap/RSS, handles/listeners, live owners and
actual native stop as applicable; do not claim ESM unloading or unbounded
cache-busting. Move to G only if continuous use needs realm recycling.

### F — one integrated reference and adoption handoff

Install A through the actual EF verifier, invoke useful A, inspect candidate B
and changed grants, update B through LMU with independent sibling work,
observe useful B, finish permitted A, disable, uninstall and restart. Inspect
the actual owner records, effect log, resource disposition and artifact holds.
Exercise denial, failed prepare, stale preview, lost publication ACK, crash
after commit before local visibility, and original cleanup failure. Reuse
existing B7/C fixtures, conformance and test runner. An independently wired
second Host must use the actual packed public surface; two callers of one
Host builder are not independent SPI implementations.

Exit: qualified first **trusted** profile and useful external author path,
exact source/archive/environment, bounded lifecycle and explicit unsupported
guarantees. No production Host admission, stable SPI, npm publication or
untrusted containment follows from fixture success alone.

## 6. G — replace a coherent group in a recyclable process

**IMPORTANT implementation TODO — required before claiming indefinite
continuous updates without whole-Host restart.** Owner: LMU plus the actual
native executor/Host. Reuse G's F4/F5/E2b owner contracts; do not create a
second supervisor. First discriminator: one trusted compatible Node cohort
behind a narrow typed local transport, with independently owned sibling work.

### Contract and sequence

1. Inventory the existing executor's supported creation, identity, cancellation,
   physical termination and cleanup evidence. Reuse it through a small adapter.
   Start with one process per compatible trust/resource cohort, not one per
   ordinary module or agent. No pooling, reattachment or remote RPC in this
   first slice; those require separately selected evidence.
2. Host owns exact artifact digest, selected bindings, target realm incarnation
   and preparation custody before launch. Pass bounded inert configuration;
   admit only verified code and a compatible handshake. A readiness response
   is not a grant or useful-work proof.
3. Expose a typed capability port with bounded request/response and stream
   limits; bind message correlation, actual sender/incarnation, generation
   and original operation identity to the selected receiver. Validate
   untrusted bytes on entry. A late reply cannot become a successor receipt.
   Preserve cancellation/unknown outcomes and do not auto-retry effects.
4. Prepare B in a new process, use C's authoritative switch, retain permitted
   A work and companion assets, and let unrelated cohorts run. For exclusive
   resources first close old admission and obtain the resource owner's actual
   release or authorized transfer; no simultaneous acquisition by A and B.
5. Stop the exact old native owner, independently observe actual exit and
   applicable descendant/resource disposition, then reconcile foreign
   obligations. Timeout, signal acceptance and process exit do not settle an
   external effect. If stop cannot be proved, retain debt/quarantine and do not
   recycle an exclusive slot. Return to compatible A code as fresh authority.
6. Repeat within declared evaluation/asset/retention budgets; compare
   controlled-restart baseline and recyclable mode using actual workload
   cost, not idle-process counts alone. If simpler finite restart satisfies
   the product's requirement, do not materialize G for that product.

**Smallest acceptance:** real old/new processes, useful B and independent
sibling continuity; one held A invocation; late old-incarnation reply; failed
candidate; forced termination or unresolved stop; observed original cleanup
and retained external receipt. Repeated updates expose real memory/handle
behavior. No hostile-code isolation, process reattachment, transparent remote
migration or indefinite soak promise from this first G.

Alternatives: finite trusted in-process budget and controlled restart
(R/U/C 8/9/3; 180–400 P, 300–650 T, already E); recyclable cohort
(8/7/7; 700–1,500 P, 1,000–2,000 T); process per helper/module
(reject as default, 5/6/8; no sizing without a selected actual boundary).
Reliability refers to the bounded profile, not availability measurements.

## 7. H1 — agent requests its own plugin update and resumes the conversation

**IMPORTANT implementation TODO — before exposing self-update to an agent.**
Owner: Run/Agent Context and Runtime through their existing product
continuation/management mechanisms; LMU supplies the update operation.
A management intent is not a tool permission or an agent's self-granted
authority. Start with one authorized trusted plugin and one real selected
agent integration.

### State, identity and execution

1. Offer a narrowly scoped management operation for an exact installed
   capability/target, not arbitrary repository write or code execution.
   Derive principal, tenant, product scope and current grants from the
   actual receiver. Bind expected head, candidate digest/compatibility,
   update attempt and original request fingerprint. If permission changes
   require approval, use the product's existing approval authority.
2. Persist the accepted intent in the existing durable Run/continuation
   owner before ending its originating invocation. The tool returns
   acceptance/refusal, not completion of its own retirement. The operation
   belongs to a separately owned executor that outlives the old turn.
   If that durable owner is missing, use a clearly limited fixture and do
   not claim product crash recovery.
3. End/settle the holding turn and its actual dependent work without waiting
   inside its callback for its own disposal. Current cancellation/approval
   policies remain authoritative. An unresolved irreversible effect is not
   retried to make the update appear smooth; record/reconcile or refuse the
   transition under the selected policy.
4. Executor rechecks current authority and expected revision and invokes
   the existing LMU operation once by original identity. Persist actual
   committed/refused/unknown receipt; recover via original lookup. If a
   commit is unknown, a resumed conversation can report uncertainty but
   cannot assume B or repeat the mutation.
5. Resume the **same conversation** via the existing continuation owner,
   with exact result/receipt and fresh receiver authority. New turn identity
   is distinct; preserve original Run/effect provenance. Deduplicate
   resume/wake and reject late old callbacks; user stop/revocation wins.
   Do not invent a durable workflow engine in LMU.
6. At fresh tool offer, resolve the supported new contract normally. Pending
   old invocations retain the exact offered contract/revision and selected
   implementation or explicitly refuse, never reinterpret under a reused
   display name.

**Smallest acceptance:** one actual agent requests an update, old turn settles,
authorized B becomes useful, conversation resumes with the actual receipt and
an independent agent continues. Kill/restart at accepted-intent versus
settlement and applied-receipt versus resume boundaries; duplicate resume,
permission revoke, failed/unknown update and user stop must not repeat an
effect or create a new unauthorized turn. A no-op test of a chat message is
not sufficient. If the selected provider cannot expose an honest turn end,
keep normal external management and report the unsupported capability.

Alternatives: external operator update only (8/9/2; existing C/J, no H1
additional code); detached terminal management intent (recommended H1,
8/7/6; 600–1,300 P, 1,000–2,000 T); synchronous self-wait or blind turn
replay (reject, 3/9/5; cannot satisfy the liveness/effect contract).

## 8. H2 — safe handover of a continuing turn, and I/J

### H2 — transfer only at a provider-supported safe boundary

**IMPORTANT implementation TODO — before promising live continuation of the
same turn.** H1 deliberately finishes a turn; H2 does not. Runtime owns
provider execution/continuation facts, Orchestrator owns product continuation,
and LMU owns the selected module replacement. Do not require every provider
or CLI to expose a checkpoint they do not have.

1. Inventory one native provider/harness supporting a real known boundary
   (e.g. after a completed model step with settled tool/approval obligations).
   Describe what the provider can safely resume, its actual compatibility
   contract and unresolved effects. A returned Promise or output chunk is
   not sufficient evidence.
2. Bind the exact offered tool catalog revision, tool contract/implementation,
   original invocation and generation to pending tool calls. Before handover
   stop new old admissions at the chosen boundary; drain or reconcile pending
   effects/approvals. Use a narrow versioned checkpoint of owner state,
   original Run/operation and receipt identities, not JS closures, stack
   snapshots or opaque foreign session internals.
3. Prepare compatible B, validate checkpoint/state/grants and transfer only
   the selected authority under the actual owner CAS/fence. Re-resolve
   compatible tools for the next step under fresh current grants; a pending
   old call does not acquire new authority. Preserve original provider and
   output identities according to the supported contract.
4. Recover a lost acknowledgement by original identity, and resume once.
   If checkpoint or state is incompatible, effect remains unknown, provider
   fails, or custody cannot be proved, retain/pin A or report the explicit
   allowed interruption. No automatic arbitrary replay or cross-provider
   migration.

**Smallest acceptance:** real selected provider checkpoint, one useful old
model step and one successor step in the same supported continuing turn,
independent output/effect log, no duplicate tool or input, denied stale
writer. Deliberately change a same-name tool contract while an old request
is pending; reject reinterpretation. Inject unknown effect and competing
handover/crash around authority transfer; fail closed or reconcile exactly.
If provider cannot expose the real boundary, stop H2 for that profile.

Alternatives: pin and drain (9/8/5; D already counted), H2 safe-step handover
(8/6/7; 500–1,100 P, 900–1,700 T incremental to H1's identity contracts),
automatic cancellation/restart where explicitly safe (5/8/4;
200–450 P, 400–800 T; not an equivalent continuation guarantee).

### I — actual isolation for untrusted code

**IMPORTANT implementation TODO — before any untrusted executable support
claim.** Owner: EF artifact/admission, actual Runtime Security/executor and
product receiver. A separate process in G improves failure/lifetime
separation but is not the security boundary for I. Investigate one Linux
profile using the existing [native containment evidence](https://github.com/agent-teams-ai/agent-runtime/blob/main/docs/spikes/linux-nonroot-containment-egress-results.md).
That evidence is scoped; verify the actual adapter supports this different
plugin threat model. Select owner-approved filesystem/network/IPC/resource
and termination policy before implementing or advertising I.

1. Inventory the admitted executor, supported native OS/runtime, current
   credentials and permitted host capabilities. Describe attacker-controlled
   plugin bytes, trust roots, protected user/tenant data, network and native
   handles, and threat boundaries. Admission verifies the exact content
   before evaluation; signed code still has no implicit effect grant.
2. Use the actual native containment mechanism; narrow host capabilities and
   validate all receiver inputs, caller/tenant, current grant, generation and
   resource bounds. Do not expose ambient credentials, generic privileged
   Host service bags or a raw product database. The artifact verifier is not
   the process sandbox; the Host supervisor is not the product authorization
   authority.
3. Enforce resource budgets and supported termination/disposition through
   the actual executor. Report refusal, timeout, quarantine or outstanding
   debt distinctly. Reclaim only after enforcement-backed disposition; late
   callbacks and unknown external effects retain original reconciliation.
4. If live replacement is selected, combine the already qualified G/C/D
   lifecycle with the actual enforcement boundary; fresh B receives current
   narrow permissions. Revocation closes protected effects at the receiver,
   not merely in UI or the plugin registry. Old retained work may only do
   what current policy still permits.
5. Compare one constrained Wasm/WIT ABI only if a real consumer does not need
   general Node APIs. Do not force a portability format or new native
   runtime on ordinary modules. Later Browser/Desktop, macOS/Windows,
   custom native libraries and remote profiles require their own actual
   security/custody evidence, not a Linux result.

**Smallest acceptance:** actual permitted operation and attempted forbidden
filesystem/network/privileged IPC access using disposable harmless fixtures;
wrong tenant or stale grant; bounded CPU/memory/output; non-cooperative
termination with exact process/resource observations; denied external receiver
after revocation. Verify the forbidden effect did not occur from independent
receiver/native observations, not plugin-reported errors. If isolation cannot
be demonstrated, do not run untrusted plugins under this profile.

Alternatives (conditional on selected existing executor/runtime):
Linux native executor adapter (8/5/8; 900–2,000 P, 1,400–3,000 T);
Wasm/WIT constrained capability ABI (8/5/8; 700–1,600 P, 1,000–2,500 T);
JS Worker alone (3/9/3 for hostile-code guarantee; reject; ordinary trusted
plumbing would be 150–400 P, 300–700 T). No estimates for implementing a
new sandbox, arbitrary Node compatibility in Wasm or all OS targets.

### J — usable native plugin management surface

**IMPORTANT implementation TODO — before freezing the public management UX.**
Owner: product presentation plus actual Host/Orchestrator management contracts.
First choose one native Host surface, preferably an existing application
shell and shared UI components. A disposable UI fixture qualifies a narrower
interaction than a production Desktop or web client.

1. Start with an installed/available list and exact install/admission state,
   current selected generation and actual useful status. Cold discovery
   must not evaluate plugin code. Use bounded authorized query/projection
   and existing pagination/subscription conventions; no per-agent global
   scans or authority encoded in UI visibility.
2. Provide inspect/update preview from C: target artifact/contract revision,
   affected/retained group, supported update mode, changed capabilities,
   outstanding work/cleanup and restart requirement. No prediction of an
   exact finish time without a model. Explain which issue blocks apply.
3. Confirm through the current management authority, not a client-side
   grant checkbox. Request carries exact expected revision and original
   operation identity; if preview is stale, refresh/reconfirm. For newly
   required privileges, use existing product approval. Cancellation is a
   request; disable/uninstall are distinct from deleting user data.
4. Render truthful preparation/publication/adoption/retirement/unknown
   outcomes from the actual owner. Preserve unrelated drafts/view state,
   selection, focus and keyboard access where promised. Reconnect reads
   original status/receipt, not a speculative second apply. Emergency
   revocation is an owner action, not a presentation trick.
5. Use host-native controls first. A headless author need not ship UI.
   A custom or declarative presentation contribution is separate under the
   [headless/UI owner guide](../architecture/headless-plugins-and-ui.md);
   add no universal schema, renderer, widget library or additional client
   runtime unless a real selected interaction justifies it. Desktop
   privileged IPC must independently validate sender and current authority;
   a browser fixture alone cannot qualify Electron.

**Smallest acceptance:** one real native management journey, actual preview
and consent/refusal, useful B, independent sibling continuity, visible
unknown/cleanup debt after failure, reconnect and retained user data on
uninstall. Verify accessible controls and stale preview/unauthorized API
refusal at the real receiver. Keep existing headless consumer tests; don't
retest all owner transition combinations through the UI.

Alternatives: CLI only (8/9/2; 100–250 P, 200–450 T for narrow additional
management commands; acceptable first independent Host); native minimal
management UI (8/7/4; 350–800 P, 500–1,000 T; recommended product surface);
universal renderer/marketplace (reject as unnecessary scope, no estimate
without actual product contracts).

## 9. Scale without future architectural lock-in

The competitive plugin programme does not implement another fleet scheduler.
Keep [Runtime C0–C3](https://github.com/agent-teams-ai/agent-runtime/blob/main/docs/architecture/capacity-admission-delivery-plan.md),
[Orchestrator OD-033](https://github.com/agent-teams-ai/agent-teams-orchestrator/blob/main/docs/open-decisions/OD-033-ooda-convergence-and-context-activation.md),
[OD-043](https://github.com/agent-teams-ai/agent-teams-orchestrator/blob/main/docs/open-decisions/OD-043-extension-lifecycle-catalog-and-hot-update.md)
and [Platform integration](https://github.com/agent-teams-ai/agent-teams-platform/blob/main/docs/architecture/shared-research-integration-plan.md)
as the implementation authorities.

Before the dependent schemas fix the stable operation/effect and placement
identities, authority and compatibility horizons, bounded data/control paths,
resource vectors and actual release receipts. Admission is not execution,
queue delivery is not authority, and expiry is not physical stop. Reuse
accepted Stage K scoped PostgreSQL evidence for a model, not fleet proof.
Start owner-local, with indexed bounded claims, receipt-based CAS, fair
allocation and real reserved cancel/renew/reclaim capacity. Use existing
NATS delivery and Temporal workflow owners; neither replaces admission.

Measure one local and one bounded hosted profile before selecting extraction
or multiple cells. If two independently admitted pools share a hard cap,
start with one authoritative transaction; compare conserved finite shares
only after measured contention. Warm pools are conditional: account for
desired, in-flight, observed and truly claimable members; prevent double
allocation under delayed cache and sustained arrivals. No automatic active
Run migration, no global lock per call, no central sync dependency in Fully
Local. A declared 100/500/1,000-active-work test envelope is not evidence
of a 300k simultaneous-agent deployment.

## 10. Sizing, scheduling and implementation gates

P = incremental handwritten production/integration TypeScript lines;
T = incremental handwritten tests/fixtures. R/U/C = achievable reliability
within the stated profile, confidence from present evidence and engineering
complexity (1–10; C=10 highest). They are estimates, not measured rates.
Review/fix and native qualification effort is included in engineer-days;
calendar/CI waiting, upstream prerequisite completion, package publication,
broad product work and infrastructure spending are excluded. Re-estimate
after actual owner inventory; reduce a row to zero when reuse establishes it.
Do not count alternative choices, #12's first discriminators or research #33
again. No line-count, coverage-percentage or test-count targets.

| Work | P | T | Engineer-days | R/U/C |
| --- | ---: | ---: | ---: | --- |
| A authoring | 200–450 | 350–700 | 3–6 | 8/8/3 |
| B durable Host | 1,200–2,400 | 1,700–3,200 | 10–18 | 9/7/6 |
| C affected cohort and preview | 650–1,300 | 900–1,800 | 6–12 | 9/8/6 |
| D stream custody | 350–750 | 600–1,200 | 4–8 | 9/8/5 |
| E retention/restart | 180–400 | 300–650 | 2–5 | 8/9/3 |
| F joint proof, only uncovered joins | 120–300 | 700–1,400 | 4–7 | 9/8/5 |
| **A–F subtotal** | **2,700–5,600** | **4,550–8,950** | **29–56** | 8/6/6 |
| G recyclable cohort | 700–1,500 | 1,000–2,000 | 7–15 | 8/7/7 |
| H1 self-update and resume | 600–1,300 | 1,000–2,000 | 6–12 | 8/7/6 |
| H2 safe-step handover | 500–1,100 | 900–1,700 | 5–10 | 8/6/7 |
| I selected Linux isolation | 900–2,000 | 1,400–3,000 | 10–20 | 8/5/8 |
| J native management UI | 350–800 | 500–1,000 | 4–8 | 8/7/4 |
| **A–F + G + H1 + J** | **4,350–9,200** | **7,050–13,950** | **46–91** | conditional trusted interactive target |

Allow an additional 150–400 SQL and 150–300 config/docs lines for the first
fixture where needed; their effort is already included in B/F. H2 and I
are separate selected additions to the interactive target; if G and I
share native adapter code, count it once. H1/H2 assume an existing qualified
product continuation owner; I assumes a supported containment mechanism.
If those assumptions fail, identify the exact missing owner primitive and
re-size rather than misrepresent a small adapter as the full new subsystem.

Separate fleet estimates from Research #33: C0 (no production TS, 2–4 days);
C1 (1,000–2,000 P, 1,500–3,000 T, 8–15 days); C2 (1,500–3,000 P,
2,000–4,000 T, 12–22 days); C3 (600–1,300 P, 900–1,800 T, 5–8 days).
Total 3,100–6,300 P, 4,400–8,800 T, 27–49 days, estimate confidence 4/10
until C0 inventories the real adapters. Optional warm pools/cross-cell
profiles remain separate. These are not code added to LMU.

Implementation handoff for each selected slice: read the owning contracts and
exact accepted pins; specify the smallest public change and unsupported
guarantees; use existing code where possible; open one coherent draft PR per
owner slice (not per helper); run existing native and contract evidence;
review actual source, fix material findings, verify final head and normal
merge/main checks. Publication/adoption uses existing gates. Stop or defer
only the specific unsupported profile, with evidence.

## 11. Risk-based evidence and comparative acceptance

Choose tests because they reject a distinct realistic failure at the actual
owner boundary. Prefer existing public conformance, real native process/
store/receiver observations and one useful vertical journey. Pure deterministic
graph/metadata helpers can use a compact table-driven unit/property test if
it catches a real invariant; do not mock the entire world to increase branch
coverage. Avoid redundant end-to-end runs of the same law at every layer,
snapshots of incidental formatting, per-file coverage quotas, large fixtures
with no independent oracle or another test harness. Integration regressions
belong to the owner where the fault manifests. Use targeted mutants only
when an otherwise plausible false-pass oracle needs discrimination.

| Evidence group | Smallest positive and discriminating rejection | Existing route |
| --- | --- | --- |
| Artifact/admission | Useful verified A; incompatible/tampered B or declined expansion never obtains authority | EF actual artifact and receiver qualification |
| Cohort impact and durability | New B useful, A retained, sibling useful; omitted dependent, stale basis, commit-before-reply/process loss and duplicate identity detected by actual store/effect log | GM facts, LMU E0/E2 and B7/C reference |
| Lifetime and retention | Old stream and asset remain held through finalizer; ignored cancellation/failed cleanup cannot fabricate release or reuse | LMU E1/E5, actual Resources/loader |
| Recyclable realm | Useful B in new realm, real old disposition; stale response/failed stop cannot affect successor or free held custody | G actual executor and receiver |
| Agent continuation | H1 exact receipt/new turn, H2 actual supported checkpoint; self-wait, stale tool, duplicate resume/unknown effect rejected | Real selected Runtime/Orchestrator owner, not generic LMU conversation fixture |
| Security | Allowed narrow capability and denied file/network/privileged receiver, revocation and physical stop | I native executor/security owner |
| UX | Useful management flow and refusal/reconnect, exact status/permissions and retained user data | J one real Host journey |
| Scale | Useful throughput and control progress at saturation; stale receipts, last-slot race, slow output/failed reclaim | Existing Runtime C0–C3 and owner-specific real integration |

For a profile, record supported workload, exact inputs/artifact/source,
environment, declared finite budgets, oracle and raw outcome. Qualify Node/
Chromium and other native profiles only where promised. Shared evidence is
reused across slices when its source, scope and boundary still match; one
changed behavior does not mandate repeating unrelated suites. Existing
required CI remains authoritative.

### Competitive measurement protocol

Select the same real useful scenario, trust class, runtime/OS, workload and
supported behavior for comparison. Include cold install/discovery, first
effective call, author steps and handwritten glue, normal/failed update,
unrelated workload during replacement, old work and stream continuation,
grant refusal, restart/recovery, cleanup and operational cost. OpenClaw and
other relevant implementations may provide inspected/documented or actually
executed baselines; record version, evidence class and unsupported comparison
cells. Never equate a smaller feature set or weaker security promise with
better performance.

Measure affected vs unrelated work completions/refusals, interruption and
p50/p95/p99 latency, useful adoption, outstanding/duplicate effects,
reconciliation debt, heap/RSS/FD/listeners, retained assets, and author
time/steps. For fleet use accepted/active/waiting units, oldest eligible wait,
control lag, fairness, pending bytes, provider and DB pressure. Set concrete
fixture budgets and comparison thresholds before running, based on the real
selected workload and baseline. Unrelated work must keep its promised
admission and authority; no double effect, unauthorized effect, or false
cleanup/activation success is acceptable. Do not invent numerical SLA or
global superiority from source reading or small CI timings. If a proposed
mechanism is slower, heavier or less reliable without user benefit, retain
the simpler qualified baseline or narrow the stronger profile.

## 12. Open decisions and seven-round improvement record

The owner requested seven **subsequent substantive revisions, each triggered
by a new owner message**. This initial version establishes the proposal;
it does not count as any of those seven. Keep one plan, push meaningful
deltas in the same planning stream, record the finding, correction, affected
owner, evidence, estimate/scope delta and remaining uncertainty. A repeated
status check or cosmetic edit does not count. If a choice requires product
policy, present alternatives with R/U/C, P/T, effort and rejecting evidence;
continue independent plan improvements. Do not silently select untrusted
support, downtime or old-client windows. After the seven actual owner-triggered
revisions, review and publish the consolidated plan through its normal gates.
**The user's updated goal then continues into implementation and E2E delivery.**
Do not mark the overall goal complete at the end of the seven planning rounds.

Proposed review lenses (not completed work and not a fixed artificial checklist):
1. Source/owner reuse and precise dependency/placement (completed in v1).
2. Durable state, authority, crash boundaries and idempotency (completed in v2).
3. Lifetime, streams, recycling, concurrent ownership and old/new bindings.
4. Agent handoff, offered-tool contracts and real provider limitations.
5. Trust, artifact/receiver boundaries, native containment and revocation.
6. Authoring/UX, proportional tests and comparative benchmarks.
7. Integrated scope/estimate/schedule, counterexamples, owner routes and
   release readiness; reconcile all prior decisions and remove duplication.

| Revision | Status | Meaningful evidence and change |
| --- | --- | --- |
| v0 | Initial proposal, 0/7 | Existing owner sources, five follow-up slices, early architecture TODOs, estimates and scope-limited acceptance. No runtime code or new test execution claimed. |
| v1 | Completed, 1/7 | First new owner continuation. Reviewed exact GM public plan/emitter/Assembly run and LMU single-domain invocation/authority source. Fixed false assumptions about equal graph digests, partial live assembly, unscoped identities, borrowed owner disposal and cross-domain atomic update; added bounded implementation sequence, refusal/stop criteria, C estimate breakdown and three nonduplicated test groups. No new production code or owner API adopted. |
| v2 | Completed, 2/7 | Reviewed actual LMU synchronous admission, preparation and original authority receipt laws, EF ADR-0011, Orchestrator ADR-0095 and Runtime S2. Fixed intent ordering before startUpdate, specified owner-scoped durable facts, visibility barrier, recovery/revocation and exact attempt/physical custody, compared durable alternatives and executed the bounded abstract visibility discriminator. B estimate retained; no native E2E or new public contract claimed. Owner extended the overall goal to actual end-to-end implementation after round 7. |
| v3–v7 | Await actual new owner turns | Record real changes and dispositions only after each respective round. |

### Implementation continuation and completion ledger

After v7, continue the actual authorized work rather than stop at a merged
document. Re-read selected owner decisions and live source/PR state.
Coordinate with ongoing EF #70, LMU #12 and required admission/toolchain
owners; reuse their completed work without expanding unrelated scope or
starting parallel competing implementations. Deliver A–F and each of the
five required follow-ups G/H1/H2/I/J through the selected bounded profile,
plus C0–C3 and applicable product seams of §9, in the established owners.
Choose a real supported provider for H2 and a real enforcement target for I;
conditional alternatives and out-of-scope profiles are not requirements to
implement every incompatible option. If a choice still changes a product
promise or no supported mechanism exists, present concrete alternatives
with R/U/C, LOC and evidence, then continue independent work.

For each slice maintain one actual owner implementation PR (combine related
changes when suitable), code commits, selected dependency/adoption receipts,
native positive/negative E2E, actual review dispositions, final-head checks,
ordinary merge and applicable resulting-main/release/consumer verification.
The plan is not a release gate or permission to weaken existing protections.

| Completion phase | Current state | Required result |
| --- | --- | --- |
| Planning review v1–v7 | 2/7 | Seven substantive owner-message rounds, accepted applicable design choices, reviewed plan and published navigation |
| Shared foundation A–F | Not delivered by this planning PR | Actual selected installed journey and qualified lifetime/durable/native owner contracts |
| Five follow-ups G, H1, H2, I, J | Not delivered by this planning PR | Each selected profile implemented and exercised through its actual owner/native/product E2E, including supported failures |
| Runtime C0–C3 and applicable product adoption | Not delivered by this planning PR | Actual scoped capacity, control, recovery and relevant integration proof; no automatic larger fleet claim |
| Overall goal | In progress | All selected implementation scopes complete with actual evidence and existing delivery gates; planning completion alone is insufficient |

The goal is a useful, smaller, safer implementation with proven behavior,
not seven rounds of adding text. Delete unnecessary layers or tests when
the review proves they provide no distinct useful guarantee. Keep decisions
in their existing owners; this document remains the one cross-owner
implementation coordination plan.
