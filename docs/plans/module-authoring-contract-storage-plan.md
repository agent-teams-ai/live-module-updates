# Modular authoring: complete feature contracts and early storage acquisition

Status: corrected after independent review round 1; awaiting round 2, 2026-11-26.
Maintained
implementation and regression edits have not started. This follows the
[completed construction/conformance review](module-authoring-critical-review-plan.md).

## 1. Outcome and limits

Remove two confirmed authoring hazards before the maintained reference is copied:
an incomplete feature contract map and Browser Host resource acquisition before
a potentially denied storage getter. Deliver one bounded LMU PR, preserve failing
evidence, qualify the actual packed consumer and native Chromium, obtain
independent review, merge through the ordinary route and verify actual-main CI.

This work changes the private fixture/reference and its qualification. It does
not create a production runtime, public SDK, new lifecycle owner, storage
fallback, retry policy, dependency cohort, lockfile change or npm release.
The Browser profile remains one live execution context with controlled restart;
clean refusal on an opaque origin does not admit opaque-origin execution.
Do not edit GM or Extension Foundation without a distinct reproduced defect.

## 2. Exact basis and discriminating findings

| Source | Inspected revision |
| --- | --- |
| Live Module Updates | `b5b54d7958022ecc4e631e538bd2eb2fe707a8af` |
| Get Modular | `a5f41853200aed26d692e89d768185013d629a12` |
| Extension Foundation | `312782a7a74515682a324dc0d89f43394ea1618d` |

The accepted [CMS complete-feature rule](https://github.com/agent-teams-ai/get-modular/blob/a5f41853200aed26d692e89d768185013d629a12/docs/architecture/common-assembly.md)
and [ADR-0041](https://github.com/agent-teams-ai/get-modular/blob/a5f41853200aed26d692e89d768185013d629a12/docs/decisions/0041-preserve-complete-feature-maps-with-descriptor-unions.md)
already apply. Their inspected blobs are respectively
`12ccc2fa8a6f267d1008bc6fec64a055923d7f78` and
`1c0060afb1ecbe6ab38289fa7c7969b73c7a97aa`.
This corrects compliance with an existing rule, not the consumer's source pins.

### A. Complete feature maps

Document and Format export capability interfaces but no complete descriptor
unions. Export combines the imported Document and Format descriptors in one
mapped base and omits DocumentState. A Host root that separately includes
DocumentCapabilities masks the missing transitive key.

A temporary strict TypeScript probe used the actual packed core and the
installed public GM types, without source path aliases or declaration shims:

| Probe | Observed result |
| --- | --- |
| Current Export map: complete keys, value and compatibility parity | Three TS2344 failures |
| Complete descriptor unions and separate capability bases | Compiles |
| Current map with an unused incompatible DocumentState in Format | Compiles; conflict is missed |
| Corrected map with the same unused conflict | TS2320 at ExportCapabilities for `fixture/document/state` |
| Complete union collapsed into one mapped base | Compiles; conflict is missed again |

Export complete `DocumentContracts`, `FormatContracts` and `ExportContracts`
unions. Export's union contains its own descriptors and both complete imported
unions. Its capability interface extends a separate `CapabilitiesOf` base for
each imported union and its own descriptors, as prescribed by CMS. Use type-only
imports. No new runtime exports, descriptor revisions or feature framework are
required. The existing root may continue composing complete feature interfaces.

The maintained compiler qualification must examine the independent feature
fragment, without the Host root. Qualify both the exported descriptor union and
the maintained capability interface; either can hide an omission in the other.
Split incompatible value and revision into separate cases; retain an identical
overlap positive case, independent union/interface omission controls and
collapsed-base controls. Reject unrelated compiler failures as evidence.

### B. Storage boundary before native acquisition

Browser Host appends owned DOM before its first `localStorage` access. If the
native getter is denied, failure cleanup reads it again before removing the DOM.
A temporary Node witness against the actual packed Host observed two getter
errors, replacement of the original cause, and one retained section. This is
source-level fault reproduction, not native-browser evidence.

The [HTML Web Storage specification](https://html.spec.whatwg.org/multipage/webstorage.html#the-localstorage-attribute)
allows the getter to throw SecurityError for an opaque origin or a policy denial;
a write can throw QuotaExceededError after a holder was obtained. Acquire the
holder before creating owned DOM and use that captured holder for subsequent
reads, writes and cleanup. Preserve existing single-flight disposal, Resources
ownership, finite invocation custody and unchanged cleanup reports.

Do not introduce a general cleanup aggregator or implicit retry. Native
implementations can still reject operations after a context is destroyed; this
plan does not claim that removeItem can never throw. Destroyed-context cleanup,
monkey-patched Storage failures and a second recovery manager are outside this
live-context profile and do not justify broadening the confirmed fix.

### C. Findings that do not justify changes

The public artifact cohort, optional adapter boundary and fresh GM/EF main
state did not produce an additional critical counterexample. Existing packed
consumption, conformance, signal custody and native release gates remain required.
Package publication remains deferred by the owner.

## 3. Execution plan

| Step | Deliverable | Acceptance |
| --- | --- | --- |
| P0 | Publish this Markdown plan and draft PR; conduct two independent critique/correction rounds | Both rounds recorded before maintained test or implementation edits |
| P1 | Add existing-interface parity and native denied-storage regression qualification | Preserve a published pre-fix source/run checkpoint that fails for the missing transitive map and native acquisition defect; missing new exports are not the intended failure |
| P2 | Complete feature unions and separate imported capability bases | Independent Export map is complete; unused conflicts are rejected at the correct declaration |
| P3 | Acquire and retain native storage before owned DOM | Native denial cannot leave an acquired Host resource or replace the original cause during cleanup |
| P4 | Qualify successful and failing storage boundaries, all existing cases and packed artifacts; update the owning guide/matrix | Strict compiler, Node and real pinned Chromium pass without skips or fake native evidence |
| P5 | Independent implementation review; exact-head CI; ordinary expected-head squash merge with a Conventional Commit subject | Verify author, message, tree, merged state and actual-main checks; record exact evidence in PR |

### Compiler qualification

- Compile disposable copies of the three actual contract source files against
  the installed packed core and public GM types. Do not mutate installed
  packages or introduce type shims, aliases or a consumer type framework.
- The pre-fix checkpoint checks the existing ExportCapabilities surface, so
  absence of a newly proposed export cannot masquerade as the original defect.
  After introducing complete unions, check exact keys, values and compatibility
  tokens of both ExportCapabilities and CapabilitiesOf<ExportContracts> against
  an independent complete expected map, and against each other. Include
  transitive DocumentState; derive neither expectation from the tested surface.
- Introduce unused value and revision conflicts in Format separately: revision
  1 with an incompatible value, and revision 2 with unchanged DocumentPort.
  Require TS2320 at ExportCapabilities, naming the two imported bases and
  conflicting key. Syntax, resolution, missing-export or unrelated errors fail
  the test rather than count as the intended rejection.
- An identical overlapping descriptor remains valid. Independently omit the
  transitive descriptor from the exported union and from the interface's
  inherited surface while the other remains complete; each must fail the
  intended parity assertion. Collapsing the separate bases makes each conflict
  compile, proving why that source rule matters.
- Use the existing strict TypeScript 7.0.2 qualification route. Include the
  maintained capability interfaces, not only a reconstructed example.

### Native Browser qualification

- Extend the existing pinned Chromium harness with a real opaque/sandboxed
  document. Serve the actual compiled Host and installed package ESM. If that
  origin requires test-only CORS headers, retain exact asset byte/hash checks.
- Require successful module loading before testing Host.open. Transparently
  observe the actual native storage getter: call the original getter, retain
  each native thrown object and rethrow it unchanged. Require one SecurityError
  and rejection identity equal to that first exception. Do not synthesize a
  storage failure or replace native storage semantics.
- Observe body insertions with the actual MutationObserver, and require no
  owned DOM insertion, no retained root, no provider construction and preserved
  unrelated DOM. This does not claim to detect every detached DOM allocation.
  Restore the observation wrapper in finally. Before Host invocation, require
  successful actual imports, isSecureContext === true and callable
  crypto.randomUUID: the old Host reaches UUID creation before storage. A
  loopback document with CSP sandbox allow-scripts and test-only CORS on
  unchanged assets is the initial native setup to qualify. Missing primitives,
  module loading or CORS failure cannot satisfy the regression. Preserve the
  failing pre-fix run.
- In a normal origin, use a bounded native-storage calibration to provoke a
  QuotaExceededError on the Host's initial write after obtaining a holder.
  Require no returned Host, no constructed provider, no retained owned DOM or
  owned keys, and unchanged unrelated storage. Calibration is setup for this
  browser, not a promise of a universal quota.
- Bound setup memory and iterations. Unsupported setup fails explicitly rather
  than skipping. Close contexts and test listeners in finally; remove only
  test-owned keys, never clear all storage. No DOM/storage fake qualifies native
  behavior.

## 4. Scope estimate and review risks

| Area | Estimated maintained change |
| --- | --- |
| Reference implementation | 25–65 added/changed lines |
| Qualification | 160–300 added lines |
| Documentation | 140–220 added/changed lines |
| Public runtime implementation | 0 lines |

Initial scores: architectural fit 9/10, expected reliability 8/10, implementation
complexity 4/10, confidence in the bounded choices 8/10. These are planning
judgments, not a production-readiness score.

The main risks are a Host-level map hiding an incomplete feature, accepting any
compiler error as the expected rejection, a module fetch failure masquerading as
a denied-storage result, and a quota setup that never reaches the Host failure.
Independent controls and native assertions must address those risks. Broaden
tests only to resolve a concrete remaining risk or a required repository gate.

## 5. Review and execution record

| Round / step | Review and resulting correction |
| --- | --- |
| Deeper audit | Three independent audits isolated the map and acquisition defects. Storage scope was narrowed from generic cleanup aggregation to early acquisition of the required native holder. |
| Plan review 1 | module_vision_review and npm_release_audit required independent union/interface parity and separate omission controls; the pre-fix compiler checkpoint must fail the existing map, not a missing new export. npm_release_audit required observable original native error identity. lifecycle_gap_review required actual import, secure-context and UUID preconditions. Corrections are incorporated; DOM acceptance now names observable insertion, not every detached allocation. No maintained implementation has started. |
| Plan review 2 | Pending; review the corrected plan before implementation. |
| Implementation and delivery | Not started. |
