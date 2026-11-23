# Cutover, admission and state custody: the critical implementation boundary

**2026-11-23 — research only.** This is a deeper follow-up to the
[G01-G18 evidence gaps](critical-evidence-gaps-2026-11-23.md), not an accepted
API, selected Q1-Q7 answer, production implementation, or complete-library E2E.
It adds a pinned source audit, a bounded schedule enumeration and a real
disposable SQLite transaction witness. The two experiments do not install or
execute Get Modular, Node, PostgreSQL, an application or the future library.
The earlier [Piral/Effect campaign](validation.md) remains separate.

## Decision brief: where the real work is

The difficult boundary is not loading B instead of A. It is keeping a coherent
meaning for **which work was admitted under which code, which effects remain
authorized, which state is current, and when A can actually be reclaimed**.
The following source audit narrows the reusable problem considerably.

| Finding | Evidence | Consequence before implementation |
| --- | --- | --- |
| Get Modular lifecycle-kernel admits/revokes one generation at a time and permits more than one active generation | Pinned source and upstream test inspection | The Host's routing cutover and invocation admission need a joined contract; do not promise that installing the kernel supplies the entire update operation |
| Quiesce refuses all new call and custody leases, including a new nested admission by an already-running caller | Pinned source and accepted candidate ADR | Drain must specify the boundary of admitted work, dependencies and continuations; do not silently reopen retired authority |
| Assembly input entries require **zero slots**, are borrowed, and never enter the created journal | Pinned public source, runtime admission guard and upstream test inspection | Reuse stable explicitly declared owner-supplied inputs; arbitrary incremental replacement of a graph with existing dependent instances is not an established Assembly API |
| Resources already tracks pending acquisitions and joins a close flight; Observation already suppresses obsolete query results and drains its owned loaders | Pinned source/contracts; prior Resources experiment | Do not write another scope manager, latest-only loader, reactive bus or cleanup counter |
| A current head alone loses the historical outcome of an attempt after later publication, even when the head has a monotonic revision | Executed SQLite witness | A durable profile needs a same-attempt receipt committed atomically with authority; a repeated intent must not re-publish or become a new operation |
| Even a safe atomic publication can cause rejected normal requests if selecting a route and admitting a call are separate | Executed finite model; not a real JS race test | Design a single local select-and-admit boundary or a strictly defined revalidation/retry *before* work has started |
| A genuinely shared exclusive resource can prohibit nondestructive preparation | Derived profile constraint; not executed | Keep a stable resource owner outside replaceable generations where possible, or explicitly select a handoff/restart profile with different availability guarantees |

## 1. What the existing Get Modular kernel really guarantees

Inspected Get Modular commit
[850bac5](https://github.com/agent-teams-ai/get-modular/tree/850bac5fd02fa5697846cc8958ac447d5c2ee7bb),
not a newly installed dependency. The package manifest at that revision is
[lifecycle-kernel 0.1.0, private](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/lifecycle-kernel/package.json).
The [candidate ADR-0029](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/docs/decisions/0029-admit-an-optional-lifecycle-kernel-candidate.md)
and [common Assembly guidance](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/docs/architecture/common-assembly.md#optional-dynamic-host-lifecycle-candidate)
bound its authority. Source admission is not public npm qualification. No
private import, copied kernel or change to that owning repository is proposed
as an immediate action.

### Exact contract, including the dangerous differences

| Kernel operation | Actual source behavior | Design consequence |
| --- | --- | --- |
| stage / activate | Creates or activates a specific identity; activation does not alter other generations | Two active records are legal. "Current" is not a kernel-wide singleton |
| beginCall | Requires active phase, creates one call lease | Root selection and the admission decision must be protected together |
| retainCustody | Requires staged or active phase; not available while quiescing | A late acquisition cannot be justified solely by an earlier parent call |
| quiesce | Closes new call/custody admission; preserves checkCall on old held calls | Compatible with an explicitly bounded drain, not a blanket promise that every nested call can start |
| retire | Changes phase; previously held call checks reject as revoked | Retirement is a semantic revocation, not simply the name for graceful drain |
| release / finishRetirement | Release is explicit/idempotent; finish requires zero call and custody counts | No automatic garbage-collector release; zero counts are not evidence that an external process or artifact is gone |

See [kernel.ts lines 26-135](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/lifecycle-kernel/src/features/lifecycle/kernel.ts#L26-L135)
and [semantic suite](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/lifecycle-kernel/tests/semantic-suite.mjs#L40-L94).
The inspected tests intentionally activate two generations, retain work on both,
and distinguish quiescing from revocation. We did not rerun those upstream tests.

### Admitted operation versus a new child call

The subtle failure is not hypothetical API naming: an A request admitted
before quiesce can later reach an await, then need another A capability. If the
adapter simply calls beginCall again for every nested dependency invocation, the
new admission is rejected by the existing candidate contract. If the adapter
instead resolves the newest generation from a global service locator, the old
operation may mix A and B contracts. Neither behavior is a correct universal
implementation of "let old work finish".

Three separate options to evaluate with the real consumer:

- **Closed operation cohort:** admit a finite request/command against one immutable
  prepared composition and retain its actual required provider/custody handles
  through completion, including the bounded continuations authorized by that
  profile. New acquisitions, new externally initiated calls, and expansion of
  privileges are not implicitly covered. This does **not** authorize bypassing
  ADR-0029's existing admission rules.
- **Explicit root drain:** stop new external admissions while a separately
  qualified Host allows only already owned internal continuations to reach their
  valid boundary. The selected execution mechanism needs an actual contract for
  that behavior; the current narrow kernel is not evidence of such support after
  quiesce/retire. Do not implement it by calling beginCall on a retired generation.
- **Controlled cancellation/restart:** stop at a documented safe boundary, report
  the result and retain recovery/cleanup ownership. This is not seamless drain
  and must not be selected silently when a deadline expires.

For a first trusted ordinary TypeScript profile, prefer the smallest closed
operation that the public mechanism can actually qualify. For long agent work
the natural boundary might be a command, turn, stream or session rather than
an arbitrary function. That is a product choice, not a new global default.
Security revocation is another distinct policy: preserving executable affinity
does not imply preserving a grant that was explicitly revoked.

Do not use AsyncLocalStorage as proof of a live lease. Node's
[async context API](https://nodejs.org/api/async_context.html) can propagate or
capture context; it does not retain physical resources or revoke detached
callbacks. A captured context may outlive its operation. A Node adapter may use
native context propagation for convenience, but the operation/receiver must
still verify the actual owned identity and lifetime, and the portable core
cannot require Node builtins.

The same rule applies to tokens in the candidate WeakMaps: numeric counts
are not decremented by loss of a token reference. A strong Host-owned attempt
record must retain its actual outstanding handles/leases until their explicit
release is established. A lost receipt is recovery debt, not a justification
to infer completion from garbage collection.

## 2. Executed ordering witness: atomize the correct boundary

The [frozen research probe](evidence/critical-ordering-20261123/probe.py)
enumerated all interleavings for a model with one update and one ordinary
caller. A begins active; B begins staged. The update performs three actions
(activate B, route to B, quiesce A), either as separate events or one modeled
atomic event. The caller reads the route and attempts admission either as
separate events or one modeled atomic acquire. A new call is allowed only
when the selected generation is active, matching the relevant narrow source
condition; the model does not execute the actual kernel or a JS event loop.

Actual [raw output](evidence/critical-ordering-20261123/receipt.json):

| Update ordering | Caller boundary | Enumerated schedules | Refused admission |
| --- | --- | ---: | ---: |
| Activate B, route B, quiesce A separately | Read then admit | 10 | 2 |
| Activate B, quiesce A, route B separately | Read then admit | 10 | 6 |
| Atomic switch | Read then admit | 3 | 1 |
| Atomic switch | Atomic select-and-admit | 2 | 0 |

The third row matters most: moving the update actions into one critical section
does **not** fix a caller that read A before yielding and then tries to admit A
after the switch. Refusal is allowed by the kernel; it is an observable gap
if a profile promises continuous admission without a defined retry. These are
counts of enumerated orderings, **not probabilities, performance measurements
or a proof of the whole system**. The last row is a positive control for this
small model, not a production PASS. Reentrant callbacks, two publishers,
cross-domain dependencies, failure mid-switch, streams and real scheduling
are outside its state space.

A minimal local profile can put selection, lease admission and route mutation
in one bounded non-yielding owner operation. Do not put imports, arbitrary
factory callbacks, abort listeners, event emission or user-defined getters
inside that boundary. An ordinary synchronous JavaScript call can be reentrant
if it calls application code. For a caller that already started executing a
side effect, redoing the whole invocation is not a harmless retry. A
cross-process canonical CAS and a local routing update are different boundaries;
a process can die between them. Report that as a recoverable transition in
a supported durable profile, not as a single global atomic instruction.

The analogy with mature lifetime mechanisms is useful, but should not expand
dependencies: Linux [RCU](https://docs.kernel.org/RCU/Design/Requirements/Requirements.html)
waits for pre-existing protected readers before reclamation; sleepable SRCU
scopes that waiting to a domain. Rust
[ArcSwap's owned load](https://docs.rs/arc-swap/latest/arc_swap/docs/performance/)
is suitable for longer retention than a borrowed guard. These mechanisms
explain the shape of "publish new; retain admitted old; reclaim only when
safe." They do not provide TypeScript effect authority, arbitrary async
cleanup, or a ready adapter for this project. Do not build RCU or add Rust just
to implement a well-bounded single-agent route.

## 3. A separate critical limit: real partial composition and borrowed lifetime

The existing Assembly implementation has a useful **but narrower** reuse seam.
Its root exports input and the preparation/run APIs. The input constructor
requires a declaration with an empty slots tuple; captureInput also rejects
a nonempty slots list at runtime. Run inputs are admitted before factories,
borrowed from their owner, and omitted from the construction journal. Assembly
does not own resource cleanup or determine useful readiness. It retains the
raw returned factory product when validation fails after fulfillment; cleanup
must cover that product as well as the successfully recorded entries.

Exact source and source-inspected tests:
[entry constructor](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/assembly/src/features/construction/entry.ts#L12-L17),
[runtime input guard](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/assembly/src/features/construction/entry-store.ts#L27-L35),
[run journal and returned-product handoff](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/assembly/src/features/construction/run.ts#L107-L151),
[existing rejecting/positive input tests](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/tests/assembly/inputs.test.mjs),
[public root](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/assembly/src/index.ts).
No installed-package result is inferred from these observations.

This rules out a seductive shortcut: take any unchanged module instance from
the old plan, erase its slots, and call it an Assembly input. That would discard
real declared dependency semantics, potentially change the plan identity and
hide retained physical dependencies. The source supports explicit owner-supplied
slot-free boundary inputs, not arbitrary partial execution of an existing graph.

| Option for reuse | Suitable first use | Reject / revisit when |
| --- | --- | --- |
| Rebuild one complete affected composition | Small replaceable feature, with no exclusive internal resource overlap | A large transitive closure or important long-lived service would be unnecessarily reconstructed |
| Borrow a stable owner-supplied input | Existing DB pool, listener/router, settings or other real capability owner outside the replacement region | Input actually needs undeclared graph dependencies, or its owner can close it while the successor still uses it |
| Qualify an upstream incremental-construction contract | A real second consumer demonstrates repeated unavoidable expensive reconstruction or unsafe lifetime seams | Until then do not add a generic graph differ, cache, hidden input adapter or second resolver |

The **dependency graph** and **physical ownership** are not the same thing.
Use Get Modular's existing compiled graph/bindings as the composition truth;
derive the proposed affected closure from that plan and actual loader/share
facts. Do not infer that an unchanged implementation ID means the same runtime
instance is compatible with changed dependencies. Do not infer that the
created journal lists borrowed dependencies or that a reference can be closed
once per capability.

Required real-consumer case: A and B both use a real stable provider P; abort B
during preparation; later switch successfully to B and retire A. The independent
oracle must show that P still works for B, P was not double-closed, B's failed
candidate-owned resources were cleaned or kept as debt, and P only closes when
its actual owner is done. Also test an attempted borrow of a module with slots:
the current public path should reject instead of flattening its declaration.

### Exclusive resources and true availability

A resource such as an exclusive listener, lock or device may prevent A and B
from being fully live simultaneously. Do not promise both nondestructive
preparation and zero interruption for all such resources. Prefer a stable
listener/router or connection owner serving replaceable logic, where that is
an existing product boundary. Otherwise qualify an actual transfer/handoff, or
choose a controlled drain/close/start profile. If preparation must occur
after irreversible old cleanup, failure may require re-opening or restart; it
is not the same rollback guarantee as keeping A live until B is ready.

Resources already reserves a pending setup record before invoking the setup
callback, retains a late acquisition even after close was requested, and joins
the original close flight. See the
[exact setup path](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/resources/src/features/scope/scope.ts#L93-L141)
and [Resources contract](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/resources/README.md).
An acquisition that never returns a handle is not magically recoverable, and
a scope cannot prove release of undeclared effects. The ordinary scope closes
new acquisition, calls abort listeners and may await cleanup; it is not the
cutover's tiny atomic route mutation. A cleanup that awaits its own or an
ancestor scope's close can deadlock; use the documented hierarchy, not nested
universal teardown callbacks.

## 4. Durable publication: why CAS alone and a content hash are insufficient

For an ephemeral single-owner profile, an in-memory activation record may be
enough, provided the profile explicitly excludes recovery after process loss.
A durable consumer has a harder problem: authority can commit before the caller
receives a reply, and another valid operation may publish before reconciliation.

The [research-only SQLite probe](evidence/critical-ordering-20261123/probe.py)
used three actual disposable database files. A separate child process committed
an update and immediately exited with code 73 without writing a reply. The
parent read the committed database, performed subsequent updates and attempted
reconciliation. SQLite 3.46.1, Python 3.13.5. No network server, PostgreSQL,
production schema or runtime library was executed. A deliberate process exit
after successful COMMIT is not a hardware crash/power-loss test.

Observed results from the [raw receipt](evidence/critical-ordering-20261123/receipt.json):

| Named witness | Actual observation | What the design must retain |
| --- | --- | --- |
| Commit before lost reply | Child exit 73 with empty stdout/stderr; independent read found epoch 1, B | An absent reply is not proof of rejection or rollback |
| Same attempt after successor | After B then return-to-A at epoch 2, replay of original attempt returned committed epoch 1/B; head stayed epoch 2/A; changed intent returned intent-mismatch; two receipts remained | Original attempt result and current active target are independent facts |
| Head-only ambiguity | Histories A -> B -> A and A -> C -> A produced identical epoch 2/A heads and zero attempt receipts | Even monotonic current head cannot establish the historical attempt's outcome without an authoritative receipt/history |
| ABA | A stale epoch-0 conditional mutation changed zero rows; a stale digest-A-only condition changed one row after returning to A | Compare a monotonic authority revision, not only implementation/content digest |
| Receiver fence | Precheck at epoch 2; publication advanced to epoch 3. Unfenced old write inserted one row; old-epoch conditional write inserted zero; current-epoch control inserted one | The decisive check belongs at the mutation boundary, not only before await/dispatch |

The SQL in this witness deliberately serializes publication using SQLite
BEGIN IMMEDIATE and commits the head plus receipt in one local transaction.
It does not test concurrent PostgreSQL transactions, network ambiguity, a
distributed lock, async replication, receipt expiry, arbitrary external effects
or the real application's authorization. Its narrow purpose is to disprove
head-only reconciliation and content-only CAS, and demonstrate the local
mutation-side guard. Do not adopt SQLite on the basis of this research.

### Minimal semantic contract for a selected durable profile

Use the consumer's existing canonical authority storage. Maintain only the
facts the operation needs; do not introduce a second canonical generation
registry, a new universal workflow engine, or an outbox for every ephemeral
consumer.

- **Identity:** activation domain, non-reused authority revision/epoch, candidate
  artifact/plan identity, original attempt identity, semantic intent fingerprint
  and original caller/authorized subject. A repeated request with the same
  attempt but different intended effect is rejected; the same content under
  a new authorized operation is a different event.
- **Commit:** compare the expected authority revision and revalidate mutable
  grant/state conditions at the authority boundary; publish the target and the
  same-attempt committed receipt in one appropriate atomic operation. Do not
  run arbitrary module code in the transaction. If the chosen backend cannot
  express the required atomicity, explicitly narrow or reject that profile.
- **Reconcile:** first read the original outcome from the authoritative source
  (including after another update). A historical committed receipt does not say
  its target is current, locally active, useful or safe to delete. A separate
  conflict or expired/unknown outcome does not authorize a fresh attempt
  silently. Receipt retention must cover the supported duplicate/reconnect
  horizon; after expiry a policy must reject or report unknown, not replay a
  potentially previously committed effect.
- **Adoption:** observe actual new useful behavior against the selected target
  and state revision. If publication committed but activation failed, report
  committed/not-useful and use the selected reconciliation/recovery path. Do not
  delete the possibly active candidate until its owner proves eligibility.
- **Remote effects:** a conditional local database write can enforce an epoch
  at that database only. An HTTP/RPC service, provider tool or queued operation
  needs the receiver's own version/fence/idempotency contract when the policy
  requires it; a local lease or AbortSignal cannot recall an already sent write.

This is not a novel persistence pattern. The
[AWS Builders' Library on idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
explains caller request identity, matching intent, late replies and atomic
recording with side effects within the service's transaction boundary.
[etcd v3.6's guarantees](https://etcd.io/docs/v3.6/learning/api_guarantees/)
explicitly distinguish completed consensus writes, caller uncertainty after
timeouts, and non-linearizable watch observations. If an existing consumer
already uses PostgreSQL, its
[READ COMMITTED update behavior](https://www.postgresql.org/docs/18/transaction-iso.html)
supports a useful conditional-row-update building block; the real transaction,
unique receipt identity, effect owner and concurrent failure/serialization
contract must be separately tested. No mandatory etcd, PostgreSQL, Temporal or
additional storage backend follows from these references.

## 5. State and streams: reuse the actual semantics instead of a generic manager

Get Modular's [Observation source manifest](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/observation/package.json)
describes version 0.2.1 and a public package root; the exact new npm cohort
was not installed or qualified here. Its
[read/watch/load guidance](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/observation/README.md#choosing-state-commands-and-asynchronous-work)
and [load source](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/observation/src/features/store/load.ts#L79-L159)
show real reusable behavior: compare the current store revision just before
publishing a loader result, abort obsolete work, serialize its owned loads and
wait for actual settlement during cleanup. It coalesces intermediate revisions;
it is a latest-state projection, not a durable event log, command completion
protocol, cross-store transaction, generation fence or product-traffic drain.
Use an existing product store/Observation where its contract fits. Do not
invent a second watch/load implementation just for the live-update library.

### Three distinct state boundaries

| State class | Proposed owner and handling | Critical rejecting example |
| --- | --- | --- |
| Durable domain state, agent history, drafts and settings | Existing product owner; keep schema compatibility explicit, reconstruct views from its state | Old A writes after an incompatible migration; snapshot/copy silently drops an edit that happened while preparing B |
| Runtime state, admitted calls and physical resources | The selected generation, executor and their retained owner handles | A promise resolves to a stream, but its body or finalizer still needs the old provider |
| Derived UI, caches and replaceable query results | Existing framework/store or scoped Observation; suppress obsolete results | Old async result arrives after the new selection and overwrites a B view |

A stable UI shell can keep valuable state outside replaceable contributions.
[React's state-identity rules](https://react.dev/learn/preserving-and-resetting-state)
show that component type/position and keys matter; changing the component
implementation is not arbitrary hook-state migration. The public
[useSyncExternalStore contract](https://react.dev/reference/react/useSyncExternalStore)
can protect consistent snapshots in React rendering, including fallback to
blocking rendering if a snapshot changes during a Transition. It does not
give durable editor history, server version affinity or cross-tab publication
atomicity. Preserve actual edits, undo/redo and identity under a real
consumer test; do not promise internal component state preservation by giving
A and B the same key.

If state schema changes, explicitly check A-read/A-write and B-read/B-write
compatibility for the selected transition interval. Keep one owner of
migration and current durable state. Expand/contract or an owner-approved
maintenance transition may be needed; dual writes and generic serializers
are not default obligations of this library. A return to old code after a
schema contraction is a fresh, potentially unsupported transition, even if
the old bundle still exists. Readiness tests must not cause unapproved
irreversible business effects during candidate preparation.

### Lazy bodies and async continuations

A returned Promise, Stream, lazy Effect or HTTP response is not necessarily
terminal work. Hold the actual admitted operation/custody until the supported
stream consumption and finalization boundary. Use the already documented
[Get Modular native Effect practice](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/effect/docs/practices.md#7-own-streams-through-consumption-and-finalization)
and native stream/scope semantics rather than inventing Task/Stream/Scope
facades. Node
[stream.finished](https://nodejs.org/api/stream.html#streamfinishedstream-options-callback)
distinguishes cancelling the wait from cancelling the underlying stream.
The [WHATWG Streams specification](https://streams.spec.whatwg.org/)
distinguishes releasing a reader lock from cancelling the source. An abandoned
wait, detached subscriber, cancelled producer and physically released resource
are four different observations. An unbounded session can prevent reclaim
forever; expose retention budgets/owner decisions instead of silently claiming
a deadline can revoke a dependency or close a held resource.

## 6. Loader closure and mature versioning: preserve their actual boundaries

- **ESM:** [ECMAScript 2026 module evaluation](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
  retains evaluation failure in a reused Module Record and traverses actual
  imported dependencies; the host mapping can reuse one module record across
  requests. [Node ESM](https://nodejs.org/api/esm.html#urls) caches by resolved
  URL. New root URL, fresh module record, new transitive closure and fresh realm
  are not equivalent. A retry after failed evaluation is not guaranteed to
  re-execute that same record. Qualify immutable dependency closure and the
  selected loader's failed-evaluation/late-acquisition behavior. Do not write
  a new import resolver or infer resource rollback from a rejected import.
- **Module Federation / Native Federation:** keep their actual delivery,
  share-scope and staged map mechanisms. The previous source and native
  evidence is in the [ready-stack comparison](https://github.com/agent-teams-ai/extension-foundation/blob/10deea1a11748df1fcbfc2766033c462fce3acd0/docs/research/live-update-ready-stack-comparison-2026-11-23.md).
  An updated remote may still use an old shared singleton. A complete
  replacement claim requires actual resolved identities and compatibility for
  every required binding, not merely the descriptor of the latest remote.
- **Temporal Worker Versioning:** the official
  [versioning behaviors](https://docs.temporal.io/worker-versioning) provide
  pinned workflows, auto-upgrade with replay-safety obligations, and
  deployment drainage. The same documentation identifies independent
  Activities on other task queues that may use a different version, and closed
  workflows that may still be queried on retained workers after draining.
  Therefore even a mature pinned workflow does not universally pin a remote
  sub-operation or prove every old artifact is reclaimable. Reuse this mechanism
  if a product already uses Temporal for that precise work class, not as a
  dependency of the ordinary TypeScript library.
- **Browser and desktop:** retain immutable chunks for actual supported old
  clients and explicit protocol compatibility. Client asset retention, view
  adoption, runtime drain and executable artifact reclamation are distinct.
  Keep renderer, preload, main/native boundaries from the prior
  [platform analysis](critical-evidence-gaps-2026-11-23.md#platform-specific-runtime-limits-from-primary-documentation);
  a generic HMR/loader adapter cannot promise every application can replace
  every module without a restart.

### Which architecture is worth evaluating first?

These are candidate scope comparisons, not adopted decisions or measured
competitor scores.

| Candidate scope | Strength | Main cost / limit | Recommendation for research |
| --- | --- | --- | --- |
| One cooperative local composition, stable state/resource owners | Simplest route and explicit independent lifetime ownership; can reuse public Core/Assembly/Resources and selected Observation | Atomic admission and admitted continuation semantics still need qualified mechanism; unregistered effects cannot be revoked | Best small **conditional** first comparison; reject stronger requests before executing |
| Isolated worker/process per replaceable cohort | Real execution boundary and potential physical retirement | IPC, state/protocol compatibility, process resources, external effects and sandbox policy; a Worker alone is not hostile-code isolation | Evaluate only where the real trust/kill requirement justifies it |
| Existing distributed rollout/workflow stack | Ready replica/worker placement, durable progress and infrastructure operation | Mixed versions, receiver fences, database migration, client retention and external effects still need product ownership | Reuse for qualifying deployment/work classes; do not build a generic controller |
| Foreign UI stack with lifecycle and loader adapter | Existing contribution registration, loading, mounting and delivery | Does not automatically provide coherent application authority, state and old work | Use when the concrete UI already uses that stack; compare complete consumer scenario |

## 7. Narrow next qualification gates, not another framework survey

The following refine the previous S1-S7 plan; they are **not executed** by the
current research probe. Test each on a real supported Node 24/26 and TypeScript
7.0.2+ fixture, or the actual target product technology, after its owner and
scope are selected. A source audit can reject an unsupported promise; it cannot
substitute for a shipped package or installed consumer.

| Order | Test, independent oracle and required negative control | Go/no-go |
| --- | --- | --- |
| 1 | Packed public admission seam with actual parent/nested work and real stream. New route admits B; admitted A remains on its qualified cohort until the chosen terminal boundary. Negative: read route then yield, nested admission after quiesce, early response-body release | No public mechanism or unsupported nesting policy = do not claim that guarantee |
| 2 | Assembly owner/borrowed-provider test with real cleanup and partial preparation failure, exact package graph. Negative: input with slots, stale dependency identity, old scope closes P still used by B | If stable boundary cannot be expressed through existing contracts, return a small evidence-backed upstream proposal; no private import |
| 3 | Actual owner storage transaction and real receiver, lost reply at commit, two competing candidates, same/different intent, stale epoch after return-to-old-code, process restart before adoption. Negative: head-only, read-before-write without receiver check | Needed only for a durable/fenced profile; SQLite witness above does not qualify PostgreSQL or distributed effects |
| 4 | Real UI action and state owner: edit during preparation, immutable snapshot consistency, useful B action, old client with late chunk, incompatible schema and return-to-old-code | Select exact state continuity, protocol and retention contract; do not equate a React mount with preserved state |
| 5 | Actual loader/realm closure, failed top-level evaluation and later candidate; old callback and shared dependency identity; actual cleanup evidence | Reject unsupported mixed realm/shared singleton or unregistered effect guarantees; do not invent second resolver |

No production package, public API, adopted FMS change or new runtime dependency
is authorized by this study. The next implementation planning pass should use
the actual first consumer to reduce the scope, not turn the above list into
five new mandatory packages. The missing admission/reuse seam belongs first
to Get Modular's public qualification owner; new runtime features in that
repository are not being implemented now.

## Reproduction and evidence identity

Run from this document's directory or the repository root with Python's
standard library; the probe creates only temporary database files, runs two
child processes, and prints its receipt. It is a frozen research input,
not product code, dependency or library implementation.

- Input: [probe.py](evidence/critical-ordering-20261123/probe.py),
  7,919 bytes; SHA-256
  8cc9e445e03b1c34eef25055ca3ddbaff85868dc3fbe60999eb1fa80cfa9ad6a.
- Actual [receipt.json](evidence/critical-ordering-20261123/receipt.json),
  7,153 bytes; SHA-256
  497e31d68c79013802e8568238ea31568290c9c7b77a87f9c2429ce6d729414f.
- Command: python docs/research/evidence/critical-ordering-20261123/probe.py
- Actual local execution exited 0; Python 3.13.5, SQLite 3.46.1, 25 schedules
  across four modeled orderings and five named SQLite result groups. The two
  expected child exits (73, no output) are the lost-response controls.
- This environment had Node 22.16.0 and TypeScript 5.8.3, not the required
  Node/TS7 toolchain; no JavaScript-runtime fixture or upstream test was
  initialized or counted as passed. No PostgreSQL server was available.
- Source documents above were inspected on 2026-11-23; GitHub source links
  are pinned. External documentation links describe their cited specification
  or documented version, and are not installed-package evidence.
