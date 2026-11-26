# Installed feature contracts: dependent consumer plan

Date: 2026-11-26. Status: **proposal for coordination; plan only**.
This Draft proposes one bounded next authoring qualification. Implementation
starts after review of this scope and coordination with the other workstream.
Publishing or merging this document does not accept a production API or select
an LMU operation profile.

## Execution assignment, 2026-11-26

The owner has now authorized implementation, E2E, correction and merge of the
complete [workstream B](first-operation-implementation-plan.md#workstream-b-complete-module-updates-2026-11-26).
All B0–B7 work is delivered in **[PR #9](https://github.com/agent-teams-ai/live-module-updates/pull/9)**.
The original [PR #8](https://github.com/agent-teams-ai/live-module-updates/pull/8)
is incorporated here as B0, preserving its source and review history. Its
separate PR is superseded by the single workstream PR. The plan-only stopping
point and executor-choice questions below record
the original planning delivery; they no longer pause this authorized execution.
Its bounded code allowlist and acceptance cases still govern B0. The larger
owner plan separately governs invocation and full-operation changes; do not
interpret B0 exclusions as exclusions from the whole assigned programme.

## 1. Outcome and why this slice

An independently authored consumer entry can depend on a packaged feature's
canonical contract through its installed package root, extend ordinary GM
composition and perform a useful operation. The author does not edit the
provider's source, repeat its contract map or obtain dependencies from a service
locator. This makes the existing reference usable for a project that adds its
own feature to separately owned features.

The representative scenario is an application-owned **export summary**: invoke
the existing Export capability, return a summary of its published revision and
content, and preserve a rejected publication as rejection. The summary is plain
application data, not a durable receipt or an authorization token. No additional
storage, renderer, transport or generic command abstraction is needed.

This is a fixture-first extension of the authoring profile. It does not wait for
a first product or claim that all projects are blocked. Projects that need the
existing closed composition or a replacement Format provider can already follow
the maintained reference and [GM's adoption route](https://github.com/agent-teams-ai/get-modular/blob/f78f2bee84a7407b2a8b499418dd401a398028f0/docs/guides/consumer-quickstart.md). Production EF/LMU delivery
remains with the existing owning plans.

## 2. Inspected baseline and exact gap

Planning source: LMU `ea0d1b8e418524bc3578b28d348362727a36b31f`;
GM `a5f41853200aed26d692e89d768185013d629a12`;
Extension Foundation `a1b5007ae4777bb5b01adab35a9ee83546a62333`.
These are observations, not new dependency pins. Recheck live branches and PRs
before implementation; the [maintained reference](../../tests/qualification/portable-document/README.md)
and [qualification matrix](../research/foundation-qualification-matrix.md#complete-feature-contracts-and-storage-acquisition-2026-11-26)
own the prior results and exact execution receipts.

Publication base was refreshed to LMU
`a780597acd3fcae2936a2a258241f1da7ce62f94` after the navigation-only PR #7
merged during review. GM's current navigation and still-older copyable profile
were rechecked at `f78f2bee84a7407b2a8b499418dd401a398028f0`. No runtime change
from either navigation delivery is assumed to be new qualification.

Already delivered: Document/Format/Export, ordinary core plus optional GM
adapter, two private packed artifacts, external Format provider C, strict
installed consumers, independent Node/Chromium Hosts, controlled restart,
complete feature-map controls and early Browser storage acquisition. The
existing 44-test result belongs to that source and those claims.

The adapter's [package entry](../../tests/qualification/portable-document/adapter/src/index.ts)
exports composition, providers, aggregate capabilities and `FormatProvider`.
It does not export the canonical `Export` descriptor, `ExportContracts` or
`ExportCapabilities` from the [owning fragment](../../tests/qualification/portable-document/adapter/src/features/export/composition/export.contracts.ts).
The [M4 compiler cases](../../tests/qualification/portable-document/feature-contract-cases.ts)
correctly test copied source fragments against installed dependencies. They do
not prove that a new dependent feature obtains that complete surface from an
installed adapter. Provider C proves implementation substitution inside an
existing slot, which is a different authoring scenario.

Both fixture artifacts remain `private: true`. Here, **public root** means the
package's declared `exports["."]`, not npm availability or a released LMU SDK.

## 3. Coordination and file boundaries

The author of this Draft owns only the proposed dependent-consumer slice.
This is a coordination proposal, not an exclusive lock on repository files or
an assignment of other agents' work. Unpublished work is not visible in PR
discovery; compare this table with the other agent's plan before editing code.

| Workstream | Boundary for this Draft and its proposed continuation |
| --- | --- |
| This Draft | Add only `docs/plans/installed-feature-consumer-plan.md`; no existing-document, runtime, package or workflow edits |
| Navigation delivery [LMU PR #7](https://github.com/agent-teams-ai/live-module-updates/pull/7) | Owns its navigation plan, `AGENTS.md`, `docs/README.md` and companion GM/organization navigation work. Merged at `a780597acd3fcae2936a2a258241f1da7ce62f94`; its navigation scope remains outside this slice |
| Proposed implementation here | Minimal adapter root exports, one separately authored consumer entry, installed-package compiler/runtime proof and necessary existing-check integration |
| Invocation/lifecycle work | `consumer/invocation-owner.ts`, Host open/close/restart, public lifetime APIs and the full LMU operation are outside this slice; no ownership of another agent's unpublished implementation is inferred |
| GM-owned follow-up | The [copyable consumer profile](https://github.com/agent-teams-ai/get-modular/blob/f78f2bee84a7407b2a8b499418dd401a398028f0/docs/templates/consumer-module-profile.md) still lists an older package cohort. Its correction belongs in GM; current authoring navigation is already covered by PR #7's workstream. This Draft changes neither |
| EF-owned follow-up | Contribution compatibility productization and its EF-A/EF-C/EF-V decisions stay in the [EF delivery plan](https://github.com/agent-teams-ai/extension-foundation/blob/a1b5007ae4777bb5b01adab35a9ee83546a62333/docs/architecture/plugin-delivery-plan.md). No EF TEST helper is copied here |
| Tooling/governance | EF cohort selection in [organization PR #434](https://github.com/agent-teams-ai/.github/pull/434) and repository-retirement work remain independent; no pins, accepted standards or admission rules change here |

Proposed implementation allowlist, relative to
`tests/qualification/portable-document/`:

| Files | Permitted purpose |
| --- | --- |
| `adapter/src/index.ts` | Re-export the existing `Export` value and the `ExportContracts`/`ExportCapabilities` types; no new provider API |
| New `consumer/author-entry/**` | One ordinary consumer-owned use case/port, its outer GM contracts/declaration/module and a thin composition entry; use the existing FMS feature layout |
| New `installed-feature-cases.ts` | Installed-root positive, completeness, conflict and runtime qualification; keep the existing source-fragment M4 coverage |
| `pack-modular.ts`, `qualification.test.ts` | Reuse packing/install/evidence machinery; explicitly include and register the new consumer/checks |
| `source-profile.ts`, `architecture/foundation/source-dependencies.yaml`, `source-check.test.ts` | FMS/CMS census for the whole new consumer; dependency-policy coverage of its application layer; one meaningful rejecting control using installed tooling, as specified in P2 |
| `README.md` (fixture-local) | Explain the bounded new authoring path |
| Repository-root `docs/research/foundation-qualification-matrix.md` | Add exact evidence only after execution |

The packer, qualification registration and source-check configuration are shared
integration files. Agree their current SHA and sequence the small integration
patch with any other owner before editing them; this proposal does not reserve
them exclusively. Preserve the other workstream's changes rather than copying
or replacing its helpers. Root README and PR #7's navigation files stay outside
the allowlist.

`package-inventory.ts` changes only if emitted artifact files actually change;
root re-exports alone add no packaged files. Adjust an existing checker helper
only if its current behavior prevents the listed integration, and record the
reason in the diff. No new dependency, lockfile, package manifest, CI workflow or
provider implementation change is planned. A demonstrated need beyond these
boundaries returns to this plan instead of silently expanding implementation.

## 4. Smallest credible design

Recommend the minimum root surface **for this representative independent-entry
scenario**, subject to review. The strongest counterargument is that the adapter
could intentionally remain a closed composition. In that narrower product
scenario, extra exports are unnecessary and existing consumption remains valid.

| Option | Declared scope and tradeoff | Incremental P / T LOC; engineer-days | U / N / C |
| --- | --- | --- | --- |
| Retain the existing root | Closed composition and provider substitution only; no new independent-dependent-feature claim. Fails the new installed import/use experiment by design | 0 / 0; 0–0.5 for documentation | 6 / 9 / 1 |
| **Three canonical root exports + one consumer entry** | Selected proposal: prove exactly the Export-dependent case while retaining root-only packaging. Risk: declaration closure or the consumer's inherited map can be incomplete; installed compiler controls discriminate | 0 / 220–430; 1–3 | 9 / 8 / 3 |
| Export all three features' contract surfaces | Broader independent-authoring promise, with more combinations to document and qualify. Use only when independent Document/Format consumers require it; extra exports alone would not prove those cases | 0 / 400–650; 2–4 | 6 / 8 / 5 |

P is handwritten production/integration code; it remains zero because this is
TEST-owned qualification. T includes approximately 40–90 lines of consumer
reference behavior/composition and 180–340 lines of harness, compiler controls
and check integration for the recommended option. Documentation, generated,
vendored and platform/release work are excluded. Rows are alternatives, not
additive estimates. Days assume existing prerequisites and one experienced
engineer with focused review; estimate confidence is 6/10.

U = confidence in fitness, N = expected reliability for the row's stated scope,
C = implementation/maintenance complexity, each out of 10. These are planning
judgments, not measured probabilities or whole-platform readiness. No separate
contracts package is justified by a release/dependency boundary in this slice.

### Ownership rules for the proposed implementation

- The Export owner retains descriptor identity/revision and its complete
  transitive contract closure. Re-export that source; do not redeclare
  `fixture/export`, manually reconstruct its map or expose every private input.
- The consumer owns its semantic port, use case and result. Its application
  layer imports neither GM, the fixture adapter nor Node/DOM types. Its outer
  composition adapts the actual Export port and uses the canonical descriptor.
- The entry can expose its operation as a root instance without inventing an
  additional reusable capability. Its contract union still retains the imported
  complete `ExportContracts`; capability bases preserve conflict detection.
- GM remains the only graph constructor. Use `documentComposition(provider)`
  modules and inputs plus the new entry/group. Select **only the new entry as a
  root**, so Document/Format/Export are reached through its required dependency.
  No `extendComposition()` framework, resolver, registry or service-context bag.
- A one-shot TEST caller supplies borrowed state and the existing delivery port
  contract, awaits the original operation, then closes its public Resources
  scope. It adds no concurrent close/restart policy or new invocation owner.
  Resources is the accepted cleanup mechanism; withdrawn ADR-0028/K1 gates are
  not prerequisites for this work.

## 5. Phases and stopping points

Each phase has a reviewable output. An unresolved issue blocks its dependent
step only; it does not reopen confirmed Browser/Desktop/untrusted targets or
require a real application before representative qualification.

### P0 — coordinate and retain the existing evidence

Refresh main and open PRs; compare the actual changed paths with this allowlist
and PR #7. Record which continuation owns the consumer slice. If another agent
already supplies the same proof, review/reuse it and retire this duplicate
proposal. Keep the existing source/run receipts unchanged.

Exit: one owner for these edits, exact source baseline, explicit next unfinished
step. Neither P0 nor plan approval claims production adoption.

### P1 — specify and expose the minimum contract

Freeze one small observable operation before implementation. With borrowed
state `{ revision: 7, text: "MiXeD text" }` and the existing plain formatter,
the delivery witness expects `"Document r7\nMiXeD text"` at revision 7; the new
entry returns `{ status: "published", revision: 7, contentLength: 22 }`.
Here `contentLength` counts JavaScript string code units, not visual characters.
A denied receiver returns `{ status: "rejected", reason: "denied" }` with zero
deliveries. Other existing rejection reasons remain explicit; none becomes a
successful summary. This is one application projection, not a new receipt API.

Write the consumer import/use expectation and preserve its baseline failure:
the three requested owner exports are absent from the installed root. Check the
actual diagnostic; a missing installation, broken compiler or syntax error is
not evidence of this gap. Then re-export only those existing canonical symbols.
Preserve existing contract IDs/revisions, manifest/export topology and dependency
cohort. The consumer entry needs no separate package or published API.

Before broader harness work, strict-compile the intended
`assemblyFor<ConsumerCapabilities>().prepare(...)` call with the existing modules
and inputs, the new entry, and only that entry as root. If public APIs cannot
express it without `any`, double casts or new generic APIs, retain the minimal
reproduction and route the issue to the GM owner; do not invent an extension
framework. Exit: canonical imports and this composition typecheck against the
packed adapter. Baseline failure and corrected results retain distinct sources.

### P2 — compile the independent consumer from artifacts

Create a **second temporary consumer directory outside the existing build root**,
containing only the authored consumer sources and installed dependencies. Keep
the original `packModularConsumer()` root, including its `adapter/src`, for M4;
do not remove those sources or treat that root as the new clean installation.
Reuse the already built archives, their metadata and existing offline install
helpers; add no second packing pipeline. Install the same core/adapter archives
and exact GM cohort. Record actual compiler inputs. No adapter source
fragments, checkout aliases, symlinked source, declaration shims, copied contract
maps or success-path type assertions are available to this compiler.

Use the fixture's pinned strict TypeScript 7.0.2, including emitted declarations
and `skipLibCheck: false`; any future compiler upgrade follows its own cohort
review. Explicitly add all new maintained
consumer files to the applicable compiler project: recursive file copying is not
typecheck coverage. Preserve closed artifact inventories and one physical GM
identity.

Reuse the existing checker for FMS/CMS census of the whole `author-entry` tree.
Extend Foundation's dependency-policy `governedRoots` only to that entry's
application subtree, with no allowed external packages, built-ins or runtime
references. The ordinary port/result is consumer-owned; outer composition adapts
the actual Export result. Keep all existing core/adapter policy coverage intact.
Update the source-check fixture copier and expected module census, and make the
new rejecting control target this consumer's application boundary.

The current fixture manifest has no adapter dependency, and the pinned
[Foundation 3 resolver](https://github.com/agent-teams-ai/engineering-foundation/blob/23b5a885ba46a2b43b5715ce82db28fcf04f2175/packages/engineering-foundation/src/capabilities/source-dependencies/adapters/outbound/node/node-source-dependency-resolver.ts)
treats `file:` external declarations as undeclared. Therefore this plan does
**not** claim full Foundation dependency-policy coverage of the new outer
composition. Its real installed manifest, closed dependency inventory, strict
compiler, public exports and runtime checks own that separate proof. No synthetic
manifest, blanket exception or new scanner is used to turn it into a different
claim. A broader production tooling profile remains a separate adoption task.

Exit: independent installed-root compilation succeeds; complete union/interface
parity and the rejecting cases below distinguish the intended behavior.

### P3 — execute one useful static composition

Prepare/run through actual published GM APIs with the new entry as the sole
root. Supply test-owned state and a delivery receiver using the existing narrow
port. Assert the expected summary and delivered content/revision from handwritten
test values, not from declaration metadata or the returned summary itself.
Exercise receiver denial and preserve its typed rejection with no claimed
publication. Await the real operation before closing the Resources scope;
verify its close report and the independently observed delivery lease count.

Exit: success and rejection are observed through the assembled dependency; a
missing Export provider fails preparation before factories or effects. A local
call to an already extracted aggregate root is not this proof.

### P4 — qualify, review and deliver the bounded result

Run the affected strict/compiler/source cases and the existing
`pnpm check` / `pnpm qualify` route under the fixture's pinned environment.
Use the existing native workflow for its normal Node/Chromium regression; do not
add another browser harness. The **new** independent-entry execution claim is
trusted static Node only. Existing Browser cases remain regression evidence,
not proof that the new entry ran in a browser.

Review ownership/FMS, package consumption and independent test oracles; correct
blocking findings and re-review material corrections. Add actual source,
artifact/integrity, compiler, run and result identities to the owning evidence
route only after execution, retaining failures. Reuse one bounded implementation
PR when that work is authorized; reconcile exact head/base and applicable checks
before its eventual ordinary merge. This current Draft stops at the reviewed
plan and remains Draft for coordination.

## 6. Discriminating acceptance cases

| Case | Required observation |
| --- | --- |
| Installed public import | Canonical runtime descriptor and both type surfaces resolve from the installed root; emitted declarations need no checkout source |
| Complete feature closure | Both `ExportContracts` and `ExportCapabilities` retain independent expected keys, value shapes and revision tokens, including transitive Document state; an aggregate map cannot substitute |
| Independent conflict | An otherwise valid consumer-local descriptor conflicts with the unused transitive state ID, once by value and once by revision; separate inherited bases produce the intended conflict diagnostic. A matching overlap passes |
| Detector sensitivity | The existing M4 omission/collapsed-base cases remain. The new installed proof must fail when a required root export is removed; distinguish that failure from an intended contract conflict |
| Export boundary | First verify the internal emitted file's presence and bytes against the artifact inventory; importing it through a non-exported package subpath must give Node `ERR_PACKAGE_PATH_NOT_EXPORTED`. A generic TypeScript resolution failure alone is insufficient |
| Real dependency | Sole-entry-root composition invokes the real Export via its required slot; removing the Export group fails GM preparation before acquisition/effect and the paired positive case really executes |
| Useful result and refusal | Independent expected summary/content/revision matches success; receiver denial stays rejection and produces no delivery effect |
| Boundary and cleanup | Installed Foundation/FMS checks reject a forbidden GM import in consumer application code; the one-shot run observes completed Resources close and no owned delivery lease |

Do not repeat all lifecycle, format-provider, storage-denial or mutation
campaigns. Reuse the existing evidence where it addresses the same obligation.
Compiler negative cases must have the expected diagnostics and successful paired
controls; any unrelated resolution/syntax/process error fails the test itself.

## 7. Explicit exclusions and remaining questions

Excluded: production EF/LMU materialization or publication; plugin SPI/trust,
artifact loading and isolation; private kernel use; finite invocation API;
concurrent update/rollback/recovery; Host lifecycle changes; Desktop execution;
untrusted code; UI renderer/headless-library selection; product migration/pins;
new tooling/admission governance. Their existing owners and plans remain intact.

Two coordination questions remain for review:

1. **Who implements this slice?** This Draft's continuation, or the other agent
   if their planned work already contains the same installed dependent consumer.
   Reuse a single implementation; no parallel copies. This does not block review
   and publication of this plan.
2. **Which authoring promise is needed next?** Recommend the bounded
   independent Export consumer above. If the intended next projects need only
   the closed composition/provider substitution, defer this extension and use
   the already qualified route. This is a scope choice, not a first-product gate.

Broader package/API decisions stay in their owning plans rather than becoming
new questions here. A technical failure in the proposed compiler/composition
experiment should lead to a small documented correction or a discriminating
experiment, not an implicit expansion into the full LMU runtime.

## 8. Review and plan-delivery record

Independent scope critique preceded this text. Round 1 reviewers:
`gm_enablement`, `lmu_enablement` and `plugin_enablement` read the actual plan.
Corrections: preserve the M4 build root and use a second artifact-only consumer;
limit the source-policy claim to its feasible scope; fix the operation's literal
oracle and typed-composition discriminator; clarify shared-file ownership and
README paths. The Foundation limitation was independently checked against its
release source. In round 2 all three reviewers re-read the corrected complete
plan and returned GO for plan-only Draft publication, with no remaining critical
or medium findings. The author then refreshed the navigation delivery metadata
against actual main without changing the reviewed implementation scope.
Exact plan-diff/link checks and remote Draft receipts belong in the PR body.
Current deliverable: this plan alone; production and test code changes: zero.

