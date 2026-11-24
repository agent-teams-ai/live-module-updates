# Native public-package custody research — first completed run

Executed 2026-11-23 UTC at immutable source
[b2c7ab1](https://github.com/agent-teams-ai/live-module-updates/commit/b2c7ab1e46e4ebe608be31bae686d28657da9877).
[GitHub Actions run 45253364235](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45253364235),
attempt 1, job 137968615027: SUCCESS. Exact inputs are visible at that source.
No updater implementation or production/runtime adoption.

The original artifact was downloaded through the Actions API, checked for ZIP
integrity, and every input/lock checksum in its internal receipts recomputed.
The published byte-identical [ZIP](public-gm-custody-45253364235-1.zip) is the
original 17-member artifact (not a rebuilt archive). Its Git blob and SHA-256
match the verified downloaded bytes:

- GitHub artifact 14857267814; 13,664 bytes.
- SHA-256 05bc4ff131e3ce489c2ea38705c8ba0e42c7865d07174a7ef44ed37fcddef2d8.
- Git blob 235ce567079391fdc2601d17f84f673ad44b777f.
- Actual lock SHA-256 fa419ff2a21ab6ec54cc1e35eda2e87a706dff144ed2629b6841ce07869d9510.
- All five source/workflow input Git blobs match the exact run commit.
- Installed Core and Assembly 0.8.0, Resources 0.2.2, TypeScript 7.0.2,
  Node types 24.19.1, Node 24.22.3, pnpm 11.25.0.
- Strict source/declaration compiler gate succeeded. Initial lock was resolved
  on the runner from exact direct coordinates before frozen installation;
  the result ZIP retains that lock for subsequent reproducibility.

Observed native tests (raw original native.log is included):

    $ node --test probe.test.ts
    ✔ P1 actual A/B streams retain borrowed provider through failed F and owner retirement (20.394085ms)
    ✔ P2 unsafe host close does not drain an unregistered continuation (5.59768ms)
    ✔ P3 explicit drain before release; abandon is not closure (5.448047ms)
    ✔ P4 public runtime rejects pretending a dependent module is a slot-free input (0.360637ms)
    ℹ tests 4
    ℹ suites 0
    ℹ pass 4
    ℹ fail 0
    ℹ cancelled 0
    ℹ skipped 0
    ℹ todo 0
    ℹ duration_ms 245.509146

P1 proves the particular borrowed stable file-owner and scoped-candidate
mechanism using real reads and closed-handle errors. P2 proves an unsafe
Host can close a scope while an unregistered lazy iterator remains live.
P3 proves a manually registered drain obligation preserves the physical handle
until a held read settles, and caller abandon does not mean close.
P4 verifies the actual runtime slot-free input restriction. None exercises the
unpublished lifecycle-kernel, automatic admission, arbitrary nested-call
retention, product selection, external fencing, PostgreSQL or arbitrary
incremental graph reuse. The positive drain control is explicit test ordering,
not the future generic update engine. Test durations are not throughput/latency
benchmarks.
