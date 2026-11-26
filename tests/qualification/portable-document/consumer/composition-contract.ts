import assert from "node:assert/strict";
import {
  assemblyFor, declareModule, defineContract, group, implement, type CapabilitiesOf,
} from "@get-modular/assembly";
import {
  checkNamespaces, checkWiring, contractSuite, isolate, runContractSuite, type WiringOracle,
} from "@get-modular/conformance";
import { createScope, type SetupSpec } from "@get-modular/resources";
import type { ExportDeliveryPort, FormatPort } from "@fixture/portable-document";
import {
  documentComposition, prepareDocumentComposition, plainFormatProvider, markedFormatProvider,
  type FormatProvider, type PortableDocumentCapabilities,
} from "@fixture/portable-document-gm";
import { authorFormatProvider } from "./author-format.js";

type Definition = ReturnType<typeof documentComposition>;
const expectedFormat = defineContract<FormatPort>()({ id: "fixture/format", revision: 1 });
const complete = { complete: true, settled: true, debts: [] };

function declarationsOf(definition: Definition) {
  return [
    definition.roots.document.declaration, definition.roots.format.declaration,
    definition.roots.export.declaration, definition.inputs.state.declaration,
    definition.inputs.delivery.declaration,
  ];
}

/** Expected identities are handwritten test data, independent of selected entry metadata. */
function wiring(expectedFormatImplementation: string): WiringOracle {
  return {
    providers: {
      "fixture/document": "fixture/document/default",
      "fixture/document/state": "fixture/document/state/host",
      "fixture/format": expectedFormatImplementation,
      "fixture/export": "fixture/export/default",
      "fixture/export/delivery": "fixture/export/delivery/host",
    },
    roots: ["fixture/document/default", expectedFormatImplementation, "fixture/export/default"],
  };
}

const formatSuite = contractSuite(expectedFormat, {
  "preserves the revision and verbatim text": format => {
    for (const revision of [0, 7, 1234]) assert.ok(format.title(revision).includes(String(revision)));
    for (const text of ["MiXeD text", " leading and trailing ", "строка 😀"]) {
      assert.ok(format.body(text).includes(text));
    }
  },
  "repeated calls have stable independent results": format => {
    const title = format.title(7);
    const body = format.body("MiXeD text");
    format.title(900);
    format.body("another document");
    assert.equal(format.title(7), title);
    assert.equal(format.body("MiXeD text"), body);
  },
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** This probe is an installed consumer of public metadata and conformance tools only. */
export async function verifyCompositionContracts() {
  const cases = [
    { provider: plainFormatProvider, identity: "fixture/format/plain",
      profile: "fixture/portable-document/fixture/format/plain", title: "Document r7", body: "MiXeD text" },
    { provider: markedFormatProvider, identity: "fixture/format/marked",
      profile: "fixture/portable-document/fixture/format/marked", title: "[Document r7]", body: "> MiXeD text" },
    { provider: authorFormatProvider, identity: "fixture/format/author",
      profile: "fixture/portable-document/fixture/format/author", title: "Author revision 7", body: "By author: MiXeD text" },
  ];
  let contractCases = 0;
  for (const expected of cases) {
    const definition = documentComposition(expected.provider);
    assert.equal(definition.profileId, expected.profile);
    const declarations = declarationsOf(definition);
    checkNamespaces({ namespace: "fixture", declarations });
    const preparation = await prepareDocumentComposition(expected.provider);
    assert.equal(preparation.status, "prepared");
    if (preparation.status !== "prepared") throw new Error("fixture.contract.prepare-failed");
    assert.equal(preparation.composition.plan.profileId, expected.profile);
    checkWiring(preparation.composition, [wiring(expected.identity)], { declarations });
    const registered: { readonly name: string; readonly run: () => Promise<void> }[] = [];
    runContractSuite(formatSuite, {
      name: expected.identity,
      declaration: definition.roots.format.declaration,
      create: async context => {
        const subject = await isolate(definition.roots.format, {
          dependencies: {}, within: context.resources, signal: context.signal,
        });
        assert.equal(subject.instance.title(7), expected.title);
        assert.equal(subject.instance.body("MiXeD text"), expected.body);
        return subject.capabilities["fixture/format"];
      },
    }, (name, run) => { registered.push({ name, run }); });
    assert.equal(registered.length, 2);
    for (const testCase of registered) {
      await testCase.run();
      contractCases += 1;
    }
  }

  const wrongSelection = documentComposition(markedFormatProvider);
  const wrongPrepared = await prepareDocumentComposition(markedFormatProvider);
  assert.equal(wrongPrepared.status, "prepared");
  if (wrongPrepared.status !== "prepared") throw new Error("fixture.contract.wrong-profile-not-valid");
  assert.throws(() => checkWiring(wrongPrepared.composition, [wiring("fixture/format/plain")], {
    declarations: declarationsOf(wrongSelection),
  }), { code: "conformance.wiring.mismatch" });
  assert.throws(() => checkNamespaces({
    namespace: "fixture",
    declarations: [{
      ...wrongSelection.roots.format.declaration, owner: { authority: "another-owner", path: ["format"] },
    }],
  }), { code: "conformance.namespaces.violation" });

  let factories = 0;
  let acquired = 0;
  let effects = 0;
  let released = 0;
  const witnessedProvider: FormatProvider = {
    implementationId: "fixture/format/plain",
    create: () => { factories += 1; return plainFormatProvider.create(); },
  };
  const definition = documentComposition(witnessedProvider);
  const api = assemblyFor<PortableDocumentCapabilities>();
  const accepted = await api.prepare(definition);
  assert.equal(accepted.status, "prepared");
  if (accepted.status !== "prepared") throw new Error("fixture.contract.witness-not-prepared");

  const missing = await api.prepare({ ...definition, inputs: { state: definition.inputs.state } });
  assert.equal(missing.status, "failed");
  if (missing.status !== "failed") throw new Error("fixture.contract.missing-dependency-accepted");
  assert.equal(missing.error.code, "assembly.prepare.unresolved-binding");
  assert.ok(Array.isArray(missing.error.cause));
  assert.ok(missing.error.cause.some((problem: unknown) => isRecord(problem)
    && problem["consumerImplementationId"] === "fixture/export/default"
    && problem["slotId"] === "delivery"
    && Array.isArray(problem["candidates"]) && problem["candidates"].length === 0));

  const wrongRevision = defineContract<FormatPort>()({ id: "fixture/format", revision: 2 });
  interface WrongCapabilities extends CapabilitiesOf<typeof wrongRevision> {}
  const wrongDeclaration = declareModule({
    moduleId: "fixture/format", implementationId: "fixture/format/wrong-revision",
    owner: { authority: "fixture", path: ["format"] }, provides: [wrongRevision.provide()], slots: [],
  });
  let incompatibleFactories = 0;
  const wrongModule = implement<WrongCapabilities>()(wrongDeclaration, async () => {
    incompatibleFactories += 1;
    const port = plainFormatProvider.create();
    return { instance: port, capabilities: { "fixture/format": port } };
  });
  const invalidInput = {
    ...definition,
    modules: [definition.modules[0], group("format", [wrongModule]), definition.modules[2]],
    roots: { ...definition.roots, format: wrongModule },
  };
  // Static callers cannot mix r1 and r2. Model untyped external input at the public
  // method, then validate the unknown runtime result; do not weaken consumer types.
  const incompatible: unknown = await Reflect.apply(api.prepare, api, [invalidInput]);
  assert.ok(isRecord(incompatible) && incompatible["status"] === "failed");
  const error = incompatible["error"];
  assert.ok(isRecord(error));
  assert.equal(error["code"], "assembly.prepare.core-rejected");
  const diagnostics = incompatible["diagnostics"];
  assert.ok(Array.isArray(diagnostics));
  assert.ok(diagnostics.some((diagnostic: unknown) => isRecord(diagnostic)
    && diagnostic["code"] === "binding.compatibility-mismatch"));
  assert.equal(incompatibleFactories, 0);
  assert.equal(factories, 0);
  assert.equal(acquired, 0);
  assert.equal(effects, 0);

  // The same counted positive control really runs after all rejecting preparation
  // checks, so the zero-effect witnesses are connected to reachable operations.
  const delivery: ExportDeliveryPort = {
    prepare: async () => ({ status: "ready" }),
    commit: (revision, content) => { effects += 1; return { status: "published", revision, content }; },
  };
  const setup: SetupSpec<ExportDeliveryPort> = {
    name: "contract-delivery",
    setup: () => { acquired += 1; return delivery; },
    cleanup: () => { released += 1; },
  };
  const scope = createScope({ name: "contract-positive-control" });
  try {
    const result = await accepted.prepared.run({
      scope: scope.resources,
      inputs: {
        state: { "fixture/document/state": {
          read: () => ({ revision: 7, text: "MiXeD text" }),
          commit: () => ({ status: "rejected", reason: "denied" }),
        } },
        delivery: { "fixture/export/delivery": setup },
      },
    });
    assert.equal(result.status, "succeeded");
    if (result.status !== "succeeded") throw new Error("fixture.contract.witness-run-failed");
    assert.deepEqual(await result.roots.export.publish(), {
      status: "published", revision: 7, content: "Document r7\nMiXeD text",
    });
  } finally {
    assert.deepEqual(await scope.control.close(), complete);
  }
  assert.deepEqual({ factories, acquired, effects, released }, { factories: 1, acquired: 1, effects: 1, released: 1 });
  return {
    providers: cases.map(entry => entry.identity), contractCases,
    namespaceRejected: true, wrongSelectionRejected: true,
    wrongRevisionRejected: true, missingDependencyRejected: true,
    effectsBeforeRun: 0, positiveControl: { factories, acquired, effects, released },
  };
}
