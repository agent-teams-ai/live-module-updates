# Open implementation choices

Status: proposed alternatives; no production defaults selected. The existing
[EF owner decision](https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/open-decisions/OD-003-module-runtime-and-public-spi-choices.md)
and [Q1-Q7 matrix](https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/research/module-federation-update-boundaries-and-architecture-options-2026-11-22.md#owner-decision-matrix)
are the source of owner direction. This page is a standalone navigation and
discussion projection, not a second decision authority.

## Confirmed direction

- A reusable standalone library supplies the full update operation.
- Ordinary TypeScript is the first implementation/profile direction.
- Wasm/Extism and native Effect are optional, separately qualified profiles.
- Products retain business contracts, authority and canonical state.
- Existing composition, loading, resource and execution mechanisms are reused.
- Eligible built-in features and distributed plugins both belong in the vision.

On 2026-11-24 the owner requested parallel documentation/plan consolidation,
independent critique, correction and normal merge of ready related work. The
desired foundation includes reusable headless plugins, custom presentation and
optional declarative Headless UI. These are direction and documentation scope;
no public UI vocabulary, runtime defaults or production implementation is
selected by this request. Read the [headless proposal](../architecture/headless-plugins-and-ui.md)
and [delivery plan](../plans/foundation-delivery-plan.md).

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

The smallest coherent candidate to evaluate is one trusted TypeScript feature
with explicit host-owned state and a real limited update boundary. That is a
conditional scope recommendation, not a selection of Q1-Q7. If the first real
consumer needs isolation, native Effect or durable restart recovery, its profile
must include those requirements instead of borrowing weaker evidence.

## Technical delivery questions

1. Which real application feature will prove the first complete operation?
   An existing accepted Agent Runtime provider journey is not automatically
   the same acceptance target.
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

### D1 — first actual consumer and useful outcome

| Option | Benefit | Cost / prerequisite |
| --- | --- | --- |
| Existing Sandbox Manifest capability and its real product owner | Concrete existing seam and an accepted bounded static foundation gate | Verify exact owner/scope and actual behavior; does not automatically select the first LMU operation |
| Another waiting greenfield product nominates one useful capability | Aligns work with the most urgent actual application | Its owner must supply contracts, admitted scope, state/lifetime and an independent acceptance oracle |
| Continue only isolated research while product selection remains open | Can falsify a specific substrate risk without production changes | Cannot close real product adoption or demonstrate cross-Host reuse |

Recommendation: prefer a real existing narrow seam whose owner can supply useful
acceptance now; Sandbox Manifest is the current concrete candidate. The owner
should choose between actual product needs, not between equivalent toy fixtures.
The second independent Host is selected for the portability claim, not imposed
as a prerequisite to every first static feature.

### D2 — first execution and trust profile

| Option | Benefit | Cost / rejecting condition |
| --- | --- | --- |
| Trusted cooperative TS in one supported Node process | Closest to the existing public package evidence and smallest initial delivery | Cannot advertise hostile-code isolation or forced physical stop |
| A real browser/desktop consumer first | Addresses the application's actual UI/runtime constraints early | Needs actual packed browser/runtime qualification; Node observations do not substitute |
| Isolated untrusted execution first | Addresses a real third-party execution requirement | Actual sandbox, capability enforcement, protocol and physical-stop/recovery evidence become prerequisites |

Recommendation: use the simplest profile that satisfies the chosen real
consumer's trust and placement requirement. Do not downgrade a requirement to
fit available evidence. This elaborates Q1 and does not resolve it for all
products. Third-party provenance alone does not determine admitted trust.

### D3 — initial optional Headless UI scope

| Option | Benefit | Cost / rejecting condition |
| --- | --- | --- |
| Host renders the headless capability with its own UI | Fastest behavior reuse; products retain their chosen interaction design | No claim of portable UI declarations |
| A small semantic contribution through a compatible existing/product-owned contract | Demonstrates the owner's desired declaration capability with native Host controls | Needs supported-vocabulary negotiation, current action authority, accessible behavior and explicit fallback/refusal |
| A separately delivered custom UI contribution | Supports specialized interactions beyond Host vocabulary | Stronger framework/trust/asset/lifetime coupling; separate profile and qualification |

Recommendation: retain Host-native rendering as available and compare the
smallest semantic declaration needed by the first real interaction. Do not
select a universal DSL, vendor library or renderer based on the term Headless
UI alone. Two actual presentations qualify that UI promise separately from
two headless backend integrations.

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
