# Live Module Updates

Controlled replacement of application modules and plugins while an application
continues serving useful work.

The project is being designed as a portable TypeScript library. Its central
operation will plan and prepare an update, coordinate authoritative switching,
reconcile uncertainty, manage supported continuity and report remaining cleanup.
Applications supply narrow authorization and state primitives. Existing loaders,
composition systems, resource scopes and executors retain their responsibilities.

## Current status

**Research and proposed specification. No public production package or accepted
public API is delivered by this packet.** Ordinary TypeScript implementations
are the confirmed first direction. Native Effect, isolated execution and
Wasm/Extism are separate candidate profiles. Module Federation, Piral,
Native Federation and OpenComponents are considered at their actual delivery,
loading and contribution boundaries.

The bounded Piral/Resources and Effect campaign completed successfully: three
declared tests, six named cases and 66 explicit comparisons, with both official
artifacts delivered and independently reviewed. [Validation](docs/research/validation.md)
records the exact executed inputs, earlier delivery failures and scope. This
packet contains no production-library implementation; the complete consumer
operation and comparison with ready stacks remain unqualified.

This is a prepared standalone repository directory. The GitHub destination has
not been created or admitted through this work. The creation capability was
rechecked on November 23 at 16:39 UTC. See
[bootstrap status](BOOTSTRAP.md) for the observed limitation and the official
continuation route. Do not infer release or runtime qualification from the
directory name, an archive, or a package installation.

## Read by responsibility

| Question | Entry |
| --- | --- |
| Complete operation, ports and failure outcomes | [Operation proposal](docs/architecture/operation.md) |
| Module authoring, ownership and upstream changes | [Architecture review](docs/architecture/cross-repository-review.md) |
| What established implementations do well and where guarantees stop | [Industry register](docs/research/industry-patterns.md) |
| Ready stacks and the proposed common application comparison | [Existing stack comparison](https://github.com/agent-teams-ai/extension-foundation/blob/f285333c5869b1f69070efee29b205da8fd19e49/docs/research/live-update-ready-stack-comparison-2026-11-23.md) |
| Exact experiment inputs, results and limits | [Validation](docs/research/validation.md) |
| Unresolved product/profile choices | [Open decisions](docs/decisions/open-decisions.md) |
| Original material and transfer identities | [Provenance](provenance/README.md) |
| Immutable historical and campaign packets | [Source registry](history/SOURCES.json) |
| Organization bootstrap and external consumer independence | [Bootstrap](BOOTSTRAP.md) |

The design supports eligible built-in features as well as independently
distributed plugins. The replacement boundary, shared dependencies, state
ownership and supported fallback are explicit. An ordinary external consumer
will not require Agent Teams catalog credentials, a particular database or
mandatory Effect.

## Implementation discipline

Start with one substantive operation feature and a real consumer. Extract
packages where dependency, release or ownership evidence warrants them. Do not
copy an upstream private lifecycle kernel, build another module resolver, or
make every consumer reconstruct the update state machine.

Public Resources already supplies cooperative cleanup. Profiles promising atomic
invocation admission and generation custody need a separately qualified public
mechanism. That availability gap remains explicit in the design.

The retained historical research is stored as separate immutable packets. New
findings refine current proposals without rewriting old results or treating
source inspection as native execution. The packet manifest identifies every
file; it is a transfer inventory, not repository admission evidence.

Transferred project material retains the existing Apache-2.0 license. Original
third-party notices remain with their historical archives and experiment
evidence. No dependency, browser or compiler binary is a production deliverable.
