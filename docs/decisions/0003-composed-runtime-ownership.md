# ADR-0003: current ownership for a GM-owned LMU runtime

Status: selected after Programme C's native C2 discriminator, 2026-11-27.
Implementation and qualification follow C3; this decision alone is not support
evidence. The cooperative execution profile and ADR-0002 remain unchanged.

## Evidence and scope

A concrete application GM module owns one LMU runtime and provides only its
application invocation capability. Actual Resources/file-descriptor experiments
showed that detached generation scopes and an explicit Host shutdown cutoff
preserve already-admitted work. They also demonstrated two missing observations:

- A successful explicit native cleanup retry does not rewrite the original
  incomplete runtime close report. A parent cleanup callback consulting only
  that report cannot truthfully discharge its debt.
- A genuine publication receipt may resolve uncertainty while an overlapping
  original publish or lookup still uses borrowed Host infrastructure. Logical
  `pendingPublication` alone therefore cannot establish external completion.

The [review record](../reviews/composed-module-adoption-2026-11-27.md) links the
unaltered native observations and independent critique. This corrects the
existing coordinator; it does not introduce another execution profile.

## Decision

Add `RuntimeSnapshot.ownershipReleased`, one current observation computed by the
existing coordinator. It is true only after admission is closed, admitted work
has finished, preparation and publication uncertainty have ended, every actual
authority call has settled, and every captured owner has released its custody.
That includes unregistered preparation custody and invalid native report paths.
Zero registered generations or a terminal receipt alone is insufficient.

The observation relies on the existing captured cleanup reports. It does not
independently prove physical release. A native owner that cannot prove settlement
keeps custody; no timeout or observer cancellation fabricates success. The
original `close()` Promise and its complete/incomplete result remain immutable.
A later successful explicit retry may change the current observation only.

Track the original publication response with one per-attempt pending flag, set
before calling the external port and cleared only after the real synchronous
throw or Promise success/failure has been processed. Always refresh after
clearing it, including terminal-result, malformed-result and error paths.
Reuse the existing reconciliation flight for the actual lookup; refresh after
clearing it. Original runtime close waits for those actual flights, but still
returns an incomplete report when native debt has settled incompletely.

The current predicate is shared by `inspect()` and close-result construction.
The existing `UpdateHold` diagnostics gain `authority` for an actual publication
response or lookup still in flight; `publication` keeps its distinct meaning of
unresolved outcome. `UpdateHandle.completion` retains its existing logical
terminal meaning and may contain an `authority` hold; it does not wait for that
transport observation. Whole-runtime close and current ownership do wait.
No global counter, cleanup registry, replacement attempt,
automatic retry, public raw-Promise API or second retirement state machine.
Generation retirement remains driven by the genuine terminal outcome and work;
whole-Host completion separately preserves still-borrowed authority ports.

## Composition and initial transfer

Keep the concrete owner-defined GM module in the reference consumer. A small
native Resources setup cell owns initial preparation before evaluation. It
transfers responsibility only after runtime construction succeeds, and retains
the original owner across factory failure, cancellation and late completion.
Generation scopes and still-borrowed infrastructure are outside the parent tree
whose abort would invalidate them. The Host seals LMU before closing that parent.

The Resources cleanup callback awaits the original runtime close and consults
the current `ownershipReleased` fact. It throws if ownership remains, allowing
the existing Resources debt and explicit retry mechanism to retain responsibility.
This is a few lines of application composition. It does not justify a generic
public prepare/run wrapper, universal LMU descriptor or new adapter package.

## Required qualification

Promote both native overlap counterexamples into rejecting regressions: after
close begins, a real asynchronous native probe observes released generation
resources but retained authority ownership and an unsettled parent close. Resume
the same original authority call; its actual final native use must precede
successful parent completion. Preserve the pre-fix observations as history.

Also qualify current versus original close after explicit cleanup recovery,
unregistered custody, malformed reports, abandon-only native observations,
pending preparation, admitted descendants and unchanged refusal after cutoff.
Existing installed-root, optional Resources, Node/Chromium complete-operation
and signed-EF scenarios continue through their native routes. No upstream GM/EF
change, product admission or public release is authorized by this decision.
