# Historical and campaign evidence

[SOURCES.json](SOURCES.json) binds the immutable sibling packets in Extension
Foundation. They remain complete at their recorded Git revision. This current
archive contains their references, not duplicate binary archives.

The 532-file base and 167-file Federation supplement have different provenance
and must not be overlaid blindly. The two later audit packets preserve the
documentation/source review and independent corrections. Their manifests and
old native receipts remain historical evidence.

The registry preserves those four entries unchanged and adds six packets at
`cc07959309f65ab2401f838c982911743075fe1e`:

- The design plan and detailed design/review packets.
- The frozen 97-file native input and its dependency/source identities.
- Original upload failure and zero-job workflow-validation failure packets.
- The successful result packet with both official ZIPs and independent review.

The successful run executed on `b86e05988334f657d933fa412a02572b455dcd7e`.
The `cc079593` revision makes its evidence durable; it is not another execution.
[Current validation](../docs/research/validation.md) describes the three tests
and six cases without counting repeated attempts as additional coverage.

For a full offline checkout, obtain all ten recorded archives and their
adjacent manifests from each entry's pinned source revision alongside this
directory. Verify archive byte counts and SHA-256 against SOURCES.json, then
check the members against each packet's own manifest before using them. Do not
replace current architecture or activate old workflows merely by extracting a
historical packet. Source reports, failures, notices and original inventories
remain unchanged.
