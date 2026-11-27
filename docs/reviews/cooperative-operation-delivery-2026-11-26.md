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

That successor is published at
[`d918f67`](https://github.com/agent-teams-ai/live-module-updates/commit/d918f674b8ffb7e27514a11d1a68fbe8c57fb442).
Its [complete native library run](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45910258035/job/140216639241)
passed **48/48**, with zero failures, cancellations or skips. The
[repaired L1 run](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45910258087/job/140216639473)
also passed both actual Node/Chromium runner tests. Both logs confirm the fixed
11.28.10 bootstrap selecting the unchanged requested pnpm 11.25.0. The initial
L1 failure remains recorded rather than reclassified as success.

## Successor: completed descendant references

Independent operation review found that the generation owner's child array
retained every completed child result until a long finite parent finished.
The active-work limit counted unfinished calls correctly but did not remove
those unnecessary completed-result references.

The narrow correction tracks pending child aggregates in a Set and removes each
exact completed flight. The parent's completion still waits for the pending
snapshot after its continuation is sealed; every child aggregate includes its
own later descendants. Closed records clear their raw promise, completion
resolver and parent-Set reference. This is the same invocation owner, not an
additional lifetime mechanism.

Both peer implementers and the root reviewer inspected that reasoning. A new
actual Resources/native-listener case runs 32 sequential children followed by
an unawaited transitive child. The original parent and cleanup stay pending,
the listener remains usable, and actual removal occurs only after the last
descendant finishes. The focused native invocation/adapter suite passed 14/14
both during implementation and the root repeat; strict TypeScript and both
unchanged native lint presets passed. Source review establishes that completed
references are removed; this test validates transitive lifetime after the
change. Neither observation claims a total heap-byte bound or measured garbage
collection. Capability-owned returned data has its separate ownership contract.

## Packed complete-operation review

The B6 runner installs the actual LMU tarball and exact public GM artifacts in a
new consumer directory. It compiles distinct Node and browser consumers with
TypeScript 7.0.2 and no source/workspace links. The unchanged operation runs
through separate Map/file-descriptor and sessionStorage/DOM owners. The browser
loads the captured installed JavaScript inventory in its own realm; its served
hashes, actual version and selected launch profile are recorded.

The first local packed Node campaign passed 28 named scenarios and rejected all
six deliberate defects at their specified runtime oracles. It identifies itself
as `local-unpublished`; native exact-commit Chromium remains a separate exit.
Four controls mutate one executable file in isolated installed-package copies;
two controls break the actual native receiver/removal adapter with LMU bytes
unchanged. A useful A operation must succeed before each negative scenario, so a
setup, import or compiler error cannot satisfy a mutant's named oracle.

The two production implementers independently reviewed this integration. Their
material findings were corrected before publication:

| Finding | Correction and independent witness |
| --- | --- |
| One pending publication cell could overwrite another attempt | Exact request-bound pending entries and independent completion controls |
| Native head and receipt changes could become separate mutations | One complete authority record replaces the Map or Storage value at publication |
| Candidate preparation could replace a live registration before publication | Acquire a generation-specific native resource; canonical useful invocation establishes its exact registration |
| The removal defect originally changed only an annotation | Deliberately damage B's actual descriptor/listener and retain the useful native failure plus teardown detail |
| Separate receipt/pending limits could admit twice the intended history | One combined 32-identity budget; the mixed 16-terminal/16-pending test rejects the thirty-third and preserves all original lookups |
| First-Host teardown could prevent second-Host cleanup | Attempt both independent disposals and preserve the original scenario error |
| A default executable hint could be mistaken for the launched browser | Record the actual reported version and requested pinned launch profile without inventing an executable path |

A final applicability review added synchronous reentrant shutdown to the packed
campaign. The actual provider closes its runtime, remains held across a native
event-loop turn, then completes a bound nested A call after `await` before native
cleanup. This had previously been covered only by the precursor and source tests.
The refreshed local campaign passed 29 named positive rows and all six negative
oracles. The retained archive SHA256 is
`5d088d203597ecf9da15797f0ebf974629f68984583984e340132ce3168dceb5`;
an independent reviewer checked that archive, consumer lock and every retained
mutant file against the reported hashes and exact replacements.

The receipt-capacity rows directly qualify the native authority primitive after
useful A setup; they are not 32 complete module replacements. Runtime attempt
capacity has its own row. The closure catalogue uses actual GM compositions;
arbitrary dynamic artifact admission belongs to B7.

Both reviewers found no remaining critical or material issue in those corrected
sources and the refreshed local Node receipt. That source review does not substitute for
the actual hosted browser run or final-source qualification.

### First hosted B6 failure: the shared fixture lifetime

The first [exact-head B6 job](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45912637899/job/140224383016)
on `bfea5e59dccc3c909e196343c78536473b29a1bf` passed 50 of 51 tests. The packed
Node campaign passed; native Chromium 159.0.8154.6 was installed and launched,
then could not read `consumer/out/browser`: the directory had already been
removed. The [exact failing excerpt](../research/evidence/cooperative-operation-20261126/bfea5e5-browser-fixture-lifetime-failure.log)
and original artifact `15160418606` preserve that result. Its artifact ZIP digest
is `sha256:11557e62851fd5975821318848377acd680a53c82664355a3fb6633da15aad73`.
It proves no successful browser operation.

An independent minimal Node 24.22.3 reproduction confirmed that a global
`after` hook can run between sequential awaited top-level test registrations.
The first test finished before the second was registered; the shared fixture
had no parent owning both target lifetimes. The correction gives the fixture
one explicit parent test and awaited target subtests, with cleanup after both.
The browser must still execute every positive case and exact negative oracle;
no missing-directory, setup or import failure can count as a passed target.

## Author-facing contract review

A separate implementation-to-documentation review corrected overclaims at the
public boundary. A generic result can contain caller-owned functions or data;
LMU does not sanitize it, automatically reject all detached work, or grant an
implicit generation lease. Unsupported candidates and conditions are rejected
where the actual Host contract can identify them. Public type documentation,
the selected-profile ADR and the usage guide now agree.

The guide also records two necessary ownership conditions: one live runtime per
activation domain/session, and a continuation scoped to its own provider's return
settlement. Pending descendants retain aggregate lifetime through their own
contexts; they do not reopen a completed parent's context. Construction neither
arbitrates other runtime owners nor discovers unregistered canonical generations.
These clarify existing implemented behavior without adding a global registry,
new runtime API or stronger execution claim. The Host must also qualify the
initial closure before transfer, then leave its native owner under LMU custody.
The factory does not re-run artifact or compatibility admission for that initial
owner. A publication refusal is documented as definitive; uncertain original
requests must remain unknown because refusal permits candidate retirement.

## Observed CI installation corrections

The new root workspace initially captured the L1 precursor's dependency install.
Its compiler was absent, so that job failed before TypeScript or runtime tests.
The [matrix preserves the failed job and exact step excerpt](../research/foundation-qualification-matrix.md#3b-first-private-production-checkpoint).
An explicit empty workspace restores the precursor's own frozen dependency
graph. Local normal frozen installation and strict TypeScript passed after the
correction. The original missing offline metadata attempt was not a pass; the
ordinary supply-chain-checked install resolved it without disabling the policy.
The precursor stayed active until the real B6 replacement succeeded; its later
retirement is recorded below.

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

The complete packed Node/Chromium campaign passed at `6089f0a`: the
[matrix](../research/foundation-qualification-matrix.md#3c-complete-packed-operation)
records 52/52 runner tests, 29 positive rows and six exact defect controls per
target, downloaded artifact verification and unchanged raw reports. The root
reviewer also checked every browser-served LMU hash and all retained mutated
files against the actual archive. The superseded L1 candidate and workflow are
now retired, with an immutable history route in their former profile note.

The EF verified-artifact join and its final exact-source review remain a distinct
exit. Executor A has published real public contracts in EF #70; actual qualified
archive handoff and the combined native operation must establish that result.

Normal merge and actual-main checks belong to the final source. No pending
case, unknown publication, cleanup debt, unexecuted browser test, external
artifact handoff, managed admission or public release is marked complete by this
intermediate record.
