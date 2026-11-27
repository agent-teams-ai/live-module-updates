# Using the cooperative update operation

This guide describes the private implementation delivered through
[LMU #9](https://github.com/agent-teams-ai/live-module-updates/pull/9).
The [selected profile](../decisions/0001-cooperative-update-profile.md) and
[qualification matrix](../research/foundation-qualification-matrix.md) own its
support limits and executed evidence. The package is not published to npm.
Installed consumers use an exact qualified tarball and its integrity receipt.

## What a project adopts

Use the ordinary `live-module-updates` entry for the portable operation and its
types. Use `live-module-updates/resources` only when the Host uses public
`@get-modular/resources`. That peer is optional; an ordinary consumer installs
without GM, EF, Node/DOM declarations or organization tooling in its runtime
closure. The [ordinary installed consumer](../../tests/module/consumer-contract.ts)
and [optional peer consumer](../../tests/module/consumer-resources.ts) are the
executable starting points.

The stable call surface is `UpdateRuntime.invoke`. A module receives a
`BoundInvocation` as its first argument and uses that context for nested work
belonging to the same operation. A fresh global invocation selects the current
generation. A continuation admitted under A keeps A across `await`, even after
B becomes current. Saving the global facade is supported; saving raw provider
roots as a replacement for it is outside this contract.

The selected lifetime is finite cooperative work. A returned iterator, callback
that starts later or detached task is not implicitly owned by the Promise that
produced it. Such escaped work needs its own selected profile and qualified
boundary. An explicitly generation-owned registration may instead start a new
finite facade invocation for each event; it does not inherit the completed
invocation's affinity. Its callback and disposal path still need native evidence.
Hostile-code containment, cross-process/cross-tab
authority and restart recovery are not supplied by this profile.

The parent invocation completes only after all descendants registered through
its `BoundInvocation` have completed, including descendants the provider did
not await. Their semantic success or failure still belongs to the provider's
contract; retaining a child does not automatically turn its result into the
parent's business result.

Each context belongs to the particular provider invocation that received it.
Once LMU observes that provider's own return or Promise settlement, that context
refuses new descendants with `continuation-closed`, even while already
registered descendants keep the aggregate operation pending. Descendants use
their own supplied contexts for further work; retaining the parent's context
is not an alternative lifetime contract.

## Keep the owners distinct

| Owner | Contract it must implement |
| --- | --- |
| Capability owner | Argument/result types, meaningful success and refusal, contract identity/revision |
| Application state/effect receiver | Canonical business state, schema/state compatibility, current grants and fences on every protected write |
| Host authority | Canonical head and atomic conditional publication, exact original-attempt receipts and lookup |
| Preparation owner | Inert custody before evaluation, actual graph/loader identity, all partial and late resources |
| GM, when selected | Construction of the complete coherent module composition; LMU does not resolve its graph again |
| Resources or another qualified lifetime owner | Original native cleanup flight, truthful completion/debt evidence and exact-instance disposal |
| LMU | Admission, retained operation context, preparation/publication coordination, reconciliation and retirement decisions |

Contract compatibility is not a grant. A generation lease is not permission to
write. A verified artifact is not an activation decision. The authority and
receiver must check their live conditions where their protected mutation happens.

## Constructing and transferring the initial owner

`createUpdateRuntime` requires explicit `domainId`, `initial`, `authority`,
`compatibility`, `preparation` and positive finite `limits`. It transfers the
already created initial lifetime **only on successful return**. The caller
retains cleanup responsibility if construction throws. The authority's initial
head must identify that exact generation.

The Host qualifies and admits the initial closure, schema and artifact before
construction. The factory validates identity and its match to the canonical
head; it does not run candidate compatibility or artifact verification for this
already active initial generation. After successful transfer, the former owner
must not independently release it or transfer it to another runtime.

The Host supplies exactly one live runtime owner per activation domain/session.
All replaceable calls and publications for that domain use this runtime and its
registered generations. The constructor does not arbitrate a global registry,
discover another runtime or rehydrate an arbitrary existing head. Creating two
runtimes against one authority, or externally publishing an unregistered
generation, violates this ownership contract; a canonical head alone does not
make its callable/resources available to this runtime.

The initial entry and each prepared entry have the same ordinary `ModuleEntry`
shape. Use one coherent closure per generation. Keep durable or canonical state
with its owner and borrow it through the generation's ports; replacing or
cleaning a generation must not delete that state.

The limits are separate policies: `maxAttempts` bounds retained original attempt
history for the session; `maxCandidates` bounds candidate custody;
`maxRetainedPredecessors` bounds retiring generations and prospective retirement
reservations; `maxActiveWork` bounds admitted roots and registered descendants
across all generations. They are required, not hidden universal defaults.
History is not evicted to admit another attempt. The fixture's chosen numbers
are recorded in ADR-0001; a project selects and qualifies its own envelope.

## The three Host ports

### Compatibility

`CompatibilityPort.check` is an inert preflight. It returns `compatible` or a
reasoned `refused`. It may use the detached current snapshot, but that snapshot
does not freeze mutable grants, head or state until publication. Unsupported
contracts fail before preparation evaluates candidate code.

### Preparation and native custody

`PreparationPort.open` synchronously creates an inert owner. External acquisition
and candidate evaluation start only inside its `prepare` method, after LMU has
captured custody. `prepare` returns the generation's callable entry. If it fails,
partially acquires or finishes late, the same actual owner remains responsible.

`createResourcesPreparation` supplies that owner using a public Resources scope.
Its callback receives the ordinary preparation context and the native Resources
interface. All acquisitions use that scope; do not add an independent cleanup
array beside it. `open` creates no candidate effects, and a closed or reused
preparation owner cannot evaluate another candidate.

The cleanup port's first call returns the **actual original native flight** and a report with
settled completion evidence and debt. Passing an observer that times out or
abandons the original flight does not satisfy this contract. LMU captures the
report fields and a detached debt array; opaque debt and cause identities remain
available for diagnosis. A malformed or nonterminal owner report cannot authorize
forgetting or a concurrent retry.
LMU preserves that original flight. A later port call occurs only through an
explicit eligible retry and returns that new native attempt's actual flight.

`CleanupState.failed.retryable` distinguishes an actual rejected native Promise
(`true`) from malformed or abandoned settlement evidence (`false`). The latter
keeps custody and forbids retry because another native cleanup could still be
running. It is different from an honest settled report containing cleanup debt.

### Canonical authority

`UpdateAuthority.read` is synchronous, inert and detached. Invocation selects
its head and reserves the matching generation without suspending or invoking
candidate code between those steps. `publish` must mutate this same canonical
head; a second local active-generation pointer is not the authority.

Each publication request binds the domain, attempt, full candidate description,
expected head and opaque owner-issued `basis`. The authority checks head and
every relevant basis condition at its actual conditional mutation, stores the
original result and returns it. No candidate callback runs inside that section.
A local mutex does not extend this guarantee to other processes or browser tabs.

`lookup` asks about the exact original request. An absent receipt returns
`unknown` while the original request can still commit. It cannot be translated
into a rejection merely because the current head differs. Once a terminal result
exists it is immutable and bound to the original payload. A repeated attempt ID
with changed candidate, contract, revision or basis must refuse.

A publication `refused` result is a definite refusal of that exact request: it
cannot later commit. LMU may retire the candidate on that evidence. A queue
timeout, missing receipt or original request still capable of committing must
remain `unknown`; an adapter cannot use a refusal to terminate an inconvenient
wait. A rejected immutable receipt likewise establishes a terminal original
outcome rather than merely reporting that the current head differs.

The candidate is registered before publication. Therefore, if publication
commits but its reply is lost, new calls can already use B. LMU retains B and
the predecessor obligation while the update result remains unknown. A later
B → C does not release B until B's own original publication is resolved.

## Calling, updating and observing results

`invoke` returns a tagged `returned`, `failed` or `refused` outcome. Capability
results remain the capability owner's type; invocation admission errors do not
become business-domain results. A failed authority read is distinguishable from
a failed provider call.
Returned and failed provider outcomes include their actual generation ID;
pre-admission refusals do not invent one.

Returned values follow the capability's own data-ownership contract. They may be
ordinary owned data or borrowed data with a separate valid owner. The generic
`Result` type does not inspect or sanitize that object graph. Returning a raw
provider, resource or callback does not create a lease or extend generation
custody beyond invocation completion; a longer-lived handle needs an explicit
qualified ownership contract.

`startUpdate` validates and reserves an attempt before candidate effects. A
matching replay returns the same handle. A changed payload, exhausted limit,
reused generation identity or closed runtime refuses before new acquisition.
An accepted attempt may subsequently report a planning or preparation failure;
it retains its original history slot and any actual custody it acquired.

Use a handle's `inspect()` for current facts and `completion` for the original
terminal observation. `reconcile()` consults the authority for that same request;
it does not create a new attempt or repeat a protected effect. The completion
Promise can remain pending while publication is unknown or original work and
cleanup are pending. Caller-side `Promise.race` may abandon that caller's wait;
it does not release the operation or prove physical stop.

The optional adoption probe supplies explicit call arguments and an
application-owned useful-result predicate. It invokes the expected generation
after committed publication. A later C cannot accidentally satisfy a probe for
B. An already superseded generation reports `superseded`, and a failed useful
probe does not silently roll back an authoritative transition.

Read the independent facts rather than one success flag:

| Observation | Meaning |
| --- | --- |
| `planning` / `preparation` | Whether candidate work was accepted and actually made ready |
| `publication` | Original authority result, including unresolved outcome |
| `adoption` | Actual useful observation, failed probe, supersession or no requested probe |
| Candidate/predecessor lifetime | Actual admission, work, original cleanup, latest cleanup and retained custody |
| `holds` | Remaining preparation, publication uncertainty, actual authority calls, work, cleanup or reservation obligations |
| `settled` | The original logical operation observation is terminal; authority calls or cleanup debt may still remain |
| `RuntimeSnapshot.ownershipReleased` | Current closed-runtime ownership is discharged according to captured native reports, including actual authority calls and unregistered custody |

## Retirement, retries and shutdown

Closing new admission and draining existing work are separate. A retained
operation may continue through its own context after new admission closes. Old
work still uses current receiver checks before a protected write; stale or
revoked work must receive the receiver's explicit refusal.

Disposal targets the exact registration/resource instance. If B replaces a
registration, A's later disposer must preserve B and unrelated resources.
Retirement forgets callable and release references only when preparation and
publication obligations are discharged, actual work has ended and native cleanup
is complete. A cleanup debt consumes retention capacity and remains observable.

`UpdateHandle.retryCleanup()` retries eligible settled cleanup for its relevant
candidate or predecessor. `UpdateRuntime.retryCleanup()` also covers shutdown
debt on the initial generation when there was no update handle. Both are explicit
actions over the same actual owner; a pending or uncertain original native
cleanup cannot be replaced by a concurrent retry. Later success does not rewrite
the original update completion or original close result.

`close()` closes new runtime admission and returns the same original close
Promise on repeated calls. It retains in-flight preparation, unresolved
publication, actual authority response/lookup calls and actual work. Its `complete` result requires all tracked native
owners to report complete cleanup and release their custody. Physical correctness
belongs to each qualified native owner and its external witness. A terminal
incomplete result records cleanup debt or invalid owner evidence; it does not
permit discarding custody. Inspect the latest state and use the explicit
retry action where the native contract permits it.

`inspect().ownershipReleased` reports current ownership separately from that
immutable original close result. It remains false for held authority calls even
if their outcome is already known, and for unregistered or unproven native
custody even if the registered generation list is empty. Successful explicit
cleanup recovery can make it true without changing the first report. An
`authority` hold describes a publish response or lookup still in flight;
`publication` describes an unknown outcome. A logically completed update can
therefore retain an authority hold until its original transport finishes.

A concrete GM Host owns one runtime and exposes only its application invocation
capability. At the beginning of Host shutdown, seal LMU before closing the
Resources parent: parent abort listeners can otherwise reenter a fresh facade
before cleanup callbacks run. Already-admitted bound work remains valid. Keep
generation scopes and still-borrowed infrastructure outside an ancestor whose
abort would invalidate them. The owner's cleanup callback uses the actual fact:

```ts
const original = await runtime.close();
if (!runtime.inspect().ownershipReleased) {
  throw new Error("LMU still retains native ownership", { cause: original });
}
```

The existing Resources mechanism records that failed cleanup and performs an
explicit eligible retry later. Returning an incomplete close report from the
callback would falsely tell Resources that cleanup succeeded. This small glue
belongs to the concrete owner; LMU adds no second resource manager. Initial
preparation must already be owned before construction and transfer only on
successful runtime creation. See [ADR-0003](../decisions/0003-composed-runtime-ownership.md)
for the full failure and late-completion obligations.

Returning to old code is a new generation and new authorized transition against
current state and grants. It does not reuse an old generation ID, erase an
attempt, reverse already accepted effects or imply a data migration policy.

## Qualifying an actual authority integration

The optional `live-module-updates/testing` entry exports
`authorityContractCases(createFixture)`. Each named case returns an async `run`
function for the consumer's existing test runner. No runner, GM, Node or DOM
dependency enters this portable test surface; an isolated ES-only consumer can
import it without the optional Resources peer.

The factory supplies a fresh disposable integration of the actual authority,
two valid candidate descriptions, an independent read of the native routing
head, and controls for pending publication, lost acknowledgement and a changed
basis. The cases cover detached reads, canonical publication and replay,
full original-payload binding, stale head, stale basis, pending original
requests, recovery of a lost acknowledgement and immutable historical receipts.
They execute public port behavior rather than the coordinator's private oracle.

The basis control changes an actual owner condition while leaving the head and
fresh-candidate admissibility intact. For example, perform an authorized state
revision change while grants remain valid. Revoking permission would let an
unrelated refusal hide a missing basis check; the law therefore also requires
publication with the fresh basis to succeed. The native head observer must read
the real routing/effect owner, not return the expected candidate or call the
same authority reader under test.

A held publication returns unknown until its original operation can be settled;
a lost acknowledgement conceals only the response, not a fabricated commit.
`releasePublication` safely settles held originals even after an assertion fails
and is harmless when called again. `dispose` retains responsibility for real
native owners even if release failed. The suite always attempts both teardown
steps and preserves original and cleanup errors together when necessary.
A named `AuthorityContractViolation` identifies a failed law; native setup and
teardown errors retain their original causes.

Run the cases against each independently wired actual Host. This suite does not
prove physical cleanup, effect policy, isolation, persistence, arbitrary
concurrency or product admission. Those remain native/application scenarios;
passing a simulated fixture is not qualification of its proposed real adapter.

## Further adoption work

Use the [phase plan](../plans/first-operation-implementation-plan.md) for the
remaining artifact/profile gates and the [source ownership guide](source-ownership.md)
before extending the implementation. The EF join adapts verified artifact facts
to these existing ports; it must not introduce another update coordinator.
Managed Docs, registration, remote enforcement and public publication retain
their separate [bootstrap status](../../BOOTSTRAP.md). Real product adoption
selects its actual state authority, loader, workload and limits and runs the
corresponding qualification before claiming a stronger profile.
