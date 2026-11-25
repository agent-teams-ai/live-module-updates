# Modular authoring foundation — implementation plan

Status: reviewed for scoped implementation, 2026-11-26. Three independent review
rounds completed before source implementation. This is the bounded F1/F2 authoring
delivery from the [foundation plan](foundation-delivery-plan.md), with an
EF-owned contribution-compatibility qualification. It does not replace the
[first-operation plan](first-operation-implementation-plan.md).

## 1. Outcome and exact scope

An author can follow one maintained reference to write useful modules with
consumer-owned ports, explicit composition, stable state ownership and honest
resource lifetime. The same packed behavior and optional GM adapter execute in
independently wired Node and Chromium Hosts. Changing the selected formatting
implementation requires changes at composition, not in document/export business
logic. Existing document behavior and rejecting controls remain supported.

The reference is maintained, runnable source with a short authoring route, not
a public LMU runtime or a new organizational standard. All new runtime code in
this delivery is TEST-owned reference/qualification code. Applications can reuse
the pattern and the existing public GM packages; production EF and LMU packages
retain their owning materialization/admission gates.

| Owner | Delivery | Boundary |
| --- | --- | --- |
| LMU | Extend `tests/qualification/portable-document`; keep its maintained README as the author entry; add actual GM composition, three useful features, source checks, packed Node/Chromium proof and controlled restart | No public coordinator or copied private lifecycle kernel |
| GM | Connect its maintained consumer quickstart/authoring route to the executed reference and precise adopted CMS contract | Preserve current public APIs, accepted ADRs and package versions |
| EF | Exact-revision, owner-defined contribution compatibility in its existing qualification path; connect it to EF-owned TEST preflight before candidate execution | No production package, public SPI, generic envelope copied into LMU or weakened E1 gate |

Excluded: npm publication, application implementation/migration, arbitrary hot
replacement, distributed/durable publication, streams, arbitrary state migration,
Desktop native qualification, hostile-code containment, a universal UI renderer,
new discovery/service registries, or organization-wide tooling/admission changes.
Browser/Desktop/untrusted execution remain architectural targets; only the
stated Node and Chromium trusted profiles are executed here.

## 2. Source basis and ownership

Initial source identities:

- LMU `6e0d5a9e61d76ff7eba7561aea89aa729ce32086`.
- GM `ae2418b186119c3c84736a6217a9ef25bbfe86cb`.
- EF `65e03edd10cc08194cc4031f857aae302d4b9020`.
- Organization guidance `755c8515a5d106402a7e9e2cff621fb1fdc855cf`.

Follow the existing [application foundation](../architecture/application-foundation.md),
[headless boundary](../architecture/headless-plugins-and-ui.md),
[continuous evolution vision](../architecture/continuous-evolution-vision-2026-11-23.md),
GM CMS and applicable FMS. Record the exact adopted CMS/FMS and tool cohort in
the fixture profile. Scoped fixture checks do not admit this entire research
repository to a production tooling profile. Preserve historical evidence bytes.

One owner remains responsible for each concern: feature owners define semantic
contracts; GM constructs the graph; actual factories/Hosts own their handles and
use Resources to record and execute registered cleanup; each Host
owns canonical state, final grant/revision checks and ingress/drain; EF owns
contribution compatibility. No second mutable standards or status ledger.

## 3. Decisions and alternatives

Estimates are incremental handwritten lines: R = reference/candidate runtime,
T = tests/Host/packaging/configuration; production runtime LOC remains zero.
Days are focused engineering estimates, not a promised schedule. Scores are
planning judgments (fitness/reliability/complexity, each out of 10), not measured
runtime reliability. Existing accepted owner decisions take precedence.

| Decision / option | R / T LOC; days | Fitness / reliability / complexity | Selection and reason |
| --- | --- | --- | --- |
| Extend existing LMU packed Node/browser reference | 300–550 / 700–1,250; 3–5 | 9 / 8 / 5 | Selected: existing independent Hosts, artifact oracle and browser runner already belong here |
| Build a new GM-centered browser reference | 350–600 / 1,000–1,600; 4–7 | 8 / 8 / 7 | Duplicates packing/browser infrastructure; GM retains semantic ownership through its CMS and linked guide |
| Keep separate examples and add only prose | 0 / 80–150; 1 | 4 / 4 / 2 | Does not prove the complete authoring path |
| Two artifacts: ordinary core + optional GM adapter | 100–180 / 150–250; 1–2 | 9 / 8 / 4 | Selected: demonstrated dependency/use boundary; ordinary consumer has no GM installed |
| One artifact with a GM subpath and optional peers | 80–160 / 200–350; 1–3 | 7 / 7 / 5 | Possible, but makes the zero-GM install/declaration closure less direct |
| Separate package per feature/layer | 150–250 / 300–500; 2–4 | 4 / 6 / 8 | No independent release/use evidence justifies those packages |
| Controlled restart: stop ingress, drain, close A, construct B | 40–80 / 100–180; 1–2 | 9 / 8 / 3 | Selected first profile: semantic ports and borrowed state survive; no universal live-operation contract is frozen |
| Fixed A/B overlap with atomic route selection and retained old calls | 80–140 / 250–450; 2–4 | 7 / 6 / 6 | Valuable future L1 discriminator; unnecessary for the initial restart guarantee |
| Public reusable live coordinator now | 600–1,100 / 700–1,500; 5–10 | 5 / 4 / 9 | Depends on unclosed L1/public mechanism and production bootstrap obligations |
| EF exact supported contract revision | 180–350 / 300–550; 2–3 | 9 / 8 / 4 | Selected only for the TEST profile: explicit and rejectable before execution |
| EF owner-defined compatibility relation | 300–550 / 450–800; 3–5 | 7 / 6 / 6 | Defer until an actual rolling-compatibility consumer requires it |
| EF negotiated version sets | 450–750 / 650–1,000; 4–7 | 5 / 5 / 8 | Introduces a new protocol without a present requirement |

Confidence: medium (6–7/10), to be updated after the public-artifact spike and
review. Rows are alternatives or overlapping work, not additive estimates.

### Selected restart semantics

The Host admits work only while its composition is open and reserves a reachable
operation owner before invoking effectful or reentrant code, then retains the
original returned asynchronous flight under that owner. Reentrant close must
not observe started work as unowned. The Host closes ingress before
requesting cooperative cancellation, and waits for actual settlement before
closing registered resources. Cancellation is not evidence of settlement.
Pending/failed cleanup remains observable through the existing resource owner.
A successor is constructed over the same borrowed canonical state only after
all admitted raw operations settle and the original Resources close reports
`settled: true` and `complete: true`. Pending cleanup leaves restart pending;
incomplete cleanup refuses restart while retaining its report and owner. There
is no retry of a failed cleanup hidden inside a new close call.
Old Host invocation facades, including extracted/saved methods, reject further
work; pure Format values and the
borrowed canonical state owner are deliberately not revoked. No generic proxy
or revocation membrane is added.

This profile may interrupt availability. It promises neither A/B overlap nor
atomic fleet publication. Format implementation A/B identities are distinct
from semantic contract revision. Selection, authority, state adapters and lifetime
stay at outer boundaries so future replacement work can be localized. Its final
live-operation contract remains separately owned and may require reviewed changes.

## 4. Authoring structure and contracts

Three feature-owned capability slices have substantive responsibilities, with
document, format and export GM entries in the optional composition adapter:

1. **Document:** existing query/edit use case and validation; borrows the Host's
   conditional state port. Canonical data and write receipts stay with the Host.
2. **Format:** pure formatting capability, with two independently selected
   implementations and a named semantic contract. Helpers remain plain functions.
3. **Export:** reads through a narrow document port, formats through a narrow
   format port, awaits actual outer delivery preparation and requests an export
   effect. The final receiver checks current grant and expected document revision.

Domain/application code imports neither GM nor platform/framework types. Each
consumer owns the ports it needs. Public capabilities expose own functions;
composition maps providers to ports explicitly. Type compatibility is not used
as a substitute for behavioral compatibility. No generic `execute(any)` or
service-context bag. Async and cancellation appear only at actual async work.

`@fixture/portable-document` remains a dependency-free ordinary library.
`@fixture/portable-document-gm` is a second private, packed adapter depending on
the exact core artifact and published Core/Assembly/Resources cohort. The two
packages reflect an actual optional dependency boundary, not package-per-layer.
All GM imports remain in the applicable outer composition roots. Flat features
are sufficient; this delivery claims no new nested-FMS qualification.

Source checks reuse installed Foundation/FMS/GM Conformance mechanisms, with
real positive and rejecting inputs. Do not substitute a handwritten import
regex, relax an existing gate or copy a resolver/cleanup manager. New type checks
must cover maintained TS, emitted declarations and actual installed public roots.

EF's generic exact-revision matcher remains under EF `tests/qualification`.
Trusted extension-point owners supply synchronous payload validators; artifact
metadata cannot supply or import a validator. Unknown/incompatible required
entries reject the whole preflight before evaluation; unsupported optional
entries have explicit omission with no effect. Validate the bounded inert outer
carrier for every entry; unknown optional payload semantics remain unknown.
Malformed envelope and duplicate identity always reject; a supported contract's
invalid payload rejects even when optional. Validator throws or malformed returns
refuse. A later failing entry causes zero evaluation/effects for the entire
candidate. Preserve accepted declaration order and a detached validated snapshot
bound to the selected owner contract; later caller mutation cannot change it.
Existing live grant/scope/revision checks
remain at the actual Host receiver. LMU owns only its feature-specific semantic
ports and inert identity, and does not import EF test internals. P5 integrates
the matcher into EF's own existing packed-consumer preflight only. It provides
separate executable EF evidence, not a cross-repository EF runtime integration.

## 5. Ordered implementation and verification

| Step | Work and reviewable exit |
| --- | --- |
| P0 | Commit this plan before implementation; run three review rounds, retain findings/corrections, and resolve blocking scope/ownership issues |
| P1 | Discriminating public-package spike: verify strict public import/types and same installed GM adapter bytes in Node/Chromium; inspect exact runtime identities. A failure changes the plan before dependent work |
| P2 | Implement three features and optional composition adapter; preserve ordinary core-only consumer and original document outcomes; explain how to add another provider without changing business logic |
| P3 | Integrate independent Node/browser state, final effect receivers, owned resource witnesses, cancellation and controlled restart; use existing Resources semantics |
| P4 | Add real source/declaration/wiring checks and rejecting mutations over the actual reference; extend closed package inventories and workflow input coverage for nested source files |
| P5 | Implement EF-owned exact-revision qualification, integrate it into EF's existing TEST preflight, and document the future LMU admission-adapter boundary; preserve permission/custody controls and production gates |
| P6 | Update maintained authoring navigation at the existing owners; run focused and full relevant gates, independent implementation review and fixes; observe exact-head CI and publish reviewable PRs |

### Acceptance matrix

| Claim | Required observable evidence |
| --- | --- |
| Useful module composition | Handwritten expected document/export results for both format providers; independent `checkWiring` detects wrong selected bindings before run; unsupported dependencies/revisions are refused by actual preparation. A structurally valid wrong profile is an authoring error, not an invented runtime security gate |
| Ordinary reuse | Core-only packed consumer works with GM absent; no platform or optional-adapter types in its declarations |
| Same artifacts in two Hosts | Hash and closed inventory checks before/after pack/install; actual Chromium executes installed core and adapter bytes; independent Node and browser state/IO paths |
| Real state ownership | Accepted edit survives A-close-B; unchanged borrowed owner remains usable; stale revision/revoked grant cannot publish an export |
| Lifetime and restart | New/old Host ingress rejects after close; cooperative cancellation settles supported work, while a held raw operation survives cancellation until its explicit barrier. Resource close starts only after settlement. Partial setup and incomplete cleanup have visible owners; B cannot construct with cleanup debt |
| Source boundaries | A real forbidden inward/platform/private import and forbidden source placement fail the installed checker for the intended rule |
| EF extensibility | Two owner-defined payload shapes without changing the matcher; unknown/mismatched required, optional omission, invalid payload and duplicate identity; zero forbidden candidate evaluation/effect |
| Regression strength | Existing controls retained; small deliberate broken controls fail the corresponding external state/resource/artifact oracle, not compilation/setup |
| Author ergonomics | Follow README from a fresh isolated consumer, add/select a format provider using public contracts and documented files, and change no document/export implementation |

Keep the envelope explicit: three flat features, two providers, one trusted Host
at a time per Node process/browser context, finite operations, one canonical
document and bounded exports. Retain current runner time limits; no sleeps or
test retries replace barriers/observations. Larger scale, concurrency, security
or native targets need separate evidence.

LMU retains Node 24.22.3, pnpm 11.25.0, TS 7.0.2 and Playwright 1.65.1.
Use exact GM public and source-check tool versions inspected in P1; commit the
reviewed dependency closure and keep TS 7.0.2+ effective throughout. Commands
remain the fixture's `pnpm check`, `pnpm build`, real Chromium installation and
`pnpm qualify`, extended to include new maintained checks/tests. EF and GM retain
their own AGENTS/runtime/Docs routes and normal `check:fast`/`check` gates.

## 6. Delivery, cost and review record

Initial combined estimate: 1,700–3,000 changed/added handwritten reference,
qualification and integration lines; approximately 200–350 documentation lines.
No new production runtime package. Measure actual diff separately from generated
locks/evidence. The upper range includes two real Hosts and EF rejection cases;
it does not justify broadening into the full LMU or EF roadmaps.

Push each useful commit immediately through the authorized GitHub route. Keep
one canonical plan and owner-specific PRs; link exact published revisions across
repositories. Do not merge stale/unreviewed heads or reinterpret queued CI as
success. npm publication remains explicitly postponed by the user.

| Review | Findings and disposition |
| --- | --- |
| Round 1 — independent repository/architecture review | Reuse LMU's real browser/package harness; keep ordinary core physically independent from optional GM adapter; EF generic compatibility remains EF-owned; choose restart instead of inventing a live coordinator. Incorporated in this draft. |
| Round 2 — exact plan critique | Corrected resource ownership; separated EF-local preflight execution from LMU architectural alignment; made optional payload policy, trusted validators and detached selection explicit; restricted old-handle rejection to Host facades including saved methods; specified reservation before reentrant code, the complete-close restart gate, cooperative and held-operation cases, and independent wiring oracle versus runtime preparation refusal. Removed any promise of zero future live-operation API changes; identified three features rather than three distribution packages. |
| Round 3 — corrected plan / adversarial acceptance | Three independent reviewers read exact corrected revision `0f05ca1767c2514d54afd987af9c22c7131b2d1a` and reported GO, with no remaining critical blocker. Clarified the owner-table EF wording. Begin P1; dependent composition work follows its public-artifact discriminator. |

Implementation evidence, actual counts and final review findings will be added
after execution; this plan is not itself a passing qualification record.
