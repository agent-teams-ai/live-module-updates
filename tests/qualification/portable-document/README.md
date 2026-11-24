# Packed headless document fixture

This maintained qualification fixture checks a useful ordinary-library seam
before an application exists: read a document revision, validate an edit, and
request an authorized conditional write. It is a test package, not a released
Live Module Updates or Extension Foundation implementation.

The portable core owns edit validation and use-case coordination. Each test
Host owns canonical state, the final grant/revision check, receipts and lifetime.
The core imports no renderer, DOM, Node, Get Modular or organization runtime.
Composition is qualified separately by Get Modular's public-package fixtures;
this test does not supply a second composition or update mechanism.

## Exact artifact through two real runtime boundaries

`pack-consumer.ts` compiles the core with strict TypeScript and ES-only libraries,
emits its public declarations, packs it with `npm pack`, and installs that tarball
offline into a fresh directory outside the source checkout. Package installation
disables lifecycle scripts. Node and browser consumers compile against the
installed public export and declarations, without source aliases or shims.
Compiler-only Node declarations come from the exact tool graph; the installed
fixture artifact has no runtime or peer dependencies.

The Node Host imports that installed package by name and uses an owned temporary
file. The independently wired browser Host imports the same package name through
an explicit import map and executes the installed ESM bytes in real Chromium.
It owns browser storage, DOM listeners and its grant switch. The test hashes the
actual browser module response and the Node-resolved installed entry and requires
the same recorded SHA256. It is not a browser frontend calling a Node copy.

## Cases and independent observations

| Case | Observable acceptance and rejection |
| --- | --- |
| Q1 | Isolated packed consumer and emitted declarations work; initial query, normalized accepted edit, stale revision, invalid edit and revoked grant match handwritten expectations. The actual file and receipt ledger contain exactly one accepted edit. Closing removes only the owned root, leaves a borrowed owner's file intact and prevents later operations. Fresh construction repeats from the initial state. |
| Q2 | The same artifact executes in Node then browser, and browser then Node, with fresh state ownership for each run. DOM actions, actual browser storage and the receipt ledger match independent expected outcomes. After close, another click cannot change the output or state. Contexts and the owned HTTP listener are closed. |
| Q3 | An intentionally unsafe compiled browser-adapter mutation omits the Save-listener removal. The Q2 lifetime oracle must reject it specifically because a post-close action is still handled. A closed/grant guard preventing writes cannot hide the leaked listener. Unrelated compilation, browser or transport errors do not count as the expected rejection. |

Repeated runs prove the specified reset/order controls, not additional unique
features. The expected results are handwritten in the test, rather than generated
from the core or Host transition logic. Receipts here are a bounded observation
of accepted writes, not a durable distributed acknowledgement protocol.

## Run and retained evidence

Use Node **24.22.3**, pnpm **11.25.0**, TypeScript **7.0.2**, `@types/node`
**24.19.1** and Playwright **1.65.1**. The frozen graph is the exact reviewed
cross-tier research cohort (lock SHA256
`c70e5d8e78d46a37a623729838b19215fc63b514a728684d419924900bedae2a`);
the historical source fixture remains unchanged. This reuse does not adopt a
production tooling profile or a new public package.

```sh
pnpm install --frozen-lockfile --ignore-scripts --engine-strict --strict-peer-dependencies
pnpm check
pnpm build
pnpm exec playwright install --with-deps chromium --only-shell
pnpm qualify
```

For a deliberately Node-only local check, use
`node --test --test-name-pattern=Q1 qualification.test.ts`. It does not establish
Q2/Q3 or browser qualification. The workflow
[portable-document-qualification.yml](../../../.github/workflows/portable-document-qualification.yml)
runs all cases on pull requests and main when this fixture changes. A failing
or queued workflow is not a successful qualification result.

The retained artifact contains exact source inputs, tool lock, compiler/runtime
versions, packed tarball, generated consumer lock, installed core/declarations,
independently compiled Hosts, browser build identity, native test log and observed
results. Browser contexts, temporary consumer/state directories and the HTTP
listener are owned by the test and closed on its normal success/failure paths.
No arbitrary sleep or test retry stands in for a lifecycle observation.

## Boundaries still requiring their own evidence

These Hosts are trusted, single-process/single-context test owners. The file
write is synchronous and has no crash-durability claim. A browser run uses a fresh
context/origin with one Host; it does not qualify concurrent tabs or multi-process
compare-and-swap. A browser grant switch does not contain malicious code.

Raw DOM interaction checks one presentation/lifetime path, not a headless UI
library, accessibility/focus conformance or a Desktop shell. Two independently
wired Hosts are not two independently authored plugin SPI implementations.
Plugin admission/install/remove, actual isolation, authority fencing across
processes, stream custody, live replacement and migration remain separate rows
in the [foundation delivery plan](../../../docs/plans/foundation-delivery-plan.md).
No product implementation is required to design and execute those additional
representative fixtures when their owning mechanism/profile is selected.
