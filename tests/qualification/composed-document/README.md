# Composed module adoption reference

This maintained TEST reference constructs one actual LMU runtime through Get
Modular, then replaces complete Document/Format/Export/Summary closures. Its
application-facing capability is the owner-defined `DocumentInvocation` contract.
The Host retains update, shutdown and recovery controls. The ordinary LMU package
continues to have no mandatory GM dependency.

The owning scope and completion criteria are in
[Programme C](../../../docs/plans/composed-module-adoption-plan.md). Current
executed evidence and material findings belong to the
[review record](../../../docs/reviews/composed-module-adoption-2026-11-27.md).
Source existence, local success, hosted qualification and product admission are
separate observations; this README does not promote a pending run to success.

## Source and contract ownership

| Source | Responsibility |
| --- | --- |
| `src/features/document-runtime/application/ports/` | Concrete commands, replies and a readonly invocation capability over the portable LMU root contract. |
| `src/features/document-runtime/composition/` | Complete descriptor union and capability map, one declaration per implementation, four single-capability Host input entries, the runtime owner and its downstream client. |
| `src/composition/` | Actual whole-closure and runtime compositions. The coordinator remains a Host-owned instance; only invocation is published to the dependent module. |
| `hosts/generation-owner.ts` | Trusted TEST catalogue binding each candidate identity to its actual original provider and complete composition. It uses the existing optional Resources preparation adapter. |
| `hosts/node-environment.ts` | Independent file descriptors, file delivery and the existing native Map authority. |
| `hosts/browser-environment.ts` | Independent DOM listeners, DOM delivery and the existing native Storage authority. |
| Other `hosts/` files | Handwritten behavior expectations, explicit lifecycle and capacity scenarios, and the same installed `live-module-updates/testing` authority laws in both native environments. |
| [composed-fixture.ts](../../module/composed-fixture.ts) and [composed-inputs.ts](../../module/composed-inputs.ts) | Root-owned compiler orchestration, explicit unchanged inputs, two isolated installations and exact artifact/source receipts. |
| [composed-e2e.test.ts](../../module/composed-e2e.test.ts) and its browser/mutation helpers | Native target campaigns, independent expected scenario census, exact intended negative failures and browser loaded-byte observations. |
| [check-composed-source.ts](../../../scripts/check-composed-source.ts) | Actual Foundation, FMS, GM Conformance and scoped native source-quality checks. |

The existing [portable-document reference](../portable-document/README.md) owns
the portable behavior, its GM adapter, the independently authored Summary
feature and external Format provider. Staging copies an explicit inventory of
these sources unchanged and records their original hashes. Summary's public
entry is renamed mechanically to avoid replacing the new package's entry; its
source bytes remain unchanged. This reference does not maintain another
implementation of their use cases or a second graph resolver.

The new GM source adopts FMS v1.1 and the consumer module standard at GM commit
`27dfb4ddf67cead198fee6e781ab355c37782928`; the checker records the complete
immutable identities and file scope. The old reference retains its own accepted
profile. The entire staged composed-reference source receives strict compiler,
graph, FMS, layout and dependency checks. Native typed lint and the new CMS limits
cover every newly maintained reference source file. The unchanged portable core,
adapter and Summary retain their existing owner profiles. All copied Host
implementations receive independent Node/browser compiler coverage; newly
maintained Host infrastructure also receives stock typed quality, without
pretending that test orchestration is a GM application feature.

## Constructing and owning the runtime

The Host exists before acquisition and coalesces its original construction
promise. Its native Resources setup owns initial preparation before any awaited
work. Initial compatibility is checked before acquisition and again against
current owner facts after asynchronous preparation. These checks do not grant
permission to change application state.

The owner captures the original preparation and cleanup callables with their
original receivers. A successful `createUpdateRuntime` return is the single
initial ownership transfer. The owner stores the runtime and clears its initial
cleanup cell before publishing recovery controls or running downstream code.
A failed dependent root therefore leaves an exact owner available for explicit
cleanup and recovery even when no application root was published.

Generations use detached Resources scopes and retain their native resources
through the work that uses each generation. Borrowed Host authority infrastructure
remains owned until the whole runtime releases its actual authority calls;
generation retirement alone does not establish that fact. Before
closing the external GM parent, the Host synchronously calls `runtime.close()`
to cut off fresh admission. Its native cleanup callback awaits that original
close and reads `runtime.inspect().ownershipReleased`. An incomplete current
ownership fact becomes native cleanup debt. Explicit `runtime.retryCleanup()`
and an explicit parent retry can later release that debt; the original reports
remain immutable. The reference has no implicit retry policy or copied
coordinator completion predicate.

Application calls use the concrete `DocumentInvocation` capability. Nested work
uses its retained invocation context. Long-lived state, schema, grant and final
write authority stay with the native owner. A held A summary continues through
A's original formatter after B becomes current, while A's final delivery is
refused by the selected current-generation effect policy. Closure consistency
does not imply a snapshot of all application data.

## Isolated build and execution

From the repository root, with the frozen root dependency cohort installed:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium --only-shell
node --test tests/module/composed-e2e.test.ts
```

Use the existing CI environment's browser installation where available. The
runner builds root declarations and implementation with the actual TS 7.0.2
compiler into its own temporary package before packing. It never writes shared
root build output while parallel qualification consumers may be packing it.
It does not use the old fixture's compiler or installed
development dependencies. The root `pnpm run check` also includes this campaign
alongside the production and prior qualification checks.

The staging order is LMU and the exact public GM cohort, unchanged portable core,
unchanged GM adapter, then the new reference with unchanged Summary. The first
isolated installation supplies public dependencies for construction. A second
clean consumer installs only the eight archives and authored Host files. Its
closed installed inventory and every installed byte must match the original
packed build. No checkout source aliases or declaration shims are accepted.

Separate strict Node and browser compiler projects record `--listFiles`. Their
combined implementation inputs must equal the explicit copied Host inventory;
actual installed public declarations must participate. An additional ES-only
application project checks the inner portable boundary. A deliberate attempt to
assign `DocumentInvocation.invoke` must fail with TS2540 after a valid installed
contract compile. Source-quality controls likewise establish valid setup before
requiring each exact intended native rule failure.

The native campaigns share the same eight archives. Chromium serves installed
package bytes directly, records response-body hashes and loads the actual public
LMU, Resources and testing entries. Node and browser targets have independent
state and physical resources; two executions of one Host are not counted as two
integrations.

## Evidence and limits

The 34 positive scenarios cover useful A/B/external-provider behavior, complete
held closures, retained nested work, final edit/grant/schema guards, exact factory
identity despite equal plans, missing and incompatible dependencies, initial and
candidate preparation failures, original lost acknowledgement recovery, external
parent shutdown and cleanup debt, finite work/candidate/retention/history limits,
independent domains and the eight installed authority laws.

Seven negative controls change actual installed or emitted bytes, or select one
deliberately faulty native owner: wrong wiring, mixed closure, plan-only factory
reuse, effect guard omission, parent-before-admission shutdown, wrong-instance
removal and omitted physical disposal despite retired bookkeeping. A useful
baseline and the exact first intended error are required; an import, compilation
or unrelated teardown failure is not a successful negative control.

Physical release is observed independently of retirement counters. Node compares
the actual original descriptor's device/inode and treats EBADF as closed, so a
reused descriptor number is not mistaken for the old resource. Browser probes
the exact listener through native dispatch even after its bookkeeping says it
is inactive. Final cleanup first records leaked native resources, then attempts
safe cleanup while preserving the original scenario failure.

Artifacts and reports are retained under the dedicated
`.qualification/evidence/composed-document/` directory. They include input
archives and hashes, lock and compiler identities, source inventories, native
gate results, target reports, deliberate mutations and browser received bytes.
The exact hosted revision and result are recorded by the owning review.

The campaign qualifies only the selected cooperative private library and trusted
reference profile when its source-bound native evidence passes. It does not
establish npm publication, managed product admission,
untrusted plugin isolation, Desktop execution, durable cross-process recovery,
transparent session renewal, stream supervision or live replacement of the
coordinator itself. Those stronger profiles retain their existing owner plans.
