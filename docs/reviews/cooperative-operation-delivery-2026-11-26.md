# Cooperative operation: implementation review and delivery

This record follows the owner-authorized B0–B7 delivery in the single
[LMU #9](https://github.com/agent-teams-ai/live-module-updates/pull/9).
It records actual review findings and corrections. The
[phase plan](../plans/first-operation-implementation-plan.md) owns scope, the
[qualification matrix](../research/foundation-qualification-matrix.md) owns
runtime evidence and [BOOTSTRAP](../../BOOTSTRAP.md) separates admission axes.
Agent source reviews are not GitHub approval submissions.

## First substantive source checkpoint

Source
[`97e051b`](https://github.com/agent-teams-ai/live-module-updates/commit/97e051b73f42e485ca5479ecb06444edd548097c)
delivers one portable library, one `update-operation` feature, optional Resources
integration, strict native source adoption and two clean installed consumers.
It followed the actual Node/Chromium invocation discriminator; production API
selection did not rely on a Node-only context mechanism.

The invocation/lifetime and operation/authority implementers reviewed each
other's boundaries. The root reviewer independently read the implementation,
native tests, bootstrap controls and public consumers. The packaging/source
reviewer checked the actual FMS/Foundation contracts and external dependency
closure. Material corrections before that checkpoint:

| Finding | Correction and discriminating evidence |
| --- | --- |
| An initial owner could leave cleanup debt before any update handle existed | Added explicit runtime cleanup retry over the same owner; actual Resources test proves recovery and unchanged original close result |
| Mutable cleanup reports could change historical evidence or authorize disposal | One shared pure report capture reads fields once, detaches the debt array and retains opaque debt/cause identities |
| An abandoned observation could be mistaken for native cleanup settlement | `failed.retryable: false` preserves custody and forbids concurrent retry; actual native cleanup remains pending in the negative test |
| A rejected original native Promise needed a distinct recovery path | Actual rejection is marked retryable; the later native attempt preserves the first cause/result |
| Initial owner methods lost their receiver on capture | Capture and bind methods to the actual initial owner; successful transfer and constructor refusal use real native custody |
| A throwing fulfilled publication receipt could cause an unhandled rejection | Fulfilled normalization is caught into unknown publication; a typed throwing getter after real B commit retains B and reconciles through the original receipt |
| Shared root DOM declarations could hide a platform dependency in portable implementation | Added a real ES-only production compiler for application/composition/root, in addition to the complete optional-adapter compiler and ES-only installed consumer |
| Large closure factories made ownership difficult to inspect | Refactored into one exact generation owner and ordinary operation functions over one private operation record; unchanged stock maintainability and typed presets pass |

The complete native library CI passed **38/38** at that exact source. The
downloaded artifact ZIP and packed/installed consumer bytes were independently
verified. Browser installation in this job is not counted as production browser
execution; B6 is a later actual operation campaign.

## Successor: concurrency, budgets and shutdown

The next native campaign adds actual authority races, deduplicated prospective
predecessor reservations, history/candidate/predecessor/work limits, cleanup-debt
pressure, independent domains, observer abandonment, late preparation during
shutdown and synchronous reentry. It exercises the selected ADR-0001 policies
through the public runtime and actual Resources owners.

The original run passed nine of ten tests and found a shutdown race:
`shutdown.test.ts` expected `close().complete === true` after two actual empty
native owners had completed, but observed `false`. The first retirement callback
could publish the terminal snapshot before the second eligible owner had been
forgotten. That original failure was observed in the native tool output; no raw
log file was captured, and this record does not invent one.

The correction applies the existing safe-forget conditions to all eligible
owners before forming a terminal snapshot. It does not relax any condition:
preparation/publication holds must be discharged, retirement requested, actual
work absent and native cleanup complete. The same ten native tests then passed,
and the root reviewer independently repeated all ten successfully. The internal
predicate is named `originalCleanupObserved`, because a terminal invalid report
is an observation failure, not proof of physical settlement.

Reviewed successor file SHA256 values:

| File | SHA256 |
| --- | --- |
| `application/update-operation.ts` | `c7d2f3158017fff3383edbac79fcea27df9d1b226fcaffb44bc6bfb825b0e86c` |
| `application/operation-state.ts` | `eff0c315cee1c86ffb4d533fb49338bde271d3726bb77d7fc992aff612dfc93d` |
| `tests/features/update-operation/budget.test.ts` | `4eb9bdd96d6dd1ecacb29e255d5897beba81d5b4d9b970da803b65b588c8adc2` |
| `tests/features/update-operation/shutdown.test.ts` | `c6e97cf52f85ce853aeca701b8a6e4553a4190f42927d5882780f18d6fe99406` |

Application paths above are relative to `src/features/update-operation`.
The records preserve this reviewed checkpoint if a later qualified change
supersedes its bytes.

## Observed CI installation corrections

The new root workspace initially captured the L1 precursor's dependency install.
Its compiler was absent, so that job failed before TypeScript or runtime tests.
The [matrix preserves the failed job and exact step excerpt](../research/foundation-qualification-matrix.md#3b-first-private-production-checkpoint).
An explicit empty workspace restores the precursor's own frozen dependency
graph. Local normal frozen installation and strict TypeScript passed after the
correction. The original missing offline metadata attempt was not a pass; the
ordinary supply-chain-checked install resolved it without disabling the policy.
The precursor remains active until the real B6 replacement succeeds.

The hosted installer also exposed a real vulnerable bootstrap: the old pinned
`pnpm/action-setup` installs pnpm 11.7.0 before selecting the requested 11.25.0.
The [pinned upstream bootstrap manifest](https://github.com/pnpm/action-setup/blob/008330803749db0355799c700092d9a85fd074e9/src/install-pnpm/bootstrap/pnpm-lock.json)
and native `npm audit` confirmed the affected dependency. Published advisories
include [GHSA-qrv3-253h-g69c](https://github.com/advisories/GHSA-qrv3-253h-g69c)
and [GHSA-vx52-2968-3vc6](https://github.com/advisories/GHSA-vx52-2968-3vc6).

The official [v6.1.1 release](https://github.com/pnpm/action-setup/releases/tag/v6.1.1)
specifically refreshes the bootstrap. Its signed tag resolves to immutable
`73e46992e05b19abd31f2f3c20e0e7370d762115`, with the
[11.28.10 bootstrap lock](https://github.com/pnpm/action-setup/blob/73e46992e05b19abd31f2f3c20e0e7370d762115/src/install-pnpm/bootstrap/pnpm-lock.json).
The five repository-owned setup references now use that exact source. Requested
pnpm versions, package graphs, checks and source inputs remain unchanged. Native
audit found zero reported vulnerabilities for bootstrap 11.28.10, target 11.25.0
and the installed root development graph at this observation. This is a dated
advisory result, not a permanent safety guarantee.

The central reusable admission/identity callers retain their required owner pins;
their internal setup dependency belongs to the central implementation owner.
Frozen research source/results are not rewritten or requalified by a workflow
setup-pin correction.

## Remaining delivery observations

The same packed implementation still needs the complete independent Node and
Chromium campaign, real rejecting controls, the EF verified-artifact join and
their exact final source reviews. The old L1 candidate and its active workflow
will be retired after the production replacement proves those claims; the
original source, runs and artifacts remain historical evidence.

Normal merge and actual-main checks belong to the final source. No pending
case, unknown publication, cleanup debt, unexecuted browser test, external
artifact handoff, managed admission or public release is marked complete by this
intermediate record.
