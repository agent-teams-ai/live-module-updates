# Programme C review record, 2026-11-27

Scope: [composed-module adoption](../plans/composed-module-adoption-plan.md).
Completed B0–B7 implementation and evidence retain their own records.

## Discovery review

Three independent agents inspected current source and accepted rules. These
are actual agent reviews, not three different models or external approval.
The root agent integrated their findings; no implementation approval is claimed.

| Reviewer | Discovery incorporated into the first plan |
| --- | --- |
| operation_design | GM belongs at actual selection boundaries; fixed inner helpers stay static. Method-shaped public ports risk variance. A real GM-owned runtime exposes parent abort and retry ownership obligations. |
| invocation_contract | Static complete chain plus live single-capability proof does not establish live whole-closure replacement. Plan digest is not factory identity; separate calls are separate admissions; finite history cannot be evicted. Parent cleanup must retain incomplete LMU ownership and permit truthful explicit recovery. |
| installed_consumer | Existing full FMS does not equal root CMS adoption. Scope the real new GM boundary, preserve full census and ordinary installed closure, use existing compositionContract fields and real native tool gates. |

## Plan review

Round 1 reviewed the full published abed8ff7a5d6087ae3bc65753b4a542d3092d2fb
plan. No critical architectural contradiction was found. Material corrections:

| Finding | Reviewer | Correction |
| --- | --- | --- |
| External abort can reenter invocation before cleanup seals LMU | invocation_contract | C2 now defines a shutdown admission cutoff and earlier-listener reentry test; bound existing work remains valid. |
| Parent teardown also threatens pending preparation and unknown publication | invocation_contract | Separate held-acquisition and committed/lost-ack parent-close experiments retain actual ports until settlement/reconciliation. |
| Initial ownership has post-constructor and late/cancelled windows | operation_design, invocation_contract | Explicit transfer matrix covers refusal, successful transfer followed by GM failure, late initial preparation and cancellation before root publication. |
| Current completion must include every actual owner | operation_design | Coordinator-owned fact, if needed, includes closed admission, preparation/publication/work and unregistered/invalid-report custody; no copied predicate or false physical-release claim. |
| Test suite owner and package delivery were ambiguous | installed_consumer | Selected portable live-module-updates/testing, no runtime/platform/GM dependencies, real FMS testing role and forbidden inward production import. |
| New root runner could accidentally depend on old child compiler or shared outputs | installed_consumer | Explicit ordered isolated staging from unchanged maintained sources, root compiler, clean second installation, actual compiler input list and separate C evidence. Reference sources have an explicit staged compiler owner; root orchestration has no bare fixture aliases. |
| Existing static workflow path filter would not run on new LMU-only inputs | installed_consumer | Extend the existing workflow's path triggers for actual composed/public inputs, retain its native graph/commands and bind the regression to the current source. |
| Coordinator replacement, data isolation and writer scopes were implicit | root self-review, confirmed by operation_design | Exclude coordinator hot-swap; distinguish provider coherence from transactional state; add disjoint phase/file ownership map. |

Round 2 independently reviewed the complete corrected plan at
cb43ed052ce942a632975c1d439948b5c0b5c56f. All three reviewers reported no
remaining critical or material finding in their respective scopes. Initial
transfer, external admission cutoff, preparation/publication custody, current
ownership evidence, testing delivery and actual compiler/CI routes were
explicitly rechecked. These are actual agent reviews, not an external approval
or runtime qualification. C1 and independent C4/C5/C6 work may proceed; C3's
public lifetime API remains dependent on C2's executable discriminator and review.

## Implementation and delivery

Implementation started after Round 2. No new native qualification, package
release or product admission is claimed. The local executor was temporarily
unavailable during planning; the plan and corrections were immediately preserved
through GitHub in Draft PR #11. The executor is restored. The initial plan's
native regression run 45922316110 passed against abed8ff7; it is baseline
evidence, not execution of the new programme.

### C1: sound installed operation contracts

The original emitted archive from actual main #9, SHA-256
58b63bff40c946599a314dc6a9c9339d7a75e4b87276241334ebdfa9423478fa,
accepted narrower facade, continuation and runtime providers for wider consumers
under real TS 7.0.2. The [unaltered observation](../research/evidence/composed-module-20261127/c1-unsafe-assignment.json)
retains that archive/declaration/input identity; this is not a rebuilt old-source
claim. C1 changes only public interface signatures to readonly function-valued
properties, preserving executable operation behavior and legitimate provider
continuation invariance.

The installed campaign passes valid substitutions and checks ten separate
invalid programs against exact diagnostics at their violating assignments.
Actual compiler inputs are confined to authored consumer files and installed
declarations. Ordinary no-peer and optional Resources consumers still execute.
The stock native lint route additionally has a permanent scoped method-signature
rejection control. Focused local strict, native lint and packed checks passed;
source-bound CI remains authoritative for the committed checkpoint.

### C2: actual GM-owned lifecycle discriminator

The initial native campaign completed 12/12 tests (one parent and eleven
scenarios), with strict compiler and stock typed lint checks. Its
[unaltered observation](../research/evidence/composed-module-20261127/c2-owned-runtime.json)
records eight positive native scenarios, two deliberately rejected integration
patterns and one demonstrated gap. Actual GM construction, Resources scopes
and native file descriptors exercise initial transfer, reentrant parent abort,
held work/preparation, lost publication acknowledgement and physical cleanup.

After native cleanup succeeds on explicit retry, the immutable original LMU
close result still says incomplete. A parent cleanup callback that consults only
that original result cannot discharge its own debt. This proves a need for a
coordinator-owned current ownership fact; it does not justify a second cleanup
manager or a public wrapper for the small owner-defined callback.

Independent follow-up found another obligation before that fact may be frozen:
a terminal publication receipt can become known while the original publish or
an overlapping lookup still uses borrowed native infrastructure. The two actual
flight orders need separate discriminators before C3. The logical
`pendingPublication` flag alone is not physical authority-flight completion.
C3 remains unimplemented at this checkpoint.

The C1 checkpoint 6b2dee66cf42aaa5c16c9d0eee4bdc5cf1d340cf passed native CI
45924590958 and repository-admission inspection 45924591299. Admission still
retains its separate configured-versus-qualified meaning.

### C2 follow-up and C3 decision

Both real authority-flight overlap orders were reproduced, bringing the local
native discriminator campaign to 15/15 tests with strict/lint checks passing.
The [unaltered overlap observation](../research/evidence/composed-module-20261127/c2-authority-overlap.json)
records parent completion while one actual publish or lookup still held a file
descriptor; the same call used it after resumption. A genuine terminal receipt,
useful B invocation and exactly one publication preceded each observation.

operation_design independently reviewed the native witnesses and the existing
coordinator; invocation_contract reviewed the finally/refresh and current-fact
semantics. The selected [ADR-0003](../decisions/0003-composed-runtime-ownership.md)
adds per-attempt observation of the original publication response, reuses the
existing reconciliation flight and derives current ownership once. No material
contradiction remained in this bounded decision. It is permission to implement
and test the correction, not a claim that the corrected native proof has run.

### C5: portable authority laws and package boundary

The optional `live-module-updates/testing` surface is implemented in the existing
feature's substantive testing role. Its eight cases use public authority ports
and independent native observations; no test runner, GM, platform or organization
runtime dependency is added. Its private oracle spells out the public grammar
instead of calling the coordinator's private binding logic.

Independent review by operation_design corrected two material oracle gaps:
require a fresh committed head revision and compare replay against a detached
original receipt/head. invocation_contract then identified a masking control:
revoking permission while changing basis can conceal a missing basis comparison.
The corrected control performs an authorized state revision change with the same
head and requires a later fresh-basis commit. Binding-preserving stale head/basis
bypass controls now fail for the actual stale transition; a deliberately
revoked-permission fixture is also rejected. Re-review found no remaining
material issue in those corrections.

Focused native law checks passed 22/22, including ten injected authority defects,
combined teardown failures and the masking-fixture control. Three separate clean
installed consumers pass: ordinary root, optional Resources and testing without
peers. The testing consumer compiles with actual TS 7.0.2, ES libraries only and
no Node/DOM declarations; its runtime entry preserves fixture-acquisition errors.
The full laws execute in the native campaigns, not in that package-closure probe.

FMS exposes the curated testing surface while retaining the testing role. Native
FMS and Foundation controls reject inward runtime imports, including ordinary-root
re-export. Foundation's full source/dependency/suppression checks and dev-only/
registry assertions passed locally with no diagnostics. A development-only
composed-source checker uses the existing Foundation/FMS/Conformance owners; it
imports no test implementation. Chromium execution of the new composed consumer
and final same-source qualification remain C6/C7 work.

### C3: coordinator correction and native Host recovery

The selected correction is implemented in the existing models, operation state
and coordinator. One current predicate owns `ownershipReleased`; the original
publication response flag and existing lookup flight describe actual calls.
Original logical update completion remains independent, with an `authority`
hold when needed. Original close results still record settled incomplete debt
and never change after explicit recovery. No Resources wrapper was added.

The complete feature family passed 40/40 locally, including actual unregistered
Resources listener debt with no registered generations and an abandon-only
owner report that remains unproven after external physical cleanup. The native
GM campaign passed 16/16: both original authority calls now retain the parent
until their final real FD use, and parent retry consumes the current fact while
original LMU/parent reports remain false. Three wrong integrations remain
explicit rejecting controls.

invocation_contract independently reviewed all three production files and the
focused feature tests without material findings. Root rechecked the shared
predicate, terminal-versus-physical distinction and native witnesses. Strict
test and ES-only projects, normal build and stock lint passed for the final
local source. Same-source hosted qualification remains required for delivery.

### C4 integration critique and prepared receiver correction

Both independent reviewers inspected the concrete reference before qualification.
They confirmed whole-closure GM construction, full public descriptor unions,
one LMU owner and artifact-only consumption. Material corrections identified:

| Finding | Required correction |
| --- | --- |
| Initial callbacks lost their original receiver during transfer | Capture original prepare/close/invoke with their owners before evaluation, including later property replacement. |
| One Host input entry supplied four capabilities despite the adopted CMS | Four one-capability declarations/aliases with the complete owner map and independent wiring expectation. |
| Failed GM construction could lose parent/runtime recovery ownership | Expose an inert Host owner before acquisition and retain narrow recovery controls before root publication. |
| Initial A was prepared without explicit Host admission | Check owner compatibility before acquisition and again against current facts after async preparation; keep the core pre-admitted initial contract. |
| Staged compilation/layout was not the complete adopted CMS gate | Add native typed/CMS controls, preserve borrowed Summary's profile, and prohibit concrete resource/test imports in application. |

The new installed receiver-sensitive witness then found a core defect:
a valid B PreparedGeneration method was installed without its original receiver.
The actual failing archive SHA-256
bb0fd20c5d379d51abec2e897126ffebe2dc55ddab20912def318003c0c21665
is byte-identical to the C3 hosted archive from
[run 45927030119](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45927030119).
A succeeds and B publishes before the method fails. The correction captures
the original callable once, validates it, and binds it to its prepared owner
inside the existing owned failure path. It adds no owner or public mechanism.
The focused regression failed before that change and passed after it, including
later property mutation and an invalid entry whose acquired owner still closes.
Strict test/portable compilation, native lint and build passed before the local
executor became unavailable. The original method/custody semantics were
independently reviewed by operation_design.

The C5 checkpoint 6e81b2338074cf608acc818f06ea35735770e924 passed native run
45926759858, static packed regression 45926759850 and admission 45926760412.
C3 at 71099b14c7636533335c4a99f1f91b4e907aba58 passed native run 45927030119
(101 tests, zero failures/skips), static packed regression 45927030016 and
admission 45927030506. The C3 evidence ZIP, artifact 15166996561, has SHA-256
53f155c0c06c517f73d8b862f1af01fffe0df3d3b2efbb61fbb2b4c3550adef7;
its actual owned-runtime receipts were inspected. These are the existing
native/browser/EF routes, not execution of the unfinished composed campaign.

The C4 writer split now allows reference/Hosts, native runner and staged quality
controls to proceed independently. During the executor interruption, exact known
source is preserved through the existing GitHub route in this same Draft PR.
Recovered or newly written source still needs source-bound native CI and final
review; no unexecuted reconstruction is presented as a passed qualification.

### C4 second review: native retirement and actual source gates

invocation_contract found a material native-observation gap in the unfinished
reference: `alive()` returned false immediately when its local `active` flag
was false. An owner that omitted actual FD/listener disposal could therefore
pass retirement checks. The correction observes the exact native resource after
logical retirement: Node compares the captured device/inode behind the FD,
including safe handling of FD reuse; Chromium dispatches to the actual exact
listener and observes its own pulse count. Final teardown must also detect the
original native leak before releasing any remaining exact owner. It cannot trust
the same bookkeeping or close a reused foreign FD.

This finding justifies one additional rejecting native Host control, beyond
the six originally planned: omit physical release but mark the owner retired,
then require the exact retirement oracle to reject after useful A/B work.
The planned 34 positive cases remain unchanged. The local counterexample,
corrected native campaigns and final review belong to their actual source;
this paragraph records the requirement, not an unexecuted passing result.
The [standalone real-FD observation](../research/evidence/composed-module-20261127/c4-native-retirement-discriminator.json)
reproduced `oldAlive=false` while independent native observation remained true.
After actual close and numeric FD reuse by a different file, the original
device/inode remained absent. This is a bounded Node observer discriminator,
not execution of the composed campaign or a substitute for Chromium.

operation_design independently audited the implemented C2/C3/C5 and the pending
public documentation without new material findings. It rechecked the shared
ownership predicate, actual authority flights, incomplete/unregistered custody,
original receiver capture and immutable reports. The fixture factory now
explicitly owns failed setup before returning its complete teardown handle;
the suite can guarantee both teardown attempts only after that return.

The prepared-receiver correction at 43ae5cc5b06b35b1838f4dba198f77d6456af3a3
passed native run 45928918639 (**103/103**, zero failures/cancellations/skips),
static packed regression 45928918721, admission inspection 45928919115 and
author identity. The original failing [receiver report](../research/evidence/composed-module-20261127/c4-prepared-receiver-receipt.json),
[native failure](../research/evidence/composed-module-20261127/c4-prepared-receiver-node.json)
and [actual input identities](../research/evidence/composed-module-20261127/c4-prepared-receiver-identities.json)
remain unchanged. The C3 hosted [owner result](../research/evidence/composed-module-20261127/c3-owned-runtime.json)
and [authority-overlap result](../research/evidence/composed-module-20261127/c3-authority-overlap.json)
are likewise preserved verbatim from the downloaded source-bound artifact.

The next native review found a partial Node setup leak: opening the foreign
FD and then failing its initial write left both FD and directory outside a
returned owner. The small setup path now retains each original acquisition
until handoff and cleans it on failure while preserving the original cause.
The [actual ENOSPC report](../research/evidence/composed-module-20261127/c4-native-setup-report.json)
compares exact historical source with the current emitted module in two separate
Node 24.22.3 processes. Both first pass ordinary setup. A real `/dev/full` write
then produces the same original native error: [before](../research/evidence/composed-module-20261127/c4-native-setup-before.json)
leaves the FD/directory; [after](../research/evidence/composed-module-20261127/c4-native-setup-after.json)
closes the exact original FD once and removes the directory. The read-only
installed consumer was unchanged, and the probe reclaimed its own old leak.
operation_design re-reviewed the final setup and physical observers without
remaining material findings.

### C6 actual local campaign and final integration review

The complete staging route passed with eight archives and 68 copied source
inputs: both strict native compiler projects, the ES-only application scope,
installed readonly TS2540 control, real FMS/CMS/Foundation checks, stock typed
quality and ten reference plus two Host rejecting controls. The actual Node
runner then passed all 34 positive rows and all seven intended negative
controls. Local Chromium launch was unavailable because its pinned executable
is not installed; that overall local test command returned a failure, and no
browser result is inferred from the Node subtest.

Root's final orchestration review found one shared-output race: this campaign
rebuilt root `dist` while other native test files could concurrently pack it.
Its LMU build now belongs to the same isolated temporary package tree as the
other staged artifacts. The existing CI's root build and other consumers retain
their own routes. This changes staging ownership, not the runtime contract.

invocation_contract re-reviewed whole-closure, initial/current compatibility,
factory identity, independent domains, all bounds and native retirement after
the corrections. Its documentation pass corrected version attribution (#9
versus C additions), the exact reference/Host quality scopes and gate order.
Generation retirement and borrowed Host authority lifetime are also described
separately. Source review and local results do not replace the pending hosted
Node/Chromium campaign on the final committed source.
