# Foundation qualification through representative fixtures

Status: maintained qualification design; current checkpoint refreshed 2026-11-26.
The current exact-source result and independent review are recorded below.
Earlier exact results remain preserved as separate checkpoints.
The owner's clarified sequence is foundation first, applications afterward.
This matrix names falsifiable claims and their evidence; it is not another
repository admission policy, universal test framework or stable public API.
The [delivery plan](../plans/foundation-delivery-plan.md) owns the sequence;
the [open decisions](../decisions/open-decisions.md) retain exact profile choices.

## 1. Representative behavior and ownership

Use small features with real state, effects and lifetimes. Their contracts should
resemble expected applications without requiring those applications to exist.
The current reference contains Document, Format and Export features. Its ordinary
core owns validation, formatting and use-case coordination; each independent
test Host owns canonical state, final grant/revision validation, receipts and
cleanup. The core uses narrow ports without GM, UI or platform dependencies.
A separately packed optional GM adapter supplies composition. The implemented
controlled-restart profile has the bounded integrated result below, including
the corrected package-peer policy and abort-aware browser-harness cleanup.

The complete-operation successor below adds actual candidate replacement.
Later fixtures can extend the family with bounded streams or artifact admission
when those discriminators are needed. Do not add all of
them to the first edit operation or copy the LMU coordinator into each Host.
Expected outcomes and denied effects must be specified independently from the
implementation under test. Reusing input types or encoding grammar is valid;
deriving expected decisions through the tested reducer is not an independent
oracle.

## 2. Claims and current evidence

Rows are independent scopes, not a single all-or-nothing production gate.
Use actual owner requirements to select a profile. Browser, Desktop and
untrusted execution constrain architecture from the start; a pending native row
does not erase that requirement or block unrelated qualified static work.

| Claim and owner | Discriminating evidence | Current observation and remaining limit |
| --- | --- | --- |
| Static composition — GM | Public declarations/bindings, materially different profiles, rejected bindings before factory effects, source boundaries and borrowed lifetimes | P1 and the integrated `6b22e4b` result execute public GM in Node and Chromium. M1 checks three-feature wiring and semantic A/B/C contracts through installed exports; unsupported revision/dependency cases reject before effects. Historical P1–P12 controls remain separately scoped. |
| Authoring source boundaries — fixture checks | Real source parsing, exact tool/standard identities, forbidden dependency/placement mutations and restored-source acceptance | The `6b22e4b` checkpoint passes installed Foundation/FMS/GM checks and four mutation subtests over the actual flat core/adapter source. This is fixture-local qualification, not whole-repository production admission. |
| Packed ordinary behavior — capability contract | Public exports/declarations resolve in an isolated installed consumer; accepted edit, invalid input, stale revision and revoked grant match independent state/receipt expectations; installed bytes and owner receipts survive adversarial controls | Q1/Q1b plus artifact/authority controls passed in the six-test `6083e89` result below. Test package only; no public LMU release, installation/admission SPI or crash durability. |
| Independent Node/browser use — test Hosts | One installed ESM artifact executes through independently wired file and browser-storage owners; response hashes agree; both execution orders reset to the expected initial state | `portable-document/Q2` passed in actual Chromium. These are two test Hosts using one core, not two production adoptions or independent plugin SPI implementations. |
| Cleanup oracle — fixture lifetime owner | Independently omit Save, Query, Revoke or Close listener removal; actual post-close dispatch must fail the corresponding oracle, including query error/repeated close | Q3 passed all four rejecting controls in the `6083e89` result. A closed-state guard cannot hide the tested retained listener; no arbitrary leak freedom or hostile-code stop is claimed. |
| Controlled restart — TEST Hosts and Resources | Stop ingress, retain raw asynchronous work until settlement, preserve canonical state, reject stale/revoked effects and refuse B while original cleanup is incomplete | The `6b22e4b` Node/Chromium suite passes the supported finite-work, actual resource and rejecting-control cases. No live overlap, stream custody, fleet publication or complete LMU operation follows. |
| Installable contribution — EF and test Host | Actual verified artifact/import closure to admitted invocation, denied/tampered/incompatible/wrong-scope/stale/revoked paths, disable/uninstall and explicit data retention | [EF #66](https://github.com/agent-teams-ai/extension-foundation/pull/66) supplies the bounded trusted Node package-to-effect path. [EF #68](https://github.com/agent-teams-ai/extension-foundation/pull/68) adds EF-local TEST exact-revision compatibility work. Neither is an EF runtime integration in this LMU reference or proof of signed OCI trust, durable installation or production SPI. |
| Full live update — LMU and actual authorities | Atomic select/retain, failed B preserving A, useful B adoption while admitted A work remains coherent, original-attempt reconciliation, stale-writer rejection and retirement holds | The private complete operation passed the actual packed Node/Chromium campaign at `6089f0a`, including live overlap, original-attempt recovery and six defect controls per target; see section 3c. This is the selected finite session profile, not npm release, EF admission, durable recovery or automatic product adoption. |
| Desktop — selected shell and privileged receiver | Actual renderer/main or native boundary, versioned IPC, malformed/denied calls, native resources, recovery and observed shutdown on selected OS | Required design boundary; exact shell/profile and native qualification remain open. Node plus browser tests do not qualify Desktop. |
| Untrusted code — selected executor/authority | Denied file/network/IPC and privilege access, current grants at the real effect receiver, quotas and actual termination under adversarial behavior | Required design boundary; selected enforceable mechanism and native evidence remain open. A grant toggle, Worker, process label or signed artifact does not prove containment. |
| Optional portable UI — semantic owner and presentation adapters | One declared interaction through independent presentations; unsupported required contribution, action identity, stale results, keyboard/focus and accessible behavior | Current raw DOM interaction is one bounded presentation. No shared UI vocabulary, renderer, vendor library or cross-presentation/a11y qualification is selected. |
| Durable recovery / broader load — actual state and execution owners | Real transaction/receiver recovery, interruption schedule, declared concurrency and retention budgets, bounded long-lived work | Historical SQLite/file/order witnesses remain limited to their inputs. No distributed exactly-once, multi-tab CAS, crash-durable write or thousand-concurrent-operation result. |

An ordinary library may qualify without a public extension SPI. Stable SPI
publication retains its independently authored implementations and conformance
requirements at EF. Product adoption retains its own accepted pins and gates.
Neither claim is silently inherited from successful test Hosts.

## 3. Exact portable-document result

### Independent installed feature, 2026-11-26

The [B0 plan](../plans/installed-feature-consumer-plan.md) is implemented in
workstream B's single PR. **46 tests passed, zero failures, skips or
cancellations**, including actual Chromium regression, at
`0721ffeee2fac54123592ea8c46f418eb801c4a4`.

| Evidence field | Exact result |
| --- | --- |
| Corrected source | [`0721ffeee2fac54123592ea8c46f418eb801c4a4`](https://github.com/agent-teams-ai/live-module-updates/commit/0721ffeee2fac54123592ea8c46f418eb801c4a4) |
| Complete native execution | [Run 45903083884 / job 140193279968](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45903083884/job/140193279968): 46/46; strict compiler/source gates, frozen installation and pinned Chromium installation succeeded |
| Input and observation archive | [Artifact 15156204421](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45903083884/artifacts/15156204421), including installed-consumer evidence and its actual package lock |
| Preserved failure | [Pre-change compiler baseline](evidence/installed-feature-consumer-20261126/README.md): three missing canonical exports, exactly three TS2305 diagnostics after correcting the test's ambient configuration |
| Scope | A new independently authored static Node feature and all previous Node/Chromium regression; no live-update or new browser-summary claim |

M5 installs the verified core/adapter archives in a second clean directory
outside the provider build root. The summary feature is the sole entry root;
its required Export slot reaches the real provider graph. Complete inherited
contracts, independent value/revision conflicts, identical overlaps, removal
and restoration of the public exports, and the actual hidden-file export error
are all discriminated. Useful publication returns revision 7 and 22 JavaScript
code units for `"Document r7\nMiXeD text"`. Current receiver denial produces
no extra delivery. Missing Export fails before factories or effects. Original
Resources close agrees with the external lease count and preserves borrowed
state. Whole-module FMS/CMS and the forbidden-GM application control pass.

Root review checked each changed implementation file after the author's local
positive and negative runs. Complete-operation independent reviews remain B6;
this checkpoint does not claim their completion or repository admission.

### Complete feature contracts and storage acquisition, 2026-11-26

The [bounded follow-up plan](../plans/module-authoring-contract-storage-plan.md)
completed two independent review rounds before implementation. This slice
corrects an incomplete standalone Export contract map and Browser Host storage
acquisition after owned DOM creation. **44 tests passed, zero failures, skips,
cancellations or todo**, including actual Chromium, at
`7ff1b0492e955b1df0ff9846986c305c8798438b`. The exact original failures remain preserved.

| Evidence field | Exact result |
| --- | --- |
| Preserved pre-fix source | [`fd33d09935e092221b1161369a7be0099096ee5e`](https://github.com/agent-teams-ai/live-module-updates/commit/fd33d09935e092221b1161369a7be0099096ee5e), [run 45832279729 / job 139951844778](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45832279729/job/139951844778): 44 tests, 42 passed, exactly independent feature parity and native storage denial failed; zero skips/cancellations/todo |
| Pre-fix evidence | [Artifact 15122902308](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45832279729/artifacts/15122902308), downloaded archive SHA256 `869d7f639a2bc69b45e95a27a6cf4b7fc94fafa1cae021acc0d93d8e15e7c29c` |
| Corrected source | [`7ff1b0492e955b1df0ff9846986c305c8798438b`](https://github.com/agent-teams-ai/live-module-updates/commit/7ff1b0492e955b1df0ff9846986c305c8798438b), [run 45833913782 / job 139957585454](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45833913782/job/139957585454): all 44 passed |
| Corrected evidence | [Artifact 15124201132](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45833913782/artifacts/15124201132), downloaded archive SHA256 `a08e0fb26966ceff46f1a67d8e32e31b5f4fdc0dd8f1575ef120e85786174d7a` |
| Native execution | Unchanged pinned Chrome Headless Shell 159.0.8154.6 build 1255 on Ubuntu 24.04; actual installed ESM bytes checked for both storage scenarios |
| Review / final delivery | Two independent implementation reviewers reconfirmed the published source. [PR #6](https://github.com/agent-teams-ai/live-module-updates/pull/6) retains final documentation/head checks, merge attribution and actual-main verification; later prose revisions do not rename these executions |

The pre-fix compiler checkpoint uses the actual three contract files against the packed
core and installed public GM declarations, with no Host aggregate or future type
export. It fails TS2339 for missing `fixture/document/state` and three TS2344
key/value/token parity assertions. The corrected M4 gate runs eight compiler
programs: complete union/interface parity, two independent omissions, separate
unused value/revision conflicts, their collapsed-base controls and identical
overlap. Four programs compile; four reject only the specified diagnostics.

The pre-fix denied-storage observation is native: the real getter throws twice, failure
cleanup replaces the first exception and leaves one inserted root. The normal
origin quota control passes on that same pre-fix source: calibration and Host
failure are separate, and the Host removes its acquired root while preserving
unrelated storage. The fix acquires the required Storage holder before DOM and
keeps that holder for the existing operations. Corrected native denial observes
one getter exception, preserves its identity, constructs no provider and observes
zero owned DOM insertions and zero retained roots. The quota case still removes its acquired root and
preserves unrelated keys/values. This does not add fallback, retry,
a cleanup manager or destroyed-context recovery. Both remain TEST/reference
evidence in one live execution context, without a new public runtime or npm release.

### Construction and full-root follow-up, 2026-11-26

**41 tests passed, zero failures/skips/cancellations/todo**, including actual
Chromium, at `926d474d031db630b81694c1659e435b9f016873`. The
[critical review plan](../plans/module-authoring-critical-review-plan.md) records
two independent plan-review rounds before implementation and the bounded changes.

| Evidence field | Exact result |
| --- | --- |
| Preserved pre-fix source | [`c701a6bd33475b1590c44588951e1fb358fa44c2`](https://github.com/agent-teams-ai/live-module-updates/commit/c701a6bd33475b1590c44588951e1fb358fa44c2), [run 45739825330 / job 139641793448](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45739825330/job/139641793448): 38 tests, 36 passed, exactly Node and Chromium construction failed at missing cancellation |
| Pre-fix evidence | [Artifact 15080722133](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45739825330/artifacts/15080722133), archive SHA256 `afa8d61ba8c63301d2525aa8aaad683511820f6c48c3b87b5d6489eb1fea3136` |
| Corrected source | [`926d474d031db630b81694c1659e435b9f016873`](https://github.com/agent-teams-ai/live-module-updates/commit/926d474d031db630b81694c1659e435b9f016873), [run 45740189099 / job 139642989290](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45740189099/job/139642989290): all 41 passed |
| Corrected evidence | [Artifact 15080249368](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45740189099/artifacts/15080249368), archive SHA256 `6640021caf43e1d1ada1eadaeac626ba0827d826ad2f43e6cd54ecbd3220509e` |
| Tools / native runtime | Unchanged frozen cohort: Node 24.22.3, pnpm 11.25.0, TypeScript 7.0.2, Playwright 1.65.1, actual Chrome Headless Shell 159.0.8154.6 build 1255 on Ubuntu 24.04 |
| Review / final delivery | [PR #5](https://github.com/agent-teams-ai/live-module-updates/pull/5) retains exact final head, merge attribution and actual-main checks; later documentation revisions do not rename these executions |

N11 and the browser construction case independently observe setup cancellation,
the actual Assembly outcome, raw-run settlement before scope close, retained
canonical state, and native FD/DOM cleanup. Signal-preserving controls omit only
construction custody; both are rejected for the exact premature-close assertion
after real teardown. The observer returns the same raw Promise, performs the
real close, and lives only in separately typechecked TEST Host copies.

M3 uses public Conformance with the actual root and its supplied typed API:
seven expected steps per A/B/C provider, **21 smoke steps inside one named test**,
nine delivery acquisitions/releases and no retained TEST leases. Its prototype
control rejects `conformance.ports.prototype-member` after complete cleanup;
its cleanup control rejects `conformance.smoke.failed` with three original failed
debts and three held leases. Separate TEST reclamation preserves those reports.
These are fake-lease observations; actual native lifetime remains independently
qualified by the Node/Chromium cases. Handwritten wiring, profile identities,
installed-byte controls and all prior source/authority cases remain required.

The [maintained reference](../../tests/qualification/portable-document/README.md)
still uses private fixture packages, controlled restart, trusted finite work and
one Host at a time. No new production package, supported public plugin SPI, live
A/B overlap, product migration or npm publication is established.

### Modular authoring checkpoint, 2026-11-26

**Full scoped modular execution and independent source review passed at
`6b22e4b`.** This includes the package-peer metadata and browser-harness cleanup
corrections. A passing P1 or source-check result alone does not establish the
integrated claim below.

| Executed scope | Exact source and run | Observation |
| --- | --- | --- |
| Public-package P1 discriminator | [`7bb9aa85ef8d2867534ba59269d75e72606043c6`](https://github.com/agent-teams-ai/live-module-updates/commit/7bb9aa85ef8d2867534ba59269d75e72606043c6), [run 45721438195](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45721438195/job/139580479977) | Public Core/Assembly/Resources construction and close execute in Node and actual Chromium using the checked installed assets |
| Earlier baseline/source checkpoint | [`bb270ead67ef3f985559ebdcfb0c7783dfce3c23`](https://github.com/agent-teams-ai/live-module-updates/commit/bb270ead67ef3f985559ebdcfb0c7783dfce3c23), [run 45726241258](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45726241258/job/139596712267) | 13 Node-runner tests passed; zero failed/skipped/cancelled. This count includes the source test's four subtests, the two P1 cases and the retained ordinary cases |
| Earlier integrated modular result | [`1b1891679da90f13ab3e9ea2e57eb8b3e9627aa1`](https://github.com/agent-teams-ai/live-module-updates/commit/1b1891679da90f13ab3e9ea2e57eb8b3e9627aa1), [run 45727313854](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45727313854/job/139600310699) | 36 passed before the final metadata/harness corrections; retained as its own exact-source result |
| Prior corrected scoped reference | [`6b22e4b5a9ce07b9be3e861004c880e68b5b88de`](https://github.com/agent-teams-ai/live-module-updates/commit/6b22e4b5a9ce07b9be3e861004c880e68b5b88de), [run 45728069283](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45728069283/job/139602862268) | 36 passed, zero failed/skipped/cancelled: M1/M2, 11 Node cases, nine Chromium scenarios plus a listener-removal mutant, retained ordinary cases, P1 and source mutations |

The integrated result used Chrome Headless Shell **159.0.8154.6**, build **1255**,
and retained [artifact 15074823866](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45728069283/artifacts/15074823866),
archive SHA256 `6787b5bb6bf052d82670900ebde8d47ce6e794da450e3205a3ca27cc69216a25`.
Its source identities, logs and scope stay attached to `6b22e4b`; repeated runs
do not add new profiles. The maintained
[authoring route](../../tests/qualification/portable-document/README.md) and
[implementation record](../plans/module-authoring-implementation-plan.md#execution-checkpoint-2026-11-26)
describe the qualified source and delivery scope. No npm publication, public
LMU/EF runtime or product adoption is established by this checkpoint.

### Delivered six-test successor, 2026-11-25

The original actual-main job was inspected again for this documentation refresh:
checkout `6083e89`, strict TypeScript 7.0.2, actual Chromium and **6 passed,
0 failed/skipped/cancelled/todo**. That source has six named tests;
its delivery receipt distinguishes **6 positive Host scenarios** (4 Node,
2 browser) and **12 rejecting controls within those tests**, not eighteen tests
or new independent runtime profiles.

| Evidence field | Exact value |
| --- | --- |
| Executed source and merge | [`6083e89ba7781b12571a102d273058052ad94148`](https://github.com/agent-teams-ai/live-module-updates/commit/6083e89ba7781b12571a102d273058052ad94148), [PR #3](https://github.com/agent-teams-ai/live-module-updates/pull/3) |
| Actual-main run / job | [45518777341 / 138884992384](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45518777341/job/138884992384) |
| Tool cohort / browser | Node 24.22.3, pnpm 11.25.0, TypeScript 7.0.2, Playwright 1.65.1; Chrome Headless Shell 159.0.8154.6, build 1255 |
| Retained artifact | [14978894020](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45518777341/artifacts/14978894020) |
| Artifact archive SHA256 | `c00229e44de992cf45b37c3efaba1e1dbf4086874b5503d7db4f7217b4cdf421` |

The rejecting controls cover five installed-byte/inventory changes, one returned
receipt alias, four physical browser-listener cleanup omissions and two missing
revision/grant guards. Actual state and receipts are observed after accepted and
denied operations, including an action prepared before grant revocation.
The result is bounded F2 ordinary-library qualification. It does not implement
GM composition, EF production admission, stream custody or complete LMU updates.
The November 25 documentation refresh changed no executable inputs; that result
remains bound to its original source/run, not a new native execution of later code.

### Retained three-case checkpoint, 2026-11-24

The [original fixture source and commands](https://github.com/agent-teams-ai/live-module-updates/blob/c5f6ed8b75c490785679de7e813f54901ee4e3b0/tests/qualification/portable-document/README.md)
define three unique cases. The original hosted job log records the result:
**3 passed, 0 failed, 0 skipped, 0 cancelled**. Executing both Host orders does
not create extra unique cases.

| Evidence field | Exact value |
| --- | --- |
| Source | [`c5f6ed8b75c490785679de7e813f54901ee4e3b0`](https://github.com/agent-teams-ai/live-module-updates/commit/c5f6ed8b75c490785679de7e813f54901ee4e3b0) |
| Review/delivery route | [PR #2](https://github.com/agent-teams-ai/live-module-updates/pull/2) |
| Executed run / job | [45487365519 / 138776212003](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45487365519/job/138776212003) |
| Tool cohort | Node 24.22.3, pnpm 11.25.0, TypeScript 7.0.2, `@types/node` 24.19.1, Playwright 1.65.1; frozen graph and strict compilation |
| Actual browser | Playwright Chromium build 1255; Chrome Headless Shell 159.0.8154.6 |
| Retained evidence artifact | [14965145969](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45487365519/artifacts/14965145969) |
| Artifact archive SHA256 | `1bfbbbac4098e35317b9c901a75578cbd4f01865b3e0d68be9f5ad0b731d44ef` |

The result belongs to that executable source, not automatically to every later
documentation commit or merge. Exact later delivery/check identities belong to
the PR receipt. The checkpoint's earlier local Node pass and unavailable local
Chromium download are superseded for the browser claim by this hosted result;
they are not silently recounted as another native campaign.

The retained evidence binds source, lock, generated declarations, packed tarball,
installed artifact and browser response hashes to the actual run. It observes
one synchronous file owner and one fresh browser context/origin. It does not
qualify concurrent tabs, multiple writers/processes, transport recovery,
discovery/admission, plugin removal, stream custody or live replacement.

## 3a. Native invocation and authority discriminator

[ADR-0001](../decisions/0001-cooperative-update-profile.md) selects the bounded
cooperative fixture. L1 passed on both actual runtimes before production API
implementation began. This is an invocation/authority feasibility result, not
the complete update runtime or a production package admission.

| Evidence field | Exact result |
| --- | --- |
| Source | [`2f7392f3b1a9541e84ece0a910a14c49cbacb62f`](https://github.com/agent-teams-ai/live-module-updates/commit/2f7392f3b1a9541e84ece0a910a14c49cbacb62f) |
| Native execution | [Run 45904704130 / job 140198533181](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45904704130/job/140198533181): both runner tests passed, no failures, cancellations or skips; strict TS and pinned browser installation passed |
| Observations per target | Ten invocation cases, eighteen authority cases and one coupled lost-acknowledgement case; Chromium additionally checks its native Storage replacement cleanup |
| Evidence archive | [Artifact 15158036050](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45904704130/artifacts/15158036050), uploaded ZIP SHA256 `f2fb808bfb7f3aa838abd685fa1b3664ee4f24d26c04296e237bd4c686e9b363` |
| Runtime and bytes | Node 24.22.3, TS 7.0.2, Resources 0.2.2, Playwright 1.65.1 and its real pinned Chromium; Node and browser evidence bind the same compiled candidate hash and public Resources inventory |

The explicit continuation retains A through nested/reentrant and post-await
work while fresh requests observe B. Registered descendants outlive an
unawaiting parent safely. Abandoning an observer does not release actual work.
The original native close flight and debt remain identifiable after a distinct
successful retry. One domain budget covers roots and descendants across
generations.

Independent Map and native Storage authorities condition publication at the
actual mutation. They preserve the original receipt through later progress,
refuse changed same-attempt input and retain nonterminal absence while the
original request can still commit. A transport that throws after native commit
does not prevent new calls using B. Retained A does not bypass current receiver
authority. Browser head and receipt share one native replacement operation.

The TEST candidate retains its two entries until session disposal. It does not
prove repeated-update retention, safe registry forgetting or the complete
prepare/publish/adopt/retire coordinator. Its split-selection negative control
proves witness sensitivity; B6 must mutate the actual operation path or use a
genuine faulty adapter with the same independent oracle. These limits remain
explicit in the retained history. After the section 3c replacement passed, the
precursor code/workflow was retired; its [navigation note](../../tests/qualification/update-operation/invocation-profile.md)
links immutable source, runs and the earlier installation failure.

## 3b. First private production checkpoint

The first substantive implementation and complete native source gates are
published at
[`97e051b73f42e485ca5479ecb06444edd548097c`](https://github.com/agent-teams-ai/live-module-updates/commit/97e051b73f42e485ca5479ecb06444edd548097c).
[ADR-0002](../decisions/0002-production-source-adoption.md) owns the FMS/quality
adoption and the [usage guide](../architecture/cooperative-operation-usage.md)
owns the implemented authoring contract.

| Evidence field | Exact result |
| --- | --- |
| Native library gate | [Run 45909011622 / job 140212574365](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45909011622/job/140212574365), complete `pnpm check`: **38 passed**, zero failed/cancelled/skipped |
| Source checks | Actual FMS, strict root/portable/tool/test compilers, unchanged typed and maintainability presets, build, full Foundation capabilities, development-only and registry assertions passed |
| Ordinary consumer | Artifact-only installation with exactly the LMU package; ES-only declarations, useful result `42`, refusal after close and retained original work/cleanup |
| Optional Resources consumer | Separate artifact-only installation with LMU and Resources 0.2.2; native setup, useful result `7`, exact cleanup and original close identity |
| Package bytes | Tarball SHA256 `c5524d0e0926b5a3d3b8572e034fab3684cb48e77225474d0ee230c4028b2acb`; packed/installed files and both integrity receipts checked |
| Raw receipt | [Unchanged CI consumer report](evidence/cooperative-operation-20261126/97e051b-packed-consumers.json) |
| Archive | [Artifact 15159337684](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45909011622/artifacts/15159337684); downloaded ZIP independently checked against `872546e025c582b337ccce9a30ca28dc5ba405ed9696c6c81d092222537f69c5` |
| Central configuration | [Run 45909012055 / job 140212576069](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45909012055/job/140212576069) passed with `configured_not_qualified`, `issues: []`; this is not managed Docs, registration or remote-protection qualification |

The 38-test total includes FMS controls, production feature tests and the two
clean-consumer paths in one runner test. Chromium was installed by this job, but
the new production artifact was not yet executed there. Its actual browser
operation belongs to B6; the earlier native L1 result is not substituted for it.
The existing B0 browser regression also passed on this source in
[run 45909011570](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45909011570).

The unchanged L1 precursor failed **before execution** at this same source in
[run 45909011563 / job 140212574092](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45909011563/job/140212574092).
The newly introduced parent workspace captured its dependency installation,
leaving the fixture-local compiler absent. The
[exact failing-step excerpt](evidence/cooperative-operation-20261126/97e051b-l1-install-failure.log)
and [original artifact 15158838139](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45909011563/artifacts/15158838139)
preserve this failure. Its repair gives the precursor its own empty workspace,
preserving the exact frozen graph and checks until B6 supersedes it. No native
L1 result is claimed for that failed run.

## 3c. Complete packed operation

The actual private operation passed in independent Node and Chromium Hosts at
[`6089f0a46206b696e81dbe8756e7e71e00a93dd7`](https://github.com/agent-teams-ai/live-module-updates/commit/6089f0a46206b696e81dbe8756e7e71e00a93dd7).
The selected scope is [ADR-0001](../decisions/0001-cooperative-update-profile.md):
trusted finite work in one process or realm/session, compatible borrowed state,
explicit owner limits and receiver-side effects. The same complete operation
runs in both targets; each Host independently owns authority and native resources.

| Evidence field | Exact result |
| --- | --- |
| Full native route | [Run 45913432029 / job 140226913006](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45913432029/job/140226913006): **52/52 passed**, zero failed/cancelled/skipped; all strict/FMS/stock Foundation gates passed |
| Packed campaign counts | 29 positive named rows and six exact defect rejections **per target**, inside two subtests and their shared parent; these row counts are not additional runner tests |
| Runtime/compiler | Node 24.22.3, TypeScript 7.0.2, pnpm 11.25.0, Playwright 1.65.1, actual Chrome Headless Shell 159.0.8154.6 build 1255 |
| Public GM cohort | Core/Assembly 0.8.0, Resources 0.2.2, Conformance 0.5.2; actual complete GM composition and supplied Host ports |
| LMU archive | SHA256 `5d088d203597ecf9da15797f0ebf974629f68984583984e340132ce3168dceb5`; same bytes in ordinary installed consumers, Node and Chromium |
| Root / consumer locks | Root SHA256 `3550572edd004a4b59bd1303267af954419b0c3edfad3dc1df9b1790b8927473`; combined consumer SHA256 `82d57c3e1f303800368d8dcae78d689dd80c72539a23fc2d6197db78c4f33ef6` |
| Raw reports | Unchanged [Node](evidence/cooperative-operation-20261126/6089f0a-node.json) and [Chromium](evidence/cooperative-operation-20261126/6089f0a-chromium.json) CI reports |
| Evidence archive | [Artifact 15160973973](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45913432029/artifacts/15160973973), independently downloaded ZIP SHA256 `3e45d1bae6e9fc3707c9b3b4f6860eec61c40d22b49933928fbbb18d1fc94292` |
| First failed run | `bfea5e5`, [run 45912637899 / job 140224383016](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45912637899/job/140224383016): 50/51, browser fixture removed before its test registration; [original excerpt](evidence/cooperative-operation-20261126/bfea5e5-browser-fixture-lifetime-failure.log) and [reviewed lifetime repair](../reviews/cooperative-operation-delivery-2026-11-26.md#first-hosted-b6-failure-the-shared-fixture-lifetime) remain available |

The useful operation edits the actual Host-owned document. New B calls return
`B:SEED`; admitted A work resumes coherently through its bound nested calls.
Current receiver checks reject stale or revoked effects. Canonical Map or
Storage replacement atomically records head and original receipt; a deliberately
lost acknowledgement after that mutation stays unknown until original lookup.
Failed/partial/late preparation, competing updates, current state/schema/grant
changes, exact replay, independent domains, session budgets and cleanup debt
retain their own observable outcomes.

Node uses actual file descriptors. Chromium uses genuine DOM listeners and
native sessionStorage, including foreign-resource preservation. Exact retirement,
reentrant close and abandoned caller waits preserve the real native owner until
admitted work ends. A later successful retry preserves the original debt report.
Receipt-capacity rows directly exercise the Host authority primitive after useful
A setup; they are not 32 complete replacements. Runtime attempt capacity has a
separate row.

The four library defects change one installed JavaScript file each: split
selection/admission, premature cleanup, unknown publication classified as refusal,
and overwrite of original cleanup debt. Two genuine faulty Host profiles bypass
the effect guard or remove B's resource under A's stable name. Every negative
performs useful A first and fails its exact named runtime oracle; compiler,
import, setup and unrelated teardown failures cannot substitute. Independent
review verified original archives, all eight retained mutated target files and
every browser-served LMU hash against the expected original or exact mutation.

This qualifies the declared fixture closure catalogue and selected ordinary
library profile. It does not qualify EF artifact admission, untrusted execution,
Desktop, Node ESM unloading, streams, cross-tab/process publication, durable
recovery, managed repository admission, npm publication or another product.
The EF join has its own B7 result and the final PR/actual-main source must retain
its own checks. The preliminary L1 implementation is retired after this proof;
historical findings, failures and immutable artifacts remain separately scoped.

## 4. Independent oracles, negative controls and reset

For each additional claim, record the useful result and a failure that would
falsify it before writing the implementation. Select applicable controls rather
than adding unrelated lifecycle hooks to pure behavior.

| Area | Required discriminator when the profile promises it |
| --- | --- |
| Packaging | Install built bytes outside source aliases, resolve only public exports and inspect emitted declaration/runtime closure with optional UI packages absent. |
| Authority/state | Observe the actual canonical owner/effect receiver; invalid input, unsupported contract, stale revision and revoked or wrong-scope authority cause no protected effect. |
| Lifetime | Observe owned file/listener/process/work witnesses, preserve borrowed resources, release deterministic barriers in failure paths and await the actual original cleanup flight. |
| Reset | Fresh roots, state/authority/receipt namespaces, ephemeral ports and browser contexts; repeat from initial state and exercise both Host orders. A generic active-handle count or `finally` alone is insufficient. |
| Adversarial control | Deliberately remove the relevant grant/fence/cleanup property and require a precise oracle failure. Setup, compilation or unavailable-runtime errors do not satisfy it. |
| Update/recovery | Record external effect/work and original-attempt receipts independently from the coordinator; preserve unknown publication and failed-cleanup debt rather than manufacture success. |

Do not hide a failure with arbitrary sleep, retries, a reset that deletes
evidence, or assertions generated by the code under test. Preserve failure
output and distinguish test cleanup from the product/Host property being
measured. Native fixtures must use disposable roots and their declared identities.

## 5. Architecture critique as observable failure criteria

The organization [Engineering Quality Standard](https://github.com/agent-teams-ai/.github/blob/main/docs/engineering-quality-standard.md)
owns the general rules. This table maps them to this qualification work without
creating another standard.

| Concern | Concrete failure to detect |
| --- | --- |
| Clean Architecture / dependency inversion | Portable behavior or declarations import a renderer, concrete storage/SDK, organization runtime or composition container instead of the narrow port they need. |
| Single responsibility / interface segregation | One Host context becomes a service bag, or a pure capability must implement irrelevant installation, stream or teardown methods. |
| Substitution / compatibility | A Host reports unsupported work as success, weakens errors/authority, or changes semantic revision meaning while preserving only the TypeScript shape. |
| DDD / authority | A shared library takes over a consuming product's private business policy or becomes a second writer of foreign canonical state; a fixture invents production-domain acceptance on behalf of Runtime or Orchestrator. A portable core may own its own domain/application semantics. |
| DRY / honest testing | A second resolver, lifecycle/update algorithm or grant registry appears; alternatively actual and expected decisions share the tested implementation and cannot disagree. |
| Practical scope | Empty packages, a universal UI schema/renderer or wire protocol is introduced before a demonstrated release/runtime/interaction boundary. |
| Security / recovery | Manifest requests act as grants, discovery evaluates untrusted code, cancellation is treated as physical stop, or timed-out publication is reported as definitely absent. |

## 6. Retained evidence and next discriminators

The [research map](README.md) retains original P1–P12 public-GM custody/identity
controls (12 unique cases, 24 executions), X1–X4 browser/HTTP skew cases (final
4/4, original 3/4 failure retained), and the Piral/Effect campaign (3 tests,
6 cases, 66 comparisons). Those are bounded mechanism studies, not this packed
artifact result or a complete foundation runtime. X4 is an application-level
incomplete acknowledgement, not a TCP-reset proof.

Next work follows the missing guarantee: public composition projection under GM;
artifact-to-effect admission under EF and its combined B7 operation under LMU;
and real Desktop, untrusted-executor and optional UI profiles at their owners. These can progress in parallel when independent. Select a substantive
profile and its accepted mechanism before dependent implementation; use a
discriminating spike for unresolved technical alternatives. No product launch
is needed to run those fixtures, and no single passing row closes all of them.

For complete-operation work, follow the [L0–L7 implementation steps](../plans/first-operation-implementation-plan.md)
and their independent adverse witnesses. This matrix owns claim/evidence
classification; the implementation plan does not mark an unexecuted row passed.
