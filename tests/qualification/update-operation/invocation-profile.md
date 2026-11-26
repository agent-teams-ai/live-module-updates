# L1 invocation qualification

The owner packet is [the selected cooperative update profile](../../../docs/decisions/0001-cooperative-update-profile.md).
This directory is a **TEST-only discriminator**, not a second requirements ledger or an admitted package.

`candidate/invocation.ts` qualifies explicit operation-bound continuations in one cooperative JS agent.
A fresh call reads the Host's canonical head; nested and post-`await` continuation calls stay with their
already admitted generation. The fixture domain admits at most 16 total root and descendant records.
The original raw work and registered descendants settle before the original public Resources close.
An observer may abandon its wait; an explicit cleanup retry remains a different attempt.

`pnpm run qualify` compiles all TypeScript with the exact pinned compiler and runs the same compiled
candidate in Node and a native pinned Chromium realm. The browser uses its own native Storage authority;
it does not ask Node to simulate browser work. Artifact hashes, runtime versions, case outcomes and
expected negative-control witnesses are written to `.qualification/evidence/`. A missing browser is a
failed required check, not a skipped support claim.

The discriminators do not qualify streams, unregistered background work, hostile plugins, Desktop
physical resources, cross-process or cross-realm publication, or recovery after process loss. L1 proves
the invocation and native authority primitives only; the complete update coordinator still needs its
later phase qualifications.

The L1 candidate keeps its two fixture entries until the disposable fixture session ends. Bounded
multi-update retention, exact-instance registry removal and session identity history are L5 work;
this small discriminator does not claim to qualify them.
