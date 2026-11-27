# B0 installed-consumer baseline

These raw compiler observations precede the minimal adapter-root correction in
the [B0 plan](../../../plans/installed-feature-consumer-plan.md). Source
`7c3e2169ef4345c5769de79af01f9345ae22e2fe` has the same provider runtime bytes as
the subsequent documentation-only consolidation checkpoint.

[baseline-compiler.json](baseline-compiler.json) records the actual packed
adapter/core identities, installed lock digest, program, exact TypeScript 7.0.2
configuration and process result. It contains exactly three TS2305 diagnostics:
missing `Export`, `ExportContracts` and `ExportCapabilities`. Its SHA256 is
`1df4d9e5fd65b5e7e5bb5ef28f7c1444b48dfbc7a97310ee04bc12c001f582f8`.

The earlier [initial configuration](initial-ambient-config.json) omitted the DOM
ambient declarations needed by the public GM declarations. It is preserved as
an original failed experiment, **not** counted as the missing-export proof.
The corrected baseline supplies those declarations without changing the
installed provider or suppressing type checking.

The maintained M5 case proves restoration, independently removes the exact
public exports again, verifies the same diagnostic class and restores the
verified artifact bytes. It also executes the new sole-root consumer, contract
conflicts, denial, cleanup and package-export refusal. New success observations
belong to the exact-source workflow artifacts and
[qualification matrix](../../../research/foundation-qualification-matrix.md);
these historical failures are not rewritten by a later success.
