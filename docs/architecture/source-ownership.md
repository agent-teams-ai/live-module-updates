# Production source ownership and quality gates

The [single FMS profile](../../architecture/feature-module-profile.json) maps
immutable FMS v1.1 to the production LMU library. Its adoption decision is
[ADR-0002](../decisions/0002-production-source-adoption.md). The
[cooperative profile](../decisions/0001-cooperative-update-profile.md) owns the
qualified operation's semantic limits.

## One library and one operation feature

`src/features/update-operation` owns the reusable update operation. Application
code coordinates invocation custody, preparation, conditional publication,
original-attempt reconciliation and retirement through narrow ordinary ports.
Semantic identities and invariant functions belong to this feature's domain
role when those actual artifacts exist. Adapters implement concrete external
ports; composition binds exact typed dependencies. No role directory exists
merely to complete a folder template.

| Source area | Responsibility and permitted dependencies |
| --- | --- |
| Feature application | Portable operation and consumer-owned ports; no platform, GM, EF or organization runtime imports |
| Feature domain, when materialized | Deterministic identities, outcomes and invariants from explicit facts |
| Feature adapters | Narrow external bindings, including the optional public Resources cleanup mechanism; depend inward on application ports |
| Feature composition | Bind actual ports and expose the feature's factory without a global container |
| Curated module entries | Export the deliberately supported surfaces; ordinary root and optional resource integration remain separate |
| `tests/features/update-operation` | Invocation, update, failure and adapter contracts owned by this feature |
| `tests/module` | Public exports, declarations, packed external consumers and independently wired native Hosts |
| `scripts` | Development-only source/quality checks and their focused rejection controls |

The Host owns canonical head, state, grants and immutable attempt lookup. GM
owns graph construction where selected; LMU does not add a second resolver.
Resources owns physical cleanup; LMU retains its original completion and debt.
The library coordinates the complete operation instead of making each Host
reimplement the update state machine. A compatible retained generation keeps
coherent computation, while each effect receiver still checks current authority.

## Curated boundaries and growth

The ordinary package root exports no dependency on GM or Agent Teams runtime
packages. Its external consumer must install, compile and run without those
packages. A concrete Resources adapter is exposed only from its separately
declared optional entry; its peer installation and declaration closure have
their own installed consumer proof. No code deep-imports a private lifecycle
kernel or checkout source. Published artifacts exclude source tests and
development tooling.

Add a feature only for another cohesive capability. Add a layer only with a real
artifact. Update the profile, dependency policy, strict compiler scope and
rejection controls together. A new module or ownership exception needs a
repository decision before its profile and gates change. Sub-features and
composition contracts are absent from this initial profile; adopting either
also adopts its v1.1 evidence obligations.

The [source dependency policy](../../architecture/foundation/source-dependencies.yaml)
owns inward import directions and exact allowed packages. The
[suppression policy](../../architecture/foundation/suppression-governance.yaml)
starts with no waivers. The
[source coverage policy](../../architecture/foundation/source-coverage.yaml)
binds those files to the real compiler projects, Stack type-aware lint preset
and mandatory native script routes. `tsconfig.portable.json` additionally compiles
the actual application/composition implementation with ES libraries only and no
Node or DOM globals; the complete compiler also covers the optional Resources
adapter and its native declaration requirements.

## Complete native route

`pnpm check:fast` executes the compiler cohort check, actual FMS graph/census,
Foundation coverage scope and all root strict compiler projects. `pnpm check`
also runs typed lint, the distributable build, native tests, complete Foundation
policy checks and its development-only/registry assertions. The
[CI workflow](../../.github/workflows/ci.yml) installs the exact native Chromium
before executing the complete route on the PR head. There is no path-filtered
or draft-only success shortcut.

The [FMS checker](../../scripts/check-feature-module.ts) delegates parsing and
source resolution to Foundation and architecture rules to FMS. Its local file
census rejects source symlinks, unowned source formats, outside-feature files
and empty directories. The [controls](../../scripts/check-feature-module.test.ts)
exercise real filesystem inputs and exact rejecting rule families; they do not
replace operation tests or semantic review.

`tests/qualification/portable-document` and the bounded preproduction L1
experiment have separate exact dependency/compiler projects. Their independent
checks remain required evidence for their claims. Root source coverage excludes
them from production classification and does not pretend that root resolution
can compile the installed fixture consumers. Historical research and sealed
archives retain their original identities.

Full source conformance, same-source hosted checks, central registration,
managed Docs admission, remote enforcement and public release are separate
observations. The bootstrap decision records pending axes and the legitimate
next step for each; a passing local configuration inspector alone is
`configured_not_qualified`.
