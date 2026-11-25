# Implementation plans: review and handoff, 2026-11-25

Status: reviewed documentation checkpoint. The owner requested detailed phases
and implementation steps before uncertain production work, multiple critique
rounds, prompt publication and recorded open questions without stopping other
assigned work. This record does not select a runtime policy, publish a package,
accept a production Host or amend an immutable ADR.

## Inputs and ownership

The inspected baselines were LMU `6083e89ba7781b12571a102d273058052ad94148`,
EF `86c01a976792eed78a3ad8b8bdc350c7c8f7884f`,
GM `330c28dbea1a3de812d3aee5ddb71ef829dee347` and organization guidance
`6a33853123378ef8ea69868da8ecb550cd53c906`. These are source observations,
not new consumer adoption pins. The current owning repositories remain the
place to verify availability before implementation.

The [LMU execution plan](../plans/first-operation-implementation-plan.md) owns
L0–L7 implementation steps for one complete operation. The existing
[EF plan, tracked in PR #67](https://github.com/agent-teams-ai/extension-foundation/pull/67)
owns E0–E6 artifact, admission and installed-plugin work. The
[operation](../architecture/operation.md) retains semantic obligations, the
[foundation plan](../plans/foundation-delivery-plan.md) retains F0–F5 dependencies,
and the [decision register](../decisions/open-decisions.md) routes to the actual
owning choices. No second transition algorithm or decision authority is created.

## Actual review rounds

All reviewers below were separate agents in this task, except the coordinating
root's explicitly identified own review. They are not GitHub approval submissions,
different-model certifications or a substitute for repository checks.

| Round | Reviewer and concrete scope | Outcome |
| --- | --- | --- |
| Author preparation | Separate EF and LMU authors inspected current source, existing plans and owner direction | Produced detailed phases, source responsibilities, exits, adverse cases and scoped alternatives; this is author review |
| Independent architecture, round 1 | `architecture_critic` inspected both complete draft plans and applicable GM/organization contracts | No P1; found admission ordering, readiness wording, navigation and cost precision issues listed below |
| Independent architecture, round 2 | The same independent critic reread the corrected content and exact file blobs | Confirmed material corrections; no remaining P1/P2 in the substantive phase plans |
| Cross-repository integration | `ef_plan` reviewed LMU; `lmu_plan` independently read all three changed EF documents | Found and corrected the preliminary-check versus actual-mutation race; confirmed no duplicate coordinator, state owner or hidden prerequisite cost |
| Coordinating consistency review | Root read both plans, current policies, source/evidence and final navigation | Corrected language that could promote the Q1–Q7 navigation projection into another decision authority; retained owner acceptance |
| Final bounded recheck | Independent architecture critic reread the changed authority/navigation wording and review record | Final disposition is retained with the exact published source and delivery receipt; an earlier review does not cover later semantic changes implicitly |

The second architecture review identified the LMU plan at blob
`39295456493bf2c43ed80b2a4fa7d277f55a3158` and the EF plan at blob
`209ad9d3e596dd094ec963e0f4b8938765564d15`. Subsequent edits are the explicitly
reviewed navigation, authority wording and spelling corrections; final source
and check identities belong to the delivery receipt rather than a self-referential
claim that this document's own commit has already passed CI.

## Findings and corrections

| Finding | Applied correction and preserved boundary |
| --- | --- |
| E1 appeared to admit a package before E2 supplied the substantive feature needed for admission | E1 qualifies the verifier and evidence route. The first actual catalog/admission entry, substantive E2 source and candidate proof land in one owning change; no placeholder package |
| L1 bootstrap could become empty production scaffolding before L2 | Establish the eligible route first; actual source mappings/bootstrap accompany the first substantive implementation |
| A landed open-question checkpoint could be read as completed L0 | Dependent implementation requires the selected applicable packet; documentation can land while that phase remains open |
| A continuation instruction could expand the task beyond owner scope | Continue only independently actionable work within the assigned scope |
| A pre-publication check could race the actual state/head/grant mutation | Conditions are enforced at the real owner mutation/reservation boundary; add an independently observed intervening-change case without inventing a cross-store transaction |
| Verified artifact bytes could differ from the code eventually evaluated | Preserve verified closure and loader identity through installation and actual evaluation; reject substitution |
| Cleanup or uninstall could delete bytes still held by runtime/history/old clients | Check all applicable owners' holds and eligibility before deletion; reader zero and timeouts are insufficient |
| Plugin-provided executable validation could run before admission | Validate metadata through the trusted extension-point owner's validator; discovery stays inert |
| The small EF estimate could conceal the missing verifier or durable Host | State that the joint core/wiring range assumes qualified prerequisites and separately estimate missing mechanisms |
| F2 delivery and a same-artifact rule could overstate portability | Name the bounded portable-document result; distinguish one-artifact reuse from shared-contract qualification of each different target build |
| Current navigation still pointed only to older planning snapshots | Link current owner plans and the published successor proposal; retain immutable evidence/source baselines separately |
| A discussion register was described as another authority for Q1–Q7 | Keep it as navigation to owning decisions; applicable semantic owners retain acceptance |

## Validation and evidence limits

The delivery changes prose and navigation only. No runtime, fixture, workflow,
dependency, lockfile, accepted ADR or historical evidence bytes are modified.
LMU uses its existing research-documentation route; this change does not copy EF's
managed Docs profile or claim production onboarding. Proportional local validation
covers changed relative destinations/anchors, fences, whitespace and exact scope.
EF retains its own Docs Protocol, quality checks and actual protected delivery.

The original LMU main job `138884992384` was independently read again during this
task: exact checkout `6083e89`, strict TypeScript 7.0.2 and six named tests passed,
with no failures/skips/cancellations, on the recorded Node/Chromium cohort.
The [qualification matrix](../research/foundation-qualification-matrix.md#3-exact-portable-document-result)
binds the original run and artifact. Root also reread EF's original main job
`138875952992`, including its actual packed-consumer execution and 239 passing
qualification tests. These are retained execution results, not new native runs
or proof of production LMU/EF availability.

Production/integration LOC and new test LOC for this documentation delivery are
zero. Future LOC/effort scores in the plans are conditional engineering estimates,
not runtime completion percentages or a promise of measured reliability.

## Remaining decisions and next implementation handoff

The first exact supported profile, contribution compatibility, package-evidence
retrieval route, applicable admission successor and missing owner primitives
remain explicit in their existing owning records. The operation's state, work,
rollback and old-client policies remain profile-specific. Browser, Desktop and
untrusted-code requirements are confirmed targets, not questions to reopen.

A resuming implementation agent starts with the applicable selected packet and
unfinished E/L step, rereads public mechanism availability, and preserves the
step's independent adverse observations. Open policy blocks only the contract
that depends on it. No application launch is needed for fixture qualification;
merging these plans does not accept every listed alternative or a stable SPI.
