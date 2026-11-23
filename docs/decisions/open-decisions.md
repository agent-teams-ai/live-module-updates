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
