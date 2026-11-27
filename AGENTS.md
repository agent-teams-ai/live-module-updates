# Agent navigation

Read [README](README.md) and the [task-oriented documentation map](docs/README.md)
first. For application foundation and reusable plugins, read the
[application guide](docs/architecture/application-foundation.md),
[headless/UI proposal](docs/architecture/headless-plugins-and-ui.md) and
[delivery plan](docs/plans/foundation-delivery-plan.md). Read the
[operation proposal](docs/architecture/operation.md) and
[open decisions](docs/decisions/open-decisions.md) before changing dynamic scope.
For implementation, follow the [phase/step plan](docs/plans/first-operation-implementation-plan.md),
the selected profile packet and exact unfinished step. An unresolved decision
blocks its dependent contract only; continue independent work within the assigned
scope and retain the question with alternatives. Do not infer production defaults
from a merged plan.
The selected cooperative implementation follows
[ADR-0001](docs/decisions/0001-cooperative-update-profile.md). Production source
uses the [one FMS profile](architecture/feature-module-profile.json) and
[native quality adoption](docs/decisions/0002-production-source-adoption.md).
Read [source ownership](docs/architecture/source-ownership.md) before changing
its public surface and [usage contracts](docs/architecture/cooperative-operation-usage.md)
before changing invocation or Host obligations. The root package is private; source implementation, native
qualification, managed admission and public npm release remain separate.
The successor [Programme C](docs/plans/composed-module-adoption-plan.md) owns
current GM composition/adoption after completed B0–B7. Follow its phase and
lifetime/abstraction discriminator before adding public APIs. Executor A retains
EF and upstream GM mechanisms.

For writing or qualifying a modular feature, start with the
[maintained authoring reference](tests/qualification/portable-document/README.md)
for source, commands and scoped evidence. It covers private TEST packages,
independent Node/Chromium Hosts and controlled restart. The consumer's accepted
CMS/FMS and local adoption profile remain authoritative.

The owner's 2026-11-24 clarification requires representative fixtures and
independent test Hosts before dependent products. A first application is not
an entry gate. Browser, Desktop and untrusted third-party execution constrain
the architecture now; qualify their actual profiles separately. Read the
[qualification matrix](docs/research/foundation-qualification-matrix.md) and
[successor review](docs/reviews/fixture-first-foundation-2026-11-24.md).
Reuse appropriate existing headless/widget libraries behind UI adapters; do not
create a universal renderer or let framework types enter the portable core.

For foundation qualification and later product adoption, read the
[greenfield scope and continuous evolution vision](docs/architecture/continuous-evolution-vision-2026-11-23.md)
and the organization [product-scope clarification PR](https://github.com/agent-teams-ai/.github/pull/416).
The old `777genius/agent-teams-ai` is a reference only for this work. Do not
propose its refactoring or qualification as the new product. Prefer the
actual greenfield owner. The proposed GM-first reference path does not
authorize public kernel use or any product pin change.

Follow the organization
[Engineering Quality Standard](https://github.com/agent-teams-ai/.github/blob/main/docs/engineering-quality-standard.md),
including its
[TypeScript rule](https://github.com/agent-teams-ai/.github/blob/main/docs/engineering-quality-standard.md#typescript-for-javascript-runtimes),
and the [new repository bootstrap](https://github.com/agent-teams-ai/.github/blob/main/docs/repository-admission.md#new-repository-bootstrap)
route. Current links are navigation, not authority to change immutable source
pins or accepted consumer contracts. The first production implementation must
adopt the applicable full FMS profile and real native gates.

Keep one owner of graph semantics, publication authority, resource lifetime,
invocation custody and business state. The library supplies the complete reusable
operation; consumers provide narrow authority/state primitives. External projects
must not acquire organization-specific runtime dependencies.

Source observations, proposed transfers, executed fixtures, public package
availability and production qualification are distinct. Preserve failures,
exact dependency/input identities and independent test oracles. Review public
mechanism availability before implementing an adapter. Q1-Q7 remain profile
choices until their owner selects the relevant guarantee.
Their unresolved production policies do not block static fixture qualification;
the confirmed Browser/Desktop/untrusted targets must not be reopened.

Keep two meaningful profiles of one consumer distinct from two independent Host
integrations and from the public plugin-SPI conformance gate. Headless behavior
and optional declarative UI do not imply a universal renderer, supported browser
runtime or security isolation. Do not turn a recommended first-profile option
into an accepted default. Record unresolved owner choices with alternatives and
technical uncertainties with a discriminating experiment.

For foundation consolidation, use independent plan/content critique and review
material corrections; retain scoped findings in the
[review record](docs/reviews/foundation-consolidation-2026-11-24.md).
Link accepted rules instead of copying a second mutable CMS/FMS or status ledger.
Keep dated research and sealed evidence accessible through the research index.

Use strict TypeScript 7.0.2 or newer for maintained JavaScript-runtime code,
including fixtures and runners; inspect initialized embedded compiler versions.
Do not add declaration shims or weaken checks to hide an integration gap.
Preserve exact historical archives rather than rerunning them under new names.

This repository has no installed managed Docs authoring route.
[BOOTSTRAP](BOOTSTRAP.md) records the official transition. Do not copy another
repository's managed projection or claim that an unqualified tool cohort is
admitted. Follow the current repository-owned route after actual onboarding.

Commit useful findings and immediately push each commit through the authorized
repository route. Do not create unpushable local history while the destination
is unavailable; preserve reviewable checkpoints in the existing research branch.
