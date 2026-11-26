# Foundation delivery plan

Status: proposed sequence, corrected after the owner's 2026-11-24 clarification;
modular authoring implementation checkpoint added 2026-11-26.
Qualify the modularity, plugin and live-update foundation through representative
fixtures, discriminating spikes and independent test Hosts **before a dependent
application adopts that profile**. This does not
make every future profile a gate for all applications. Waiting applications are
later consumers; selecting or implementing a first product feature is not a
prerequisite for this work.

Browser, desktop and untrusted third-party extensions are confirmed architecture
targets. Their placement, authority, state and lifetime boundaries constrain the
design now. A supported runtime, security boundary or continuity guarantee still
requires its own executed qualification. No public API, production package,
consumer pin migration or product admission follows from this plan.

## Outcome and working rules

Give many applications a reusable foundation without making each application
invent composition, artifact admission, update coordination or resource cleanup.
Keep one owner for each mechanism and qualify observable useful behavior through
real package/runtime boundaries, even when the consumers are purpose-built test
Hosts rather than products.

Use [application foundation](../architecture/application-foundation.md) for the
handoff, [headless plugins and UI](../architecture/headless-plugins-and-ui.md)
for portability, [operation](../architecture/operation.md) for the full update
operation, and [open decisions](../decisions/open-decisions.md) for profile
choices. The [qualification matrix](../research/foundation-qualification-matrix.md)
owns the concrete scenarios, independent oracles and reset requirements.

The [first-operation implementation plan](first-operation-implementation-plan.md)
expands F4 into L0–L7 phases and steps, prerequisite contracts, focused E2E and
negative controls, nonadditive estimates and exact blocked work. It is the
implementation handoff; this page remains the cross-foundation dependency map.

- Start with representative behavior and explicit test-Host ownership. Do not
  start an application merely to obtain a consumer name.
- Use existing supported public mechanisms. A missing public primitive remains
  a named gap with its owner; a mock or copied private kernel cannot close it.
- Keep mechanism probes, integrated fixture qualification, public delivery and
  production adoption separate. A realistic fixture is useful evidence without
  pretending it is a production installation.
- Complete a bounded scenario, including rejection and recovery, before claiming
  that scenario. Research independent runtime/trust/UI questions in parallel.
- Keep the core independent from UI, platform APIs and composition registration.
  Extract packages when dependency, release or reuse evidence warrants them.
- Use strict TS 7.0.2+ and inspect emitted declarations, public imports and the
  actual embedded compiler graph. Preserve historical inputs and failures.

## Two-executor assignment, 2026-11-26

The owner expanded the next task from the small independent-consumer experiment
to two substantive foundation implementation streams. This section coordinates
their existing owning plans; it does not duplicate their technical steps,
accept unresolved production choices or claim that the work is implemented.
The paired Draft PRs contain the proposed assignments until merged.

| Executor | Owning plan and responsibility | Explicit boundary |
| --- | --- | --- |
| A: author of the coordinated plans | [EF delivery plan](https://github.com/agent-teams-ai/extension-foundation/blob/main/docs/architecture/plugin-delivery-plan.md): package-evidence verifier, admitted contribution/compatibility core, artifact verification and EF consumers; small GM adoption follow-up | No LMU update algorithm, product canonical store or simultaneous edits to B's fixture |
| B: continuation of LMU #8 | [Complete-operation plan](first-operation-implementation-plan.md#workstream-b-complete-module-updates-2026-11-26): external consumer, invocation/state boundary, L0–L7 operation, independent Hosts and final cross-library scenario | No duplicate artifact verification, GM graph engine or new cleanup framework |
| Existing product owners | Product-specific contracts, actual grants/state/custody, selected pins and later useful-behavior integration | This programme does not migrate or begin business implementation in their repositories |
| Existing tooling owners | Managed cohort and repository admission where actually required | Do not rewrite another agent's active upgrade or infer its completion from a plan |

The existing [PR #8](https://github.com/agent-teams-ai/live-module-updates/pull/8)
remains B's bounded initial checkpoint. It is based on the delivered navigation
from #7. A supplies proposed contracts/artifacts through the EF workstream rather
than editing B's branch. Every shared-file handoff records current source SHA,
changed paths, owner and next unfinished step. Review an existing implementation
before adding an overlapping one; published plans do not disclose unpublished
work in another agent's workspace.

### Work that can start together

1. A compares and records the existing EF-A/C/V/P candidates, builds the genuine
   evidence-verifier route and corrects the GM copyable adoption profile.
2. B completes #8, selects its fixture/profile packet and runs L1's real
   invocation/authority/cleanup discriminators. It reports only actual missing
   public mechanisms to A or their semantic owner.
3. A develops the admitted EF core/artifact path while B develops the standalone
   complete operation over qualified narrow ports. Neither core waits for an
   entire application, catalog service or the other's optional integration.
4. After both artifacts qualify, B owns one installed combined scenario; A
   reviews artifact/compatibility/authority facts. It must use the real EF and
   LMU implementations and preserve independent external witnesses.

The shared contract review fixes distinct semantic, artifact, generation,
attempt and authoritative-revision identities; whole-operation ownership;
compatibility/refusal/unknown/debt meanings; and who enforces current effects.
Use existing owners and ordinary narrow ports. No universal context, duplicate
manifest or shared mutable authority is added to connect the two libraries.

### When projects can use the result

| Capability a project needs | Required foundation checkpoint | Later work it need not await |
| --- | --- | --- |
| Ordinary static modules and independent feature consumers | Existing admitted GM/CMS/FMS, complete public contracts, the applicable #8/adoption proof and the project's real boundary checks | Artifact installation, live updates, isolation and universal UI |
| Replaceable entry designed for later updates | Qualified invocation/state/ownership facade from B1/B2 plus the project's accepted profile | Every stronger runtime profile; full update behavior is not claimed before B3–B6 |
| Typed contributions from verified artifacts | A's admitted compatibility/artifact path plus the selected trusted Node Host authority and applicable package/profile gates | A catalog product or full live replacement when restart is sufficient; durable installation is a separate E4/E5 obligation |
| Complete cooperative updates | B's L0–L7 qualification for the selected actual target | Durable recovery, hostile-code isolation or streams unless the product needs them |
| Updates of EF-verified artifacts in a trusted Node Host | Both artifacts and the separate combined B7 evidence | Durable extension installation and unrelated stronger profiles, neither of which this row claims |

A checkpoint means actual accepted contracts, substantive code and executed
evidence for that scope. Empty types or a mock do not make an API ready. Product
pins and adoption are never changed centrally by these examples. The same
semantic feature ports should survive stronger implementations because their
state, effects and lifetime owners were explicit at the initial boundary.

The detailed non-overlapping estimates belong to the two owner plans. Their
current combined investigation band is approximately **15,400–30,500 handwritten
production/integration/test lines**, including the existing #8 estimate once.
This is not a target or measured remaining work. Source reuse can reduce it;
missing upstream primitives, bootstrap, durable authorities or native profiles
have separate estimates before dependent commitments. Do not sum older
overlapping estimates or create code to reach the range.

Two independent plan-review rounds cover the pair and their join. The paired PR
descriptions retain exact reviewed heads, findings, fixes and documentation
checks. Runtime evidence, ordinary implementation merge and actual-main checks
belong to the later substantive delivery; this planning task creates none.

## 1. Dependencies between claims

| Stage | Entry and result | What it does not wait for |
| --- | --- | --- |
| F0: architecture and discriminators | Confirm required target boundaries, contract owners, alternatives and falsifying tests | First product selection or implementation |
| F1: static foundation fixture | Real public composition and independently specified useful outcomes within a bounded envelope | EF runtime/SPI, full LMU or all future platforms |
| F2: headless portability | The claimed shared behavior/contract in independently wired test Hosts; the same artifact when that is the promise, or each actual target build | Production adoption or a mandatory UI |
| F3: installable-plugin fixture | Applicable artifact/trust/installation mechanisms and Host enforcement, qualified for the claimed profile | A complete product or a live-update promise when restart suffices |
| F4: complete update-operation fixture | Supported public primitives and one cohesive operation with adverse controls | First real application feature |
| F5: stronger profile qualification | Actual browser/desktop, isolation, durable recovery or continuity evidence for the corresponding promise | Unrelated optional guarantees |
| A: application adoption | Product owner accepts an already qualified scope and its own integration/gates | Every stronger profile, unless that product requires it |

These are dependencies between claims, not one serialized project schedule.
For example, the actual-browser F2 row can execute immediately alongside static
composition work; listing stronger guarantees under F5 does not postpone it.
Two configurations of one Host are useful F1 evidence, not F2 independence.
Two Hosts using one behavior implementation are not two independent public SPI
implementations. The applicable EF public SPI gate remains separate. An ordinary
headless library does not acquire that gate merely because it is portable.

## 2. F0 — settle boundaries before dependent applications

**Owner:** the shared foundation workstream and existing semantic/package owners.
**Current delivery:** architecture, critique, representative fixture design and
bounded test work; no full production runtime implementation.

| Required design topic now | Decision or discriminator |
| --- | --- |
| Module, extension and update ownership | GM owns composition; EF owns applicable artifact/trust protocols; LMU owns the proposed shared update operation; Hosts retain authority and canonical state |
| Browser and desktop targets | Inward portable behavior; target-local loaders, storage, UI and IPC; no platform-only types in the core's public declarations |
| Untrusted third-party execution | Admission before evaluation, narrow granted capabilities, last-mile enforcement and an actual containment/termination boundary |
| State and lifetime | Canonical and private state owners, borrowed versus owned resources, drain/cancellation/stop distinctions and cleanup debt |
| Test independence | Handwritten expected behavior and external effect/receipt observations, not the implementation's own reducer as oracle |
| Delivery and admission | Exact package/source/tool identities, existing owner gates and separate later product adoption |

The targets are confirmed; the exact desktop shell, isolation mechanism, UI
vocabulary and Q1–Q7 policies for each profile still need comparison and evidence.
Do not turn those narrower choices into a renewed question about whether browser,
desktop or untrusted plugins should exist.

## 3. F1 — representative static foundation qualification

**Owner:** library qualification maintainers and test-Host owners. **Entry:**
a substantive representative contract, exact compatible public artifacts and
supported compiler/runtime. A test Host owns its state/lifetime just as a real
integration must, but does not claim a product's authority.

| Work | Acceptance and rejecting evidence |
| --- | --- |
| F1.1 Model representative seams | Independently assembled capabilities, fixed helpers and borrowed providers have explicit roles; no graph node per helper or universal service bag |
| F1.2 Pack and import | Actual public roots and emitted declarations resolve outside source aliases; optional UI/framework dependencies are absent from the headless closure |
| F1.3 Construct two meaningful profiles | Expected useful behavior is independently specified; invalid bindings/revisions reject before factory effects |
| F1.4 Preserve feature boundaries | Existing applicable FMS/CMS source checks cover nesting, direct-parent assembly, explicit republication, composition-only imports and cycles |
| F1.5 Prove owned lifetimes | Partial/late setup, borrowed owners, reentrancy, drain, cancellation and cleanup debt use actual mechanisms and concrete external witnesses |
| F1.6 Bound the envelope | Record tree depth, entry/group counts, workload, processes and compile/runtime budgets; a larger unsupported row remains separate |

Pure or borrow-only capabilities need no artificial resources. Test the actual
resource owner where that guarantee applies. The same expected decision must not
be calculated by the production compiler/admission helper under test.

**F1 exit:** a qualified representative static profile with reproducible source,
package and positive/rejecting evidence. This establishes a foundation contract
within its stated limits, not a completed product, stable public SPI or live
replacement. Known browser/desktop/security boundaries remain design constraints
even when the first executed row covers only Node.

The [reviewed modular authoring plan](module-authoring-implementation-plan.md)
selects the current bounded F1/F2 implementation in the
[portable-document reference](../../tests/qualification/portable-document/README.md):
Document, Format and Export in an ordinary core, plus a separately packed adapter
using public GM. Two built-in format providers and a consumer-authored third provider
exercise selection without changing document/export behavior. Source checks
govern three flat features per artifact; no new nested-profile result is claimed.
The public-package discriminator, source guards and full modular Host/restart
suite passed at corrected source `6b22e4b`; independent source reviews report GO
within the declared profile. The
[evidence matrix](../research/foundation-qualification-matrix.md#modular-authoring-checkpoint-2026-11-26)
records current and historical results.

## 4. F2 — independent test-Host portability

**Owner:** capability contract and qualification maintainers. **Entry:** useful
behavior and its required semantics, not a nominated application.

1. State whether the promise is reuse of one built artifact or of a shared
   contract across target builds. Inspect each actual runtime/declaration closure
   without optional UI, GM or platform packages unless they belong to an
   explicitly selected adapter.
2. Connect the claimed behavior to two independently wired Host entry/composition,
   state, authority and lifetime paths. Use the identical artifact for a
   same-artifact claim; otherwise qualify each target build against the shared
   contract. Two instances of one configurable Host builder are not automatically
   two independent integrations.
3. Use externally observed useful outcomes and independently authored expected
   receipts/effects. Share contracts and test input grammar where useful; do
   not share the decision implementation between actual and expected results.
4. Cover missing capability/revision, revoked authority, partial setup and
   ownership boundaries where the selected profile promises them.
5. Reset concretely and rerun in both Host orders. Record exact runtime and
   execution placement, cleanup witnesses and unsupported guarantees.

A browser runtime claim requires the artifact bytes to execute in an actual
browser realm. A browser UI calling a Node service proves a UI/transport path,
not browser execution of the shared core. Desktop requires its selected actual
shell/IPC/OS path; Node EventTarget is not browser or desktop qualification.

The bounded [portable document fixture](../../tests/qualification/portable-document/README.md)
retains the ordinary core-only Node/browser cases and now contains independent
modular Host adapters. Canonical state and receipts stay with their Host across
controlled restart; module-owned files/listeners use Resources. Stop ingress,
drain admitted work and await the original complete close before constructing a
successor. This profile has no live A/B overlap or complete LMU update operation.
The [current evidence record](../research/foundation-qualification-matrix.md#3-exact-portable-document-result)
records the corrected scoped execution separately from earlier checkpoints.
Historical Q1–Q3 and six-test evidence remain bound to their original sources.
There is no EF runtime integration or production npm release in this reference.

### Optional UI qualification

Compare Host-native rendering, a small semantic contribution through a suitable
existing contract, and custom UI where needed. Use a representative interaction
before any real application. Portable behavior, unstyled widget behavior,
framework independence and process independence are different claims.

For portable declarations, exercise the same supported intent through two
independently implemented presentations. Test required unsupported controls,
current action grants, dirty state, focus/keyboard/accessibility, stale results
and original command identity. No universal renderer, expression language or
UI schema is selected by this plan.

## 5. F3 — installable-plugin qualification

**Owner:** EF for applicable artifact/trust/protocol mechanisms; test Host for
grants, state, target-local loading and effect enforcement. **Entry:** the
corresponding supported mechanism and owning materialization/admission basis.

| Claim | Evidence before marking it qualified |
| --- | --- |
| Artifact/import closure | Exact executable and lazy bytes, compatibility and applicable provenance verified before evaluation |
| Installation/grants | Requested capability, installation identity and current grant remain distinct; denied execution/effects are observed as absent |
| Invocation | Semantic errors, revocation, cancellation and stream/backpressure obligations match the selected placement |
| Disable/uninstall | New admission stops; actual cleanup/stop is observed; unrelated canonical data survives and private-data policy is explicit |
| Isolation | Adversarial file/network/IPC/resource/escape attempts are tested against the selected enforcement boundary; a process or Worker label is insufficient |
| Public SPI | Applicable independent implementations, conformance and external-use/version policy remain with the owning admission gate |

A protocol spike can falsify a design before the runtime exists; it cannot be
reported as a qualified installed-plugin path. The absence of that runtime
does not block F1/F2 ordinary-library qualification. Use
[EF OD-003](https://github.com/agent-teams-ai/extension-foundation/blob/5ee8a788935c885fac075a5860a0217cf420b4d7/docs/open-decisions/OD-003-module-runtime-and-public-spi-choices.md)
and accepted owner decisions rather than invent a public SPI in a fixture.

## 6. F4 — complete live-update operation in a representative Host

**Owner:** LMU operation and existing composition/lifetime/authority mechanisms.
**Entry:** explicit fixture profile, applicable Q1–Q7 semantics, qualified public
primitives and the owning implementation/bootstrap rules. No first product is
required; no mock may stand in for the guarantee being qualified.

| Work | Required positive and rejecting result |
| --- | --- |
| F4.1 Atomic admission | One qualified select-and-retain boundary across reentrancy, nested calls, awaits and stream continuation |
| F4.2 Prepare | Custody precedes supported acquisition/evaluation; failed B preserves A where the profile promises it |
| F4.3 Publish/reconcile | Expected-revision mutation binds the original attempt; lost reply remains unknown until authoritative original receipt resolves it |
| F4.4 State/effects | Canonical owner checks current schema/grants/write fencing; stale writers and duplicate effects are rejected |
| F4.5 Useful adoption | New work uses B while authorized A work remains coherent; import/head selection alone is insufficient |
| F4.6 Retire/retain | Original cleanup flights and debt remain reachable; runtime/artifact/client holds prevent premature deletion |
| F4.7 Complete shared operation | Independent test Hosts supply narrow primitives, not copied update state machines; packed external conformance passes |

An in-memory fixture records its Host-loss limit. A durable fixture must execute
its actual transaction/receiver recovery boundary and fault schedule. Local
SQLite witnesses do not qualify a different PostgreSQL/distributed profile.
Native Effect/Wasm remain separately qualified candidates; no universal callback
facade may erase their real errors, scopes or execution semantics.

## 7. F5 — qualify the confirmed targets and stronger guarantees

Browser, desktop and untrusted-plugin work is part of the foundation programme,
not work postponed until applications request it. Separate rows establish:

- actual browser execution and compatible client/backend contracts;
- actual desktop renderer/main/native-resource and IPC ownership;
- enforced containment, capability limits and actual stop for hostile code;
- declared UI continuity, old-client assets and accessible interaction;
- durable publication, receiver receipts and restart recovery;
- bounded long-lived work, streams and retention;
- foundation/Host replacement through an outer qualified recovery owner.

Research these independently where their dependencies allow. A supported static
or cooperative row does not inherit unexecuted isolation or live-continuity
claims. Choose explicit rejection, restart or defer behavior for unsupported
transitions; do not create a global cross-tier state machine or fleet lock.

## 8. A — later application adoption

Applications consume qualified profiles through their own contracts and gates.
A purpose-built external fixture is sufficient for its declared library test
claim; it is not an adoption record for Orchestrator, Runtime or another product.

For example, inspected Orchestrator
[ADR-0117](https://github.com/agent-teams-ai/agent-teams-orchestrator/blob/c6ce98cd1a8ac1dd27ec877c018e5aa7cd5adff7/docs/decisions/0117-reconcile-mandatory-module-composition.md)
and its [pending foundation gate](https://github.com/agent-teams-ai/agent-teams-orchestrator/blob/c6ce98cd1a8ac1dd27ec877c018e5aa7cd5adff7/docs/architecture/implementation-readiness-gates.md#module-foundation-before-business-expansion)
retain their accepted Core/Assembly 0.5.0 baseline. That product reconciles its
actual seams, pins, source checks and behavior before expansion. Its pending gate
does not block the shared fixture-first work, and shared fixture success does
not mark that gate passed. A smaller qualified profile does not imply that the
separate 100/500/1,000 growth envelope passed.

## 9. Evidence, cost and execution order

The [matrix](../research/foundation-qualification-matrix.md) records exact current
coverage. Reuse historical P1–P12/X1–X4 as mechanism controls without relabelling
their 12 unique cases/24 executions and 4 browser cases as complete library E2E.
Keep the first 3/4 browser failure and its acknowledgement limitation.

| Incremental scope | Production LOC | Fixture/test or documentation estimate | Complexity / estimate confidence |
| --- | --- | --- | --- |
| This fixture-first documentation correction | 0 | About 450–750 changed/added prose lines; actual reviewed diff supersedes estimate | 5/10 / medium |
| Original ordinary portable-document profile | 0 | Original plan estimated 150–240 fixture/Host TS lines plus 250–400 packaging/test TS lines; workflow/config separate | 4/10 / medium |
| Scoped modular authoring reference | 0 | The [reviewed implementation plan](module-authoring-implementation-plan.md#6-delivery-cost-and-review-record) owns the combined reference, Host, source-check and EF qualification estimate; actual delivery count remains separate | Owner-scoped / medium |
| First complete bounded LMU operation | Earlier planning range 3,000–6,000 | Earlier 4,000–9,000 test LOC; admission, other profiles and product adoption excluded | 8/10 / low |
| Desktop, isolation or new public UI/SPI profile | Not responsibly fixed before mechanism selection | Discriminating spike first, then owner-specific estimate | Scope-dependent |

These are nonadditive planning ranges, not measured reliability or readiness
percentages. Realistic fixtures can decide architecture and constrain estimates
before products exist. Uncertain target-specific costs must remain visible.

## 10. Review and delivery

Critique the plan and exact content from architecture, semantic contract,
security/recovery, runtime/operations and author ergonomics perspectives. Use
the matrix's Clean/SOLID/DDD/DRY failure criteria. Preserve input identities,
findings and corrections in the
[successor review](../reviews/fixture-first-foundation-2026-11-24.md).

Publish reviewed checkpoints, observe exact-source required checks, and verify
merged bytes. Do not change gates, pins or retry budgets to obtain a pass.
A docs-only correction does not justify rerunning unchanged historical campaigns;
a new executable fixture needs its own actual source/runtime/negative evidence.

Compare useful behavior with a fair static/restart baseline. Record authoring
glue, duplicate logic, candidate-to-useful latency, interruption, lost/duplicate/
unauthorized effects, recovery and retained-resource bounds where relevant.
Set thresholds for the fixture's declared envelope before qualification; product
SLOs are selected later by each adopting owner.
