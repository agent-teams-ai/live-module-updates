# Programme D: current tooling and explicit module reuse

Status: owner-authorized audit and Foundation upgrade, 2026-11-27.
This programme follows completed B/C at
[77a3ecc](https://github.com/agent-teams-ai/live-module-updates/commit/77a3ecc4ace12509961bd3ff43e80703b0303c40).
Planning, implemented changes, native qualification and normal merge remain
separate observations. This document does not select a native Effect runtime.

## Outcome and scope

Upgrade maintained LMU development graphs to the current published compatible
Foundation/FMS/Stack versions; correct concrete GM/CMS findings; document a
source-backed decision on feature boundaries and actual reuse of Effect,
Observation and lifecycle mechanisms. Preserve the qualified ordinary package,
complete update semantics and Node/Chromium consumers.

One LMU Draft PR owns this work. Executor A retains EF #70, upstream GM and
their tooling/admission changes. Central #447 already owns the bootstrap-v5
adapter. Do not create a competing checker, change its branch or weaken gates.
A dependency blocks its dependent acceptance step only.

In scope:
- published-version/provenance and architecture audit;
- root tooling migration and the separate maintained portable-document tooling;
- verified CMS corrections and scoped regression evidence;
- actual Effect/Observation reuse decisions, bounded discriminating experiments
  when they can change the decision, and explicit next implementation steps;
- native checks, independent review, exact delivery evidence.

Excluded: mandatory Effect in the ordinary root, a new resource manager,
arbitrary feature-per-file decomposition, streams/session renewal,
distributed/restart recovery, Desktop/isolation, public npm release,
product pins, managed Docs onboarding and upstream authority/settings changes.

## Inspected authorities and versions

Read the current organization engineering standard and development tools catalog,
the immutable accepted FMS v1.1 profile, and GM CMS/practices before edits.

| Authority | Inspected source |
| --- | --- |
| LMU accepted B/C | 77a3ecc4ace12509961bd3ff43e80703b0303c40 |
| Organization current guidance | 283c9b8d79580b48be5b1b8d6a94a09b9543185b |
| Accepted FMS content/adoption | profile at 89b5d7c512d9c4b5ae63709857a0d71cb2e6d178; unchanged v1.1 digest |
| Get Modular CMS and packages | 27dfb4ddf67cead198fee6e781ab355c37782928 |
| Engineering Foundation current source | 7438b7ee4429dc7798cf2b18c81e6bc7788f0f5b |
| Existing Central v5 adapter proposal | #447, 050d47ec66717f0f177b586c36520eb09f3ab4e0; unmerged |

Official npm metadata observed on 2026-11-27:

| Package | Existing / selected | npm publication |
| --- | --- | --- |
| Engineering Foundation | 3.0.0 / **4.0.3** | 3.0.0: 2026-10-25T11:42:09.678Z; 4.0.3: 2026-11-27T07:56:28.697Z |
| FMS tooling | 0.3.0 / **0.4.4** | 2026-11-27T07:58:50.687Z |
| Stack Toolchain | 0.1.1 / **0.4.0** | 2026-11-27T08:02:13.133Z |
| GM Effect | available **0.1.1** | 2026-11-14T14:55:50.027Z |
| GM Observation | available **0.2.1** | 2026-11-14T12:35:54.970Z |
| Effect itself | latest **4.1.7**; GM exact peer **4.1.4** | latest: 2026-11-27T10:47:02.104Z |

Retain Node 24.22.3, pnpm 11.25.0, TypeScript 7.0.2 and current Oxlint identities
unless actual package requirements contradict them. Latest selection is a dated
exact graph, not floating dependencies. A new FMS tool version does not change
the pinned FMS standard. Do not override GM Effect's exact peer to claim latest
Effect support. Preserve original historical archives and results.

## D0 — audit and two plan reviews

1. Inspect actual imports, source ownership, state transitions, package exports,
   compiler scope and GM construction; names or passing partial gates are not proof.
2. Independently review ownership/FMS, cancellation/resource safety, and
   packaging/admission. Correct material findings before dependent implementation.
3. Record findings, accepted corrections, limits and exact source in this plan's
   execution record and the owning usage/adoption documents.
4. Root owns commits/refs. Reviewers receive disjoint read/edit scopes. Push each
   useful commit immediately through the existing owner-authorized route.

## D1 — coherent Foundation 4 migration

Use the published
[migration](https://github.com/agent-teams-ai/engineering-foundation/blob/7438b7ee4429dc7798cf2b18c81e6bc7788f0f5b/docs/development/quality-v5-migration.md),
not a local compatibility imitation.

1. Select exact Foundation 4.0.3, FMS 0.4.4 and Stack 0.4.0. Regenerate each
   changed canonical lock with pnpm; preserve strict peers and compiler floor.
2. Root coverage moves from schema 3 to schema 5. Retain source dependency and
   suppression policies, all compiler inputs, lint protections and native gates.
3. One consumer-owned Stack config owns compiler projects. Existing project
   lists must not become duplicated authorities.
4. Generate the neutral topology using published
   `projectQualitySourceTopology`; bind the exact FMS profile and coverage input
   bytes through `derivedFrom`. A small existing-route generation/freshness check
   must reject stale input bindings. Do not write a second FMS mapper or parser.
5. Set one measured finite quality budget. Preserve separate ES-only, tools,
   feature/test and isolated-consumer compilations.
6. Migrate the maintained portable-document dependency graph separately. It
   currently enables source-dependency checks only; do not silently assert that
   it acquired the root's full quality-coverage profile.
7. Add an explicit successor to ADR-0002 for the accepted migration. Preserve
   the original reason for 3.0.0 and all dated evidence.

Acceptance: exact new installed graph, strict no-script frozen installation,
real source-policy/FMS/quality checks and unchanged required native behavior.
Use finite migration controls after a valid setup:
- changed FMS/profile bytes and stale topology bindings refuse;
- newly unclassified production source and omitted actual compiler input refuse;
- forbidden application dependency and protected lint-rule weakening still refuse;
- corrected counterparts pass with the exact installed tools.
Preserve every original source inventory and compiler scope; no test or fixture
reclassification may hide production code. Reuse existing controls where they
already exercise the same authoritative boundary.

### Actual upstream prerequisite

Current accepted Central bootstrap requires old `featureProfilePath`,
`compilerProjects` and Stack 0.1.1. Foundation 4 accepts coverage schema 5 only
and rejects those obsolete fields. Existing Central
[#447](https://github.com/agent-teams-ai/.github/pull/447) supplies the v5 adapter
but currently recognizes only Foundation 4.0.2 / FMS 0.4.3 / Stack 0.3.1.
Its protected-source acceptance is still pending.

Prepare and qualify LMU's new graph independently. Final ordinary admission
requires that owning lane to qualify the newest tuple and publish an accepted
immutable workflow revision. Never copy the checker, pin an unaccepted proposal,
add contradictory fields or claim configured state as positive qualification.
Retain any real rejected admission result. Re-read this dependency before the
final delivery decision; do not assume an old blocker remains current.

## D2 — actual GM usage and feature boundaries

Correct only substantiated defects. First audit found the new C reference uses
`implement(declaration, scoped("document-runtime", factory))`; the accepted CMS
requires `implement(declaration, factory, scoped)`, deriving the scope name from
the implementation identity. Verify actual API behavior and correct this narrow
composition boundary. Its native cleanup-debt path must identify
reference/document-runtime/default; qualify this through the existing real
Node/Chromium cleanup-debt scenario and retain a failing old-wrapper witness.
Correct feature-group member order, the adopted .root.ts filename form and
each dependent staging/mutant/hash path. Pass construction cancellation through
the matching owned scope's signal in run({ signal, scope }); keep generation
scopes detached from the outer parent. Preserve the old borrowed source and
historical inventories. These source-contract omissions are not claimed as
reproduced application failures. Do not turn ordinary helpers into graph nodes.

Measure runtime code separately from tests, documentation and evidence. Current
feature is approximately 1.5k runtime lines across application/ports, adapter and
composition, plus about 285 testing lines; the coordinator file is 478 lines.
Counts are a review prompt, not a feature-boundary rule.

Evaluate these alternatives against actual ownership:

| Option | Benefit / main risk | P / T LOC; effort | U / N / C |
| --- | --- | --- | --- |
| Keep one coherent update feature; improve concrete composition violations | One owner of admitted work, transition and custody; must keep private components understandable | 20–120 / 80–220; 1–2 days | 8 / 8 / 3 |
| Introduce private sub-features where an independent owned contract is demonstrated | Enforce a real boundary; premature split can create mutual state access/republications | 180–450 / 180–400; 2–5 days | 5 / 7 / 6 |
| Separate invocation, publication and retirement into public features/packages | Independent use only if real consumers require it; currently risks duplicated authority/state machine | 450–900 / 500–900; 5–10 days | 3 / 5 / 8 |

Conditional recommendation: first option unless review finds an independently
owned capability and acyclic boundary. Record exact extraction triggers rather
than permanently banning decomposition. Do not relocate a composition mapper
into the application if that introduces an inward dependency on GM contracts.

## D3 — preserve useful Effect/Observation paths

Audit the actual `@get-modular/effect` package and native practices, including
existing communication fixtures. It is a native Layer-based construction
integration; LMU owns a different update operation.

| Option | Guarantee / principal risk | P / T LOC; effort | U / N / C |
| --- | --- | --- | --- |
| **A: preserve current runtime and record exact native integration decisions** | Concrete reuse entrypoints, triggers and qualification plan; no unexecuted native support claim | 0 / 0; 0.5–1.5 days | 8 / 8 / 2 |
| **B: qualify a concrete native Effect Host discriminator** | Real native Layers/Scope/E/R and original owner against installed LMU; exposes lifecycle incompatibilities before a public API | 150–350 / 700–1,300; 3–6 days | 8 / 8 / 5 |
| **C: optional public native integration after B** | Reusable qualified profile justified by real consumers; preserve Cause, interruption, custody and original cleanup evidence | 450–900 / 1,200–2,200; 6–12 days | 6 / 8 / 7 |

**Selected current scope is A.** B is the concrete next implementation proposal;
C depends on B and demonstrated consumer need. These are alternatives, not
additive scope commitments. A mandatory-Effect coordinator rewrite changes the
accepted ordinary dependency and cancellation contract and is outside this task.
No new runtime profile is selected by this audit. Estimates exclude docs/generated/vendor bytes and
platform/publication work; fit U, expected reliability N and complexity C are
ordinal judgments for the stated scope. Estimate confidence: 4/10.

The proposed B discriminator must establish:
- GM native Layer construction and useful finite module operation;
- one real generation lifetime owner and effect receiver;
- retained old work across replacement and cancellation of only an observer;
- actual original Scope finalizer completion and Cause on failure;
- no false complete report on repeated native disposal, which may not replay
  the first failure; no invented Resources-style retry on an Effect Scope;
- caller context, typed failure, defect and interruption remain distinguishable;
- initial failure and parent shutdown retain a reachable original owner;
- no leaked fibers/listeners and unchanged application state/grant ownership;
- no Effect dependency leaks into the ordinary installed consumer.

A returned Effect/Stream is data under the current ordinary call contract; later
execution gains no implicit LMU lease. A Promise wrapper around a native Effect
is not itself a native E/R/context integration. Document these boundaries before
dependent public code.

Observation is a single-writer latest-state projection. Its watch/load paths may
coalesce intermediate revisions: never use it as an update-command bus or the
canonical immutable receipt store. Reuse the existing GM state/callback/progress
and Observation-to-Effect recipes when a concrete subscriber is introduced.
Require actual subscription ownership and native unsubscribe evidence.

Private lifecycle-kernel remains an upstream candidate; publication and actual
Host adoption are prerequisites, not permissions to deep-import it.

**Do-not-forget route:** the owning first-operation plan/open decisions must
name the existing GM entrypoints, concrete adoption triggers, next discriminating
steps and responsible owner. A vague "optional later" note is insufficient.

## D4 — qualification and review

Run focused validation after each meaningful correction; use the complete native
route once the final runtime/tool graph is ready. Preserve existing B6/B7/C4,
ordinary/resources/testing consumers, source-policy rejecting cases and the
separate static reference. No arbitrary soak loop or duplicate framework.

If the local executor is unavailable, ordinary hosted Actions may prepare a
reviewable exact lock/artifact and run checks. Preparation never counts as frozen
consumer acceptance. No automatically pushed lock or broad write permissions;
inspect the produced bytes and then commit the canonical result normally.

Perform at least two independent review rounds across the plan and resulting
source, re-review material corrections, and close all critical/material findings.
Report pending/skipped/failing checks separately.

## D5 — delivery

Re-read current upstream compatibility and normal PR checks. Merge this one LMU
PR only through the ordinary authorized route after applicable gates pass.
Verify the actual resulting main and attribution. If a concrete external owner
step remains, finish all independent code, review and qualification and leave
the exact dependency and tested source in the same Draft PR.

Whole selected audit/migration/CMS scope estimate: P (tooling/integration)
150–450; T 150–450; 2–5 engineer-days. Native Effect adapter implementation,
stronger profiles and protected upstream procedures are excluded. Confidence
4/10. The result is judged by useful verified guarantees, not elapsed hours/LOC.

## Execution record

- 2026-11-27: published-version and actual-source audit; initial independent
  findings identified the genuine schema-v5 prerequisite and CMS scope naming.
- Plan review round 1: three independent reviewers examined tooling/admission,
  Effect/Observation lifetime and actual feature/GM ownership. Corrections added
  exact migration controls, the four bounded CMS/Host changes, and selected
  audit-only Effect option A with B explicitly deferred. No integration rewrite
  is authorized by these estimates.
- Plan review round 2: tooling/admission, feature/CMS and Effect reviewers
  accepted the revised scope without unresolved critical/material findings.
  The next native Effect proposal also names late candidate acquisition during
  shutdown; it remains a separate implementation step.
- D2 implementation: corrected the scoped adapter, group/root authoring and
  owned construction signals. A new installed-byte control restores the old
  scope naming and requires its exact native cleanup-path failure.
- D2 local focused validation: all four strict compiler projects passed;
  the installed Node campaign passed 34 positive cases and eight negative
  controls. Chromium was not selected in this local focused run; complete
  hosted qualification and new-tooling validation remain pending.
- D2 hosted source b7d3f0b: complete native run 45999548017 passed 106 tests;
  installed Node and Chromium each passed 34 positive cases and eight controls.
  Static reference, admission and identity checks also passed. Two subsequent
  independent source reviews found no critical/material issue. This evidence
  uses the previous tooling graph.
- D1 source migration: schema 5, public topology generation, single Stack project
  authority, exact current pins and separate maintained fixture prepared.
  Independent review confirmed preserved compiler/lint scopes.
- Canonical preparation at source 75806d3: run 46001466080 passed strict
  no-script installation, initialized compiler identity and tools-project
  compilation; actual pnpm/FMS produced both locks and the topology. Exact
  Git blob identities matched independent re-import. The source-bound receipt
  is retained; the temporary preparation workflow/helper is removed afterward.
- Native migration controls passed two source-review rounds. The typed-lint
  witness now uses the same valid, defective and restored file. Actual new-graph
  native execution and normal delivery remain pending.
- D3 audit packet is recorded in the owning first-operation plan and decision
  register. Option A is delivered; proposed native option B remains separate.
- The first clean frozen install at 6d5e6ee exposed incomplete preparation
  delivery: pnpm had generated exact release-age selectors in both workspace
  manifests, but only locks/topology had been imported. The original receipt's
  inputs include those post-generation workspace bytes. Preserve that receipt
  and refusal; recover both manifests through normal resolution and independently
  match their previously recorded hashes. Two reviewers accepted the bounded
  correction; no default age, strictness or other verification policy changes.
