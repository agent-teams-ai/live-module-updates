# ADR-0002: adopt the production source and native quality profile

Status: adopted with the first substantive workstream B library implementation.
This record and its gates are delivered with that implementation, not as an
empty production package. Package publication remains a separate decision.

## Decision and source ownership

The owner authorized the complete LMU workstream B in one PR. Adopt full
immutable [FMS v1.1](https://github.com/agent-teams-ai/.github/blob/89b5d7c512d9c4b5ae63709857a0d71cb2e6d178/docs/architecture/feature-module-standard/v1.1.md)
for one portable platform library and one substantive `update-operation`
feature. The [local profile](../../architecture/feature-module-profile.json)
owns the exact source, test, role and enforcement mapping. The
[source ownership document](../architecture/source-ownership.md) explains its
boundaries. No extra package, application executable, shared kernel, module-level
behavior exception, sub-feature or composition contract is introduced.

Materialize a role only when it contains actual owned code. The feature owns
the invocation and update operation, preparation custody and recovery policy.
Host adapters own canonical state and publication authority; the accepted
Resources mechanism owns physical cleanup. A thin curated module entry exposes
the supported ordinary API. An optional Resources adapter has a separate entry
when its concrete implementation is present. The ordinary entry imports no GM
or organization runtime types and requires no organization credentials.

## The actual compatible development graph

The initial exact graph is Foundation **3.0.0**, FMS tooling **0.3.0**, Stack
Toolchain **0.1.1**, TypeScript **7.0.2**, Oxlint **1.83.0** and its TypeScript
checker **7.0.2001**, with Node **24.22.3** and pnpm **11.25.0**. These are root
development dependencies and native gate tools. The frozen lockfile binds their
actual closure. A native gate checks the initialized root, Foundation and Stack
compiler versions; source compilation and typed lint execute separately.

This selection follows an observed incompatibility rather than an assumed
latest-version benefit. Inspection of the released Foundation 4.0.2
`features/quality-coverage/adapters/configuration.js` found that it accepts only
quality coverage schema 5. Its package exports no old preset facades. Schema 5
uses `topologyPath` and `toolchainConfigPath` and rejects legacy profile fields.
The [accepted central bootstrap inspector](https://github.com/agent-teams-ai/.github/blob/89b5d7c512d9c4b5ae63709857a0d71cb2e6d178/scripts/check-repository-admission.ts)
still requires `featureProfilePath` and `compilerProjects`, and accepts the
exact Stack 0.1.1 preset. Foundation 3.0.0 supports the real schema 3 contract
and the same TypeScript floor. Its installed package and embedded compiler
already execute in the separately qualified portable-document fixture.

Foundation 4.0.2 was a temporary inspection dependency, never an adopted root
profile. This decision establishes the first compatible root graph. It does
not downgrade an accepted quality profile, add unsupported fields, modify the
central inspector, substitute schemas or disable a gate. A future move to
Foundation 4 requires the owning central bootstrap compatibility transition and
an explicit local profile migration with actual native evidence.

## Enforcement and bounded evidence

`pnpm check` reaches the actual FMS graph check, coverage scope check, strict
production/tooling/test compilers, typed lint, production build, native tests,
complete Foundation check, `assert-dev-only` and `assert-registry`.
Unconditional pull-request CI runs that route on the actual requested source.
The real packed-consumer Node/Chromium qualification joins that same route
with the substantive complete operation; historical static browser results do
not establish its execution.

The FMS checker uses the published Foundation source graph and FMS kernel. A
small independent file census closes the kernel's documented empty-directory
gap and enforces this repository's module ownership. It adds no parser,
dependency resolver or generic quality framework. Positive and rejecting
controls cover a real platform feature, outside-feature behavior, deep imports,
undeclared dependencies/modules and empty layers. The actual Foundation policy
also rejects a foreign runtime package imported by application code.

Strict root compiler projects cover production, root tools and feature/module
tests. The existing maintained qualification families retain their own exact
compiler projects and native workflows; their package scopes and source aliases
are not implicitly compiled by the root project. Dated sealed research remains
historical evidence. New maintained source needs an explicit owning project and
gate in the same change.

## Separate onboarding axes

The [central admission caller](../../.github/workflows/repository-admission.yml)
pins the reviewed defining source at `89b5d7c512d9c4b5ae63709857a0d71cb2e6d178`.
The identity caller uses the specifically accepted alias-aware implementation
`77a0f46cbfc7688cbabbe12ee819e50ba6f64234`. Their installation is configuration;
bootstrap cannot protect the PR introducing its own caller. Required-check and
identity enforcement require independent live observation and the owning
administration route.

LMU's central registration and managed Docs admission remain separately pending.
At the inspected central source, stable33 is qualified only for its declared EF
canary; LMU cannot select that graph before its eligible recommendation. Do not
copy another consumer's managed projection, select an old Docs graph merely to
make a check green, or claim a Docs exemption. This native source adoption does
not manufacture positive registration, executable-specification qualification,
Docs admission, package publication or production deployment evidence.

Revisit this decision when the central bootstrap contract evolves, an eligible
Docs graph can be reconciled, a new production module/role is justified, or a
real product requires a stronger execution profile than ADR-0001.
