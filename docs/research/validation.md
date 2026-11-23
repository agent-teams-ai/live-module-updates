# Validation and exact execution scope

**The bounded native campaign passed, including artifact delivery.** Corrected
[run 45208310980][final-run], attempt 1, executed at
`b86e05988334f657d933fa412a02572b455dcd7e`. Its original artifacts, observations
and independent result review were subsequently preserved in Extension Foundation
at `cc07959309f65ab2401f838c982911743075fe1e`.

The result is **3 declared tests, 6 named cases and 66 explicit comparisons**:
Piral 2 tests / 5 cases / 61 comparisons; Effect 1 / 1 / 5. All three tests passed
with zero failures, cancellations or skips. This finalization reads those retained
results; it does not rerun the fixtures or add coverage. Production-library code
delivered by this research remains zero.

## Preparation and immutable input

The frozen campaign was committed and immediately pushed at
`f40968f88a1fd29bea3dfcf207bab56e32b90e0d` before native execution.

- [Input archive][input] and [content manifest][input-manifest]:
  `live-module-contracts-v1-input-20261123.tar.gz`.
- Size: 144,946 bytes; 97 regular-file members.
- SHA-256: `5db80d05009fe298a6cc6d8a1a628a17c80fc8e429beb3dab811ecb5d1db99b1`.
- Original preparation workflow SHA-256:
  `8135d6092a78d434fa10172f989bc890429b37ac7c7a5219b13244edd149d1ae`.
- Corrected executed workflow SHA-256:
  `d31e67757c0e1f7a08a135c444de8e94876f92f6b40ed395065f2f87d63c52f6`.

Both fixture projects passed strict TypeScript 7.0.2. The actual Piral production
bundle was generated through the existing official code generator. The first
strict declaration failure is preserved: Piral's full types needed actual
SystemJS dependencies. Installing the genuine packages resolved it without
declaration shims or disabled checking.

Independent source review bound the real public app/registration path, listener
oracles, original close result and failure cleanup. Before execution, its
corrections ensured that observations survive host-cleanup failure, scenario and
cleanup errors remain separate, and Effect assertion failures enter the result.
The delivery corrections changed paths and workflow context handling; the frozen
fixture input and test oracles remained byte-identical.

## Execution and delivery history

| Attempt | Exact executed or submitted head | Native result | Delivery result |
| --- | --- | --- | --- |
| [45205566932][first-run] | `f40968f88a1fd29bea3dfcf207bab56e32b90e0d` | Full logs record Piral 2/2 and Effect 1/1 passed | Upload failed because absolute patterns retained a `../` segment; no observation JSON was delivered |
| [45207513737][context-run] | `3b511d2a75829169c011baf3c114ec62c8c254b3` | Zero jobs and zero native executions | Workflow validation failed before execution |
| [45208310980][final-run], attempt 1 | `b86e05988334f657d933fa412a02572b455dcd7e` | Piral 2/2 and Effect 1/1 passed; all six named cases completed | Both upload steps and official artifact delivery succeeded |

The [first-delivery-failure packet][first-failure] retains the original complete
logs. Its missing detailed JSON and comparison counts are not reconstructed from
the corrected run. The [context-failure packet][context-failure] preserves the
zero-job receipt and subsequent review. Job-level `runner.temp` was diagnosed
against the submitted source and documented context availability; the exact
hosted validator annotation was unavailable, so no quoted error or job log is
invented. The successful correction initializes paths in the first runner step.

Repeating unchanged fixtures to repair evidence delivery adds no distinct
coverage. Observation rows and comparison calls are not additional tests. The
publication commit `cc07959309f65ab2401f838c982911743075fe1e` and later transfer
commits are not the head that ran the experiment.

## Actual bounded observations

| Case | Delivered observation | Supported interpretation and limit |
| --- | --- | --- |
| P1 | New setup rejected after acquiring a listener; the outer action fulfilled and old managed contributions were already removed | Action completion is not useful readiness. The failed candidate still owned its listener until explicit cleanup; a retained A callback did not restore A's useful page |
| P2 | The successor's page and extension were useful before the delayed old disposer ran; afterwards the route page disappeared while the distinct extension reference survived | Route-only removal can delete this successor. Exact-reference removal supplies the positive control. This is an asynchronous continuation of a `void` teardown contract, not a broken awaited-Promise guarantee |
| B1 | The cooperative bridge reported readiness rejection and closed the failed candidate's listener; old contributions remained absent | Owned failed-candidate cleanup works in this fixture; it does not supply nondestructive preparation or automatic restoration of A |
| B2 | B remained useful while A's first close report was settled but incomplete, with one failed listener debt; A's listener still responded | Useful adoption and predecessor cleanup debt can coexist; settled does not mean released |
| B3 | Explicit retry of the same A scope removed that debt and listener, preserved useful B, and retained the original failed report | Exact old-scope cleanup can preserve the successor; the fixture does not choose an automatic production retry policy |
| E1 | A second Effect close returned before the original finalizer was released; joining the original fiber then established listener removal | Repeated close did not join original finalization; retain the actual first close outcome |

Piral recorded no page errors or infrastructure failures. Its two deliberate
setup-rejection console messages remain in the observations. In the raw cases,
the fixture explicitly cleaned its native listeners; an empty Resources scope
does not prove that it cleaned unregistered resources.

Useful UI behavior is supported by the passed, independently reviewed DOM
actions and assertions bound to the executed source and generated bundle. The
delivered artifacts contain no DOM screenshots or browser recording.

## Delivered evidence and exact runtime

The [result archive][results] and [manifest][results-manifest] preserve the two
original downloaded ZIPs, full job logs, observation JSON, exact input/workflow
bindings, installed dependency identities, generated-output receipts, root
verification and `industry/NATIVE-RESULT-REVIEW.md` with its input ledger.

| Official artifact | ID | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| Piral | 14835352018 | 408,261 | `aa2b566afaebd87eebca733830e58c32ac09ff091e186953913fab0e1e845afe` |
| Effect | 14835745764 | 308,046 | `38e92383b7201bd5dec759e67e85f39d34caaaf47679345fd2c228a5e2c13929` |

Both official ZIPs were independently read. Their computed digests and sizes
matched GitHub metadata, and their member inventories matched the retained
copies. The result packet is 691,662 bytes with 30 regular members and SHA-256
`52ebb4aea355ae338cbc99d40f392cd85b1f600adb5c0e2c9efe1db82f0f73a8`.

Both hosted profiles used Node 24.22.3, pnpm 11.25.0 and TypeScript 7.0.2. Strict
source/public-declaration checks and exact installed-graph checks passed. The
Piral profile used core 1.12.5, Resources 0.2.2, React 18.3.1, router 5.3.4,
Vite 8.3.8, the official codegen plugin 2.1.0 and Playwright 1.65.1. The Effect
profile used 4.1.5. These identities qualify this fixture cohort; they do not
upgrade another consumer's accepted dependency pins.

## Scope and retained research

The cases do not qualify a complete update library, arbitrary foreign-pilet
adaptation, secure isolation, atomic invocation admission, state migration,
durable crash recovery, physical release of all resource kinds or the proposed
common application comparison. They do not accept an adapter, select Q1-Q7 or
prove comparative product advantage.

The earlier MF, SystemJS, database, Worker, editor/history and cross-language
probes retain their original source and scope. The design checkpoint contains
24 architecture findings, 13 industry findings, 42 industry source records and
independent review dispositions. Statements marked source-only or proposed in
those preserved reports describe their preparation context; the results above
record the later bounded campaign. Documentation checks and transfer-integrity
checks are separate evidence from native execution.

[Source registry](../../history/SOURCES.json) binds all ten immutable sibling
packets, including the original failures. [Provenance](../../provenance/README.md)
distinguishes preparation, execution, result publication and the current transfer.

[first-run]: https://github.com/agent-teams-ai/extension-foundation/actions/runs/45205566932
[context-run]: https://github.com/agent-teams-ai/extension-foundation/actions/runs/45207513737
[final-run]: https://github.com/agent-teams-ai/extension-foundation/actions/runs/45208310980
[input]: https://github.com/agent-teams-ai/extension-foundation/blob/cc07959309f65ab2401f838c982911743075fe1e/docs/research/evidence/live-module-contracts-v1-input-20261123.tar.gz
[input-manifest]: https://github.com/agent-teams-ai/extension-foundation/blob/cc07959309f65ab2401f838c982911743075fe1e/docs/research/evidence/live-module-contracts-v1-input-20261123.manifest.json
[first-failure]: https://github.com/agent-teams-ai/extension-foundation/blob/cc07959309f65ab2401f838c982911743075fe1e/docs/research/evidence/live-module-contracts-first-delivery-failure-20261123.tar.gz
[context-failure]: https://github.com/agent-teams-ai/extension-foundation/blob/cc07959309f65ab2401f838c982911743075fe1e/docs/research/evidence/live-module-contracts-context-failure-20261123.tar.gz
[results]: https://github.com/agent-teams-ai/extension-foundation/blob/cc07959309f65ab2401f838c982911743075fe1e/docs/research/evidence/live-module-contracts-results-20261123.tar.gz
[results-manifest]: https://github.com/agent-teams-ai/extension-foundation/blob/cc07959309f65ab2401f838c982911743075fe1e/docs/research/evidence/live-module-contracts-results-20261123.manifest.json
