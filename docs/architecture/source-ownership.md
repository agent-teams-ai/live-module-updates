# Production source ownership and quality gates

The [single FMS profile](../../architecture/feature-module-profile.json) maps
immutable FMS v1.1 to the production LMU library. Its adoption decision is
[ADR-0002](../decisions/0002-production-source-adoption.md); its current tooling
successor is [ADR-0004](../decisions/0004-current-tooling-adoption.md). The
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
| Feature testing | Portable authority laws and independent observations; application contracts only, with no runner or native dependency |
| Curated module entries | Export the supported ordinary root, optional resource integration and test-only contract suite separately |
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

The optional `live-module-updates/testing` export owns the runner-neutral Host
authority cases. Its implementation belongs to the actual feature testing role,
not module-level runtime behavior. The curated entry exposes the factory,
fixture/case types and named violation; private law/oracle helpers remain behind
package exports. The FMS profile marks these two authored feature files as both
publicly available and testing surfaces so the curated package entry can expose
them. The role remains testing. Foundation independently marks both boundaries
as development-only and forbids their import from the ordinary runtime or
application; real rejecting controls exercise both directions. This is an
optional test kit for consumers, not a required application dependency.

Add a feature only for another cohesive capability. Add a layer only with a real
artifact. Update the profile, dependency policy, strict compiler scope and
rejection controls together. A new module or ownership exception needs a
repository decision before its profile and gates change. Sub-features and
composition contracts are absent from this initial profile; adopting either
also adopts its v1.1 evidence obligations.

The separate [composed reference](../../tests/qualification/composed-document/README.md)
materializes an application-owned GM boundary without changing the ordinary
library's profile. Its `document-runtime` feature owns the concrete invocation
contract and composition; it reuses the existing `export-summary` feature and
packed Document/Format/Export implementations. GM constructs this selectable
closure and the actual runtime owner. Fixed private operation helpers remain
ordinary imports. Full feature maps, one-capability declarations and explicit
composition-contract surfaces belong to that reference's adopted CMS/FMS scope.

The [source dependency policy](../../architecture/foundation/source-dependencies.yaml)
owns inward import directions and exact allowed packages. The
[suppression policy](../../architecture/foundation/suppression-governance.yaml)
starts with no waivers. The
[source coverage policy](../../architecture/foundation/source-coverage.yaml)
binds those files to the generated neutral topology, Stack type-aware lint preset
and mandatory native script routes. The [Stack configuration](../../toolchain.config.json)
owns the four actual compiler projects. The [public FMS projection helper](../../scripts/check-quality-topology.ts)
checks exact FMS/coverage input bytes and the complete committed topology.
Foundation's typed production check and the strict tools/test compilers have
different scopes; the former is not described as typed lint of every tool/test. `tsconfig.portable.json` additionally compiles
the actual application/composition implementation with ES libraries only and no
Node or DOM globals, including the testing entry and its implementation.
The complete compiler also covers the optional Resources
adapter and its native declaration requirements.

## Complete native route

`pnpm check:fast` executes the compiler cohort check, actual FMS graph/census,
topology freshness, Foundation coverage scope and all root strict compiler
projects through public Stack compile. `pnpm check`
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
replace operation tests or semantic review. The [v5 migration controls](../../scripts/check-quality-topology.test.ts)
exercise the actual installed Foundation against stale inputs, omitted source
and compiler coverage, protected severity and same-file valid/defective/restored
typed-lint input. Native setup failure cannot satisfy an intended rule oracle.

`tests/qualification/portable-document` retains its separate exact dependency
and compiler project. Its checks remain required for that authoring reference.
The preliminary L1 invocation implementation and workflow are retired after the
complete production package passed both targets; the retained
[navigation note](../../tests/qualification/update-operation/invocation-profile.md)
links immutable source and results. Root source coverage does not pretend that
root resolution can compile isolated installed consumers; their actual separate
compilations remain mandatory. Historical research and sealed archives retain
their original identities.

`tests/qualification/composed-document` has an explicit root-native staging
route in [composed-fixture.ts](../../tests/module/composed-fixture.ts), using the
root's pinned compiler and an exact source inventory. Borrowed core, adapter
and Summary files are copied unchanged into isolated ordered builds; their
original child compiler graph is not reused or modified. A second clean
installation compiles only authored consumer sources and installed declarations.
Actual `--listFiles` output establishes both compiler scopes.

The [staged source gate](../../scripts/check-composed-source.ts) uses actual
Foundation graph/dependency checks, FMS and GM Conformance layout checks. New
maintained reference source also runs the pinned stock typed/maintainability
rules and scoped CMS limits; native Host test infrastructure runs the stock
quality rules in its own staged project. Exact valid and invalid inputs verify
that the actual rules reject their named defects. The unchanged borrowed Summary
retains its accepted source profile; a new reference does not relabel historical
source as a new CMS adoption. The reference source gates precede its packing;
installed-consumer gates run after the second installation and before native
execution. Both are in the existing CI route, with no separate workflow or
runner framework. LMU itself is emitted and packed in the isolated staging
directory, so concurrent native consumers never read a shared `dist` while
this campaign rewrites it.

Full source conformance, same-source hosted checks, central registration,
managed Docs admission, remote enforcement and public release are separate
observations. The bootstrap decision records pending axes and the legitimate
next step for each; a passing local configuration inspector alone is
`configured_not_qualified`.
