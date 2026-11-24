# Failed drain, handoff and synchronous callback boundary

Research-only follow-up; use the original frozen npm lock and actual Resources
0.2.2 on Node 24.22.3, strict TS7.0.2. Earlier P1-P8 remain unchanged. This
does not implement a new updater or assert a new public API.

P9: a registered drain cleanup throws before admitted work terminates. Observe
actual Resources continuation past debt, closed native descriptor, failing
old read; later cleanup retry cannot undo the failed operation. This is
documented Resources behavior, not a defect. The product's drain-before-owner
release contract must not be inferred from simple reverse-order cleanup.
P10: setup acquires real descriptor and then rejects before returning it.
Compare actual escaped resource and no registered cleanup against a separate
successful ownership handoff followed by later validation failure. Harness
retains and explicitly closes even the intentionally escaped handle.
P11: actual scope abort listener sees the host's split publication state.
Positive control publishes one consistent route object first. Also verify
new scope acquisition is rejected during the reentrant callback. Scope's own
admission safety does not make arbitrary host routing changes atomic.
P12: actual async-generator return while next is awaiting; then block its
asynchronous finalizer. Verify the real descriptor remains readable until
the actual return/finalizer settles. No claim that every stream library has
the same cancellation semantics.

Two source-review passes: Resources scope.ts invokes callbacks and records
failed debts but continues the remaining reverse release; registered setups
gain ownership only on successful acquisition return; AbortSignal callbacks
are synchronous; iterator continuation must be observed to its actual
terminal boundary. No timing sleep is used as correctness evidence: all work
and finalizers use explicit gates, tests have bounded timeout, and finally
releases test-owned gates/handles. The only deliberate negative examples are
in disposable local files and no external effect or production code runs.
