# Application foundation: begin with qualified modules, preserve upgrade paths

Status: proposed cross-repository adoption guide, 2026-11-24. It synthesizes
existing owner contracts; it is not a new CMS/FMS version, public API, adoption
approval or production implementation. The owner requires the shared foundation
to be qualified first through representative fixtures and independent test
Hosts. Waiting greenfield applications adopt qualified profiles afterward.

Read [current status](../status.md) and the [delivery plan](../plans/foundation-delivery-plan.md).
The [vision](continuous-evolution-vision-2026-11-23.md) owns the long-term purpose;
this guide separates initial foundation qualification from later product adoption.

## 1. The first useful milestone

A representative capability uses actual public composition/package boundaries,
explicit contracts and state/resource ownership, then passes independently
specified positive and rejecting tests. Its test Hosts provide realistic
authority, state and lifetime pressure without implementing an application.
Foundation work does not wait for a first product or migration candidate.

Two meaningful GM profiles qualify the tested composition choices. The same
built behavior in two independently wired test Hosts can qualify bounded reuse.
An actual browser-execution row must run those bytes in a browser realm; a
browser UI calling a Node backend is a different claim. Product adoption,
installed-plugin support, public SPI stability and complete live replacement
each retain their own gates. The [qualification matrix](../research/foundation-qualification-matrix.md)
defines the concrete evidence and current gaps.

Browser, desktop and untrusted third-party extensions are confirmed architecture
targets now. Keep their execution, IPC, authority, storage and containment
boundaries possible in the first design; do not postpone those boundaries until
an application appears. Their native support remains separately qualified.

The broader objective remains an upgrade path for every substantive owned
capability, including foundations through their outer recovery owner. The
qualified boundary may be a feature cohort, process, realm or installation.
A source helper does not need its own runtime identity merely to support that
objective. An unsupported finer transition remains research work.

## 2. Follow the existing authority chain

| Decision | Owner/source | What this guide adds |
| --- | --- | --- |
| Feature semantics and business invariants | Capability contract owner; later product bounded context and accepted ADRs | Define realistic fixture semantics without inventing a product's domain or requiring a first product |
| Feature visibility, layers and parent republication | [FMS v1.1](https://github.com/agent-teams-ai/.github/blob/0b44c64c824f536bd1b085341e7669bcc64ef124/docs/architecture/feature-module-standard/v1.1.md) as adopted by the consumer | Exercise applicable source boundaries in fixtures, then retain each product's own checks |
| Module declaration, bindings and construction | [GM Consumer Module Standard](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/docs/architecture/common-assembly.md) at the consumer's adopted revision | Keep portable behavior independent from composition registration |
| Artifact/trust/installation obligations | [EF accepted extension model](https://github.com/agent-teams-ai/extension-foundation/blob/70f2bf21203b557e0f5a3b563a6b41eec5925fd8/docs/architecture/extension-model.md) and applicable host profile | Separate reusable code from independently admitted executable artifacts |
| Public package and repository admission | Owning package release and [repository admission](https://github.com/agent-teams-ai/.github/blob/0b44c64c824f536bd1b085341e7669bcc64ef124/docs/repository-admission.md) | Retain exact public/declaration/runtime evidence; no implicit pin migration |
| Complete live-update coordination | [Proposed LMU operation](operation.md) | Reuse qualified mechanisms without moving product authority into the library |

These immutable links are inspected source coordinates, not automatic consumer
adoptions. Before qualification, record the fixture's exact public/tool cohort;
before product integration, record its accepted pins and any reviewed migration.
Historical GM eligibility requirements withdrawn by
ADR-0030 must not be revived; its withdrawal also does not publish the private
lifecycle kernel. Source availability, public release and product qualification
remain separate facts.

## 3. The minimal authoring handoff

Keep these facts beside the representative fixture or later owned feature,
reusing applicable CMS/FMS declarations and documentation. The fixture contract
has a real owner without pretending to be a product decision. This table is a
review aid, not another manifest schema or mandatory form for every class.

| Fact | Required question | Example of a rejecting gap |
| --- | --- | --- |
| Capability and owner | What useful operation is provided, and who controls its meaning? | A generic `execute(any)` surface hides several unrelated owners |
| Contract and compatibility | Which behavior, errors and revisions does each consumer rely on? | Matching TypeScript shapes are treated as semantic compatibility |
| Composition | Which implementations and explicit bindings are selected? | Discovery order or a global service bag selects the implementation |
| Shared basis | Which dependencies are owned, borrowed or mutable across instances? | An apparently independent module captures an unrecorded shared writer |
| State | Who owns durable data, drafts, caches and operation progress? | Replacing a view destroys the only copy of a user's draft |
| Lifetime | When may new work begin, and what must finish before cleanup? | Aborting a signal is treated as physical completion of asynchronous work |
| Supported environment | Runtime, compiler, package cohort, placement and relevant APIs? | A Node-only dependency appears in a supposedly portable browser entry |
| Change path | Which restart, rollout or live boundary is actually supported? | A changed file is advertised as an independently replaceable unit |
| Evidence | Which representative external fixture or adopted consumer and negative controls establish the stated claim? | A local source alias is presented as a packed-consumer result, or a test Host is labelled product adoption |

Keep business behavior and its consumer-owned ports inward. GM declarations,
entries and profiles stay in the actual outer composition boundary specified by
the consumer's CMS. Infrastructure adapters receive values or the narrow ports
they implement; domain/application code does not acquire GM or resource-scope
types. Optional UI and transport packages must not leak into the portable core's
emitted declarations. Use the existing public root exports and source checks.

An adapter is not automatically a separately distributed plugin. Create a
package when a real release, dependency, deployment or independent-use boundary
justifies it. Do not scaffold empty packages for every phase in a diagram.

## 4. Resource and state discipline needed even for static applications

### Construction and resources

Establish the real construction-attempt owner before executing code that can
acquire supported resources. Use the existing public resource acquisition path
for module-owned handles; preserve borrowed owners across dependent failure.
Failed or late construction remains owned until the actual required cleanup
has completed or an explicitly supported debt disposition is recorded.

Adopt the consumer's actual drain-before-close boundary. Keep separate facts for
closing admission, requesting cancellation, settling work, unsubscribing and
closing resources. A successful cleanup callback is evidence of that callback's
result, not proof that all I/O or foreign code has stopped. Pure borrow-only
capabilities need no artificial cleanup scope.

Treat absence of import-time product effects as an authoring rule and a tested
limit of the selected profile. A loader cannot retroactively collect arbitrary
unregistered effects created by a failed import. The [native custody study](../research/public-runtime-identity-and-safe-drain-2026-11-23.md)
records concrete setup, reentrancy and failed-drain counterexamples.

### State and writes

| State kind | Initial ownership question | Future replacement implication |
| --- | --- | --- |
| Canonical business data | Which existing authority validates and commits a mutation? | Code replacement cannot bypass current permissions or receiver-side fencing |
| Plugin-private durable data | Which namespace, schema and export/removal policy apply? | Installation custody is separate from product-wide domain authority |
| View draft/history/selection | Which actual product state owner retains user intent? | Mounting a successor is not proof of preserved editing behavior |
| Cache or derived observation | Can it be rebuilt from an authoritative snapshot? | Stale completion must not overwrite newer useful state |
| In-flight operation and stream | Which lifetime and semantic cohort were admitted? | The next selection must not invalidate still-authorized old work |
| Effect receipt | Which actual receiver records matching intent and result? | A retry after lost acknowledgement must reconcile the original operation |

The first profile may retain state in the Host and reconstruct a view or
implementation. This is a candidate simplification, not a selected universal
policy or a guarantee of arbitrary migration. Any rollback promise must account
for the current schema, grants and irreversible effects. Never add a second
canonical state store to make update coordination convenient.

## 5. A bounded supported profile

Before a fixture or consumer advertises support for a profile, its owner records:

- exact accepted public package and compiler cohort, including embedded tools;
- runtime and trust assumptions, execution process/realm and available APIs;
- actual feature-tree depth, entry/group counts and shared-owner topology;
- fixed compile/runtime budgets and relevant workload, not just module count;
- source/declaration checks, positive and negative consumer scenarios;
- supported restart/recovery boundary and explicit rejection/fallback behavior.

Use strict TypeScript 7.0.2 or newer for maintained JavaScript-runtime work.
Keep compatible public artifacts pinned through the consumer's owning process.
The public GM 0.8.0 cohort exercised by the dated research does not silently replace another product's
accepted 0.5.0 cohort. A peer dependency declaration also does not establish one
physical runtime identity: validate actual packed roots and opaque-handle use.

Select a bounded envelope with representative pressure on the claimed contract.
Do not shrink away a required Browser/Desktop/trust boundary merely to get a
passing row. Broader scales or
platforms require their own rows of evidence; a 1,000-entry typecheck fixture is
not a thousand-concurrent-operation or live-update load test. Two Node Hosts do
not qualify a browser renderer. Resources/Observation provide mechanisms for
trusted same-process code, not a hostile plugin sandbox.

## 6. Later adoption: the concrete Orchestrator gate

At inspected main `c6ce98cd1a8ac1dd27ec877c018e5aa7cd5adff7`,
[ADR-0117](https://github.com/agent-teams-ai/agent-teams-orchestrator/blob/c6ce98cd1a8ac1dd27ec877c018e5aa7cd5adff7/docs/decisions/0117-reconcile-mandatory-module-composition.md)
requires GM at applicable real TS composition seams. Its
[module foundation gate](https://github.com/agent-teams-ai/agent-teams-orchestrator/blob/c6ce98cd1a8ac1dd27ec877c018e5aa7cd5adff7/docs/architecture/implementation-readiness-gates.md#module-foundation-before-business-expansion)
is pending. Existing Sandbox Manifest migration, nested-source conformance, a
representative consumer with two meaningful profiles, lifecycle failure cases
and a bounded adoption envelope are the immediate obligations.

Foundation work and migration of existing admitted seams may proceed within
their owner's scope. New or expanded business assembly must wait for that gate.
Smaller qualified adoption does not wait for the separate 100/500/1,000 growth
matrix, full live update or every plugin-host decision. This guide does not
retract existing scoped admission or declare the pending gate passed.

Sandbox Manifest is an inspected product-adoption example, not the entry gate
or selected first consumer for shared foundation qualification. Independent test
Hosts can establish their declared library/profile claims before this product
work. They cannot be presented as independent product adoptions. Other
applications follow their own accepted scope and gates rather than inheriting
Orchestrator's profile; applications are not required to start first so that the
foundation can be tested.

## 7. Preserve the next change without implementing everything now

Keep artifact identity, semantic capability revision, composition plan, runtime
generation and operation identity distinct. Do not freeze loader-specific or
UI-framework-specific objects into the portable contract. Make supported change
boundaries and incompatible transitions explicit so an ordinary restart can
later be supplemented by a qualified live transition without rewriting business
logic.

The next dynamic prerequisite is an explicitly qualified atomic selection,
admission and custody path for the whole supported operation, including nested
work, through supported public mechanisms and product-owned authority ports.
Resources alone does not provide it, and private kernel imports are not a
delivery route. Qualification does not preselect a new published kernel when an
existing supported mechanism can establish the actual profile's guarantees.
The [operation proposal](operation.md) and [open decisions](../decisions/open-decisions.md)
own the remaining dynamic obligations. The [headless guide](headless-plugins-and-ui.md)
adds reusable plugin and optional rendering boundaries without inventing another
Host, resolver, resource stack or global event bus.
