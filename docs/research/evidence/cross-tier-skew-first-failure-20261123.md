# Initial cross-tier run — preserved failure

- Head: feb3927d320fe905bd3f712a46f7458c0107db4e
- [Run 45257881795](https://github.com/agent-teams-ai/live-module-updates/actions/runs/45257881795), job 137984392452, attempt 1: FAILURE, native tests 3 pass / 1 fail.
- Artifact 14858538535: 23,361 bytes, SHA-256 3eb0e049c29e2099d01fde683428af83bedd6131a1a962f57f481ac94efc4855.
- Downloaded ZIP integrity, recorded input/emitted-browser hashes, and Git source blobs independently checked. Original workflow inputs and source remain at the exact head above.
- Initial lock 8,576 bytes; SHA-256 c70e5d8e78d46a37a623729838b19215fc63b514a728684d419924900bedae2a; Git blob 81dd5c23f26ce17ff857c30e4828a14e7b11c824. The gzip committed under the fixture root contains exactly this lock, independently pinned by the amended workflow.

Observed native.log:

```
$ node --test skew.test.ts
✔ X1 actual old/new browser clients and incompatible/compatible backend paths (399.518831ms)
ℹ {"oldClient":"A","backend":"B","unversioned":"incompatible-response","oldCompatible":"B-via-v1","newCompatible":"B-via-v2"}
✔ X2 retained lazy assets serve both generations; premature removal breaks a real old tab (363.091346ms)
ℹ {"oldRetained":"A-lazy","new":"B-lazy","prematurelyRemoved":"unavailable","realAsset404":true}
✔ X3 real late A HTTP result, switched B view, and stable dirty input/focus (297.534404ms)
ℹ {"guarded":false,"lateResult":"A-late overwritten","preserved":{"draft":"unsaved draft","focus":"draft","start":2,"end":5,"sameDocument":true}}
ℹ {"guarded":true,"lateResult":"stale-ignored","preserved":{"draft":"unsaved draft","focus":"draft","start":2,"end":5,"sameDocument":true}}
✖ X4 actual HTTP lost reply, original command identity across backend switch, and grant refusal (10125.114887ms)
ℹ tests 4
ℹ suites 0
ℹ pass 3
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 15606.402391

✖ failing tests:

test at skew.test.ts:235:1
✖ X4 actual HTTP lost reply, original command identity across backend switch, and grant refusal (10125.114887ms)
  page.waitForFunction: Timeout 10000ms exceeded.
      at expectText (/home/runner/work/_temp/lmu-cross-tier/skew.test.ts:141:14)
      at TestContext.<anonymous> (/home/runner/work/_temp/lmu-cross-tier/skew.test.ts:241:11) {
    name: 'TimeoutError',
    log: []
  }
[ELIFECYCLE] Command failed with exit code 1.
```

Failure stays in history. No claim that a transport retry or product defect caused the timeout. The second fixture tests a deliberately incomplete application acknowledgement, not the initial reset itself.
