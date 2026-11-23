# Closure integrity, overlapping generations, and safe reclamation

**Research checkpoint, 2026-11-23.** This extends the
[critical gap register](critical-evidence-gaps-2026-11-23.md) and
[cutover/admission investigation](cutover-admission-and-state-custody-2026-11-23.md).
It is not an accepted API, selected Q1-Q7 policy, production implementation,
or qualification of the future updater. Three disposable research programs
were executed twice; no runtime library or JavaScript-runtime fixture was
implemented or installed.

## 1. Executive finding: the unit of correctness is not the changed module

The earlier investigation established that a local route switch must be
coordinated with call admission and that an attempt receipt cannot be
reconstructed from the current head. The next question is what must remain
consistent **around** that switch. Four boundaries are different:

| Boundary | What it includes | Existing owner |
| --- | --- | --- |
| Resolved composition | Selected implementations, bindings, required and ordered-many slots, compatibility and declared dependency facts | Get Modular / product composition |
| Actual executable closure | Verified entry, transitive artifacts, runtime realm and selected shared dependency identities | Existing artifact/loader/execution owners |
| Publication and effects | Current authority scope, graph head, state/grant basis, exact candidate, effect receiver and original attempt | Product authority and respective effect owner |
| Reclamation | Each generation's retained work, borrowed providers, resource cleanup, state/artifact/client holds, actual physical disposition | Existing resource, execution, data and artifact owners |

A valid new graph may coexist with old in-use wirings. A graph-level publication
may have committed while activation is still pending on one host. A generation
may be retired for invocation purposes while its physical bytes remain required.
None of these facts can be replaced by a mutable enabled flag.

The **existing EF ADR-0011 already requires** the smallest product-owned
publication scope, complete closure revalidation, ordered fences, controlled
attachment/retirement, and confirmed external effects. This study corroborates
those decisions for that explicitly admitted profile; it does not promote them
to a mandatory distributed persistence stack for every standalone OSS consumer.
The goal is to reuse the existing owner's primitives, not to copy the EF
catalog/control plane into the new library.

## 2. Actual Nginx reload: a useful strong baseline, not a JS updater

The official [Nginx reload contract](https://nginx.org/en/docs/control.html)
describes a master applying configuration and acquiring resources before
starting new workers; a failed application keeps the previous configuration.
Old workers stop taking new connections and finish their existing clients.
This was selected as an independent native precedent for the operation and
retirement model, not as a proposed runtime dependency.

### Executed probe

The sealed [evidence packet](evidence/critical-closure-witnesses-20261123.tar.gz)
contains the exact final Python harness, both raw receipts and their Nginx logs.
It ran Nginx **1.26.3** with its own temporary configuration and master process,
one worker per configuration, isolated loopback listener, and a local HTTP
upstream whose two requests are held behind explicit events. An additional
loopback port is occupied before requesting the X configuration; no other
application or provider is contacted. PIDs are observed through the test-owned
master's child relationship and actual Nginx logs.

| Case | Observed result | Evidence boundary |
| --- | --- | --- |
| N1: failed acquisition | X cannot bind the additional occupied listener. Actual log records bind failure. No replacement worker created. A serves a new request; admitted A request remains pending | Failure before new configuration is usable can preserve old useful service |
| N2: overlapping generations | Hold A request; reload B; hold B request; reload C. C serves fresh version request, while A and B requests remain pending and all three worker PIDs are live children | Two predecessor generations may coexist, even with only one active target for new requests |
| N3: out-of-order retirement | Release B first. Its response carries B's generation and expected body, B worker is reaped; A remains pending, C serves fresh request | Retirement order is not necessarily generation order |
| N4: final retirement | Release A. A response carries A's generation and body; A is reaped; only C worker remains. Master subsequently exits normally | Physical process observation is distinct from routing/response observation |

Both final executions exited successfully. All semantic receipt fields matched
after excluding the run-specific PID map and original Nginx log text; both raw
logs remain included. The first incomplete harness attempt used an unavailable
Linux process-observation pseudo-file. Its original input and failure excerpt
are retained. The observer alone was corrected to ps parentage inspection;
the incomplete attempt adds no successful coverage.

**Limits:** the worker shutdown timeout was 20 seconds and the held work was
released within it. No forced-timeout, crash, TLS/QUIC, high-load, continuous
availability, arbitrary external-write fencing or multi-host test was run.
Polling for a B/C version marker is not a measurement of zero transient errors
during cutover. This is not a TypeScript, Get Modular, Electron or future library
execution. It demonstrates that the design must accommodate independently
retained generations or explicitly reject a new update until budget is available.

### Design consequence: keep separate retention, routing and memory policies

Do not store only current and previous. Each relevant generation has an exact
owner identity and independently observed retention facts. A simple first
profile may permit one active generation and at most one draining generation,
**refusing/defering another update** when that limit is full; it must not overwrite
the retained A slot to make B appear retired. Alternatively, a bounded set of
draining generations can be supported when actual consumer demand requires it.

The library coordinates the operation; the native resource/execution/artifact
owners hold the actual handles. A registry of generation facts is not a second
authority for selecting the current graph. Do not invent a general-purpose GC.
Reuse resource scopes and existing retention/termination mechanisms.

A back-of-envelope capacity relation is useful, not a performance prediction:
if replacement arrivals are spaced by at least I seconds, all supported
predecessors drain within D seconds, and there is one active generation, up to
roughly 1 + ceil(D/I) generations can overlap, plus any separately admitted
staged candidate. At 30-second replacement spacing and 10-minute retention,
around 20 predecessors may coexist. Without a finite bound or a refusal policy
there is no such cap; cleanup debt and offline/rollback holds may outlast work.
Define separate budgets for live processes/scopes, staged work, retained
artifacts and unresolved recovery records. A time limit on a caller's wait is
not permission to force stop or delete. Existing gRPC graceful-stop
[guidance](https://grpc.io/docs/guides/server-graceful-stop/) likewise separates
draining ongoing RPCs from explicit forceful shutdown.

## 3. Graph publication: CAS on the target is too narrow

The real SQLite probe prepared X and Y from the same initial graph:
neither owns an exclusive capability. Each separate proposal claims that
capability and is valid against its observed basis. They then commit in a
controlled interleaving using independent connections. This is a deterministic
stale-preparation witness, not a test of concurrent PostgreSQL SSI.

| Case | Actual result | Meaning |
| --- | --- | --- |
| C1: check only X's or Y's row revision | Both commits succeed. Final X and Y each claim the exclusive capability | Individually valid plans plus per-target CAS do not establish a valid combined graph |
| C2: revalidate the complete relevant read set under the transaction | X commits; Y rejects stale-basis; constraint holds | Validate all facts the candidate depended upon, not merely its write set |
| C3: unrelated Z revision changes | Relevant X publication still succeeds; stale conflicting Y rejects | Scoped validation can preserve independent progress if non-interference is actually established |
| C4: newly introduced edge outside captured set | Captured reverse dependencies are empty; a new consumer edge appears without changing provider row. Target-only retirement succeeds and leaves one active dangling dependency | Rechecking only old member IDs does not detect new members |
| C5: recompute relevant membership under the same authority transaction | New edge is detected; retirement rejects stale-closure; zero dangling edges | Include membership/absence/predicate facts or an authoritative scope revision advanced by every such change |

See the raw authority-closure and authority-races receipts in the packet.
The examples deliberately use SQLite's BEGIN IMMEDIATE to serialize actual
commits, showing that serializing writes alone does not repair stale reads
performed outside the authority transaction. PostgreSQL 18
[transaction-isolation documentation](https://www.postgresql.org/docs/18/transaction-iso.html)
provides mechanisms for rechecking and preventing read/write anomalies within
real transactions. No isolation level automatically validates preparation facts
that are not part of the transaction, or external state that it does not own.

### Existing decision already gives the appropriate product boundary

[EF ADR-0011, publication and lifecycle fence hierarchy](https://github.com/agent-teams-ai/extension-foundation/blob/10deea1a11748df1fcbfc2766033c462fce3acd0/docs/decisions/0011-extension-admission-custody-and-retirement-closure.md#publication-and-lifecycle-fence-hierarchy)
requires a GraphPublicationFence for the smallest product-owned cohort, then
affected artifact/source fences in a canonical order. It explicitly rejects
new, missing or changed members of the revalidated closure, coordinates
attachment creation and retirement, and excludes long external work from the
transaction. Across authority scopes it permits an explicit product saga,
not a fabricated globally atomic cutover.

For a simple in-memory first OSS consumer, prefer one graph head and one
non-yielding publication/admission owner for the affected local composition.
For independently owned durable domains, reuse the actual transaction/epoch
authority. The fine-grained independent-read-set optimization is only justified
after a real consumer demonstrates that its entire invariant/read set,
membership changes and physical-resource constraints can be expressed.
Avoid a global deployment mutex, per-module lock manager, or unqualified
optimistic merge of two individually valid plans.

### What the affected closure must describe

Do not introduce another graph compiler. Get Modular
[owns canonical declarations, selected bindings and plan digest](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/docs/architecture/system-boundary.md#get-modular-owns).
[Core](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/packages/core/README.md)
does not execute lifecycle. Use its actual compiled facts, plus already owned
loader/physical-resource and state/authority facts. A proposed planning review
must consider both the old and intended graph: removed or rebound providers,
added reverse dependents, ordered-many cardinality/order, optional degradation,
compatibility of unchanged consumers, shared realm/singleton constraints and
physical ownership. Do not turn every static dependency into a deployment-wide
stop-the-world requirement.

Concrete cases that distinguish the real policy:

| Situation | Proposed handling, not a new SPI |
| --- | --- |
| Stable provider P is genuinely owner-supplied and both A/B bind the same compatible capability | Keep P outside both candidate scopes with owner-proven borrowed lifetime; never dispose P because A closed |
| A has captured old provider object P1, new provider P2 is selected | Existing A retains its P1 cohort or is explicitly drained/rebuilt; selecting P2 cannot mutate A's captured reference by fiat |
| Provider removal leaves a required dependency | Rebind/replace or disable affected dependent in the same supported publication; reject dangling route |
| Added dependency/hold after preview | Compare membership basis or revalidate under canonical owner; no stale closure success |
| Changed shared realm/type identity | Check actual runtime closure and semantic contract; choose compatible coexistence, wider replacement or unsupported |
| Independently owned authority scopes | Explicit coordinated rollout with independently truthful progress and compensation/recovery; no global atomic promise |

The accepted [EF ADR-0014 generation and replacement rules](https://github.com/agent-teams-ai/extension-foundation/blob/10deea1a11748df1fcbfc2766033c462fce3acd0/docs/decisions/0014-product-local-module-authoring-composition-and-generation-guardrails.md#future-enable-disable-and-replacement)
already specify this desired profile/closure discipline for its future product
activation shape. The new research is a concrete rejection test plan for
those rules, not an authorization of a runtime or a change to the ADR.

### External reference worth copying precisely: OSGi

[OSGi Core 8, Bundle Wiring](https://docs.osgi.org/specification/osgi.core/8.0.0/framework.wiring.html)
keeps existing in-use wiring after an update; refreshing the reverse-dependent
closure can stop and restart bundles. This is a particularly valuable
counterexample to the assumption that "install latest" rewires old users.
[OSGi module-layer package constraints](https://docs.osgi.org/specification/osgi.core/8.0.0/framework.module.html)
also constrain class-space compatibility across indirect type dependencies.
Reuse the distinctions of current versus in-use, explicit affected closure,
and compatible shared identity. Do not port the Java resolver, assume OSGi
refresh is nondisruptive, or introduce a second Get Modular graph semantics.

## 4. State continuity: a readable schema is not a safe writer

Actual SQLite witness: the candidate reads document revision 0, then a user edit
writes revision 1 before the candidate's backfill commits.

- Blind snapshot replacement succeeds, restoring the earlier text and
  destroying the user's edit. A conditional update on the original revision
  changes zero rows, preserves the edit, and a recomputed migration can preserve
  it while adding the new fields.
- Separate JSON round-trip witness: old reader understands the text of a new
  record but old replacement writer discards the new approval and review
  revision. The field-preserving control retains them.

The second case is dangerous because an ordinary compatibility suite that only
proves old-reader/new-record parsing would pass. A safe transition checks read
**and** write semantics of both versions, not merely syntax/schema or semver.

The [AWS rollback-safety deployment practice](https://builder.aws.com/content/3F04j2yRAAMBuPSPs50xwXZqg01/ensuring-rollback-safety-during-deployments)
separates installing readers for both formats from starting new-format writers,
and delays removing old readers until old data is no longer present.
[Protobuf's unknown-field contract](https://protobuf.dev/programming-guides/proto3/#unknowns)
documents why even a format that normally retains unknown fields can lose them
through JSON conversion or field-by-field reconstruction. These are protocol
examples, not a decision to adopt Protobuf or JSON migration in the library.

Proposed minimum state-owner qualification matrix, only for the actual supported
transition:

| Operation during coexistence | Required invariant |
| --- | --- |
| Old reader on state written by B | Supported interpretation, or prevent old access before activating new writer |
| Old writer after B wrote new fields | Preserve supported semantic fields/revisions, or prevent such writes |
| B reader/writer on retained A state | Compatible behavior and explicit migration; no automatic deletion or silent defaulting of unknown meaning |
| User edit during prepare/backfill | No stale overwrite; state owner supplies expected revision/merge contract |
| Return to A after B wrote | Revalidate current state/permissions and actual old-reader/writer ability; reject if irreversible |
| Contract obsolete field/protocol | Prove relevant old writers/readers/history are retired or an explicit compatible path remains; a deployment marker is not evidence |

Keep one authoritative domain owner, not a generic state serializer or mutable
copy in the update engine. Reusing stable owner ports is the preferred scope
when they actually fit. Where a selected profile needs a format transition,
prepare/activate/contract is an explicit product migration policy, with the
library coordinating only its declared prerequisites/outcomes.

## 5. Reclamation is an admission problem, not just a reference-count query

Actual disposable file/SQLite case R1: a retirement actor observes zero holds.
A second connection successfully attaches an old-client hold before physical
unlink. The file is removed even though a holder exists, and the authority
still says available. In R2, an atomic transition to deleting checks no holds
and closes attachment admission under the same owner. A late attach changes
zero rows. After unlink, the authority is still deleting until the absence
is observed and the exact deletion intent is finalized; attachment remains
refused. This is a deterministic local recovery checkpoint, not a process
crash or a distributed artifact-store qualification.

A separate finite model enumerates 128 Boolean combinations of seven distinct
hold classes: active call, pending acquisition, borrowed provider, cleanup
debt, uncertain effect, old client, rollback hold. A naive rule of zero active
calls permits 64 combinations; 63 of those still have another modeled hold.
Only one combination has all seven clear. These are enumeration counts under a
toy predicate, not observed frequency or a real safe-delete proof.

Required distinction:

- Seal new holds, reads/admissions or attachment as appropriate at the same
  authority boundary that tests eligibility; keep the retirement intent.
- Retain existing holds under their actual owners and policy. Do not expire
  a live handle merely because the observer is gone. An inaccessible owner
  remains unknown unless the selected contract proves an expiry/physical stop.
- Perform actual cleanup/deletion outside the short transaction, then
  reconcile the exact identity and postcondition. An absent physical target
  can prove only an operation requiring absence, not an attach or migration.
- Do not reuse a physical pathname or resource ID without the identity
  needed to distinguish a successor from an old deletion attempt. Two
  artifact installations may share the same immutable bytes; close a source's
  hold, not another installation's byte ownership.
- Retain cleanup debt, uncertain effects and actual old-client obligations
  separately from historical rollback eligibility and the user's desired
  cleanup budget.

The EF [ADR-0011 confirmed-effect contract](https://github.com/agent-teams-ai/extension-foundation/blob/10deea1a11748df1fcbfc2766033c462fce3acd0/docs/decisions/0011-extension-admission-custody-and-retirement-closure.md#only-proved-external-effects-advance-lifecycle)
already supplies the correct distinction between intent, pending/unknown and
confirmed terminal proof for its profile. Do not invent generic success receipts.

Two further source-only comparisons reinforce the bound:
[.NET collectible AssemblyLoadContext](https://learn.microsoft.com/en-us/dotnet/standard/assembly/unloadability)
initiates cooperative unloading and requires actual executing frames and strong
references to clear. [Go's plugin documentation](https://pkg.go.dev/plugin)
explicitly disallows closing a loaded plugin and imposes build/dependency
compatibility constraints. Neither is a JS adapter. Their honest refusal
boundaries should be adopted in the language of our profile descriptions.

## 6. Two independent owners: an idempotency key is not an effect proof

The prior study tested loss of a reply from the **publication authority**.
The new witness uses **two distinct SQLite databases**, a controller with a
durably claimed dispatch and a separate synthetic effect receiver. A child
process commits the receiver's synthetic effect row and exits 73 before any
reply. The original controller record remains dispatch-claimed.

| Case | Receiver behavior after retrying original request | Observed effect rows |
| --- | --- | ---: |
| E1: receiver has no attempt receipt | Applies a second effect | 2 |
| E2: receiver commits matching-intent receipt atomically with its effect | Returns original receipt; changed intent rejects | 1 |
| E3: receiver receipt deliberately removed before delayed retry | Applies another effect despite using the same request identity | 2 |

This is a two-owner local witness, not a real provider call, network failure
campaign, distributed transaction, or a proof of exactly-once effects.
Controlled receipt removal represents the expiration scenario; no real
provider TTL is inferred. The
[AWS idempotent-API practice](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
explains identity/intent, atomic recording at the effect owner and a bounded
retention horizon. Reuse actual receiver mechanisms when present.

The future updater may not assume an update-attempt identity covers an agent's
tool invocation, external payment, message or infrastructure action. Those
are independently owned effects with their own identities and supported
reconciliation routes. An outbox gives durable intent, not proof that a remote
side effect was completed exactly once. If a receiver cannot disambiguate a
late retry or the receipt horizon expired, preserve unknown and refuse blind
replay instead of pretending a new generation makes the old effect safe.

This directly matches [Agent Runtime ADR-0091 handoff](https://github.com/agent-teams-ai/agent-runtime/blob/0ce60d7474159396132752a625c914ffa87c5049/docs/decisions/0091-interactive-agent-session-synthetic-vertical-slice.md#durable-intent-and-sequential-handoff)
and [its existing execution authority model](https://github.com/agent-teams-ai/agent-runtime/blob/0ce60d7474159396132752a625c914ffa87c5049/docs/architecture/execution-generation-model.md#generation-activation-transaction).
Do not duplicate those authorities or reinterpret a code-generation switch as
a new provider operation. Uncertain handoff may prevent safe retirement of
the relevant owner even when the local callback has stopped.

## 7. Trust and distributed enforcement: validate the actual bytes and current grants

Two actual byte/projection witnesses:

- Hash entry and dependency bytes, then atomically replace the dependency's
  file while leaving the entry unchanged. Entry-only validation succeeds,
  closure digest comparison detects the changed child. Separately replacing
  the entry pathname after the earlier read changes the bytes seen by a new
  read; the captured small byte snapshot still matches the prior digest.
- Apply revoke revision 2, then a delayed grant revision 1. Blind local
  projection replacement reopens access. Conditional monotonic update
  changes zero rows and retains denied revision 2.

No code was evaluated in the byte witness, no signatures, JS loader, sandbox
or real remote authority protocol was qualified. Keeping an in-memory byte
snapshot for small data is only a control; an actual loader must ensure the
admitted immutable closure is the executable closure. A mutable tag, path,
shared cache, integrity check of the entry or verified source commit alone
cannot establish that.

Useful existing sources, not new dependencies:
[OCI content descriptors](https://github.com/opencontainers/image-spec/blob/main/descriptor.md)
identify linked content and verify bytes/size; [TUF specification 1.0.37](https://theupdateframework.github.io/specification/latest/)
covers signed/versioned metadata, expiry and consistent snapshots. The latter
is a relevant model for distinguishing publisher-authorized fresh metadata
from a valid old artifact or a mixed snapshot. It is not a reason to implement
TUF in the library. [npm provenance documentation](https://docs.npmjs.com/generating-provenance-statements/)
explicitly separates verifiable build provenance from a guarantee that code
is harmless. Reuse Extension Foundation's applicable distribution/trust route
rather than building a signing, catalog or sandbox engine in this project.

[EF ADR-0011 revision-bound admission](https://github.com/agent-teams-ai/extension-foundation/blob/10deea1a11748df1fcbfc2766033c462fce3acd0/docs/decisions/0011-extension-admission-custody-and-retirement-closure.md#revision-bound-admission-and-publication)
already separates immutable evidence from revocable authenticated grants,
host-set membership, finite authority leases and clock skew, local monotonic
enforcement and terminal revocation. The canonical transaction does not imply
all routers/external receivers converged. A host that cannot prove an
appropriate current grant does not acquire authority by falling back to an
old cache; a disconnected member does not become successfully fenced simply
because another host acknowledged. A grant may have been valid when a candidate
was prepared and invalid at publication or effect time. Check the exact
authority at the boundary needed by the selected policy.

Proposed additional negative controls (not executed in this campaign):
revocation during prepare, out-of-order/duplicate grant events, expiry under
documented clock-skew bounds, reconnect with a stale membership epoch,
unreachable host, changed artifact between verification and evaluation,
mixed singleton/runtime closure, and revocation during admitted old work.
Preserving code affinity does not preserve a revoked grant. For a trusted local
profile, use the relevant local owner only; do not require remote leases,
distributed transactions or TUF for unrelated in-process features.

The [etcd guarantees](https://etcd.io/docs/v3.6/learning/api_guarantees/) provide
another useful source-level distinction: consistent KV operations do not make
watch delivery linearizable. A live update UI should reconcile authoritative
snapshots/receipts after gaps; current observations and projections cannot
become a second route/grant authority.

## 8. Comparative value and concrete scope recommendations

| System/mechanism | Strength to preserve | What must not be inferred | Role for this project |
| --- | --- | --- | --- |
| Nginx worker reload (executed) | Prepare replacement, preserve old service on resource failure, independently drain processes | Arbitrary JS/module state continuity or zero transient failures | Strong process-lifecycle baseline and reusable design evidence |
| OSGi wiring (source) | Actual dependent closure, retained old wires and package-space consistency | Non-disruptive refresh of every dependent, JS-compatible resolver | Adopt review/test semantics, not Java runtime |
| .NET collectible loading (source) | Explicit collectible context and actual strong-reference/frame constraints | Immediate unload on command, arbitrary hostile-code containment | Honest physical-lifetime taxonomy |
| Go plugins (source) | Direct native integration in supported build cohorts | General unloadability or independent toolchain/dependency compatibility | Reject blanket native in-process replacement |
| AWS deployment practice / Protobuf (source) | Prepare readers, activate writers, compatibility/unknown-field preservation | Rollback of irreversible effects or a universal migration algorithm | Product-state and protocol conformance criteria |
| OCI / TUF / npm provenance (source) | Content identity, coherent metadata and build-source evidence | Same as authorization, sandboxing, or physical executable closure automatically | Existing artifact/trust mechanisms; no new catalog or signing implementation |
| Get Modular + EF (pinned source, earlier bounded experiments) | Composition, scopes, Observation, declared future closure/admission policy | Public lifecycle-kernel availability, arbitrary borrowed non-leaf graph, complete E2E | Reuse through supported existing owners, qualify only actual missing public seams |

These are mechanism comparisons across different scopes, not a common
competitive score, throughput benchmark or a claim that our proposed
architecture is stronger than deployed alternatives.

The most economical first-profile hypothesis is still one **trusted, bounded,
real TypeScript consumer** with a stable external state/resource owner,
explicit immutable composition, local atomic publication/admission, and an
explicitly bounded predecessor-retention policy. Evaluate refusal rather than
generalizing distributed rollback, untrusted code, durable orchestration,
browser assets and provider-session transfer into the base API. If a real
consumer requires any of those guarantees, it is a selected profile with
the appropriate owner and negative controls, not a hidden default.

## 9. Prioritized acceptance gaps, owners and stop conditions

The previous S1-S7 specifications remain proposed at their native/consumer
scope. This checkpoint supplies additional bounded falsifiers and the evidence
above; it does not replace their actual installed-technology requirements.

| Priority | Risk/required real conformance scenario | Ownership and stop rule |
| --- | --- | --- |
| P0 | Real TS7 public-package admission across root/nested call/stream + old/new dependent provider | Get Modular public admission seam and selected consumer; no private kernel/deep imports or fabricated public API |
| P0 | Real composition change and concurrent publication: overlapping X/Y closure, newly attached dependent, stable borrowed provider survives A/B failure and retirement | Product canonical graph authority + GM/EF existing facts; reject stale/unsupported closure; no second resolver |
| P0 | Actual state owner read/write/coexistence matrix including edit racing migration, old writer losing new fields, unsafe rollback refusal | Real consumer schema and commands; no generic serializer or duplicate state |
| P0 if durable | Real selected backend transaction and independent receiver: lost commit/dispatch acknowledgement, same/different intent, expiry, stale authority fence | Existing authority/effect owner; unknown remains unknown; no blanket DB choice or retry |
| P0 if executable delivery | Exact verified executable/import/shared closure, replacement of staged bytes, current grant at evaluation/publication/effect | Real EF/loader/authority profile; signed metadata is not containment or automatic admission |
| P0 if reclaimable | Late attachment races retirement, failed cleanup, independent source/byte holds, A/B/C retirement order, bounded retention refusal | Actual resource/artifact owner; reject deletion when hold or outcome remains uncertain |
| P0 if remote grants | Real multi-host membership/fence/lease/reconnect and revocation-versus-admission scenarios | Selected authenticated owner protocol; no terminal global enforcement from one acknowledgement |
| P1 | Actual browser old-client asset/protocol retention, view state and late query result; separate renderer/preload/main support | Real consumer profile; no universal hot reload claim |
| P1 | Resource/latency budgets and no indefinite starvation: repeated replacements with long work, failed candidate/debt, independent domains | Measure selected scenario; budget controls must refuse/defer or explicitly authorize forced policy, not declare false completion |

Do not begin production implementation simply because these research witnesses
are green. Select Q1-Q7 scope and a first actual consumer; qualify supported
public seams and their rejecting cases. FMS and Engineering Foundation continue
to govern the **first real feature bootstrap** through existing organization
admission. New findings do not authorize upstream code changes, package releases,
consumer pin upgrades or immutable standard amendments.

## Evidence and reproducibility

- [Archive](evidence/critical-closure-witnesses-20261123.tar.gz):
  10,558 bytes, SHA-256 d0b10093cc957ae6b15b04c8c0037d4f65a3e8b46eade1e05a573ecda977c152.
- [Manifest](evidence/critical-closure-witnesses-20261123.manifest.json):
  eleven regular files, exact SHA-256 for each; three final Python programs,
  six raw outputs, initial Nginx input and failure excerpt.
- Executed with Python 3.13.5, SQLite 3.46.1 and local Nginx 1.26.3 on Linux.
  The two authority receipts reproduced byte-for-byte; native Nginx receipts
  reproduced semantic observations while preserving raw PID/log differences.
  Four Nginx observation groups and 17 SQLite/file/model result groups are
  recorded. The 128 enumerated hold states are not 128 native tests. Repeats
  add no unique coverage. The incomplete Nginx harness attempt is not PASS.
- To reproduce, verify the outer archive hash and every extracted member,
  extract into a fresh disposable directory, and run python3 on
  authority-closure-probe.py, authority-races-probe.py and nginx-reload-probe.py.
  The Nginx harness requires Linux process observation via ps, an installed
  nginx binary and local loopback ports. Use the final input, not the retained
  failed first-input harness. No dependencies or external providers required.
- The available local Node v22.16.0 and tsc 5.8.3 do not satisfy the selected
  Node24/26 and TS7+ qualification requirement; no JS-runtime fixture was run.
  Registry access was unavailable from this environment. The existing Piral/
  Effect campaign and prior ordering probe retain their exact earlier scope.
- External references above were read on 2026-11-23; fixed-version specs and
  pinned owner source URLs identify their observation cohorts. Rolling public
  documentation is source-only. No new dependency version was selected.
