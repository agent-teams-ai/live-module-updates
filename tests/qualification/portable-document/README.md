# Modular authoring reference: portable document

Write portable feature behavior, choose implementations at composition, and
keep state, authority and resource ownership explicit. This TEST reference has
three features—Document, Format and Export—and two private packed artifacts:
an ordinary core and an optional Get Modular adapter.

The [full modular run](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45740189099/job/139642989290)
at `926d474d031db630b81694c1659e435b9f016873` passed **41 tests, zero
failures/cancellations/skips**, including actual Chromium. This adds construction
cancellation/custody and complete-root smoke to the prior 36-test reference.
The [evidence matrix](../../../docs/research/foundation-qualification-matrix.md#construction-and-full-root-follow-up-2026-11-26)
owns exact results, including the preserved pre-fix failure;
the [original plan](../../../docs/plans/module-authoring-implementation-plan.md)
and [critical follow-up plan](../../../docs/plans/module-authoring-critical-review-plan.md)
own the bounded delivery scope. Final delivery and actual-main checks are linked
from [PR #5](https://github.com/agent-teams-ai/live-module-updates/pull/5).
The [contract/storage follow-up](../../../docs/plans/module-authoring-contract-storage-plan.md)
and [PR #6](https://github.com/agent-teams-ai/live-module-updates/pull/6) retain the
deeper review, original failures and qualification of the new boundaries below.

These are maintained qualification packages, not an npm release or public
LMU/EF runtime. The reference uses published GM APIs and contains no EF runtime
integration, private lifecycle-kernel import or live A/B overlap.

## Start with the owning feature

| Feature | Portable responsibility | First source to read |
| --- | --- | --- |
| Document | Query, edit validation and a conditional write request; the Host owns the document | [Document port](core/features/document/application/ports/document.ts), [use case](core/features/document/application/use-cases/create-document-commands.ts) |
| Format | Pure, stable `title(revision)` and `body(text)` functions | [Format port](core/features/format/application/ports/format.ts), [plain](core/features/format/application/use-cases/create-plain-format.ts) and [marked](core/features/format/application/use-cases/create-marked-format.ts) providers |
| Export | Capture the document revision, format it, await delivery preparation and request a final conditional export | [Export-owned ports](core/features/export/application/ports/export.ts), [use case](core/features/export/application/use-cases/create-export-commands.ts) |

`core/features/*/application` imports narrow semantic ports, never GM, Node, DOM
or a renderer. Each feature's `composition` surface exposes its ordinary
factory; [core/index.ts](core/index.ts) is the package entry. The
[optional adapter root](adapter/src/composition/root.ts) connects the three
features with public GM declarations, inputs, groups and factories. GM owns
graph construction; the Host supplies state and delivery inputs.

### Keep the feature contract complete

Follow the pinned [CMS module-contract rule](https://github.com/agent-teams-ai/get-modular/blob/a5f41853200aed26d692e89d768185013d629a12/docs/architecture/common-assembly.md#module-packages-and-contracts)
and [ADR-0041](https://github.com/agent-teams-ai/get-modular/blob/a5f41853200aed26d692e89d768185013d629a12/docs/decisions/0041-preserve-complete-feature-maps-with-descriptor-unions.md).
Export a complete descriptor union from each feature's composition contracts:
its own descriptors and each imported feature's complete contract union,
including transitive contracts that the current factory does not directly use.
Derive the capability interface from a separate `CapabilitiesOf` base for each
imported union, plus the feature's own descriptors. Keep those two lists aligned.

Read the [Document contracts](adapter/src/features/document/composition/document.contracts.ts),
[Format contracts](adapter/src/features/format/composition/format.contracts.ts) and
[Export contracts](adapter/src/features/export/composition/export.contracts.ts).
Export must retain `DocumentState` through Document's complete contract even
though its factory uses Document commands. Adding that state contract elsewhere
in the Host aggregate does not repair Export's independent feature surface.

Qualify both `ExportContracts` and `ExportCapabilities` against independent
expected keys, values and compatibility tokens. The
[feature compiler qualification](feature-contract-cases.ts) owns these checks.
Require separate omission controls for the union and interface, plus unused
value and revision conflicts. Identical overlaps remain valid; collapsing all
imported contracts into one mapped base can hide a conflicting duplicate ID.

## Add or select a Format provider

[consumer/author-format.ts](consumer/author-format.ts) is provider C, authored
outside both artifacts using the public adapter type:

```ts
import type { FormatProvider } from "@fixture/portable-document-gm";

export const authorFormatProvider: FormatProvider = {
  implementationId: "fixture/format/author",
  create: () => ({
    title: revision => "Author revision " + revision,
    body: text => "By author: " + text,
  }),
};
```

Pass the provider to `prepareDocumentComposition(provider)` at a composition
root, or to the supplied Node/browser Host's open or `restart` method. Built-in
`plainFormatProvider` and `markedFormatProvider` select A and B through that
same parameter. Document and Export implementations do not change.

Implementation identity is separate from semantic contract `fixture/format`
revision 1. The [installed-consumer contract probe](consumer/composition-contract.ts)
checks revision/text preservation, stable results, handwritten wiring and useful
A/B/C output. A compatible TypeScript shape alone does not establish those
semantics. Missing dependencies or incompatible revisions must fail actual GM
preparation before factories run. A structurally valid but incorrectly selected
provider is detected by the independent wiring oracle.

Use receiver-independent factory callbacks and own arrow-function port members,
as in C above. Class prototype methods are invalid ports under the adopted CMS;
the rejecting example is kept in the test probe. Each selection has its own
composition profile, derived from the captured implementation identity, such as
`fixture/portable-document/fixture/format/author`. The profile and semantic
contract revision have separate purposes.

The [complete-root smoke probe](consumer/composition-smoke.ts) passes Conformance's
typed Assembly API into the same `prepareDocumentComposition(provider, api)`
function used by Hosts. Its ordinary API default is unchanged. For each A/B/C
selection, it requires seven steps: successful construction and fail/abort after
each of Document, Format and Export. Complete close reports and independent TEST
delivery-lease counts must agree. Exact prototype-port and failed-cleanup controls
check the rejecting paths; explicit fake-lease reclamation never rewrites debt.
These checks complement the handwritten wiring and native lifetime evidence.

For a new feature, place behavior and consumer-owned ports in the ordinary core
and GM declarations/factories in the adapter. Update the explicit
[source profile](source-profile.ts), [dependency policy](architecture/foundation/source-dependencies.yaml)
and [package inventory](package-inventory.ts) when adding governed files or
changing feature boundaries. This fixture has three flat features per artifact;
it does not qualify a new nested feature profile.

## State and lifetime belong to the Host

| Responsibility | Node Host | Independently wired browser Host |
| --- | --- | --- |
| Canonical document and export receipts | Owned JSON files | Owned browser-storage keys |
| Final effect receiver | Current grant/revision check followed by synchronous file write | Current grant/revision check followed by storage write |
| Module-owned resource | Async `FileHandle` for a staging file | Export button and its actual DOM listener |
| Delivery preparation | Write through the acquired handle, then await the optional finite barrier | Native `Blob.text()` work, then await the optional finite barrier |

Read [node-modular-host.ts](consumer/node-modular-host.ts) and
[browser-modular-host.ts](consumer/browser-modular-host.ts). They share only the
[finite invocation owner](consumer/invocation-owner.ts); their state, authority,
native I/O and resource adapters are independent. Each retains a Resources
scope before construction. A setup that fails before returning its acquired
value must clean that value itself.

Acquire required browser capabilities before acquiring native resources. This
Host needs `const storage = localStorage` before creating or appending its owned
DOM, then uses that captured holder for reads, writes and cleanup. A native
getter denial must leave unrelated DOM intact, construct no provider and reach
the caller as the original exception, without another lookup during cleanup.

Obtaining a holder does not guarantee a successful write: native quota can
reject the initial state write. Failed-open cleanup must remove only the Host's
owned keys and DOM before rethrowing that write failure. Retain unrelated
storage, and keep quota calibration bounded in the native tests. This reference
qualifies one live execution context; recovery after context destruction needs
separate evidence. No storage fallback or implicit retry is part of this Host.

Construction itself is admitted through that same finite invocation owner.
Pass the native cancellation signal to `prepared.run`, retain its raw flight,
and wait for it to settle before closing the attempt's Resources scope. Keep
construction failure handling outside the tracked callback: awaiting close from
inside a flight that close must drain would deadlock. The post-construction
guard prevents publication of a facade after ingress closes.

Controlled restart closes ingress, requests cooperative cancellation, waits for
admitted raw operations to settle, then awaits the original Resources close.
B is constructed only after `settled: true` and `complete: true`. Pending work
or cleanup keeps restart pending; incomplete cleanup refuses it. Cancellation
does not prove settlement, and a second close does not retry failed cleanup.

Old Host methods—including saved methods—reject new work. Pure Format values
are not revoked. Document data and accepted export receipts survive A-close-B
under the same borrowed Host owner. Explicit `dispose()` is test teardown: it
reclaims the Host's remaining native resources and canonical namespace without
rewriting an earlier incomplete close report.

## Two artifacts and real package boundaries

- `@fixture/portable-document` has no runtime or peer dependencies. Its ordinary
  consumer works with GM absent.
- `@fixture/portable-document-gm` has the fixture core as its ordinary dependency.
  It declares public GM peers: Core/Assembly **^0.8.0**, Resources **^0.2.2**,
  with exact development pins. The consuming Host selects Core/Assembly **0.8.0**
  and Resources **0.2.2**, so composition uses one physical runtime identity.

[pack-consumer.ts](pack-consumer.ts) builds the ES-only core, packs it and installs
it outside the checkout. [pack-modular.ts](pack-modular.ts) builds and separately
packs the optional adapter against that installed core, then compiles the
modular consumers through installed public exports. No source aliases or
declaration shims supply missing runtime behavior.

The [closed inventory](package-inventory.ts) names every nested JavaScript and
declaration output. The packers check archive integrity, installed bytes, lock
bindings and physical GM package identity. The modular browser path serves
those installed ESM assets to actual Chromium. The full-suite result above binds
the executed artifacts, dependency policy and native lifecycle observations.

## Run the current qualification

Run from `tests/qualification/portable-document` with the exact frozen cohort:

| Role | Pin |
| --- | --- |
| Runtime / package manager | Node 24.22.3 / pnpm 11.25.0 |
| Compiler / Node declarations | TypeScript 7.0.2 / `@types/node` 24.19.1 |
| Browser tooling | Playwright 1.65.1; use its pinned Chromium build |
| Host runtime selection | Core 0.8.0 / Assembly 0.8.0 / Resources 0.2.2 |
| Development checks | Engineering Foundation 3.0.0 / FMS tooling 0.3.0 / GM Conformance 0.5.2 |

```sh
pnpm install --frozen-lockfile --ignore-scripts --engine-strict --strict-peer-dependencies
pnpm check
pnpm build
pnpm exec playwright install --with-deps chromium --only-shell
pnpm qualify
```

`pnpm check` runs strict TypeScript and the actual installed Foundation/FMS/GM
source checks. [source-profile.ts](source-profile.ts) pins FMS v1.1 and the
adopted CMS source; it also checks the initialized Foundation compiler version.
These are fixture-local checks, not admission of the whole research repository
to a production tooling profile. The current tool lock SHA256 is
`93c6f1d17b2606aedb4ac2c95c8f15cb8c6f0705875f5149f60e13065993f700`.

`pnpm qualify` executes the modular contract/artifact, Node/browser lifecycle,
actual-root smoke, retained ordinary document, P1 and source-guard cases. A later source or package
change needs its own exact-source result.
The [workflow](../../../.github/workflows/portable-document-qualification.yml)
checks the actual PR head, installs real Chromium and retains source, tool
identities, packed bytes, installed declarations and native logs even on failure.

## Evidence and remaining limits

The retained ordinary tests still check normalized edits, invalid/stale/denied
writes, receipt aliasing, both Host orders, installed-byte mutations and all four
physical browser-listener cleanup omissions. Source mutations reject Node I/O
or GM in ordinary application code, sibling implementation access and ungoverned
source placement. The modular suite additionally checks A/B/C useful
outputs, independent Node/Chromium execution, raw-work drain, partial setup,
original cleanup debt, final receiver races and discriminating broken controls.
Construction probes are generated as separately typechecked TEST Host copies.
They preserve the actual run Promise and actual scope close; a control keeps
cancellation but omits only construction custody. Both Hosts must reject that
control for premature close after finishing real teardown. Waiting for Resources
setup alone cannot establish this ordering guarantee.

The recorded native job runs on Ubuntu 24.04 with the pinned Node and Chromium.
All claims are bounded to trusted finite work, one Host at a time in one Node
process or browser context, one document and bounded exports. Synchronous writes
have no crash-durability or multi-process guarantee; browser storage is not
multi-tab compare-and-swap. Raw DOM demonstrates one interaction/lifetime path,
not a renderer, accessibility qualification or Desktop shell. Host permission
checks do not contain hostile code.

EF contribution compatibility remains separately owned and qualified in EF.
Production plugin admission, installed-plugin lifecycle, isolation, streams,
state migration and the complete LMU update operation retain their separate
[delivery-plan](../../../docs/plans/foundation-delivery-plan.md) evidence.
npm publication is postponed. No product or consumer pin migration is implied.
