# Cross-tier browser/backend version-skew evidence — 2026-11-23

**Disposition:** bounded native research passed after a deliberately narrower
acknowledgement discriminator. No production library, public API, actual
Agent Teams feature cutover, backend process handoff, database recovery,
distributed authority, React integration, or service-worker qualification.
The initial failed TCP-reset case is not certified by this result.

## Exact executed inputs

| Field | Value |
| --- | --- |
| Original [run 45257881795](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45257881795) | FAILURE; X1–X3 passed, X4 timed out |
| Original source | feb3927d320fe905bd3f712a46f7458c0107db4e |
| Amended [run 45259638070](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45259638070) | SUCCESS, attempt 1, job 137990621676 |
| Amended source | 2bc1affa58f0fd149b69620be940bc091456f48c |
| Toolchain | Node 24.22.3, pnpm 11.25.0, TypeScript 7.0.2, Playwright 1.65.1, actual Chromium 159.0.8154.6 |
| Native test totals | 4 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo |
| Original failure artifact | 14858538535; 23,361 bytes; SHA-256 3eb0e049c29e2099d01fde683428af83bedd6131a1a962f57f481ac94efc4855 |
| Amended artifact | 14857519775; 26,481 bytes; SHA-256 cc1fb1dff0ace985004a3166f97858f9913dec82868b447e573d98a297370869 |

Both archives were downloaded, SHA-256 compared to Actions metadata, ZIP
integrity checked, recorded input/emitted-browser SHA-256 receipts recomputed,
and source Git blobs compared to the respective executed commit. Exact
first-run lock was restored from its committed gzip, not resolved again.
Artifact URLs have retention limits. Source, lock, initial failure transcript,
successful native transcript and receipt digests are retained here separately.

- [Fixture and revised plan](evidence/cross-tier-skew-20261123/PLAN.md)
- [Initial failed run evidence](evidence/cross-tier-skew-first-failure-20261123.md)
- [Successful native transcript](evidence/cross-tier-skew-success-20261123.log)
- [Input/output and toolchain receipt](evidence/cross-tier-skew-success-20261123-receipt.json)

The original X4 attempted a raw socket reset after recording an effect; the
browser did not reach the expected unknown state within the deadline. The
logs do not establish why. Rather than claim a transport mechanism without
proof, the revised experiment returns HTTP 200 with deliberately incomplete
JSON after effect admission. It proves unknown *application acknowledgement*
handling, not automatic network retry semantics, durable receipt transactions,
or real provider reconciliation.

## Observations and architecture consequences

| Case | Negative control actually observed | Positive control actually observed | Implication |
| --- | --- | --- | --- |
| X1: independent client/server versions | Old A on B unversioned route received incompatible response | Old A read B through V1 and new B read B through V2 | Stable contract/compatibility interval, not global synchronized update |
| X2: late imports | Removing old A chunk broke actual still-open A tab with HTTP 404 | Retained A chunk still loaded; B lazy import loaded | Retain old artifact closure while it is legitimately usable; enforce bounded reclamation policy |
| X3: late HTTP completion | A result overwrote switched B view | Generation guard ignored old result; dirty draft, focus, selection and document retained in both cases | Separate stable editor/state owner from replaceable view and guard the latter's async publication |
| X4: uncertain acknowledgement | Fresh command identity created a second effect | Same original ID after A→B returned original receipt, conflict 409, revoked new command 403 | Command identity belongs to intent/receiver, not module generation; unknown is not failed; authorization remains current |

The fixture deliberately owns one stable document/input, with plain ESM
view contributions and simple state switching in one local HTTP server process.
It is not a general loader, updater, UI reconciliation engine, or durable
database. It verifies real browser/network observations rather than a mock,
and explicitly uses negative controls. The old-client scenario is one
supported backward-compatible direction; the full A/A, A/B, B/A, B/B,
multi-host, IPC/protobuf, renderer-framework and offline retention matrices
remain product qualification requirements, not four already verified cells.

**Keep the production design small without dropping these guarantees.** Existing
product API owner, client stores, artifact distribution owner and command
receiver implement their actual contracts. The proposed shared update use case
coordinates supported boundaries and reports uncertainty, but must not
introduce a second business event log, state store, delivery network, renderer
or runtime authority. A surviving tab alone does not prove preserved
arbitrary component-local state; a passing receiver fixture does not prove
exactly-once effects.

For the next decision and real candidate, see
[foundation strategy review](../architecture/foundation-strategy-review-2026-11-23.md).
