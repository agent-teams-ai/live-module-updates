# Transfer provenance

This is a new current proposal directory prepared from the Extension Foundation
research branch. Current architecture and validation are read through the root
README. Historical reports are not overlaid onto current files.

The earlier 532-file base, 167-file Federation supplement and two November 23
audit packets remain separate, immutable evidence in Extension Foundation.
Six additional design/campaign packets preserve preparation, failed delivery,
workflow validation failure and final results. [SOURCES.json](../history/SOURCES.json)
records each exact source commit, path, size and SHA-256. The four historical
entries retain their original values; the six new entries resolve at
`cc07959309f65ab2401f838c982911743075fe1e`. This transfer carries references,
not duplicate binary archives. Obtain each packet and its manifest at its
recorded revision, preserving names, internal inventories and notices.

This arrangement preserves the actual earlier failures, corrections and source
observations without turning them into new runtime results. An archived workflow
is evidence, not a workflow to activate in a new repository.

The publication and execution identities remain distinct:

| Checkpoint | Role |
| --- | --- |
| `f40968f88a1fd29bea3dfcf207bab56e32b90e0d` | Published the detailed design/review and frozen native input; its native run passed tests but failed artifact delivery |
| `3b511d2a75829169c011baf3c114ec62c8c254b3` | First delivery correction; workflow validation failed with zero jobs and tests |
| `b86e05988334f657d933fa412a02572b455dcd7e` | Corrected workflow actually executed run 45208310980 successfully, with both artifacts delivered |
| `cc07959309f65ab2401f838c982911743075fe1e` | Published the durable final result packet and current governed validation |
| Current standalone transfer | Updates this projection and its evidence routes; its publication identity belongs to the containing Git commit and external manifest |

No later result or transfer commit becomes the head of an earlier native run.
The result packet retains `industry/NATIVE-RESULT-REVIEW.md`, its exact input
ledger, root verification and the official ZIPs. Read
[validation](../docs/research/validation.md) for its observed results and limits.

The external transfer manifest hashes every current packet member and records
the historical dependencies. It is a content inventory. It does not provide
FMS conformance, public API acceptance, a released package or remote admission.

Current file roles:

- `docs/architecture/operation.md`: proposed current operation contract;
  repository-relative source links point to the immutable published checkpoint.
- `docs/architecture/cross-repository-review.md`: source-pinned responsibility
  analysis, kept as a full supporting review.
- `docs/research/industry-patterns.md`: source findings and proposed transfers,
  with scope and cohort distinctions preserved.
- `docs/research/validation.md`: actual preparation/native results and limits.
- `docs/decisions/open-decisions.md`: discussion projection of Q1-Q7; it does
  not resolve or replace the source owner record.

## Retained source paths and checkpoint meanings

The source reports and machine ledgers retain their original identities. Their
paths map into this directory as follows:

| Original source | Current standalone copy |
| --- | --- |
| Architecture lane `REPORT.md`, named by its findings ledger | [docs/architecture/cross-repository-review.md](../docs/architecture/cross-repository-review.md) |
| Industry lane `REPORT.md` | [docs/research/industry-patterns.md](../docs/research/industry-patterns.md) |
| Industry `SPIKE-BRIEF.md` mentioned by its report | `industry/SPIKE-BRIEF.md` in the immutable [design-review packet](https://github.com/agent-teams-ai/extension-foundation/blob/f40968f88a1fd29bea3dfcf207bab56e32b90e0d/docs/research/evidence/live-module-design-review-20261123.tar.gz) |

The copied findings and source ledgers preserve their original bytes, including
historical `local_path` metadata. Those paths record where evidence was read;
they are not portable dependencies of this directory. Use the ledgers' exact
repository revisions and source URLs to retrieve that evidence.

Their source-only, proposed and pending statements describe the preparation
lane and time at which those reports were written. The current validation page
records the subsequently executed campaign. This does not reclassify a historical
source finding as native evidence or change its ledger identity.

The current architecture report copy has one subsequent wording correction:
the planner consumes Get Modular **inside the standalone library**; application
business code does not own that planner. Its original ledger report hash refers
to the unedited report in the immutable design-review packet, not this clarified
copy. The transfer manifest records the current copy's hash. No source finding,
owner decision or original archive was rewritten.

[previous-pr-checkpoint.md](previous-pr-checkpoint.md) is the verbatim historical
Extension Foundation checkpoint at
`f285333c5869b1f69070efee29b205da8fd19e49`. Its current-checkpoint heading,
readiness estimates, validation counts and PR status describe that source
checkpoint, not the present standalone project.

[root-review-dispositions.md](root-review-dispositions.md) records preparation
review of the original workflow before native execution. Its workflow SHA-256 is
`8135d6092a78d434fa10172f989bc890429b37ac7c7a5219b13244edd149d1ae`.
Read [validation](../docs/research/validation.md) for current execution and
delivery status. A retained preparation review does not supply a later native
result.

## Current projection changes

The interrupted preparation's native-pending page has been replaced by the
observed bounded outcomes, preserved failure history and exact delivery
identities. The source registry now includes all six campaign/design packets.
README and history navigation point to that evidence; bootstrap records the
rechecked creation limitation on November 23 at 16:39 UTC. The operation,
source reports, findings ledgers, accepted decisions and dependency pins were
not changed by this finalization. Its content manifest binds the current bytes.

The existing Apache-2.0 project license is retained. Third-party notices remain
with each historical or experiment packet. Runtime dependencies and their
generated outputs are not reclassified as authored production code.
