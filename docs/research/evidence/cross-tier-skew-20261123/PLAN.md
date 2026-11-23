# Cross-tier replacement and version-skew discriminator

Research-only; not implementation of Live Module Updates, a new public API,
real Agent Teams adoption, React integration, or a production server.
Prior public GM P1-P12 and the original browser editor campaign remain intact.

The next architectural risk is independent front-end/backend upgrades.
A real Chromium browser will use compiled, ordinary ESM view contributions and
a real local HTTP fixture. The explicit test-only switches select A or B; the
fixture is not an update framework. One stable document/input is the draft
owner. Server state is intentionally in-memory; an HTTP acknowledgement loss
is tested, not database crash recovery. No user data, real agents, remote
providers, external site or production credentials are accessed.

| Case | Negative control | Positive control |
| --- | --- | --- |
| X1 mixed client/server versions | Old A reads an unversioned endpoint after B: wrong response shape | Both old and new clients use compatible feature-owned API paths while B is serving |
| X2 immutable lazy assets | An old open tab lazily imports a removed A chunk: real HTTP 404/import failure | While A assets are retained both old A and new B work |
| X3 stale async view completion | A response arrives after B view and overwrites B | Compare exact admitted view generation; B survives; stable dirty draft and focus/selection remain |
| X4 lost acknowledgement across code rollout | A new request identity after lost reply creates another effect | Retry same original V1 command ID through B; original receipt, one effect; conflicting intent rejects, current grant enforced |

Two review passes: use an existing backend owner, never add an application
framework; make actual HTTP/DOM observable independent of fixture intent.
Tests use event gates and observable DOM predicates, no fixed sleep.
Fresh browser contexts distinguish lazy module-map state; cache disabled in
this fixture intentionally. Old tabs and backend B are real concurrent
clients/HTTP handling but backend A/B logic shares one test process.
The browser code is plain ESM, not arbitrary React state migration or a service
worker/offline claim. The test cannot qualify actual IPC/Protobuf, durable
receipt recovery, distributed routing, security isolation or the future updater.

Toolchain: exact Node 24.22.3, pnpm 11.25.0, TypeScript 7.0.2,
@types/node 24.19.1, Playwright 1.65.1. Initial dependency lock resolved
from exact direct coordinates in an isolated runner then frozen-installed;
retain raw lock, source, installed manifest identities and compiler outputs.
No old TypeScript, skipLibCheck, declaration shims or weakened negative oracle.
Every maintained TS source checked strictly; actual browser JS emitted from
its own TS project. Real Chromium installed using the pinned Playwright CLI.
Artifacts and test logs required. Failure to install/compile/run/upload is not
a successful native result. Estimate: 300–400 test/fixture TS lines plus
workflow, zero production LOC; complexity 7/10, expected probe reliability
8/10, recommendation confidence 9/10 (judgments, not measured reliability).

## First-run failure and bounded correction

Run 45257881795 at feb3927d320fe905bd3f712a46f7458c0107db4e: strict TS7,
actual browser build, installation and artifact upload passed; X1–X3 passed;
X4 timed out at the expected unknown acknowledgement. Exact cause of the
socket-reset case is not established. The amended X4 tests an incomplete
JSON receipt over an actual HTTP response (not a claim about TCP reset or
transparent retries). It still requires an observed committed effect before
retry, the same command identity after switching to B, conflicting intent
refusal, deliberate new-ID duplicate, and current grant denial. Explicit DOM
diagnostics and fresh-ID observation improve falsifiability. Reuse the exact
first-run lock; no dependency resolution on the second attempt.
