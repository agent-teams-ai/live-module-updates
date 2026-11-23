# Public Assembly / Resources shared-owner discriminator

Research only. No public updater implementation, API adoption, lifecycle-kernel
release, FMS admission or production qualification. Source basis: Get Modular
850bac5fd02fa5697846cc8958ac447d5c2ee7bb, especially public Assembly README,
entry-store, run journal, Resources scope contract, ADR-0030/0031, and the
upstream assembly-scope/inputs tests. Prior study's S2 and shared-provider
case motivate this narrower real package probe.

Question: can a prepared B borrow an actual stable owner while A is still
consuming an old stream, and what responsibility remains outside the scopes?
Use real npm Core/Assembly 0.8.0 and Resources 0.2.2, Node 24.22.3,
TypeScript 7.0.2, Node types 24.19.1 and pnpm 11.25.0. All new maintained
JS-runtime sources are .ts. Reject unsupported versions/compiler, do not
substitute a private kernel, shim declarations or bypass strict checking.
Resolve an initial lock only in the disposable runner from exact direct
versions and retain it before frozen installation. This first lock resolution
is not a previously sealed transitive graph; record installed identities and
archive integrity in the observed run before attributing results.

Cases and independent oracles:
1. Stable owner P opens one real file handle. Construct A and B with the public
   Assembly input seam and separate scopes; start A's async iterator and pause
   it after its first yield. Fail F after a distinct real acquisition, close F,
   prove A/B/P remain usable. Finish B, then A, and close their owners. Check
   actual handle reads and EBADF on each closed handle, exact cleanup counts and
   P surviving until its own close. No simulated route manager or automatic
   generation admission.
2. Negative control: close A's scope after its iterator yielded but before
   resuming. The scope can report complete while a continuation has not
   terminated; resuming tries to access a closed file. The borrowed P survives.
   This is a host misuse test, not a claim Resources violates its contract.
3. Positive contrast: register one explicit native drain obligation in the
   scope, acquired before the held read and released by that read's terminal
   continuation. Abandon one close waiter while the native close is pending;
   verify an incomplete unsettled report, original handle still open, then
   resume the read and join close. Keep the first abandoned report unchanged.
4. Reject an attempted Assembly input with a declared dependency slot using
   the actual runtime API and no declaration shim or private import.

Review passes before submission:
- Contract pass: Assembly inputs are borrowed and slot-free, scope is opaque;
  construction success does not establish readiness. Separate actual file
  handles verify ownership, not a cleanup-counter oracle alone.
- Failure pass: all holds explicitly released in finally; no sleeps as
  readiness criteria; a node:test timeout bounds a failed case; no actual
  application/provider or external effects. File paths are temporary.
  Abandon stops waiting only. The negative control must detect harm rather
  than assert premature close as success.
- Execution gate: strict compiler and public declaration checking precede
  every native test. A resolver/install/compile failure is not a native pass.
  No CI status replaces output inspection and preserved evidence.

Estimate: ~230 test-only TS lines, ~80 workflow lines, zero production LOC.
Complexity 6/10; expected bounded probe reliability 8/10; recommendation
confidence 9/10. These are planning judgments, not library reliability scores.
S2 remains open for real public lifecycle-kernel/call-admission qualification,
multi-domain selection, new nested admissions, remote effects and actual product
consumer adoption. A test-only explicit ordering is not the missing kernel.
