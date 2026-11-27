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
