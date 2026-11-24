# Foundation qualification through representative fixtures

Status: maintained qualification design and dated evidence snapshot, 2026-11-24.
The owner's clarified sequence is foundation first, applications afterward.
This matrix names falsifiable claims and their evidence; it is not another
repository admission policy, universal test framework or stable public API.
The [delivery plan](../plans/foundation-delivery-plan.md) owns the sequence;
the [open decisions](../decisions/open-decisions.md) retain exact profile choices.

## 1. Representative behavior and ownership

Use small features with real state, effects and lifetimes. Their contracts should
resemble expected applications without requiring those applications to exist.
The current slice reads and edits a versioned document. Its portable core owns
input validation and use-case coordination; each independent test Host owns
canonical test state, final grant/revision validation, receipts and cleanup.
The ordinary artifact uses narrow ports and contains no GM, UI or platform
dependency. It is not a miniature plugin platform or update runtime.

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
| Static composition — GM | Public declarations/bindings, two materially different profiles, rejected bindings before factory effects, source boundaries and borrowed lifetimes | Existing GM/P1–P12 controls are linked below. The portable-document fixture does not import or qualify GM composition. A new integrated composition claim needs its own exact result. |
| Packed ordinary behavior — capability contract | Public exports/declarations resolve in an isolated installed consumer; accepted edit, invalid input, stale revision and revoked grant match independent state/receipt expectations | `portable-document/Q1` passed at the exact source below. Test package only; no public LMU release, installation/admission SPI or crash durability. |
| Independent Node/browser use — test Hosts | One installed ESM artifact executes through independently wired file and browser-storage owners; response hashes agree; both execution orders reset to the expected initial state | `portable-document/Q2` passed in actual Chromium. These are two test Hosts using one core, not two production adoptions or independent plugin SPI implementations. |
| Cleanup oracle — fixture lifetime owner | A deliberate Save-listener cleanup omission must fail specifically on a post-close action; unrelated compiler/browser failures cannot count as the expected rejection | `portable-document/Q3` passed as a rejecting control. It validates the tested listener oracle, not arbitrary leak freedom or hostile-code stop. |
| Complete resource/work custody — existing lifetime owners | Partial/late construction, borrowed-provider survival, nested work/streams, cancellation, failed drain and retained original cleanup debt | Historical public-GM mechanism controls exist. This ordinary edit fixture has no stream or async update operation; no new complete-operation claim. |
| Installable contribution — EF and test Host | Actual verified artifact/import closure to admitted invocation, denied/tampered/incompatible/wrong-scope/stale/revoked paths, disable/uninstall and explicit data retention | Architecture and bounded probes only. Full installed-plugin path and production SPI remain unqualified; a local tarball install does not satisfy artifact trust/admission. |
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

The [fixture source and commands](../../tests/qualification/portable-document/README.md)
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
