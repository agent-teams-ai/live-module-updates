# Retired L1 invocation discriminator

The preliminary candidate is retired after the complete packed production
operation passed in both native targets. The maintained implementation is
[`src/features/update-operation`](../../../src/features/update-operation), and
its required packed qualification is
[`tests/module/operation-e2e.test.ts`](../../module/operation-e2e.test.ts).
Run the repository's complete `pnpm check` route with the required pinned
Chromium installed; there is no second maintained invocation algorithm here.

Original evidence remains immutable:

- [Original L1 source](https://github.com/agent-teams-ai/live-module-updates/tree/2f7392f3b1a9541e84ece0a910a14c49cbacb62f/tests/qualification/update-operation),
  [native Node/Chromium run](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45904704130).
- [Last retained source and corrected tooling](https://github.com/agent-teams-ai/live-module-updates/tree/6089f0a46206b696e81dbe8756e7e71e00a93dd7/tests/qualification/update-operation),
  [last successful precursor run](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45913432061).
- [The original failed installation and repair](../../../docs/research/foundation-qualification-matrix.md#3b-first-private-production-checkpoint).
- [Complete replacement evidence](../../../docs/research/foundation-qualification-matrix.md#3c-complete-packed-operation):
  the actual installed LMU artifact, independent native authorities/resources,
  29 scenarios and six exact defect controls in each target.

The precursor was a bounded TEST-only feasibility experiment. Its two-entry
retention and synthetic split-selection control did not prove the complete
coordinator or repeated registry removal. Retiring active code and its workflow
does not rewrite that scope or its original results. Reproduction uses the
identified Git revision and frozen inputs rather than this navigation note.
