# First complete operation: implementation plan

Status: proposed execution plan, 2026-11-25. The owner requested detailed phases,
independent critique and recorded unresolved questions before risky implementation.
This plan makes the existing F4 work executable; merging it does not select a
runtime policy, publish an API or admit a production package.

The [operation contract](../architecture/operation.md) owns the required semantics,
the [decision register](../decisions/open-decisions.md) routes open choices to their
owning decisions, and the
[foundation plan](foundation-delivery-plan.md) owns F0–F5 dependencies. This page
owns implementation steps and their handoff. Keep these roles separate instead
of copying another architecture standard or live release ledger.

## 1. Deliverable and current starting point

Deliver one reusable operation that prepares candidate B, coordinates an
authorized switch from A, reconciles an unknown publication, observes useful B
behavior and retains A's work/resources until their real owners permit release.
Independently wired test Hosts provide narrow primitives; they do not each
implement the update algorithm. No application must be implemented first.

At LMU [6083e89](https://github.com/agent-teams-ai/live-module-updates/tree/6083e89ba7781b12571a102d273058052ad94148),
the [packed document qualification](../research/foundation-qualification-matrix.md#3-exact-portable-document-result)
proves bounded F2 behavior. There is no production update runtime. Its six tests
and twelve rejecting controls do not prove A → B, atomic invocation admission,
durable recovery or production plugin installation.

Use the current [GM public Assembly bridge](https://github.com/agent-teams-ai/get-modular/blob/330c28dbea1a3de812d3aee5ddb71ef829dee347/docs/decisions/0043-plan-optional-native-effect-composition.md)
and [Resources](https://github.com/agent-teams-ai/get-modular/blob/330c28dbea1a3de812d3aee5ddb71ef829dee347/packages/resources/README.md)
where appropriate. Runtime module lists and inert declaration/factory capture
already exist. Artifact trust, grants and execution authority remain outside
GM. Resources already joins its current close flight; an adapter must preserve
the original completion, including debt, rather than invent another cleanup
stack. The [lifecycle candidate](https://github.com/agent-teams-ai/get-modular/blob/330c28dbea1a3de812d3aee5ddb71ef829dee347/packages/lifecycle-kernel/README.md)
is private and does not itself select a current route or supervise asynchronous
work. Qualify an existing supported path or request a narrowly justified change
at its owner; a new public kernel is not an unconditional prerequisite.

The maintained [EF plan](https://github.com/agent-teams-ai/extension-foundation/blob/main/docs/architecture/plugin-delivery-plan.md)
owns artifact/installable-plugin work; its detailed implementation successor is
tracked in [EF #67](https://github.com/agent-teams-ai/extension-foundation/pull/67).
The inspected source baseline remains `86c01a9`, not a changed adoption pin.
Ordinary-library LMU qualification need
not wait for a universal plugin Host. A profile that claims EF admission must
use its actual admitted mechanisms and exact production-admission basis.

## 2. First-profile packet before dependent code

Complete this packet in the owning decision record. Link it from the eventual
implementation PR; an agent resuming that PR reads the packet and the unfinished
step below before changing code. Accepted strategic direction is not reopened.

| Packet field | Required concrete content |
| --- | --- |
| Useful capability and independent Hosts | Versioned query/edit or another representative contract; independently specified useful A/B outputs; distinct Host entry, authority/state and lifetime paths |
| Runtime, trust and dependency cohort | Exact supported runtime/compiler/public artifacts; admitted trust; import/shared-realm constraints; claimed and unsupported guarantees |
| Replacement unit | Exact coherent capability/dependency cohort, captured references and borrowed owners; use existing composition facts |
| State and work policies | Applicable Q1–Q7 choices, state schemas/baselines, admitted-work policy, returning-to-old-code meaning and retention budgets |
| Authority and identity | Owner of the current head, expected-revision mutation, same-attempt receipt lookup and receiver write checks; installation identity only where applicable |
| Completion and failure | Separate publication, useful adoption, old work, cleanup/debt and retention results; Host-loss limit or selected durable recovery |
| Delivery boundary | Proposed package/export scope, external-consumer proof, applicable bootstrap/admission and precise dependency on upstream work |
| Acceptance | Named positive/adverse cases, external witnesses, fixture budgets and reset; evidence needed to reject the chosen option |

An inapplicable policy needs a reason tied to this profile; it is not silently
implemented as an empty method. For example, an in-memory request profile can
declare offline-client recovery unsupported. It cannot imply that the confirmed
Desktop or untrusted-execution targets were removed from the architecture.

### Credible first-profile alternatives

These are recommendations for an owner decision, not production defaults. All
three keep the same complete-operation responsibility. Compare broader runtime
targets through the parallel work in section 8, rather than make one local
operation promise every deployment guarantee.

| Option, ranked for the next discriminator | Boundary and benefit | Principal risk and falsifier |
| --- | --- | --- |
| A. Cooperative TS request with retained asynchronous work | Host retains canonical state; useful B is the next request; one held A operation crosses an await and nested/reentrant call. Reuses the current document family with a bounded extension | Reject if actual supported invocation/authority primitives cannot retain the whole operation; this does not qualify streams, physical forced stop or restart recovery |
| B. Cooperative TS execution session with a bounded stream | Exercises continuation through actual iterator consumption, cancellation and borrowed-provider lifetime; better first discriminator when long-lived sessions are essential | A returned iterator may outlive the Promise that created it. Reject on early release, cross-generation nested work or unbounded retention; no replacement of Runtime's domain/executor |
| C. Durable operation over an existing authority store | Adds original-attempt publication and actual process-loss recovery using a selected existing transaction/receipt owner | Requires real durable primitives first. Reject if lost acknowledgement or restart causes duplicate effects, premature cleanup or a second canonical head; a file/SQLite probe cannot qualify another store |

**Conditional recommendation:** evaluate A first if it exposes the selected
public mechanism gap and the owner's next guarantee permits the stated limits.
Choose B when stream lifetime is necessary to decide the architecture; choose C
when process-loss recovery is a first-delivery requirement and its owners exist.
Each option still needs its applicable Q1–Q7 decisions. A bounded first delivery
is not the long-term ceiling. Do not call the narrower option more reliable in
the broader options' failure envelopes.

## 3. One feature and its source responsibilities

The first production bootstrap must satisfy [BOOTSTRAP](../../BOOTSTRAP.md) and
the actual current organization/FMS admission route. Review that route before
creating production source; old tool-version observations are not current pins.
Choose real feature/source mappings with the first substantive implementation,
not empty packages or directories reserved for each diagram box.

| Responsibility | Prospective source area and dependency rule |
| --- | --- |
| Attempt facts, supported transitions and semantic errors | One `update-operation` feature's inner model; no DOM/Node, GM construction types, database SDK or organization services |
| Complete update use case | The same feature's application layer and its needed ports; owns planning through reconciliation/retirement once |
| Composition/lifetime integration | Outer adapter using supported public owners; maps their actual identities/results and preserves native completion semantics |
| Publication/state integration | Host-owned authority/state adapters; owns canonical mutation, schema/grants and actual receiver effects, not the LMU algorithm |
| Public composition root | Wires the supported operation/profile; excludes optional renderer/runtime dependencies from the ordinary entry and emitted declarations |
| Qualification | A complete-operation fixture family with independently wired Hosts, separately authored expected outcomes, external effect/work observations and a packed consumer |

These are ownership areas, not prescribed package names. Planning, preparation,
reconciliation and retirement can stay cohesive within one feature. Extract an
adapter/package only when independent dependency, release, trust or reuse makes
the boundary useful. Keep native Effect/isolated executors optional and native;
ordinary external consumers acquire no mandatory Agent Teams credentials,
database, event bus or optional framework.

## 4. Phases and dependencies

| Phase | Depends on | Reviewed result before the dependent phase |
| --- | --- | --- |
| L0. Select profile and record contracts | Current source/owner inspection | Completed section 2 packet; open disputes identify only the affected step |
| L1. Qualify required primitives and bootstrap | Applicable L0 choices | Actual supported dependency path, narrow mechanism controls and eligible production source/tooling route; bootstrap lands with the first substantive L2 source |
| L2. Implement semantic contract | L0 and the required L1 findings | Typed states/results/ports and one transition policy; adverse cases written independently |
| L3. Plan and prepare candidates | L2 plus qualified loader/custody | Candidate ownership before evaluation; stale/failed/late preparation preserves all obligations |
| L4. Publish and reconcile | L2 plus real authority contract; L3 for integrated execution | Expected-revision publication and original-attempt uncertainty resolution |
| L5. Adopt, retain and retire | L3–L4 and invocation/resource contracts | Useful B, coherent admitted A, exact-instance cleanup/debt and bounded holds |
| L6. Qualify complete packed operation | L3–L5 | Independent Hosts execute the same library operation and relevant rejecting controls |
| L7. Deliver the supported scope | L6 and applicable publication rules | Reviewed package/source/provenance and exact required checks; documented support and unsupported results |

This is a dependency graph, not a requirement to serialize all research. L1
mechanism comparisons, L2 contract review, external-consumer packaging design and
section 8 target work can proceed independently when they do not assume an open
policy. Production code depending on an unsettled contract waits for that
contract; independent qualified work within the assigned scope continues. L7 does
not retroactively waive production bootstrap obligations in L1.

### L0 — select the next useful guarantee

1. Re-read exact GM/EF/public-owner sources and actual package availability;
   record which observed mechanism satisfies each required port.
2. Complete the profile packet and identify every applicable Q1–Q7 choice.
   Keep engineering comparisons separate from decisions about user-visible
   continuity, interruption, state and data retention.
3. Write one useful A → B scenario and a fair static/restart baseline. Set
   fixture limits for concurrency, retained generations/work, cleanup waiting
   and artifact/client retention before measuring them.
4. Map unresolved items to section 7. Do not expand implementation scope to
   avoid an unsupported guarantee or manufacture a default for missing policy.

**Exit:** a selected bounded contract and independent expected behavior. A
documentation checkpoint can land with a recorded question and exact blocked
step, but that does not complete L0 for the affected implementation. L2–L5
readiness requires their selected packet; independent work continues.
Documentation merging alone is not this exit and does not accept a public API.

### L1 — establish real seams before a coordinator depends on them

1. Prove atomic selection/admission/retention in the selected execution domain.
   Exercise synchronous reentrancy, nested calls and awaits. Add actual iterator
   consumption/return/error only if the profile claims streams. Reading a head
   and retaining it after an await does not qualify this boundary.
2. Bind the selected composition result to exact factory/loader identities.
   Verify no candidate evaluation occurs before its attempt owner exists;
   record the trust/import rule for unregistered top-level effects.
3. Observe the original native cleanup completion. Test pending cleanup,
   rejected cleanup/debt, caller deadline and later retry separately. Preserve
   the original `close()` flight; a later close after settled debt may be a retry.
4. Prove the selected authority store's revision and same-attempt receipt
   semantics. A local mutex is not multi-process publication authority.
5. Complete applicable production bootstrap with exact source mappings, strict
   TS 7.0.2+ coverage, development-only tooling and actual eligible tool graph.
   Recheck consumer identity and hosted enforcement separately from local success.
   The bootstrap and first substantive L2 implementation land in the same reviewed
   change; an empty package/feature is not an earlier milestone.

**Exit:** real positive/rejecting evidence for each primitive the profile needs.
No private imports/copies, declaration shims or weakened checks close a gap. An
upstream contract change remains with that semantic owner and its own delivery.

### L2 — implement one typed semantic contract

1. Represent capability/closure, generation, attempt, head revision and state
   baseline as distinct identities. Keep exact resource/registration identity
   separate from a stable plugin name or route.
2. Implement independent facts for candidate state, publication outcome, useful
   adoption, predecessor work, cleanup debt and remaining holds. Avoid one
   success flag or monotonically increasing phase number that loses uncertainty.
3. Specify narrow port inputs, outputs, error/cancellation behavior and ownership
   transfer. Include original-attempt/payload binding and unsupported guarantees.
   Validate untrusted boundary data where the selected profile receives it.
4. Compare ordinary typed transitions with the already researched pure XState
   approach only if inspection/transition needs justify it. Keep one rule owner;
   do not create a general workflow language or second event-sourced control plane.
5. Author the expected outcomes in section 5 before wiring effects. Use targeted
   unit tests for transition invariants; integrated oracles remain independent.

**Exit:** compiled selected contract, explicit invalid transitions and reviewable
port obligations. Names and layout become implementation decisions here; the
earlier semantic tables did not freeze a public enum or universal interface.

### L3 — implement planning and owned preparation

1. Resolve the affected cohort through existing composition facts and actual
   state/sharing constraints. Reject unsupported guarantees before evaluation.
2. Capture the plan basis, establish attempt ownership, then evaluate/construct
   through the selected loader and resource owner. Preparation cannot authorize
   publication or a protected product write.
3. Collect meaningful readiness and state compatibility; revalidate mutable
   head/schema/grant facts at their actual authority boundary.
4. Retain failed, partially acquired or late-finishing candidates. A caller
   deadline stops that caller's waiting; it does not erase later acquisitions
   or prove physical stop. Associate their cleanup with the original attempt.

**Exit:** accepted B is ready within its profile; rejected B leaves A useful
where promised, and candidate work/debt remains observable until genuinely closed.

### L4 — implement publication and same-attempt reconciliation

1. Bind each request to the original attempt, exact candidate/payload and
   expected authoritative revision. Same identity with a different payload must
   be rejected; retries cannot create a new attempt to hide an unknown outcome.
   After successful preparation, enforce compatibility-relevant state/schema,
   current grants and head conditions at the selected owner's conditional
   mutation/reservation boundary, or through qualified evidence valid for that
   transition. An earlier check followed by an unconditioned mutation is
   insufficient. A changed basis must reject/replan or follow the explicitly
   supported transition; cross-owner fencing/receipts need their own qualified
   contract, not frozen unrelated data or an invented cross-store transaction.
2. Request mutation through the actual owner. No candidate callback runs inside
   its database transaction. Distinguish committed, rejected/conflicting and
   outcome unknown, including a reply lost after commit.
3. Look up that same attempt through the authoritative receipt path. A current
   head alone may have advanced again and cannot prove this attempt never won.
4. Keep a possibly selected candidate alive while its outcome is unknown.
   Reconcile before replaying a protected effect or treating it as disposable.
5. Exercise two competing updates and independent activation domains. Canonical
   expected-revision authority decides conflicts; selected preparation limits
   and admission/retention budgets remain explicit.

**Exit:** every observed publication is bound to its original input and actual
authority result; unresolved outcomes remain visible. Durable restart is claimed
only after the selected real recovery boundary is executed.

### L5 — coordinate useful adoption, work and retirement

1. Route new work through the qualified atomic selection/admission path. Keep
   the selected generation/cohort across supported nested work and continuations.
2. Observe a real useful B query/effect, not merely successful import or a head
   change. Preserve the selected owner state and verify its actual revision.
3. Apply the chosen old-work policy. Closing new admission, checking current
   write grants/fences, draining and requesting physical stop are separate facts.
   A generation lease does not grant permission for a delayed product write.
4. Preserve exact-instance disposers and original cleanup completion. A late A
   disposer cannot remove B's registration; cleanup failure leaves debt while B
   may remain useful. Do not block independent activation domains on that debt.
5. Combine only the applicable runtime, borrower, artifact/history and old-client
   holds. Deletion requires each relevant owner's release/eligibility; reader
   zero or a timeout alone is insufficient. Enforce the selected bounded policy
   for another update while previous work/debt is retained.
6. Returning to old code is a new authorized compatible transition against current
   state/grants. It does not undo external effects or bypass migration policy.

**Exit:** B usefulness, A work, cleanup and retention are independently truthful,
including refusal/degraded outcomes. The library coordinates the complete path;
the Host does not grow a second transition algorithm around it.

### L6–L7 — qualify, review and deliver

1. Pack the substantive library and compile an external consumer through public
   exports and emitted declarations, without source aliases or private imports.
   Bind retained source, tool graph, package bytes and installed consumer bytes.
2. Run the same operation through independently wired Host authority/state and
   lifetime adapters. Share input/encoding contracts where useful, not expected
   decisions or a copied Host coordinator. Repeat with fresh ownership and both
   Host orders where order can expose cross-Host leakage.
3. Execute the applicable section 5 cases. Preserve original failures and require
   each negative control to fail at its named oracle, not compilation or setup.
4. Review ownership/FMS/DDD, safety/recovery and integration/author ergonomics
   independently. Fix material findings, review their exact corrected source and
   retain unresolved policy questions without falsely marking their claim ready.
5. Publish reviewed commits immediately through the authorized route, keeping one
   PR per owning repository when a PR is needed. Do not rerun unchanged historical
   native campaigns for a prose-only correction. Applicable enforced checks are
   never bypassed; queued, skipped or cancelled is not execution success.
6. Verify merged bytes and support documentation. A package's public release,
   exact artifact conformance and later product adoption remain separate facts.

## 5. Required complete-operation evidence

Select controls for the declared profile; stronger rows cannot be marked passed
by a weaker substitute. The fixture observes actual owner state, accepted effect
receipts, work barriers and resource/registration identity independently of LMU.

| Case | Expected discriminator and external witness |
| --- | --- |
| Normal A → B | Useful B result/state revision for new work; held A remains coherent under the chosen policy |
| Unsupported/stale plan | Rejection before candidate evaluation/protected effect; source of current incompatibility retained |
| Basis changes after preparation | Change head, relevant schema/state baseline or grant after B is ready, including between a preliminary check and mutation; the actual owner enforces the selected conditions at the protected transition |
| Failed/late B preparation | A remains useful; partial or late acquisitions remain owned and their actual cleanup is observed |
| Reentrant/nested/await work | Same admitted cohort across the supported complete operation; no early release at an intermediate callback or await |
| Stream variant | Actual iteration/return/error and finalization retain the right generation; returning an iterator is not completion |
| Lost publish acknowledgement | Unknown stays unknown until same-attempt authority lookup resolves it; no new identity, duplicate effect or early candidate disposal |
| Attempt replay/racing updates | Matching replay follows owner receipt semantics; changed payload rejects; canonical revision decides competing publications |
| Delayed A write/revoked grant | Actual receiver rejects under the selected current fence/grant policy; a library snapshot or call lease cannot authorize it |
| Caller abandons waiting | Caller result is separate from continuing owned work, publication and original cleanup completion |
| Late A disposer/cleanup debt | B registration and borrowed provider survive; failed original cleanup remains inspectable and retry is distinguishable |
| Retention budget | Another update is refused/deferred according to policy; artifacts survive while any actual supported hold remains |
| Incompatible state/return to old code | Explicit refusal or the selected migration/compensation path; no invented reversal of previous effects |
| Durable variant | Fault schedule crosses the actual transaction/receiver and restart boundary; recovery inspects original attempts before effects/reclamation |
| Packed external consumer | Real installed public API/declarations, no optional-runtime leak; no organization credentials required by ordinary library use |

Minimum deliberate defects for the first claimed complete profile: split
select/retain incorrectly; release before held work finishes; misclassify lost
publication as rejection; bypass the real receiver's stale/grant guard; remove
by stable name instead of exact registration; discard original cleanup debt.
Use only the relevant defects when the contract changes their applicability.
Each must produce the intended failure after successful setup. Test reset must
not erase a resource/work failure before observing it.

## 6. Costs and complexity

Ranges are authored/changed LOC planning bands, not measured readiness. P is
LMU production contract/operation code, I is selected outer integration, T is
tests/fixtures. Existing code moved unchanged is not counted as new implementation.
The earlier 900–1,800-line initial slice and 7k–14k broader estimate are different
scopes, not increments to add to this first complete operation.

The following provisional phase allocation fits the retained **3,000–6,000 P /
4,000–9,000 T** bound from the [foundation plan](foundation-delivery-plan.md#9-evidence-cost-and-execution-order):

| Implementation area | P | T |
| --- | ---: | ---: |
| L2 semantic contract and transition invariants | 600–1,100 | 450–1,000 |
| L3 planning/preparation ownership | 650–1,300 | 800–1,800 |
| L4 publication/reconciliation | 800–1,600 | 1,200–2,800 |
| L5 adoption/work/retirement | 950–2,000 | 1,000–2,100 |
| L6 packed complete-operation conformance | 0 | 550–1,300 |
| **First bounded operation total** | **3,000–6,000** | **4,000–9,000** |

This is an implementation allocation to revise after L1, not a fresh measurement.
Upstream primitive changes, production onboarding/tool graph, artifact trust,
real product integration, isolation and durable infrastructure are excluded.
If L1 finds one missing, expose its owner/cost separately; do not hide it inside
an adapter allowance. L0/L1 research and L7 release administration also need their
own effort record rather than being inferred from runtime LOC.

For the substantive first-profile choice, conditional total alternatives are:

| Option from section 2 | P / I | T | Engineer-days | U / N / C; sizing confidence |
| --- | --- | --- | --- | --- |
| A: request plus retained async work | 3–6k / 0.6–1.2k | 4–9k | 35–65 | 8 / 7 / 8; 4/10 |
| B: bounded stream/session | 3.3–6.8k / 0.8–1.8k | 5–11k | 45–80 | 7 / 7 / 9; 3/10 |
| C: durable restart over an existing qualified store | 4–8k / 1.5–3.5k | 7–14k | 55–100 | 6 / 6 / 9; 2/10 |

These are nonadditive engineering estimates for one experienced engineer with
the required qualified primitives available and focused implementation/review.
They include the selected operation/adapters and conformance, excluding generated,
vendored and documentation LOC, missing upstream mechanisms, first production
bootstrap, registry/release administration, new infrastructure and deployment.
They are not calendar commitments. U is confidence in fit for the next selected
goal, N is expected reliability within that row's stated scope, C is implementation
and maintenance complexity (higher is worse). These are ordinal judgments, not
tested availability or a comparison of equal threat/failure envelopes.

## 7. Open items and exact blocked work

The [decision register](../decisions/open-decisions.md) routes Q1–Q7 to their
owning decisions; it remains a discussion/navigation projection. Acceptance stays
with the applicable scope, contract, authority and state owners. This table maps
those choices and technical unknowns to execution; it does not create another
decision authority or require every future policy up front.

| Item / owner | Resolve by | Blocks only | Work that can continue |
| --- | --- | --- | --- |
| First profile and applicable Q1–Q7 — scope owner | Section 2 alternatives and real requirements; record selected/inapplicable cases with reasons | Dependent production transitions in L2–L5 and support claim | Source review, focused mechanism probes, packaging design and independent target research |
| Whole-operation admission — existing invocation/lifetime owner | L1 real reentrancy/nesting/await/stream discriminator; supported Host path or justified upstream contract | Claimed affinity/retention in L5–L6 | State/authority contract and independent preparation/reconciliation design |
| Original cleanup completion — resource/executor integration owner | L1 actual original flight/debt/abandon/retry observation; reuse Resources where applicable | Retirement-completion claim in L5–L6 | Other owner contracts and useful-adoption observations |
| Publication and attempt receipt semantics — actual authority owner | L1 expected-revision, lost-reply, same-ID/payload and competing-update tests | L4 complete publication/reconciliation; durable scope if selected | Inert planning, composition and preparation controls |
| Exact production tool/source admission — repository and tooling owners | Current BOOTSTRAP route with actual source mappings/eligible cohort | Production source/release at applicable L1/L7 boundary | Research fixtures and documentation under their existing route |
| EF installation/admission basis — EF owner | Its scoped successor/implementation plan and real mechanisms | An EF-installed-plugin claim; not ordinary-library LMU | Standalone packed operation and independent consumers |
| Transition implementation choice — LMU maintainer | Compare ordinary typed functions with pure XState only against concrete inspection/transition needs | The selected L2 implementation technique | Semantic contract, hand-authored adverse expectations and other L1 probes |
| State migration, rollback, old clients — their semantic owners | Applicable Q3/Q6/Q7, real schema/effect/retention examples | Only transitions promising those guarantees | Explicit rejection/inapplicable-profile contract and unrelated supported paths |

When a question remains disputed after independent critique, record attempted
options, rejecting evidence, conditional recommendation and this blocked step.
Bring that question to the owner later while continuing independent work within
the assigned scope. Never silently downgrade a promised guarantee to make a step
appear complete.

## 8. Parallel confirmed-target work

| Required target | Next bounded work before its implementation claim | Stop condition for unsupported scope |
| --- | --- | --- |
| Browser | Identify realm/loading/state/authority placement; exercise actual shared artifact or each claimed target build, stale responses and physical handler cleanup | Node execution behind a browser UI cannot certify browser LMU execution |
| Desktop | Compare actual shell/OS and renderer/privileged owner; specify versioned IPC and native-resource lifetime; execute denied/malformed calls and shutdown/recovery | No Desktop support from Node plus Chromium alone |
| Untrusted plugin | Select existing containment/broker mechanism; bind admitted code to narrow capabilities; test denied file/network/IPC, limits and actual stop | Signature, Worker or process placement cannot certify hostile-code containment |
| Optional UI | Reuse an existing interaction contract/library behind presentation adapters; compare the smallest useful semantic declaration and independent presentations | No universal renderer/DSL or portable-UI/a11y claim from headless behavior alone |
| Durable/multi-client update | Select actual transaction/receipt and client-asset owners; define restart/offline window and resource budgets before fault tests | A single synchronous Host does not certify another store, concurrent tabs or offline recovery |

For an unselected shell/executor, estimate a bounded comparison/spike first;
production LOC/time remains an explicit residual until there is a credible
mechanism and failure envelope. Keep each result tied to exact runtime/artifacts
and its negative controls. These lanes inform the core boundaries now and do not
wait for a first application or every other target to finish.

## 9. Resume and review record

Each implementation handoff states: exact source/tool/public-artifact identities;
selected packet and current phase/step; changed owning contract; remaining open
item and its actual dependency; executed versus queued/unexecuted checks; original
failure evidence and required next observation. Link the owning PR/receipt rather
than maintain a second mutable readiness ledger.

Before calling a phase complete, independently check ownership/dependencies,
state/authority/lifetime counterexamples, and external-consumer ergonomics. Review
again after material corrections until no critical finding remains on the exact
candidate. Preserve unresolved scope decisions as questions, not successes. The
phase evidence must show useful behavior and its failures, not merely that the
implementation agrees with a model copied from itself.

The [November 25 plan review](../reviews/implementation-plans-2026-11-25.md)
retains the independent critiques and corrections for this planning delivery.
