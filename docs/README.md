# Documentation map

Status: maintained navigation for a research and planning repository. No public
LMU runtime, plugin SDK or product admission is established by this index.

## Choose a task

| Your task | Read in this order | Concrete outcome |
| --- | --- | --- |
| Qualify the foundation before applications exist | [Current status](status.md), [foundation guide](architecture/application-foundation.md), [qualification matrix](research/foundation-qualification-matrix.md) | Select representative behavior, independent test Hosts and evidence for the claimed profile |
| Adopt a qualified foundation in an application | Foundation guide, [delivery plan](plans/foundation-delivery-plan.md), the product's accepted profile | Preserve the product's own pins, integration and expansion gates |
| Reuse a module or plugin across applications | [Headless plugins and UI](architecture/headless-plugins-and-ui.md), the consumer's pinned Get Modular CMS, [owner choices](decisions/open-decisions.md) | Separate portable behavior, host capabilities, composition and optional rendering |
| Understand the long-term objective | [Continuous evolution vision](architecture/continuous-evolution-vision-2026-11-23.md), then the delivery plan | Preserve broad replaceability while choosing one bounded first delivery |
| Coordinate the two foundation implementation streams | [Executor assignments and project milestones](plans/foundation-delivery-plan.md#two-executor-assignment-2026-11-26), then each owning plan | A owns EF/artifact/adoption work; B owns the external consumer and complete LMU operation; shared edits and the final join have one owner |
| Design the update operation | [Operation](architecture/operation.md), owner choices, [evidence map](research/README.md) | Distinguish preparation, authoritative publication, useful adoption, old work and cleanup |
| Implement the first complete operation | [Step-by-step plan](plans/first-operation-implementation-plan.md), its selected profile packet, then the current unfinished step | Qualify dependencies, implement one operation and retain exact adverse/packed-consumer evidence; keep unresolved policies scoped |
| Write or qualify a modular feature | [Maintained example](../tests/qualification/portable-document/README.md), then the [original reviewed implementation plan](plans/module-authoring-implementation-plan.md) | Connect typed features, optional GM composition, explicit ownership and actual Node/browser evidence without inventing a public runtime |
| Check a claim or reproduce a finding | Evidence map, its dated report, then the original manifest and raw output | Identify the exact tested inputs and the claim that remains unproved |
| Review delivery and remaining disagreements | [Implementation-plan review](reviews/implementation-plans-2026-11-25.md), [fixture-first successor](reviews/fixture-first-foundation-2026-11-24.md), [earlier consolidation](reviews/foundation-consolidation-2026-11-24.md), owner choices | See current corrections and retained historical decisions |
| Prepare production onboarding | [Bootstrap](../BOOTSTRAP.md), actual repository admission guidance, the product's accepted profile | Establish real tooling and enforcement rather than copy a source repository's identity |

## Which document can decide what?

| Material | Authority and use |
| --- | --- |
| Accepted upstream ADR, published contract and consumer adoption profile | Own the applicable behavior and exact version; this repository cannot silently change them |
| Owner-confirmed strategic direction | Owns the goal and research scope; does not select every API, runtime policy or product dependency |
| Maintained foundation/headless guide and delivery plan | Proposed synthesis and ordered work; accepted source rules are linked rather than redefined |
| Operation proposal and open choices | Specify obligations to qualify and alternatives still awaiting a real scope/owner decision |
| Dated research report | Records inspected sources, executed probes and their limits at that date |
| Raw evidence, manifest and historical archive | Preserve original inputs/results, including failure; not a mutable implementation specification |
| PR/check snapshot | Delivery observation for an exact source; merging prose does not qualify runtime behavior |

The [status page](status.md) is the dated navigation snapshot. The underlying
owner records remain authoritative. Do not copy its observations into a second
live qualification ledger or turn a planning estimate into a readiness gate.

## Responsibility boundaries

- **Get Modular:** neutral composition semantics, public construction and scoped
  resource mechanisms, plus separately qualified optional candidates.
- **Extension Foundation:** extension artifact/trust/distribution and applicable
  host-protocol obligations. Its production package materialization is separate.
- **Live Module Updates:** the proposed complete reusable update operation over
  those existing mechanisms; no second resolver or cleanup manager.
- **Test Hosts, later products and executors:** the selected scope's semantic
  contract, grants, canonical state, active-head authority, execution and
  recovery. A test Host owns test state and proves no product adoption.
- **Engineering Foundation / FMS:** development-time rules and qualification
  machinery, never an application runtime dependency.

Use the [cross-repository review](architecture/cross-repository-review.md) for
source-pinned rationale. The [industry register](research/industry-patterns.md)
and [foundation strategy review](architecture/foundation-strategy-review-2026-11-23.md)
remain deeper explanations, not additional first-reading prerequisites.

## Keeping the map useful

Update the owning contract or decision first, then the affected current guide.
Add a dated successor note to a historical study only when direct readers could
mistake its old recommendation for the current one. Preserve sealed evidence.
New findings should identify the existing decision, gate or acceptance case they
change. Additional frameworks or diagrams alone do not justify another document.

For a claim of support, link the actual public artifact, selected consumer and
executed positive/negative evidence. If one is missing, name the gap. Current
navigation may use maintained owner paths; exact evidence uses immutable source
and run identities. Verify new cross-repository destinations before publishing
links to main, and retain a published proposal revision while a target is draft.
