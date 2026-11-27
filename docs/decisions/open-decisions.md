# Open implementation choices

Status: product alternatives remain open; the bounded workstream B fixture
profile is selected in [ADR-0001](0001-cooperative-update-profile.md).
No product-wide production defaults are selected. The existing
[EF owner decision](https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/open-decisions/OD-003-module-runtime-and-public-spi-choices.md)
and [Q1-Q7 matrix](https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/research/module-federation-update-boundaries-and-architecture-options-2026-11-22.md#owner-decision-matrix)
are the source of owner direction. This page is a standalone navigation and
discussion projection, not a second decision authority.

The [first-operation implementation plan](../plans/first-operation-implementation-plan.md)
maps these choices to exact dependent steps, compares three credible initial
profiles and records conditional P/I/T, effort and confidence estimates. Its
profile packet must be selected before dependent production transitions; merging
planning prose does not select Q1–Q7. Continue independent work within the
assigned scope while a question remains open; retain alternatives and rejecting
evidence through this navigation to the owning decision record.

## Confirmed direction

- A reusable standalone library supplies the full update operation.
- Ordinary TypeScript is the first implementation/profile direction.
- Wasm/Extism and native Effect are optional, separately qualified profiles.
- Products retain business contracts, authority and canonical state.
- Existing composition, loading, resource and execution mechanisms are reused.
- Eligible built-in features and distributed plugins both belong in the vision.
- Foundation qualification starts with representative fixtures and independent
  test Hosts; waiting products do not have to start first.
- Browser, Desktop and untrusted third-party execution are confirmed architecture
  targets. Their exact profiles, enforcement and support claims need evidence.
- Existing headless/widget libraries are reused behind appropriate UI adapters;
  no universal UI engine, renderer or vendor framework is selected.

On 2026-11-24 the owner requested parallel documentation/plan consolidation,
independent critique, correction and normal merge of ready related work. The
desired foundation includes reusable headless plugins, custom presentation and
optional declarative Headless UI. These are direction and documentation scope;
no public UI vocabulary, runtime defaults or production implementation is
selected by this request. Read the [headless proposal](../architecture/headless-plugins-and-ui.md)
and [delivery plan](../plans/foundation-delivery-plan.md).

The later fixture-first clarification supersedes the earlier recommendation to
select a real product before foundation testing. A purpose-built Host can own
its test authority/state and qualify a library profile. It cannot accept a
product's production gate or publish a stable SPI on that product's behalf.

## Strategic clarification, not Q1-Q7 selection

The owner clarified the long-term target of continuous evolution across the
whole greenfield system on 2026-11-23. A bounded first supported profile is
not a ceiling on future independent replacement. The legacy desktop is not
the default consumer. The [vision and technical dependency review](../architecture/continuous-evolution-vision-2026-11-23.md)
proposes GM-first integration and explicit measures to decide the long-term
bet. No production decision or accepted package pin changes here.

## Choices that determine the first supported guarantee

| Question | Main alternatives | Evidence that should decide it |
| --- | --- | --- |
| Q1: trust | Trusted cooperative code; isolated third-party execution | Actual plugin provenance, capability enforcement and required physical stop boundary |
| Q2: update unit and sharing | Isolated contribution; whole affected dependency cohort; coordinated shared realm | Contract identity, actual static/dynamic sharing and independent-loader observations |
| Q3: state continuity | Host-owned state with remount/reconstruction; selected compatible handoff; explicit migration | Real drafts/history/session schemas and incompatible-transition behavior |
| Q4: visible adoption | Next request; selected view boundary; coordinated set of views | User-visible useful action and acceptable transition latency/fallback |
| Q5: admitted work | Drain; retain old work while fencing selected writes; authorized interruption/restart | Actual long operations, streams, receiver authority and retention budget |
| Q6: returning to old code | Fresh compatible transition; compensating action; restricted code-only fallback | Current state schema, grants, external effects and retained artifacts |
| Q7: old clients | Bounded supported window; active sessions only; explicit offline support | Lazy assets, reconnect behavior, storage budgets and service policy |

One useful candidate is a trusted TypeScript operation with Host-owned state
and a bounded update boundary in a representative test Host. It establishes
only that profile. The confirmed Browser/Desktop/untrusted targets also need
their own discriminating work; a cooperative Node result cannot stand in for
isolation, physical stop or durable restart recovery. These are scoped choices,
not a renewed vote on whether the required targets belong in the architecture.

## Technical delivery questions

1. Which representative fixture contract and independent effect/work oracle
   will qualify the first complete operation? The existing portable-document
   fixture covers packaging and ordinary behavior, not an update operation.
2. Which qualified public mechanism supplies invocation admission and generation
   custody for that profile? Public Resources is cleanup; the private GM kernel
   cannot be silently imported or copied.
3. Do measured transition/inspection needs justify XState pure transitions over
   ordinary typed functions? Either choice must keep one set of rules and real
   native effect ownership; no technology is selected by this document.
4. What exact package, adapter and declaration boundary does an independent
   external consumer need? Decide it through the real packed consumer, not a
   package-per-diagram scaffolding exercise.

Keep proposed alternatives and their rejecting examples current. Once the owner
chooses a scope, record acceptance in its proper decision record and update the
current operation contract and qualification plan together.

## Decision packet for the first useful delivery

The following discussion options make the remaining choices concrete. They are
nonbinding recommendations for evaluation, not silent defaults. Select only
choices required by the actual first profile; record a justified inapplicable
case instead of selecting every future policy before static development.

### D1 — representative qualification family and useful outcome

| Option | Benefit | Cost / prerequisite |
| --- | --- | --- |
| Versioned document query/edit in independently wired test Hosts | Already bounded packaging/authority/revision/reset seam; later stream/update variants can add one missing discriminator at a time | Current slice does not cover GM composition, installation, streams or live updates |
| Execution-session fixture with a bounded stream and borrowed provider | Exposes long-lived work, cancellation and custody resembling Runtime needs | Must remain a representative contract, not an implementation of Runtime's domain or a second executor |
| Artifact/contribution admission fixture with independent schemas | Exposes distribution/trust/required-capability and installation-to-effect boundaries | Requires the applicable EF mechanisms and admission basis; mocked verification cannot qualify them |

Recommendation: finish delivery of the qualified portable-document slice, then
select the family that exposes the next missing guarantee. The
[matrix](../research/foundation-qualification-matrix.md) records those distinct
claims. These are incremental fixture scopes, not three competing universal
architectures or a requirement to implement a product. A new shared/public
contract still follows its owning decision process.

### D2 — exact profiles for the confirmed execution and trust targets

| Profile concern | Benefit | Cost / rejecting condition |
| --- | --- | --- |
| Trusted cooperative TS in an exact Node process and browser realm | Qualifies ordinary portable behavior while target-specific work proceeds | No hostile-code isolation or forced physical-stop claim |
| Selected Desktop shell with separate renderer and privileged receiver | Exercises actual placement, IPC, state and native-resource owners | Requires the real shell/OS, denied/malformed IPC and shutdown/recovery evidence |
| Selected isolated execution mechanism for untrusted code | Exercises a required hostile-code boundary and capability limits | Requires actual denied file/network/IPC access, resource limits and observed stop; process/Worker placement alone is insufficient |

All three target concerns are in scope; they are not exclusive alternatives.
Choose the exact shell/executor and profile guarantees through discriminating
spikes at their semantic owners. Keep the shared behavior contract narrow.
Third-party provenance alone does not determine admitted trust, and no profile
may borrow a weaker row's evidence for a stronger guarantee.

### D3 — initial optional Headless UI scope

| Option | Benefit | Cost / rejecting condition |
| --- | --- | --- |
| Host renders the headless capability with its own UI | Fastest behavior reuse; products retain their chosen interaction design | No claim of portable UI declarations |
| A small semantic contribution through a compatible existing/product-owned contract | Demonstrates the owner's desired declaration capability with native Host controls | Needs supported-vocabulary negotiation, current action authority, accessible behavior and explicit fallback/refusal |
| A separately delivered custom UI contribution | Supports specialized interactions beyond Host vocabulary | Stronger framework/trust/asset/lifetime coupling; separate profile and qualification |

Recommendation: retain Host-native rendering as available and compare the
smallest semantic declaration needed by the representative interaction. Do not
select a universal DSL, vendor library or renderer based on the term Headless
UI alone. Two actual presentations qualify that UI promise separately from
two headless backend integrations. Native controls can prove a simple fixture;
reuse established widget libraries where their mechanics are needed, keeping
framework and machine-service types behind the presentation adapter.

### Q1–Q7: how to resolve rather than silently assume

| Existing choice | Narrow candidate to evaluate | Evidence that can reject it |
| --- | --- | --- |
| Q1 trust | Explicitly admitted cooperative code, when sufficient for D2 | Consumer requires containment or actual forced stop |
| Q2 update unit/sharing | Smallest coherent capability cohort with explicit borrowed owners | Captured references, shared mutable state or runtime identity require a larger coordinated boundary |
| Q3 state continuity | Actual Host retains canonical state; reconstruct compatible implementation/view | Useful behavior requires non-reconstructible state or incompatible writers/migration |
| Q4 useful adoption | Observe the actual next useful request or selected UI boundary | Selected head/mount succeeds but user operation is unavailable or state is wrong |
| Q5 admitted work | Retain/drain already admitted work under bounded owner policy | Exclusive resources, revoked write authority, non-cooperative execution or unbounded retention |
| Q6 return to old code | Fresh authorized compatible transition against current state | Old code cannot read/write current schema or an effect requires compensation/fix-forward |
| Q7 old clients | An explicitly bounded supported compatibility/asset window | Actual offline or long-lived sessions require another contract and budget |

Do not present these candidates as owner decisions. Preserve the actual rejected
option and evidence when a profile chooses another policy. A timeout cannot
quietly switch Q5 to forced termination, and code rollback cannot imply reversal
of external effects under Q6.

## Technical questions that need evidence before an owner choice

- Which existing supported mechanism can provide atomic select-and-retain for
  the complete nested operation? Qualify actual Host primitives or the GM
  owner's candidate path; never copy a private kernel or add a second registry.
- Which concrete semantic UI protocol or product extension point can express
  the selected interaction? Compare existing mechanisms before proposing any
  new common schema or executable expression language.
- Which missing public fact or contract, if any, truly requires an upstream GM,
  EF or executor change? Keep that change with its semantic owner and a rejecting
  example, rather than weaken a consumer's accepted rule.
- Is a shared published API justified by independent consumers or the applicable
  materialization basis? Two Hosts sharing one core are not automatically two
  independent implementations for a stable plugin SPI.

These are engineering investigations; asking the owner to select an algorithm
without the comparison would not resolve them. The owner's priority, required
guarantees and supported product experience decide the scope. Unresolved public
contract or policy disputes stay open with alternatives and an explicit blocker
only for the affected claim.

## Native execution and observation follow-up, 2026-11-27

The owner requested a deeper audit so useful GM mechanisms are not forgotten.
The current [Programme D](../plans/tooling-and-module-reuse-plan.md)
selects documentation/audit option A alongside the tooling/CMS work.
Its [owning implementation packet](../plans/first-operation-implementation-plan.md#10-native-effect-and-observation-adoption-packet-2026-11-27)
records the three alternatives, estimates, responsibility, exact reuse points,
ordered next steps and ten native acceptance cases. B is a proposed bounded
Node Effect Host discriminator; C is a possible later public integration.
Neither is implemented or selected as a runtime profile by this record.

| Open item | Existing owner and decision trigger | Dependent claim |
| --- | --- | --- |
| Native Effect execution | LMU integration maintainer and concrete Host owner: a native provider needs Layer/Scope, caller context or typed native failures | An actual LMU/GM Effect profile; ordinary finite work remains qualified |
| Native finalizer failure and retry | Actual lifetime owner: establish an honest original-close, failure retention and recovery contract before adaptation | Any reusable native cleanup adapter; repeated Scope disposal is not Resources debt retry |
| Observable state | State owner and subscribing Host/module: a real latest-state consumer needs a read-only facet | Observation integration, subscriber ownership and its native cleanup evidence |
| Occurrences, streams and backpressure | Communication/workload owner: choose the actual delivery and settlement contract | Event/stream support; Observation coalescing is not an event log |
| Shared lifecycle bookkeeping | GM public-package owner and LMU maintainer: first public admission, then demonstrated semantic fit | Any future kernel reuse; the current private candidate cannot be imported or copied |

Read the existing
[GM Effect practices](https://github.com/agent-teams-ai/get-modular/blob/27dfb4ddf67cead198fee6e781ab355c37782928/packages/effect/docs/practices.md)
and [Observation contract](https://github.com/agent-teams-ai/get-modular/blob/27dfb4ddf67cead198fee6e781ab355c37782928/packages/observation/README.md)
through that packet rather than creating another usage standard. Exact peer
compatibility matters: the audited GM Effect package qualifies Effect 4.1.4;
a newer npm version does not silently migrate it. A concrete producer update
belongs to executor A/upstream GM, with LMU consuming the qualified result.

A disputed native failure/recovery choice blocks only the native dependent
contract. It does not reopen ADR-0001 or prevent the authorized tooling upgrade,
ordinary package checks and concrete CMS corrections. Record the first failing
native discriminator, alternatives and the required owner decision here before
a future agent freezes a new public surface.
