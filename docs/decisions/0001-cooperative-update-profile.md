# ADR-0001: qualify one cooperative update operation

Status: selected for workstream B implementation and fixture qualification,
2026-11-26. Public release and product adoption remain separate decisions.

## Authority and scope

The owner authorized the complete LMU workstream B, including implementation,
independent Node/Chromium qualification, review and merge in existing PR #9.
The [implementation plan](../plans/first-operation-implementation-plan.md)
permits the test-Host owner to choose the concrete fixture limits for option A.
This record makes that bounded selection before its dependent implementation.
It does not select interruption, migration, retention or offline policies for
waiting products, nor accept an EF artifact before executor A qualifies it.

The useful operation is a versioned document query/edit. A replacement changes
the implementation and presentation of the same compatible capability. The
Host retains the canonical document, schema, revision and grant. The operation
must serve useful B work while previously admitted A work is still held, then
report the actual cleanup outcome. Expected results are specified outside the
operation implementation.

## Selected Q1–Q7 envelope

| Choice | Selected fixture guarantee |
| --- | --- |
| Q1 trust | Explicitly admitted, trusted, cooperative TypeScript; no containment or forced-stop claim |
| Q2 update unit | One coherent GM composition per activation domain, including its static dependency closure; the library does not resolve that graph again |
| Q3 state | Borrowed Host-owned document state and compatible reconstruction; incompatible schema or stale preparation basis refuses |
| Q4 adoption | The next newly admitted request observes the canonical published generation; a successful head change alone is not useful-behavior evidence |
| Q5 work | Retain finite admitted root and explicitly registered descendant work; every effect receiver checks its current grant, revision and selected generation fence |
| Q6 return | Old code may return only as a fresh generation in a new compatible, authorized transition against current state; no undo of data or external effects |
| Q7 clients | One Node process or one Chromium realm and one disposable Host session; no process-loss, cross-tab, offline or durable recovery guarantee |

Desktop and untrusted third-party execution remain required architecture
targets. Their physical execution, IPC, resource-limit and stop boundaries need
separate adapters and evidence. They do not inherit this cooperative envelope.
Streams, unregistered detached work, arbitrary independently replaced helpers,
incompatible state migration and durable installation are not supported by this
first profile. Identified incompatible candidates or unsupported conditions
refuse at the owning compatibility/receiver boundary. Generic return values and
unregistered detached tasks cannot be inspected or automatically rejected by
LMU; authors must obey the finite-operation contract.

## Invocation and custody discriminator

The proposed common mechanism uses explicit operation-bound continuation,
ordinary typed functions and JavaScript run-to-completion. It must pass L1 in
both actual targets before becoming the production contract:

1. A fresh facade call reads the Host's sole canonical head and reserves its
   exact generation synchronously, before any provider callback or suspension.
2. Calls through the admitted operation's continuation keep that generation
   through nested calls, synchronous reentrancy and `await`. A fresh facade
   call is a new admission; ambient Node-only async context is not assumed.
3. Every registered descendant retains its own actual work. Returning a parent
   or abandoning a caller's wait does not settle its descendants or release
   their resources. Each provider's continuation closes when LMU observes its own return
   settlement, even while its descendants keep the aggregate pending. Those
   descendants use their own supplied continuations.
4. Sealing admission refuses fresh calls but preserves admitted work. Native
   Resources close starts only after that work settles. Keep the original
   close flight and its report, including cleanup debt; a later authorized
   retry has its own flight and cannot erase the original outcome.

The library owns this complete asynchronous operation boundary. GM owns graph
semantics and Resources owns cleanup. This is not an import or copy of the
private lifecycle kernel, a second resource stack or a global service locator.
Inside the coherent static composition, ordinary feature calls remain ordinary
calls. The continuation is needed only at the replaceable operation boundary.

## Publication, state and exact identity

The Host owns one atomic conditional publication primitive and a lookup of the
original immutable attempt. Its condition binds the activation domain, expected
head/revision, candidate generation/closure, state/schema basis and grant basis.
Publication updates the canonical head used by admission. It does not require
a later mirror activation after acknowledgement.

One live runtime owns the domain's registered generations and update
coordination. The Host routes that domain's replaceable calls and publications
through it; construction is not global ownership arbitration or rehydration of
another runtime's head. Independent runtimes must use independent domains.

Committed, rejected and unknown are different outcomes. An exception, malformed
reply or lost acknowledgement after invocation may mean that B already serves
new work. Keep its custody while reconciling the same attempt. An absent receipt
does not prove rejection while the original request can still commit. A current
head observation is not an original-attempt receipt. Reusing an attempt with a
changed payload refuses; matching replay returns the original terminal receipt.

The Node Host replaces one immutable Map record. The browser Host uses one
native Storage record containing head, state, grants and receipts, so publication
does not consist of independently failing head and receipt writes. These are
independently implemented session authorities, not durable or multi-tab stores.
They expose detached snapshots and receipts, not mutable internal records.

The selected effect policy rejects writes by a non-current generation and
checks the current grant and expected document revision in the same receiver
operation that mutates state. Retaining A permits coherent computation; it does
not retain permission to write. This fixture policy does not prescribe every
product's policy for compatible late writes.

Generation identifiers are exact, session-unique instance identities. Cleanup
removes only the registration it acquired; an old handler must preserve a newer
registration with the same semantic name. Borrowed canonical state and foreign
registrations survive cleanup. Candidate custody starts before evaluation or
resource acquisition, including partial, failed and late preparation.

## Finite fixture limits

| Resource | Explicit test limit | Saturation behavior |
| --- | ---: | --- |
| Prepared or in-flight candidates per domain | 2 | Refuse additional preparation before acquisition |
| Retained predecessors per domain | 2 | Refuse an update that would exceed the owned retention budget |
| Active retained calls per domain | 16 | Refuse new root or descendant admission; count both across all generations |
| Immutable attempt receipts per Host session | 32 | Refuse a new attempt; never silently evict an uncertain or terminal receipt |

These small values make saturation executable. They are explicit test inputs,
not production defaults or a promise that elapsed time bounds cooperative work.
No timeout, zero-reader observation, wait cancellation or capacity limit grants
physical-stop permission. Unresolved preparation, publication, work or cleanup
remains owned and observable. Independent activation domains have separate
budgets and authority. A future product chooses values and stronger liveness
policies under its actual constraints.

## Alternatives and rejection criteria

The [plan's options B and C](../plans/first-operation-implementation-plan.md)
remain available for bounded streams or durable/cross-process recovery. They
require different completion, interruption, journal and asset-retention proof.
They are not prerequisites for this finite operation and are not silently
implemented by adding timers or an in-memory receipt map.

Ordinary typed transitions are the initial implementation choice. Add no XState
or other state-machine dependency without a measured inspection or transition
need that the current model cannot meet. Do not split prepare, publish and
retire into packages or make each Host reconstruct their coordination.

Reject this common invocation recommendation if either native target cannot
preserve generation affinity, admission atomicity or original cleanup custody.
Record the failure and repair the responsible boundary before freezing the
shared API. An EF integration claim additionally waits for the actual qualified
artifact and verifier from executor A; a local compatibility imitation is not
evidence for B7.

## Qualification obligations

L1 records actual invocation, same-attempt authority and native cleanup probes.
B2 introduces substantive implementation with full FMS and native source gates.
B6 executes the same packed library through independent Node and Chromium Hosts
with external useful-operation oracles and deliberate defects. B7 uses the real
EF admission path. The [qualification matrix](../research/foundation-qualification-matrix.md)
owns dated results; this decision makes no unexecuted success claim.
