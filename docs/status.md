# Foundation status and source map

Observation date: 2026-11-24. The source table below retains the initial
consolidation observation; the successor clarification follows it. This is a
dated navigation snapshot, not a second package, admission or required-check
registry. Re-read the linked owner before implementation, adoption or merge.
The [delivery plan](plans/foundation-delivery-plan.md) records proposed work;
the [evidence map](research/README.md) records what the research actually proves.

## Distinguish five kinds of progress

| Kind | What counts | What it does not establish |
| --- | --- | --- |
| Design | Owned contract, alternatives, constraints and acceptance plan | Implementation or production defaults selected by an unaccepted proposal |
| Source implementation | Actual reviewed code at an identified revision | Public package availability or supported consumer use |
| Public delivery | Verified published artifact and its contract/version | Qualification of every runtime, product or integration |
| Qualified profile | Exact supported inputs and independent positive/negative consumer evidence | Unbounded scale, another Host/runtime or all optional features |
| Product adoption | Owning product accepts the exact profile and applicable gates | Fleet-wide adoption or completion of unrelated deployment obligations |

No overall percentage combines these dimensions. Earlier engineering estimates
remain dated judgments about their stated denominator. In particular, the
[EF documentation audit](https://github.com/agent-teams-ai/extension-foundation/blob/10deea1a11748df1fcbfc2766033c462fce3acd0/docs/research/live-extension-documentation-audit-2026-11-23.md)
estimated roughly 70–75% for a bounded TS-library planning/documentation package;
its implementation-plan axis was 50–60%. Those values are not plugin runtime
completion, reliability, test coverage or a product admission threshold.

## Observed source and availability

| Owner | Observed source | Available or implemented | Remaining boundary |
| --- | --- | --- | --- |
| Get Modular | [main 850bac5](https://github.com/agent-teams-ai/get-modular/tree/850bac5fd02fa5697846cc8958ac447d5c2ee7bb) | Published Core/Assembly 0.8.0, Resources 0.2.2, Observation 0.2.1, Conformance 0.5.2, Effect 0.1.1 | Pre-1.0; exact consumer adoption and supported runtime remain scoped |
| GM lifecycle kernel | [private manifest](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/lifecycle-kernel/package.json) | Source candidate 0.1.0 and its bounded tests | No supported public release or automatic dynamic Host adoption |
| Extension Foundation | [main 70f2bf2](https://github.com/agent-teams-ai/extension-foundation/blob/70f2bf21203b557e0f5a3b563a6b41eec5925fd8/README.md), [research PR #55](https://github.com/agent-teams-ai/extension-foundation/pull/55) | Accepted architecture, protocols, trust/distribution direction and research | Public runtime SPI/production package not materialized; package catalog empty at this observation |
| Live Module Updates | [research source 92e31ab](https://github.com/agent-teams-ai/live-module-updates/tree/92e31abdf77f62ab5cd217c3c05446a1fe0cd582), [PR #1](https://github.com/agent-teams-ai/live-module-updates/pull/1) | Proposed complete operation, vision and executed mechanism probes | No production LMU package or whole-library product acceptance |
| Orchestrator | [main c6ce98cd](https://github.com/agent-teams-ai/agent-teams-orchestrator/tree/c6ce98cd1a8ac1dd27ec877c018e5aa7cd5adff7) | Existing scoped behavior; accepted ADR-0117 mandates applicable GM composition | Foundation pending; accepted Core/Assembly 0.5.0 is not silently changed to 0.8.0 |
| Organization | [quality authority 0b44c64](https://github.com/agent-teams-ai/.github/blob/0b44c64c824f536bd1b085341e7669bcc64ef124/docs/engineering-quality-standard.md), [greenfield clarification acfb9e18](https://github.com/agent-teams-ai/.github/commit/acfb9e18f272a5d75917621172ef07f428567cff) | Existing quality/admission rules; greenfield scope clarification merged through PR #416 | Links/merges do not adopt package pins, product profiles or production qualification |

Public package manifests and registry observations are distinct from old CI run
labels. The Effect adapter's inspected peer is Effect 4.1.4; an independent
Effect 4.1.5 experiment does not qualify that adapter cohort. Resources and
Observation are mechanisms for trusted same-process code, not a plugin SPI.
Observation's inspected README does not claim a tested browser profile.

## Existing execution evidence

### Fixture-first successor

The owner's later clarification removes first-product selection as a prerequisite
for foundation qualification. Browser, Desktop and untrusted plugins are
confirmed design targets. Their runtime and enforcement evidence remains scoped
to the actual profile. See the [qualification matrix](research/foundation-qualification-matrix.md).

The recovered portable-document source was published as
[`c5f6ed8`](https://github.com/agent-teams-ai/live-module-updates/commit/c5f6ed8b75c490785679de7e813f54901ee4e3b0)
on `test/fixture-first-qualification-20261124`, based on main `3147f87`.
It is an ordinary-library test artifact with independently wired Node and
browser Hosts. The original hosted
[run 45487365519](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45487365519)
subsequently passed Q1 packed Node, Q2 actual Node/browser reuse in both orders,
and Q3's rejecting broken-cleanup control: 3 passed, 0 failed/skipped/cancelled.
The matrix retains exact job, browser and artifact identities. This is bounded
execution evidence for `c5f6ed8`, not final merge or public package release.
The [fixture README](../tests/qualification/portable-document/README.md) records
commands and scope; later source/check results belong to their exact PR/run.

### Retained mechanism campaigns

| Campaign | Exact execution/result | Supported conclusion |
| --- | --- | --- |
| Piral/Resources and native Effect | [EF run 45208310980](https://github.com/agent-teams-ai/extension-foundation/actions/runs/45208310980), tested `b86e059`; 3 tests / 6 cases / 66 comparisons | Specific predecessor cleanup, candidate failure and original-finalizer controls; see [validation](research/validation.md) |
| Public GM custody/identity | [LMU run 45254966742](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45254966742), tested `8f68bdba`; 12 unique cases across 24 successful executions | Public borrowing/identity/setup/drain/stream mechanisms, not complete public atomic admission |
| Browser/HTTP skew | [LMU run 45259638070](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45259638070), tested `2bc1affa`; 4/4 | Compatible client/server controls, retained lazy assets, stale-result guard and original-command receipt |
| Ordering, state and closure witnesses | [Cutover/state](research/cutover-admission-and-state-custody-2026-11-23.md), [closure/reclamation](research/closure-integrity-and-reclamation-2026-11-23.md) | Finite models, actual SQLite/file controls and Nginx observations with explicit native/distributed limits |

The first browser run had 3/4 passing cases; the original failure is retained.
The amended acknowledgement case is not proof of a TCP reset. Repeated execution
does not add unique cases. Source review, mechanism probes, representative
integrations, independent test Hosts and product adoption are different evidence
classes. Documentation-only HEADs do not inherit an unqualified claim of
whole-library E2E.

## Immediate readiness questions

- Which representative capability and independent expected outcomes expose the
  next unproved foundation contract?
- Which exact public/compiler/runtime cohort and support envelope belong to
  that fixture, separately from any later product admission?
- Which composition, package, state and lifetime rows are actually executed?
- Does the same artifact execute through independently wired Host boundaries,
  including an actual browser for that claim?
- Which native Desktop, containment and optional UI rows still need their own
  mechanisms and discriminating evidence?
- Which supported mechanism can establish the first dynamic profile's atomic
  operation admission, lifetime and reconciliation obligations?

The [decision register](decisions/open-decisions.md) records alternatives and
evidence, including profile-specific Q1–Q7 choices. Static fixture work proceeds
without waiting for every dynamic choice or an application. A product later
accepts its own qualified scope; this observation passes no pending product gate.

## Refresh and invalidation

Recheck the owner when a package/public contract, consumer adoption, trust or
runtime profile, authority/state protocol, loader/shared identity, supported
workload or source qualification changes. Update the affected claim and guide,
not historical raw output. Keep final PR/merge/check receipts in the review or
delivery record; do not make a planning table the authority for live protection.

At the initial audit, GM main's full CI had a Windows timeout and a macOS runner
acquisition cancellation; the aggregates therefore did not pass. Existing
documentation reviews do not repair or reclassify those results. New source and
merge checks belong to their actual reviewed tuples, linked from the current
PRs and [consolidation review](reviews/foundation-consolidation-2026-11-24.md).
