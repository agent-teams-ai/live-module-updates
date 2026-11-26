# Foundation qualification through representative fixtures

Status: maintained qualification design; current checkpoint refreshed 2026-11-26.
The scoped modular suite and independent source reviews passed at `6b22e4b`.
Earlier exact results remain preserved below.
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

Later fixtures can extend the family with bounded streams, candidate replacement
or artifact admission when those discriminators are needed. Do not add all of
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
| Full live update — LMU and actual authorities | Atomic select/retain, failed B preserving A, useful B adoption while admitted A work remains coherent, original-attempt reconciliation, stale-writer rejection and retirement holds | Operation proposal plus mechanism witnesses. No implemented complete LMU runtime; supported public admission/custody path must be established before claiming this row. |
| Desktop — selected shell and privileged receiver | Actual renderer/main or native boundary, versioned IPC, malformed/denied calls, native resources, recovery and observed shutdown on selected OS | Required design boundary; exact shell/profile and native qualification remain open. Node plus browser tests do not qualify Desktop. |
| Untrusted code — selected executor/authority | Denied file/network/IPC and privilege access, current grants at the real effect receiver, quotas and actual termination under adversarial behavior | Required design boundary; selected enforceable mechanism and native evidence remain open. A grant toggle, Worker, process label or signed artifact does not prove containment. |
| Optional portable UI — semantic owner and presentation adapters | One declared interaction through independent presentations; unsupported required contribution, action identity, stale results, keyboard/focus and accessible behavior | Current raw DOM interaction is one bounded presentation. No shared UI vocabulary, renderer, vendor library or cross-presentation/a11y qualification is selected. |
| Durable recovery / broader load — actual state and execution owners | Real transaction/receiver recovery, interruption schedule, declared concurrency and retention budgets, bounded long-lived work | Historical SQLite/file/order witnesses remain limited to their inputs. No distributed exactly-once, multi-tab CAS, crash-durable write or thousand-concurrent-operation result. |

An ordinary library may qualify without a public extension SPI. Stable SPI
publication retains its independently authored implementations and conformance
requirements at EF. Product adoption retains its own accepted pins and gates.
Neither claim is silently inherited from successful test Hosts.

## 3. Exact portable-document result

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
artifact-to-effect admission under EF; complete update admission/reconciliation
under LMU; and real Desktop, untrusted-executor and optional UI profiles at their
owners. These can progress in parallel when independent. Select a substantive
profile and its accepted mechanism before dependent implementation; use a
discriminating spike for unresolved technical alternatives. No product launch
is needed to run those fixtures, and no single passing row closes all of them.

For complete-operation work, follow the [L0–L7 implementation steps](../plans/first-operation-implementation-plan.md)
and their independent adverse witnesses. This matrix owns claim/evidence
classification; the implementation plan does not mark an unexecuted row passed.
