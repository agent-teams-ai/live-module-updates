# Physical package identity and semantic-cohort discriminator

Follow-up to hosted P1-P4. Research-only: real public GM packages and same
exact previously resolved lock, not an implementation of the missing public
lifecycle-kernel. Inputs for this follow-up remain separate from the original
run b2c7ab1e46e4ebe608be31bae686d28657da9877.

P5: byte-copy the installed Resources package to a distinct physical package
root. Prove both cross-copy scopes reject before body execution and own-copy
controls succeed. P6: byte-copy Assembly, with the same original Core
dependency. Prove equivalent declarations are not equivalent authenticated
entries: prepare with foreign entry rejects, both own-copy controls run.
P7: a tiny intentional vm syntax fixture returns a foreign native Promise.
Factory body runs before unsupported-carrier rejection, and a test-owned
deferred continuation still executes. Distinguish this from failure before
factory execution. P8: actual Assembly borrowed provider, one mutable
semantic revision, two old operations with repeated versus retained reads.
Contrast A/B mixed result with A/A retained result and B/B successor.

The physical copies are deliberate negative-test inputs copied after
frozen install; no alias resolution, production dependency or private
package import. Record realpaths, complete file-hash inventory and distinct
runtime roots. Strict TypeScript 7.0.2 checks both source and public
declarations; the vm snippet is an intentionally foreign-realm syntax
fixture. The explicit runtime misuse boundary uses Reflect.apply; P7's
structural Promise assertion describes a deliberately invalid runtime
carrier, not a supported bridge.

Review: current GM entry-store/group-collection use per-copy WeakMaps;
Resources openModule checks package-local membership; Assembly invokes
factory before observing returned carrier. Verify negative and positive
controls independently. No external effects or user project use. The
mutable provider example declares that both reads belong to one logical
snapshot; mutable state in a real provider is not automatically wrong.
No claim about all module systems, arbitrary vm isolation or automatic
unload. Original tests P1-P4 remain earlier evidence; only P5-P8 count
as distinct new coverage. Estimated ~190 test-only TS LOC, 0 production.
