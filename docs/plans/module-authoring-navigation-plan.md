# Modular authoring navigation

Date: 2026-11-26. Status: revised plan for the second review, before edits.

## Goal and scope

Help module authors and agents reach the maintained, executable reference from
the existing LMU, Get Modular and organization entry points. Keep the reference
beside its packing, qualification and evidence owner in LMU.

| Repository | Existing document | Change |
| --- | --- | --- |
| Live Module Updates | `AGENTS.md` | Direct authoring route to the maintained reference and its bounded TEST scope |
| Live Module Updates | `docs/README.md` | Task-oriented row with the maintained example before the original implementation plan |
| Get Modular | `docs/guides/consumer-quickstart.md` | Maintained reference URL on `main`; retain and label the original immutable implementation-plan URL |
| Organization `.github` | `docs/architecture/ecosystem-vision.md` | Short direct authoring pointer in the existing shared-module section |

This plan is the only new document. No code moves or copies, new guide, runtime,
package, dependency, workflow, accepted standard, consumer pin or release change.
The reference remains private TEST packages, independent Node/Chromium Hosts and
controlled restart. A navigation link does not establish production adoption or
automatic agent discovery in repositories without their own instruction route.
The new pointers preserve the authority of each consumer's accepted CMS/FMS and
local adoption profile. Label the retained GM plan as the original plan and its
scope as historical; its original revision does not include later fixes.

## Delivery

1. Publish this plan in a Draft LMU PR before editing guidance.
2. Run two independent review rounds; correct the plan between them as needed.
3. Edit only the four documents above, preserving their owning metadata.
4. Publish each commit immediately; use one scoped Draft PR per repository and
   link this shared plan from the two companion PRs.
5. Review the exact diffs, resolve findings, run applicable checks and perform
   ordinary expected-head squash merges. Verify the actual merged documents,
   attribution and applicable postmerge checks.

## Verification

- Check destinations and headings for every changed link and follow each entry
  point through to the maintained reference and its accepted-rule links.
- Keep immutable evidence and original plan URLs intact; `main` is current
  navigation, not a reviewed consumer contract or evidence pin.
- Confirm changed-file allowlists and unchanged code, packages and workflows.
- Use Get Modular's installed Docs authoring/profile route and scoped docs gate;
  retain the organization repository's existing required checks.
  Inspect the normal postmerge workflows, including GM's automatic main matrix;
  do not change workflow selection to reduce this documentation task's checks.
- LMU has no installed managed Docs route. Use focused Markdown/link review and
  any applicable emitted checks; do not add tooling or trigger native fixtures
  solely for these prose edits.
- Inspect current PR/head/base, complete source identities and review findings
  before merge. Do not relax repository protection or treat queued checks as pass.

## Estimate and review record

Production/integration code: 0 LOC. Tests/fixtures: 0 LOC. Existing-document
edits: approximately 15-25 lines, plus this short plan. Complexity 1/10,
expected reliability for navigation 9/10, confidence 9/10; judgment, not a
runtime qualification or delivery-time guarantee.

- Round 1: three independent reviewers found no blocker. Clarified the accepted
  CMS/FMS authority, historical plan wording and normal postmerge check selection.
- Round 2: pending.
- Delivery: pending; exact PR/check receipts belong in the PR descriptions.
