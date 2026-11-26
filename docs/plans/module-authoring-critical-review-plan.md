# Modular authoring: critical construction and conformance review

Status: approved after two independent review rounds, 2026-11-26. No maintained
implementation change precedes this plan. Continue the existing bounded TEST
reference; this is not a new production runtime or another foundation roadmap.

## Outcome and scope

Make the maintained authoring reference safe to copy at its construction and
port boundaries. Keep the ordinary core, optional GM adapter, independently
wired Node/Chromium Hosts, public package cohort and controlled-restart policy.
Deliver one LMU draft PR, review it, run actual packed E2E, merge normally and
verify the resulting main commit. npm publication remains postponed.

The user's follow-up authorizes deeper review and critical, obvious corrections
under the same plan/review/implementation workflow. It does not select live
A/B overlap, a public plugin SPI, another cleanup manager, application migration,
Desktop support, hostile-code containment or production repository admission.

## Source basis

| Owner | Reviewed source |
| --- | --- |
| LMU | `dd8de63651e79e4737e1a0e412d2c74e79e0b646` |
| Get Modular | `a5f41853200aed26d692e89d768185013d629a12` |
| Extension Foundation | `312782a7a74515682a324dc0d89f43394ea1618d` |
| Organization guidance | `e35df6a3fcf4d5e33d0f79b5b27c3a3e454b5d56` |

The [original plan](module-authoring-implementation-plan.md) and
[maintained reference](../../tests/qualification/portable-document/README.md)
retain the larger delivered scope. Follow the existing
[CMS](https://github.com/agent-teams-ai/get-modular/blob/a5f41853200aed26d692e89d768185013d629a12/docs/architecture/common-assembly.md),
[Conformance contract](https://github.com/agent-teams-ai/get-modular/blob/a5f41853200aed26d692e89d768185013d629a12/packages/conformance/README.md),
and [quality standard](https://github.com/agent-teams-ai/.github/blob/e35df6a3fcf4d5e33d0f79b5b27c3a3e454b5d56/docs/engineering-quality-standard.md).
The currently pinned CMS revision `ae2418b` and reviewed upstream `a5f4185`
contain identical document blob `12ccc2fa8a6f267d1008bc6fec64a055923d7f78`.
Refresh the fixture's source coordinate with that explicit zero-contract-delta
review; retain FMS, runtime, package and lockfile pins.

## Findings and decisions

1. **Construction custody and cancellation.** Both Hosts call
   `prepared.run({ scope, inputs })` without the construction signal. Their
   ingress owner tracks export operations but not construction. Disposal can
   start the attempt's Resources close while `run()` remains pending. CMS
   requires passing cancellation and settling the raw run before attempt close.
   Reuse the existing finite invocation owner to reserve and retain the raw
   construction flight, pass the same native cancellation signal to the run,
   and keep the failure handler outside that tracked flight. A failure handler
   must never await a close that waits for that handler itself.
2. **Actual-root qualification.** The installed probe isolates Format and checks
   wiring, but does not run the existing public `smoke` against the complete
   root. Let `prepareDocumentComposition` accept an explicitly supplied typed
   Assembly API, with its ordinary default retained. The same production
   construction function must receive smoke's API; no second test-only root.
   Qualify all three selected implementations with success and fail/abort
   after each constructed module, complete attempt reports and independent
   acquisition/release observations.
3. **Authoring form.** Make Document/Export capability members arrow functions,
   and align changed Host-supplied semantic ports with the same rule. Document
   the provider factory as a receiver-independent callback. Keep arrow-based C.
   Add the required rejecting prototype-port example through public Conformance.
4. **Selection identity.** Give each selected fixture provider a distinct stable
   profile identity derived at composition from its captured implementation ID.
   Assert the named A/B/C profiles independently alongside their existing
   handwritten wiring oracles. No runtime registry, discovery or generic
   variant schema is introduced.
5. **Current navigation.** Correct the root README's stale description of the
   historical six-test result as current. Link the maintained authoring route
   and its actual evidence. Preserve all historical receipts.

These are corrections under accepted owners, not unresolved public architecture
choices. GM remains the composition owner; Resources remains the cleanup owner;
each Host owns cancellation, raw-operation custody, canonical state and effects.
Core business behavior and external semantic contract revisions remain unchanged.

### Rejected scope expansions and counterevidence

- A temporary packed Node spike reproduced receiver loss for class prototype
  methods in a Format port and provider. The initial interpretation as a valid
  CMS implementation was wrong: CMS explicitly forbids prototype-method ports.
  Preserve that result as counterevidence and add a rejection control; do not
  add binding wrappers or relax the arrow-port contract.
- EF's 17 focused matcher/admission tests and additional inert-data probes
  passed. An accidental rejected-Promise validator can still terminate Node
  after synchronous refusal, but trusted synchronous owner predicates are an
  explicit precondition. No asynchronous-validator support, thenable execution
  or global rejection handler belongs in this correction.
- A GM failed-child retry probe returned incomplete debt while its parent
  continued. Accepted ADR-0030 requires dependencies needed by a later retry
  to remain in a separately held outer scope. LMU retains its original close
  and never performs that retry. No GM runtime change is justified.
- Smoke does not prove wiring, physical resource release or production CMS
  admission. Keep the existing handwritten oracles, native FD/DOM checks and
  stated TEST limitations; do not promote their evidence class.

## Implementation and acceptance

| Step | Deliverable and observable exit |
| --- | --- |
| P0 | Publish this Markdown plan and draft PR; perform at least two independent critique/correction rounds before maintained implementation. Record findings and dispositions below. |
| P1 | Add separate cancellation and raw-custody regression observations in the existing packed Node/Chromium harnesses. Hold B's real acquisition, request disposal, await an explicit setup-abort barrier, retain native/state witnesses and no published B facade, then release and inspect the actual Assembly cancellation result. A small typed TEST probe in separately compiled Host copies observes the original run Promise and records the actual scope-close boundary; its signal-preserving omit-custody control must fail the intended ordering assertion. Preserve red evidence at its actual revision. |
| P2 | Track construction with the existing invocation owner, forward the native signal, and retain the original close/report semantics. Failure handling runs after tracked construction settles. No duplicated drain mechanism, hidden retry or public lifecycle API. |
| P3 | Use the real root with public Conformance smoke: seven independently expected steps per A/B/C selection (normal plus fail/abort at Document, selected Format and Export), all reports settled and complete. Require actual delivery acquisitions/releases with no remaining TEST leases; calibrate the deterministic fake before fixing its exact counts. Prototype rejection must be conformance.ports.prototype-member after complete cleanup. The cleanup control must be conformance.smoke.failed with the intentional failed debt and retained TEST lease, reclaimed separately in finally. Preserve wiring, installed-byte and native lifetime oracles. |
| P4 | Correct arrow-port authoring, explicit fixture profile identities, the reviewed CMS coordinate and maintained navigation. Keep the same business outputs and package cohort. |
| P5 | Run strict TypeScript 7.0.2 and installed source gates, the full packed suite including actual Chromium, and independent implementation review. Fix substantive findings, then verify exact-head CI, ordinary squash merge with an explicit Conventional Commit subject, final source/attribution and actual-main CI. |

### Discriminating construction observation

Holding `afterAcquire` alone is not a custody proof: Resources already waits for
pending setup. Keep the explicit setup-abort event separate from the run result.
An acquired-resource failure may be an actual `failed` Assembly outcome carrying
cancellation, rather than `cancelled`; neither an arbitrary failure nor an
unstarted-run sentinel counts as cancellation evidence.

A small typed TEST helper observes the actual raw Promise, starts its pending
observation before invoking run and returns that identical Promise. Both
fulfillment and rejection clear the observation; synchronous throws clear it
before propagation. Separately compiled Host copies record that observation
immediately before the real scope close and always perform the real close.
The probe does not throw, delay cleanup, replace the returned Promise or claim
native release. Assert ordering only after both restart and disposal settle.
Core/adapter artifacts and native FD/DOM observations remain independent.

A compiled control bypasses only construction's `ingress.invoke`, retaining
the same signal, resource adapter and observer. It must complete teardown and
then fail the exact premature-close assertion. This demonstrates that forwarding
cancellation alone cannot make the custody gate pass. Passing the setup signal
to the existing TEST `afterAcquire` hook is a bounded argument addition for an
explicit abort barrier. Resolve every barrier and drain every started flight
in `finally`; a reentrant factory requests disposal and returns without awaiting
its own disposal.

Construction regression observations must come from actual outcome/cancellation,
native file descriptors or DOM listeners, and explicit barriers. They must not
replace raw settlement with cancellation, a timeout, a guessed tick count or
the Host's own asserted cleanup flag. A partial setup still owns cleanup for
an acquired value that it never returned. Failure and cancellation preserve
borrowed state until explicit teardown and never construct a successor early.

Do not add another runner, test framework, package or generic source parser.
Reuse existing files and qualified public tools. Test-only fakes and deliberate
negative cases stay visibly separate from supported authoring examples. Existing
Node/browser behavior, source mutants and artifact controls remain required.
If a regression cannot distinguish the old behavior, refine its observation
before calling it evidence of the fix.

## Estimate and risks

Incremental handwritten reference/integration changes: 50–120 LOC.
Tests/qualification changes: 260–440 LOC. Documentation: 140–220 LOC.
Production runtime: 0 LOC. No dependency, lockfile, native-code or release work.
Focused engineering estimate: 1–3 days including review and native CI; not a
delivery promise. Fitness 9/10, expected reliability in the selected finite TEST
scope 8/10, implementation/maintenance complexity 4/10, estimate confidence 7/10.
Scores are engineering judgments, not empirical probabilities.

The main risk is a construction/close self-wait cycle; tracked run settlement and
outer failure handling must be visibly separate. A second risk is a vacuous
smoke route that ignores the injected API; the existing Conformance guard and
independent expected steps must reject it. Native and browser differences remain
in their own Hosts. Limited local execution does not relax remote CI or justify
a synthetic browser substitute.

## Review and execution record

| Round | Findings and disposition |
| --- | --- |
| Audit | Three independent source reviews completed across LMU, GM and EF. Corrected the invalid class-port interpretation against the exact CMS before implementation. No GM/EF production change selected. |
| Plan round 1 | Three independent reviewers read 51cc72b. Accepted their correction: pending setup does not distinguish raw-run drain. Added unchanged-Promise/real-close observation, the signal-preserving omit-custody control, precise cancellation evidence, seven smoke steps per selection and exact negative-control reasons. Kept distinct captured profile IDs and existing package ownership. |
| Plan round 2 | Three independent reviewers read corrected revision 872b2534743f64d3155b0f7aa8f692722d141262 and reported GO before implementation. Their final clarification keeps expected smoke lease counts independent of measured output. No remaining plan blocker. |
| P1 red checkpoint | After all round-two GOs, strict source checks passed. The packed Node N11 regression failed at `construction run did not observe cancellation`, after actual teardown. Its observed Assembly outcome was `failed` / `factory` / `assembly.run.factory-rejected` at `fixture/export/default`, with `Node setup was cancelled`, no cancellation metadata, and actual scope close recorded at `pending`. The analogous real-Chromium regression is included for hosted CI. No construction fix is included in this checkpoint. |
| Implementation / E2E | P2–P5 and final exact-source E2E remain to be verified. |
