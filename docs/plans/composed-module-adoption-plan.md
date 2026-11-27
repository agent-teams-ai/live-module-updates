# Programme C: composed modules and qualified Host integration

Status: reviewed implementation programme, 2026-11-27; execution started after
two independent review rounds. The owner authorized
planning, independent critique, implementation, review and delivery in one
Draft PR. This document fixes scope before implementation; it is not execution
evidence or acceptance of a new production profile. Completed B0–B7 remains in
[its owning plan](first-operation-implementation-plan.md).

## Useful outcome

Give projects an executable way to construct a coherent group of typed modules
with Get Modular, expose its useful operation through the installed LMU library,
replace the group while old finite operations finish, and qualify the narrow
Host contracts that make replacement safe. Authors reuse the actual operation,
construction and lifetime mechanisms instead of copying a resolver, coordinator,
authority store or cleanup manager.

The concrete qualification joins the packed Document → Format → Export modules,
their independently authored dependent feature, and the complete LMU operation.
The earlier static authoring proof and B6 single-capability live-update proof do
not establish this join. One admitted operation retains the entire selected
closure across await; two separately admitted facade calls are two operations.

A second substantive result is **LMU itself owned inside a real GM Host**.
The Host constructs a concrete owner-defined invocation capability through GM;
external teardown must drain LMU before releasing the resources its admitted
work still needs. Failed cleanup remains truthful, recoverable parent debt.

Independent Node and real Chromium Hosts use the same packaged LMU and module
artifacts. Each owns actual state, final effect permission and native resources.
This is a disposable representative consumer, not a first-product prerequisite.

## Sources, owners and non-overlap

Starting LMU main: 88723c6881f54831977b96f39d24b58e8c7430d2 (merged #9).
Accepted [ADR-0001](../decisions/0001-cooperative-update-profile.md) and
[ADR-0002](../decisions/0002-production-source-adoption.md) remain in force.

| Source | Exact inspected revision | Authority |
| --- | --- | --- |
| Organization architecture, engineering rules, FMS v1.1 and tools catalog | .github@89b5d7c512d9c4b5ae63709857a0d71cb2e6d178 | Inward dependencies, semantic ownership, native evidence and supported tooling |
| GM CMS and public construction/lifetime/conformance | get-modular@27dfb4ddf67cead198fee6e781ab355c37782928 | GM at selectable composition boundaries; fixed internal helpers remain ordinary imports |
| Executor A | [EF #70](https://github.com/agent-teams-ai/extension-foundation/pull/70), observed head 4990f1f5047ef4b71e95aa74eba86fc646e84e35 | EF implementation, artifact/admission mechanisms, tooling transition and merge |
| Original qualified EF input | extension-foundation@c0a8f2733b54323e2f85322b86167491a169af1d | Existing genuine B7 archives/verifier; no silent replacement by a newer unqualified head |

Executor B changes **LMU only**, its reference packages, qualification, profiles
and owning documentation. A retains EF and upstream GM mechanisms. Runtime and
Orchestrator owners retain persistence, execution-session policy, business
state and product adoption. A missing GM/EF mechanism is reported with an exact
public-API reproduction rather than copied into LMU. Historical archives and
source-bound B7 inputs remain intact.

One new branch and one Draft PR contain every C phase. No phase PRs, public npm
release, product pin migration, central admission change or new repository.
Publish each useful commit immediately. Read live refs before integration;
another executor's unpublished implementation is not assumed from its plan.

## Architecture and implementation choices

The ordinary LMU application remains independent of GM, EF, UI and platform.
That accepted rule does not justify omitting GM from a real selectable module
boundary. Invocation/retirement/copy helpers inside one cohesive operation are
fixed dependencies, not plugin modules.

GM constructs the complete root closure at the outer composition boundary.
The capability owner supplies its full semantic contract. LMU owns admission,
finite work, original publication recovery and retirement. Resources owns
physical cleanup. Host authority owns the canonical head and each receiver
checks its current effect permissions. There is one owner of each concern.

Composing the LMU runtime as a module does **not** hot-swap that coordinator.
Exactly one live runtime owns an activation domain/session. Closure coherence
means a consistent code/provider set, not a transactional snapshot of mutable
business data; the state owner supplies any stronger data isolation.

### Concrete composition direction

A real GM module calls the ordinary LMU factory. Its Host-only instance may
expose owner controls; its provided capability exposes only the concrete
application's stable invocation contract. Downstream modules do not receive
raw generation roots, publication controls or a universal generic LMU
descriptor whose identity pretends to cover arbitrary application types.

The existing Resources entry is the first place to consider a small reusable
owned-runtime handoff, after a discriminating experiment proves its contract.
Do not add a generic prepare/run wrapper merely to import Assembly in production.
Use existing typed GM preparation and the existing LMU preparation custody.

The lifetime experiment must address two discovered risks:

- Closing a Resources parent aborts descendant scopes before cleanup callbacks.
  Retained generation scopes and still-borrowed infrastructure cannot be
  descendants of a scope whose close would invalidate admitted work.
- Returning a CloseSnapshot with complete=false from a Resources cleanup
  callback does not create Resources debt. Original incomplete close must be
  translated into truthful retained debt. A later explicit successful retry
  must release that debt without mutating the original close receipt or
  copying the coordinator's completion predicate into an adapter.

A current ownership-complete fact may be required on the existing snapshot;
first prove that need through the actual native lifecycle experiment. No second
cleanup manager or implicit retry is authorized.

### Credible options

P means incremental handwritten production/integration code; T means tests
and fixtures. Estimates exclude docs, generated output, third-party archives,
infrastructure and product rollout. Days assume one experienced engineer and
existing prerequisites, not an agent execution-time or line-count target.

| Rank and option | Benefit and principal risk | Estimate | U / N / C |
| --- | --- | --- | --- |
| 1. Real packaged GM adoption plus a narrow owned-runtime integration in the existing optional Resources entry, if the native experiment proves it | Gives projects concrete construction and truthful lifetime handoff. Risk: duplicate completion policy or premature parent abort; both require rejecting native witnesses. | P 450–1,100; T 1,600–3,000; 6–12 engineer-days | 8 / 8 / 5 |
| 2. Packaged owner-defined composition with existing LMU/GM APIs and explicit Host shutdown | No new API if existing contracts suffice. Risk: repeated nontrivial ownership handling remains consumer code. Prefer when only trivial glue is shared. | P 150–450; T 1,300–2,600; 4–9 engineer-days | 8 / 8 / 3 |
| 3. Separate optional integration package | Useful only for a demonstrated independent release/dependency boundary; otherwise adds another version relationship without a guarantee. | P 500–1,250; T 1,800–3,300; 7–14 engineer-days | 5 / 8 / 6 |

U is confidence in fit, N expected reliability within this finite scope,
C maintenance complexity (higher is worse). These are ordinal judgments, not
measured safety. Estimate confidence: 4/10. Options overlap; do not sum them.
Option 1 is conditional on C2; otherwise complete option 2. Mandatory GM in the
ordinary core and a second resolver contradict accepted rules and are not
credible alternatives.

A small reusable Host contract suite is justified only by actual repeated laws
of the two independently wired Hosts. Use existing Conformance mechanisms where
they apply; do not invent a general test framework or a universal Map authority.

## Invariants

1. **Full contracts and sound types.** Owner-defined identity/revision, complete
   transitive maps and precise results remain intact. Readonly function-valued
   port properties prevent method bivariance from accepting a provider that
   handles fewer inputs than the consumer may send.
2. **Whole closure.** All capabilities for one operation use one generation.
   Bound nested/post-await calls keep it; a global facade starts new admission.
   Raw roots and escaped handles are not a lifetime extension.
3. **Executable identity.** GM plan digest identifies composition, not factory
   code. Prepared closure reuse must bind the original plan and factory-set/
   artifact identity. The owner supplies provenance; a caller label is not
   verification. No cache keyed by plan digest alone and no new hash protocol. A control tests
   actual candidate/factory binding; do not build a cache solely to mutate it.
4. **Custody before effects.** Selection/compatibility are inert. A native owner
   is captured before construction evaluates/acquires. Partial and late
   results retain original custody and structured GM failure facts.
5. **Canonical authority.** Publication/lookup bind the original full payload.
   Unknown remains unknown while the original can commit. Every protected write
   checks actual current state revision, schema, grants and generation fence.
6. **Truthful lifetime.** Work and descendants retain the full closure. Old
   disposal removes only the owned instance; borrowed state and new/foreign
   resources survive. Observer cancellation does not prove physical settlement.
7. **Explicit bounds.** Work, candidates, retiring generations and session
   attempt history have separate limits. History is not evicted/reset to admit
   more updates; maxAttempts is not merely concurrent capacity.
8. **Actual package boundaries.** Ordinary and optional/test exports have honest
   closures. No source aliases, private kernel imports, undeclared transitive
   dependencies or broad casts are external-consumer evidence.

## Phases and implementation order

### C0 — publish and challenge the plan

- Verify active ownership and immutable starting sources.
- Independently review ownership/FMS/DDD, lifetime/recovery and installed
  integration. Keep actual findings in the [review record](../reviews/composed-module-adoption-2026-11-27.md).
- Correct material issues in at least two independent passes before dependent
  production implementation. C2 is an abstraction discriminator, not an open
  invitation to add another runtime profile.
- Use one Draft PR and immediate useful checkpoints. Do not wait for unrelated
  Docs CI to improve prose; actual required merge gates still apply.

Exit: reviewed scope, exact file ownership and no material contradiction.

### File ownership and dependency map

All implementation goes through the same PR. Reviewers may inspect every area,
but concurrent writers own disjoint files; the root integrates shared files.

| Area | Primary writer | Planned files and dependency |
| --- | --- | --- |
| C1 public contract correction | operation_design | Existing invocation/preparation/lifetime port types, UpdateRuntime/UpdateHandle signatures; new tests/module/contract-variance-cases.ts and its existing packed-consumer integration. Root integrates shared model/lint edits. |
| C2 native discriminator and C3 native Host controls | invocation_contract | tests/module/owned-runtime-*.ts; native GM lifetime and authority-flight controls. No production/shared-file edits. |
| C3 justified coordinator correction | operation_design | After C2 and ADR-0003: existing coordinator, operation state, RuntimeSnapshot and focused ownership tests. The selected owner-defined callback needs no new Resources wrapper. |
| C4 complete reference and C6 installed/native delivery | installed_consumer | New tests/qualification/composed-document/ maintained consumer/adoption slice; tests/module/composed-* staging, runner and evidence. Reuse existing portable core/adapter/Summary source unchanged; no edits to EF or old sealed evidence. |
| C5 actual Host contract laws | root | src/features/update-operation/testing/, curated src/testing.ts, focused laws/negative controls and external consumer connection; no runner or platform dependency. |
| Shared policy, plan, decisions and delivery | root | package exports, compiler scopes, existing FMS/Foundation/lint profiles, CI integration, owning docs/reviews and branch/PR operations. |

These are scoped file families, not permission to create empty layers. If C2
shows no missing adapter, its proposed source file is not created. A changed
ownership boundary is recorded before adding its profile. No writer silently
extends another writer's file set.

### C1 — strengthen public operation contracts

- Reproduce public invocation variance through installed declarations: a
  narrower command provider must not be assignable to a wider facade.
- Use readonly function-valued properties for owned public port/runtime
  contracts where parameters matter; preserve runtime behavior and semantics.
- Add positive and rejecting installed cases, including BoundInvocation,
  ordinary admission outcomes and application-owned semantic results.
- Enforce changed contract syntax using actual typed lint, not a local parser.

Exit: real TS 7.0.2 rejects the unsound substitution and valid ordinary
consumers still compile/run without GM or Node/DOM types.

### C2 — discriminate actual owned-runtime lifetime before freezing an API

- Make one real GM module own an LMU runtime and provide a concrete invocation
  capability to a dependent module. Keep owner controls Host-only.
- Acquire the initial generation under existing inert preparation custody; a
  native setup/transfer cell must retain it if construction refuses.
- Define external admission cutoff at the beginning of the owner's shutdown
  action. A previously registered abort listener must not admit a fresh facade
  call after that cutoff, regardless of listener order; an already admitted
  BoundInvocation may continue. Test this reentrant listener before choosing
  explicit Host-close ordering or a qualified facade/signal guard.
- Start held post-await work, close the external GM Host, and prove resources
  and borrowed providers remain usable until actual drain.
- Independently hold candidate preparation after native acquisition, close the
  parent, then allow its late settlement. Preserve original custody and all
  required borrowed ports; the late candidate cannot be published.
- Independently commit B with a lost acknowledgement, close the parent and
  resolve the original receipt through still-usable reconciliation ports.
  Parent completion cannot precede discharge of that actual uncertainty.
- Force native cleanup debt, retain the original incomplete LMU/parent reports,
  allow explicit recovery, then prove the parent's retry actually completes.
  Pending or unproven original settlement never permits concurrent native retry.
- Exercise the complete initial transfer matrix: constructor refusal before
  transfer; constructor success followed by GM product/dependent-module failure;
  parent close during initial preparation; and cancellation after runtime success
  but before GM root publication. Exactly one actual owner retains/releases the
  initial instance; no cancelled/closed root escapes and no borrowed owner closes.
- Establish whether current public snapshots suffice. If a current ownership
  fact is missing, derive it once from the existing coordinator rule; do not
  reconstruct private policy in the integration adapter. It means a closed
  runtime with all preparation/publication/work obligations discharged and all
  actual custody released, including unregistered custody and invalid native
  report paths. Zero registered generations, elapsed time or closed=true alone
  cannot establish it. It is advisory native-report evidence, not a proof of
  physical release or a rewrite of the original close result.
- Compare two integrations/meaningful profiles and separate common handoff
  obligations from owner-specific state, grants, root selection and behavior.
- Record the selected option and exact public API/source ownership before C3.

Exit: an executable discriminator and independently reviewed decision. If
existing APIs suffice with trivial glue, publish the reference and explanation;
C4–C7 still proceed. No universal GM descriptor, service locator or new catalog.

### Selected C2 decision

The actual GM/Resources lifecycle and two native authority-flight overlap
counterexamples select option 2 plus one necessary coordinator correction.
[ADR-0003](../decisions/0003-composed-runtime-ownership.md) owns the exact
current ownership fact, actual-flight accounting, source boundaries and controls.
The owner-defined handoff remains small consumer composition; no public wrapper
or second lifetime manager is added. Original C2 failures remain sealed evidence.

### C3 — implement the qualified handoff and exact composition adoption

- Apply the selected ADR-0003 coordinator correction and use the existing
  optional Resources preparation entry. Keep one private package and the
  ordinary root free of concrete GM dependencies.
- Build the real owner-defined GM module with narrow authority, compatibility,
  preparation and settings inputs. Preserve full descriptor unions, separate
  mapped bases and proper declaration/module/group ownership.
- Keep independently retained generation/native infrastructure outside the
  prematurely aborted parent tree. Host shutdown must preserve borrowed-owner
  lifetime until LMU has truly released it.
- Preserve initial transfer-on-success, actual original cleanup flights,
  structured GM failure results and explicit eligible retry.
- Scope CMS to the actual GM module/consumer boundary. Full FMS still covers
  all production source. Adopt new production composition-contract surfaces
  only if materialized; use Foundation's graph and existing FMS fields.
- Use GM layout/namespaces, handwritten binding oracle, smoke, isolate and
  applicable owner contract suites. Smoke alone does not prove wiring.

Exit: real GM construction of LMU capability and truthful initial/candidate/
external ownership, with enforced source and type boundaries.

### C4 — qualify the complete live feature closure

Reuse existing packed Document/Format/Export and independently authored Summary
behavior, rather than a second implementation of those use cases. Add a second
meaningful profile with an externally supplied Format provider through public
contracts. Do not count two runs as independent integrations.

| Scenario | Independent witness |
| --- | --- |
| Useful A → B → externally authored provider | Exact revision, content and accepted delivery, not a result generated by the tested formatter |
| Hold Export/Summary after document capture, update, continue A | Entire A closure finishes consistently; fresh work uses B; no A/B mixture |
| Nested/post-await work | Retained generation and aggregate lifetime; completed contexts refuse descendants |
| Edit/grant/schema change during delivery preparation | Actual receiver refuses stale/unauthorized effect; no extra file/DOM delivery |
| Same plan, different factory set | No plan-only reuse; original candidate stays bound to its actual factories |
| Missing dependency/incompatible full contract | Actual GM/TS refusal before effects/publication |
| Partial/late failed construction | Original owner retains all acquisitions; A remains useful |
| Commit with lost acknowledgement, then another update | Actual head serves new work; original lookup resolves its own attempt |
| Old cleanup after new registration | New instance, borrowed state and foreign resource survive; old instance releases once |
| External GM Host shutdown and retry | No premature descendant abort; incomplete native cleanup remains debt and can recover explicitly |

Use controlled barriers and actual side effects, never sleeps or tick counts.
Node and Chromium have independent state, effect sinks, authority and native
resources. Shared portable behavior/test cases alone are not independent Hosts.

### C5 — reusable actual Host laws and bounded operation

- Deliver the owner-maintained optional test subpath live-module-updates/testing
  after both Hosts exercise the actual laws. Its portable cases/registrar have
  no Node, DOM, GM, Conformance or test-runner dependency, and no export from the
  ordinary root. These laws belong to LMU, not the document-reference package.
- Give the implementation the real feature-owned FMS testing role and curated
  src/testing.ts entry. Full strict/typed coverage applies; Foundation rejects
  production/application imports of this testing surface. A clean external
  consumer imports it without optional peers. GM Conformance continues to own
  GM descriptor/module checks, not ordinary LMU publication laws.
- Qualify canonical read/publication consistency, detached snapshots, exact
  original payload and immutable receipts, legitimate unknown, preparation
  custody and truthful lifetime. Driver barriers/fault injection must not supply
  the expected answer or duplicate production authority policy.
- Test both real ports and deliberate faulty variants. Each rejecting case must
  fail its intended law after successful setup.
- Exercise repeated replacements, held predecessors, independent domains,
  work/candidate/retention/history saturation and real cleanup retry.
  Verify stable native counts after settlement, not just internal counters.
- Record finite session exhaustion and outer-owner renewal alternatives.
  No receipt eviction, durable store or transparent renewal is implemented.

Exit: a reusable scoped way for projects to check their actual Host obligations,
with honest capacity and resource boundaries. Test success is not product
admission or physical release without an independent native witness.

### C6 — installed artifacts and native evidence

- Install exact archives into clean external directories, compile public
  declarations and execute useful operations. Retain source, lock, compiler,
  archive and actual input/output identities.
- Keep the two maintained build scopes explicit. The new root-native staging
  route uses the already qualified root TS 7.0.2 compiler and an explicit
  unchanged input inventory from portable core, adapter and Summary. Build and
  pack in dependency order in an isolated temporary tree; do not import the old
  child pack helpers or rely on that child's node_modules/.bin/tsc.
- A second clean consumer contains only its authored files and the packed
  installations. Record compiler --listFiles inputs: consumer sources plus
  installed declarations, no checkout aliases. C evidence has its own directory;
  no mutable output is shared with the parallel old qualification workflow.
  Preserve the old child graph and accepted CMS authority unchanged.
- The maintained authored reference lives under tests/qualification/composed-document
  with its own explicit strict staged compiler/adoption route. Root runner files
  under tests/module contain only orchestration and resolvable root imports.
  No bare fixture package imports enter the root compiler, no declaration shim
  masks missing installation, and no new maintained source is omitted from gates.
- Extend the existing portable-document workflow path triggers to the new
  composed-reference sources, native composed runner inputs and relevant LMU
  public source so the promised static regression runs on the actual C revision.
  Keep its existing native commands and old fixture graph unchanged; do not add
  a separate workflow or relabel an older green run as new-head evidence.
- Ordinary installation still has no GM/EF/organization runtime packages.
  Optional integration uses one physical copy of each exact necessary GM peer.
  Verify exports and reject private imports/missing required optional-entry peers.
- Serve the same artifacts to pinned real Chromium; record loaded bytes.
  Node EventTarget/source imports are not browser evidence.
- Mutate real changed boundaries: wrong wiring, mixed-generation call,
  plan-only reuse, effect-fence removal, early parent close and wrong-instance
  disposal. Require the intended witness, not an unrelated setup failure.
- Run real FMS/Foundation/strict/type-aware gates, static authoring and B6/B7
  regressions. Preserve the original signed EF artifact route; do not take over
  A's independent EF release or tooling admission.

Exit: exact source-bound evidence and all required gates for the declared scope.

### C7 — handoff, final review and merge

- Update owning usage/source/qualification docs and navigation. Show what
  authors and Hosts import, construct, retain, call, update and close.
- Reconcile stale open wording only where an accepted ADR and actual evidence
  already settle it. Keep unresolved policy with alternatives and dependencies.
- Independently review architecture, safety and installed consumption against
  final source. Fix every critical/material finding and review affected changes.
- Push every commit, make the same Draft ready after review, merge with normal
  exact-head/actor/protection checks, then verify actual main and required checks.
  Record real commits, runs and artifacts rather than estimated completion.

## Existing tools and contracts

| Mechanism | Application | Retained boundary |
| --- | --- | --- |
| Core / Assembly 0.8.0 | Sole construction authority; full maps, original plan/factories and handwritten wiring oracle | No graph engine inside LMU application |
| Resources 0.2.2 | Existing preparation and actual original cleanup, plus C2-qualified external ownership | No second cleanup stack or false physical-release claim |
| Conformance 0.5.2 | Module/root/layout/namespace/contract tests at actual GM boundaries | Test-only; smoke does not qualify publication |
| FMS 0.3.0 / immutable v1.1 | Complete production ownership, materialized composition surfaces and rejecting controls | No partial FMS claim or copied standard |
| Foundation 3.0.0 / Stack 0.1.1 | Existing graph, dependency, coverage and typed quality routes | Keep accepted compatible cohort; no silent schema migration |
| TS 7.0.2 / Oxlint 1.83.0 | Sound public contracts, complete maps, declarations and scoped CMS rules | No broad casts/shims/waivers |
| Qualified EF Node artifact | Genuine existing B7 regression | No verifier, admission or EF core duplication |
| Observation | Only if an actual selected observable registration needs it | Not an authority, receipt journal or mandatory dependency |
| Effect / lifecycle kernel / UI / executors | Preserve their ownership and future attachment contracts | No private kernel, forced Effect carrier, universal renderer or isolation claim |

Current CMS full-document SHA-256:
ef5044eef1da7a01f3ca40323cd17d9f2597fc22b5abb905c7c77e5318b408d7.
Scope its actual 300/60/4 and 80-line module limits, function-property contracts
and import rules to the newly adopted GM boundary. Existing neutral coordinator
remains an ordinary FMS library; do not retroactively claim full CMS adoption.
New neutral roots join the ES-only compiler project. All production source
stays under full FMS/Foundation coverage. No new dependency just to use a name.

## Deferred decisions

The [existing owner decision register](../decisions/open-decisions.md) remains
authoritative. The following scoped deferrals do not reopen accepted ADR-0001
choices or block this finite programme:

- **Streams and long-lived sessions:** alternatives are finite per-event calls,
  explicitly owned bounded sessions, or an executor-specific profile. Choose
  settlement, backpressure and cancellation ownership before implementation.
  Returned callbacks/iterators acquire no implicit lease.
- **Session renewal:** retain finite history and refuse at the bound; let an
  outer owner create a fresh domain; or design a durable replay horizon with its
  authority owner. Do not silently forget original attempts.
- **Cross-process/restart recovery:** actual authority and Runtime/Orchestrator
  owners must qualify it; local cooperative tests cannot establish it.
- **Desktop/hostile plugins:** confirmed architecture targets, separate native
  and security profiles. Browser cooperation is not isolation.
- **Public release/managed Docs/product adoption:** existing owner routes apply;
  merging a private integration does not create those qualifications.

If C2 exposes a genuinely unresolved owner-level choice, record alternatives,
dependent steps and a discriminating experiment before dependent code.
Continue independent C1/C4/C5/C6 work within the authorized finite scope.

## Estimates and completion

Whole-programme estimate: P **650–1,650**, T **2,000–4,300** handwritten lines,
**8–16 engineer-days**, confidence **4/10**. Includes contract correction, selected
integration/reference, Host laws, independent native consumers and controls.
Excludes reused code, docs/generated/third-party bytes and deferred profiles.
Do not sum overlapping option estimates. C2 may reduce production code; useful
verified guarantees, not hours or line count, decide completion.

Done means implemented selected phases, independent review without unresolved
critical/material findings, meaningful rejecting controls, actual external
Node/Chromium evidence, required checks, one merged PR and verified actual main.
A plan, typecheck, two copies of one Host or unrelated green workflow is not done.
