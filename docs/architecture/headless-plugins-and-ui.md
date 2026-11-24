# Headless plugins and optional declarative UI

Status: proposed architecture and research plan, 2026-11-24. The owner's direction
is reusable headless plugins across applications, custom presentation and the
ability to declare Headless UI. This document gives that direction precise
boundaries; it does not publish a plugin SDK, select a UI protocol/framework or
qualify any renderer, sandbox or live-update profile.

The owner's later 2026-11-24 clarification requires foundation qualification
through representative fixtures and independent test Hosts before applications.
Browser, desktop and untrusted third-party extensions are confirmed targets,
not optional requirements to rediscover from a first product. Their boundaries
belong in the design now; support is established separately for each tested
runtime, presentation and trust profile.

Read [application foundation](application-foundation.md) for the static starting
path, [delivery plan](../plans/foundation-delivery-plan.md) for acceptance and
[open decisions](../decisions/open-decisions.md) for choices still requiring a
profile owner. A test Host can own a qualification profile before a product
exists. New products live in their owning organization repositories;
legacy behavior is reference material, not the default integration target.

## 1. Three related capabilities

| Capability | Intended meaning | What is not established merely by the name |
| --- | --- | --- |
| Headless module | Useful behavior with explicit ports, independent of a particular application's UI and composition registration | Independent installation, security isolation or cross-process serialization |
| Headless plugin | A supported executable contribution whose useful behavior can be connected to compatible Hosts through a declared contract and adapters | One artifact works in every application, runtime or permission model |
| Optional declarative Headless UI | Renderer-neutral presentation/interaction intent that a compatible Host can realize with its own controls | An accepted universal UI DSL, automatic adoption of a similarly named library, or permission to execute arbitrary submitted code |

UI-independent business behavior and unstyled interactive widget behavior are
also different concerns. A headless widget can still depend on DOM semantics.
A declarative surface can still require a particular vocabulary and renderer.
Each profile needs its own portability claim and evidence.

## 2. Keep one portable behavior owner

The same behavior should be usable as an ordinary library, through a GM
composition adapter, and eventually through an admitted plugin envelope when
independent installation/release is useful. The implementation is not copied
between those forms. Package boundaries follow demonstrated dependency,
release, deployment and reuse needs; these roles do not require six packages.

| Role | Owns | Dependency rule |
| --- | --- | --- |
| Behavior core | Domain/application behavior and consumer-needed ports | No mandatory React/DOM/Electron, GM registration types, product SDK, catalog or organization credentials |
| Public capability contract | Semantic operations, result/error meaning and compatibility revisions | Stable meaning under its actual contract owner; no arbitrary service locator |
| Product adapter | Mapping from product infrastructure and authority to narrow behavior ports | Concrete storage, transport and credentials stay outside the core |
| GM composition adapter | Existing declaration, binding, factory and resource wiring | Follow the consumer's adopted CMS, including composition-only GM imports |
| Optional UI contribution | Supported presentation and interaction contract | Keep framework rendering and UI dependencies out of the portable behavior/declarations |
| Plugin artifact envelope | Identity, required capabilities, compatibility and installation facts | Reuse applicable EF obligations; requests never grant their own permissions |

The [GM CMS](https://github.com/agent-teams-ai/get-modular/blob/850bac5fd02fa5697846cc8958ac447d5c2ee7bb/docs/architecture/common-assembly.md)
and [EF extension model](https://github.com/agent-teams-ai/extension-foundation/blob/70f2bf21203b557e0f5a3b563a6b41eec5925fd8/docs/architecture/extension-model.md)
already provide the ownership boundaries. The proposed GM-first reference path
uses GM at outer composition. External consumers of the ordinary core need not
install a GM-specific adapter. Do not implement a parallel resolver to demonstrate
that independence. A wrapper which imports GM is honestly a GM-specific wrapper.

### Built-in and separately installed forms

Where their semantic contract is the same, a built-in implementation and an
external plugin should be testable against the same capability suite. Their
loading, trust, authority and stop requirements may differ. The fact that a
built-in uses trusted in-process construction must not admit a third-party
artifact under that trust assumption.

An integration bundle may contain several related contributions and different
target adapters. The product can admit supported capabilities individually under
the actual contract. A manifest can be inspected without evaluating candidate
code. Do not make a successful import the mechanism for discovering whether
untrusted code was allowed to run.

## 3. Portability is a contract between independently wired Hosts

For a reusable capability, name two independently wired test Hosts, the useful
outcome in each, their supported contract versions and differences in runtime,
data and authority. Purpose-built Hosts are valid foundation evidence; a first
product is not required. Use distinct entry/composition, adapter and owner
state/lifetime paths. Two scopes or configurations of the same Host builder are
useful isolation/composition evidence, not automatically independent reuse.

Apply the following rows to the declared claim. Pure local behavior does not
need invented capability negotiation, transport or cancellation methods merely
to satisfy this review table; qualify those semantics when the profile promises
them.

| Boundary | Agreement required | Negative control |
| --- | --- | --- |
| Meaning | Operations have the same business or technical meaning | Same-shaped data with different units, ordering or failure semantics is rejected or explicitly mapped |
| Version | Each required capability revision is actually supported | Unknown/incompatible revision fails before the unsupported operation runs |
| Authority | Host grants the exact required operation in the current context | Declared permission, signature or UI visibility cannot authorize a forbidden effect |
| State | Owner, namespace, schema, export and removal meaning are explicit | Uninstalling a plugin does not silently delete another product's canonical data |
| Lifetime | Ownership, borrowing, cancellation, drain and cleanup agree | Dependent failure does not close the shared provider's lifetime |
| Runtime | Actual APIs and physical identity assumptions are supported | Browser entry cannot import Node-only APIs; foreign opaque handles are not accepted by structural resemblance |
| Distribution | Public exports and declaration closure are independently consumable | Missing optional UI/framework packages do not prevent loading the headless entry |

Do not force transport serialization into every local function call. When a
selected deployment crosses a process/language boundary, define a real wire
contract for data, errors, cancellation and stream backpressure. Functions,
closures and local scope/entry identities are not automatically wire values.
An adapter preserves meaning; it cannot manufacture unsupported guarantees.

A bounded portability proof can use two independent Node test Hosts. It does
not qualify browser or desktop support, and it does not remove those confirmed
targets from the initial architecture. For browser execution, load and exercise
the same built artifact in a real browser realm. Serving a UI which calls a Node
backend qualifies only the observed transport/UI path. The
[qualification matrix](../research/foundation-qualification-matrix.md) keeps the
runtime rows and exact evidence separate.

| Confirmed target | Boundary required from the start | Native evidence still required |
| --- | --- | --- |
| Browser | Portable public declarations, browser-local loading/storage and no accidental Node/privileged shell dependency | Actual artifact execution, supported APIs, cancellation/cleanup and chosen browser identities |
| Desktop | Renderer, privileged main/native owner and versioned IPC separated; authority checked by the actual privileged receiver | Selected real shell/OS, resource ownership, malformed/denied IPC and shutdown/recovery |
| Untrusted third-party plugin | Admission before evaluation, narrow grants, no ambient authority through a generic context, enforceable containment/stop boundary | Actual adversarial file/network/IPC/resource/escape controls and observed termination under the chosen mechanism |

Process or Worker placement alone is not containment. Qualification may reject
an unsupported combination without changing the portable behavior contract.
No arbitrary-code evaluator, universal IPC interface or global grant service
is justified merely by planning these targets.

## 4. Define optional UI intent without creating a universal renderer

The initial research should compare three approaches on one representative
interaction, without waiting for a product:

| Approach | Useful when | Cost or limiting condition |
| --- | --- | --- |
| Host renders an existing capability with its own UI | Behavior reuse is the immediate need; products deliberately own their UX | Presentation work remains per Host; does not demonstrate portable UI declarations |
| Small supported semantic UI vocabulary, mapped to Host controls | A plugin needs portable commands, fields, results or selection while Hosts retain design/accessibility | Must define capability negotiation, action meaning, state ownership and unsupported controls; reuse a suitable existing protocol if it fits |
| Separately delivered custom UI contribution | A specialized interaction cannot be expressed by supported Host controls | Stronger framework/runtime, trust, asset and lifecycle coupling; qualify this as its own profile |

The proposed first comparison uses ordinary Host rendering plus the smallest
semantic contribution needed by the representative interaction. It does not accept a new
JSON schema, compiler, expression language, renderer registry or SDK. The
question is whether an existing contract or a small product-owned extension
point suffices; extract a shared public surface only with actual reuse evidence
and its owning admission. Reuse an established widget library where it fits the
selected renderer; native controls remain valid for a simple fixture. Keep
framework/widget/state-machine types behind the UI adapter rather than in the
portable behavior contract. Unstyled, framework-neutral, DOM-neutral and
process-neutral describe different boundaries.

### Facts a semantic UI contribution would need

These are review questions, not proposed wire field names:

- Which capability and supported revision does the interaction represent?
- Which inputs, results, labels and validation facts are semantic, and which
  layout/styling choices remain local to the Host?
- Which actions are supported, and how does the Host authorize and invoke each
  action through the same product authority as other callers?
- Which product owner retains drafts, selection/history and pending intent?
- What does the Host advertise about supported controls and protocol revisions?
- What happens before effects when a required control or capability is absent?
- How are stale results, repeated actions, cancellation and errors represented
  without equating a view generation to the original command identity?

Unsupported required UI must produce an explicit incompatibility result or a
documented, semantically adequate alternative. Optional contributions can be
omitted only when their contract permits it and the Host communicates the
result. Never silently turn a required confirmation or permission boundary into
a label, default value or hidden action merely to render something.

### Host responsibilities remain substantive

The Host selects its approved renderer components and enforces resource limits,
capabilities and current permissions. It owns the design system, localization,
keyboard/focus behavior, accessibility semantics and integration with actual
product state. Untrusted content, URLs and action parameters require validation
at their real boundaries. A valid schema is not proof of accessible interaction
or permission to run a command.

A plugin may propose UI, but the Host may refuse it. Agent-generated declarations
receive the same validation and authorization as other external input. Generated
code and tests cannot approve their own activation. Reuse existing review,
artifact-trust and product authorization owners.

## 5. Prior art used for this distinction

The following are source observations accessed on 2026-11-24, not dependencies
selected or natively executed by this consolidation:

| Primary source | Relevant mechanism | Scope limit for our design |
| --- | --- | --- |
| [Zag introduction](https://www.zagjs.com/overview/introduction) | Unstyled, framework-independent interaction machines with framework adapters and accessibility behavior | Reusable widget behavior does not define our plugin capability, domain state or installation authority |
| [A2UI catalogs](https://a2ui.org/concepts/components/) and [overview](https://a2ui.org/concepts/overview/) | An agreed component/function vocabulary maps declarative messages to native Host widgets and actions | A candidate protocol to compare; actual version, renderer, semantics and trust boundaries need qualification before adoption |
| [Backstage services](https://backstage.io/docs/backend-system/architecture/services/) | Declared service interfaces are separate from selected implementations | Useful dependency discipline; its backend plugin conventions are not our accepted public SPI |
| [VS Code extension hosts](https://code.visualstudio.com/api/advanced-topics/extension-host) | Local/remote Node and browser hosts have distinct execution capabilities | A portable contribution requires explicit placement/runtime support rather than UI independence alone |
| [WIT reference](https://component-model.bytecodealliance.org/design/wit.html) | Named interfaces and worlds define component contracts | Potential later language boundary; it does not specify our behavior, state migration or update protocol |

Keep exact versioned sources and native results in the eventual selected
profile's qualification packet. Do not copy an upstream protocol into a new
organization DSL or call source inspection implementation evidence.

## 6. State-preserving change and UI continuity

The headless boundary should expose useful semantic state without serializing
arbitrary implementation objects. Keep the actual owner of drafts and canonical
data independent of a replaceable view where the product requires continuity.
The chosen profile must state whether it preserves only data, also interaction
state, or ongoing work. These promises have different acceptance tests.

The [browser/HTTP study](../research/cross-tier-version-skew-2026-11-23.md)
demonstrated old-client incompatibility, lazy-asset loss, stale completion and
uncertain acknowledgement in a bounded fixture. Its positive controls retained
the selected draft/focus/selection observations and original command receipt.
It did not qualify React, Electron IPC, an entire editor or arbitrary UI state.

For an actual UI qualification profile, observe dirty input, focus, selection and the additional
interaction state actually promised, including composition/IME or undo history
where relevant. Test a late result from the old view against the real state
owner. Preserve compatible assets for legitimately retained clients. A changed
renderer can require remount or controlled restart; report that honestly.

## 7. Trust, installation and removal

Select the trust boundary before enabling execution. A cooperative same-process
profile may use supported GM/Resources mechanisms. Untrusted or adversarial
code requires an explicit execution/enforcement boundary in the initial
architecture and separate native qualification before running it under that
claim. Its existence is a confirmed requirement; its exact mechanism is not
selected here. Third-party provenance alone does not select trust: any trusted
third-party dependency still needs explicit admission under that profile.
Node's [VM documentation](https://nodejs.org/api/vm.html) explicitly
does not offer `node:vm` as a security mechanism for untrusted code.

Keep artifact digest/provenance, installation identity, compatibility, requested
capabilities, current grants and runtime enforcement distinct. Applicable EF
admission checks precede evaluation. A live-update coordinator does not acquire
catalog ownership or a universal permission system by coordinating activation.

Disable, stop, uninstall and delete data are separate product operations. Define
what is retained for recovery, history and old clients, and which owner can
release each hold. A retained old stream, failed cleanup or compatible UI asset
can outlive the new version's usefulness. Storage limits may require defer/refuse
or an explicitly supported fallback; they do not prove old work has stopped.

## 8. Acceptance before calling a capability portable

The [delivery plan](../plans/foundation-delivery-plan.md) orders the work. A
portable headless claim needs the same built package in two independently wired
test Host integrations, independent behavior expectations, no copied business
logic, and negative cases relevant to its declared contract. These include
missing capabilities, incompatible revisions, revoked authority, partial setup
and lifetime ownership where applicable. Inspect emitted declarations
as well as runtime loading without optional UI dependencies installed. Expected
receipts/effects must not be calculated by the production admission/reducer
being tested. Observe concrete state, listener, file or work witnesses after
reset and preserve failing controls. A qualified fixture is not automatically
a product adoption or public package release.

This two-Host reuse claim is distinct from EF's public plugin-SPI gate, which
requires its own semantic contract, independent implementations and conformance
evidence. Two adapters that both call one shared behavior implementation cannot
be counted as two independently authored implementations of the same SPI or as stable-SPI
qualification. Each claim follows its actual owning gate.

A portable UI claim additionally needs two actual supported renderers or Host
presentations exercising the declared interaction, accessible operation and
unsupported-contribution behavior. A CLI and backend can qualify headless
behavior without qualifying UI. A successful mount is not the useful-outcome
oracle. Record integration effort and unavoidable Host glue as well as success.

Remaining choices belong in [the decision register](../decisions/open-decisions.md):
representative fixture contract, exact trust/runtime profile, semantic UI scope
and qualification path. Whether browser/desktop/untrusted targets exist is
already settled; their guarantees and implementation choices remain scoped.
Technical alternatives should be compared with rejecting examples before an
owner is asked to choose a public contract. None of these proposals starts a
production implementation or migrates an existing product pin.
