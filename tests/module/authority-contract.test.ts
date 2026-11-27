import assert from "node:assert/strict";
import test from "node:test";
import type { AuthoritySnapshot, PublicationReceipt, UpdateAuthority } from "../../src/index.ts";
import { authorityContractCases, type AuthorityContractFixture, type AuthorityLawName } from "../../src/testing.ts";
import { candidate, type NativeAuthority } from "./host-contract.ts";
import { createNodeAuthority } from "./native-node-authority.ts";

type Mutation = (authority: NativeAuthority) => UpdateAuthority;
function fixture(name: AuthorityLawName, change?: Mutation): AuthorityContractFixture {
  const native = createNodeAuthority("authority-laws/" + name);
  return {
    authority: change ? change(native) : native, candidate: candidate("B"), successor: candidate("C"),
    observeHead: native.observeHead, invalidateBasis: () => {
      const current = native.document();
      assert.equal(native.write(native.observeHead().generationId, current.revision, current.text + "/changed").status, "written");
    },
    holdPublication: () => { native.publicationMode("delayed"); },
    loseAcknowledgement: () => { native.publicationMode("lost-ack"); },
    releasePublication: native.finishPending, dispose: native.dispose,
  };
}

await test("the public authority contract cases qualify the actual native Map owner", async context => {
  const cases = authorityContractCases(name => fixture(name));
  assert.deepEqual(cases.map(value => value.name), ["detached-read", "canonical-publication", "original-payload", "stale-head",
    "stale-basis", "pending-original", "lost-acknowledgement", "immutable-receipt"]);
  for (const value of cases) { await context.test(value.name, value.run); }
});

interface Fault {
  readonly name: string;
  readonly law: AuthorityLawName;
  readonly mutate: Mutation;
}
const faults: readonly Fault[] = [
  { name: "aliased read", law: "detached-read", mutate: native => {
    const alias = native.read();
    return { ...native, read: () => alias };
  } },
  { name: "publication changes a second routing pointer", law: "canonical-publication", mutate: native => {
    const first = native.read();
    return { ...native, read: () => ({ ...first, head: { ...first.head } }) };
  } },
  { name: "unchanged committed revision", law: "canonical-publication", mutate: native => ({ ...native,
    publish: async request => {
      const result = await native.publish(request);
      return result.status === "committed" ? { ...result, head: { ...result.head, revision: result.previousHead.revision } } : result;
    },
  }) },
  { name: "replay mutates and reuses the first result", law: "canonical-publication", mutate: native => {
    let retained: PublicationReceipt & { readonly status: "committed" } | undefined;
    return { ...native, publish: async request => {
      if (retained) {
        Reflect.set(retained.head, "revision", retained.head.revision + "/reexecuted");
        return retained;
      }
      const result = await native.publish(request);
      if (result.status === "committed") { retained = result; }
      return result;
    } };
  } },
  { name: "replay binds only attempt ID", law: "original-payload", mutate: native => {
    let original: PublicationReceipt | undefined;
    return { ...native, publish: async request => {
      if (original) { return original; }
      const result = await native.publish(request);
      if (result.status === "committed" || result.status === "rejected") { original = result; }
      return result;
    } };
  } },
  { name: "stale head is silently refreshed", law: "stale-head", mutate: native => ({ ...native,
    publish: async request => {
      const result = await native.publish({ ...request, expectedHead: native.read().head });
      return result.status === "unknown" ? result : { ...result, request };
    },
  }) },
  { name: "stale basis is silently refreshed", law: "stale-basis", mutate: native => ({ ...native,
    publish: async request => {
      const result = await native.publish({ ...request, basis: native.read().basis });
      return result.status === "unknown" ? result : { ...result, request };
    },
  }) },
  { name: "pending request falsely refused", law: "pending-original", mutate: native => ({ ...native,
    publish: async request => {
      await native.publish(request);
      return { status: "refused", request, reason: "invented-timeout-refusal" };
    },
  }) },
  { name: "lost reply forgets the original receipt", law: "lost-acknowledgement", mutate: native => ({ ...native,
    lookup: () => ({ status: "unknown" }),
  }) },
  { name: "receipt lookup follows caller mutation", law: "immutable-receipt", mutate: native => {
    const replies = new Map<string, PublicationReceipt>();
    return { ...native,
      publish: async request => {
        const result = await native.publish(request);
        if (result.status === "committed" || result.status === "rejected") { replies.set(request.attemptId, result); }
        return result;
      },
      lookup: request => {
        const receipt = replies.get(request.attemptId);
        return receipt ? { status: "known", receipt } : { status: "unknown" };
      },
    };
  } },
];

await test("each deliberate authority defect is rejected by its own law after valid native setup", async context => {
  for (const fault of faults) {
    await context.test(fault.name, async () => {
      const control = authorityContractCases(name => fixture(name, fault.mutate)).find(value => value.name === fault.law);
      assert.ok(control);
      await assert.rejects(control.run(), (cause: unknown) => typeof cause === "object" && cause !== null && "code" in cause
        && cause.code === "lmu.testing.authority." + fault.law);
    });
  }
});

await test("contract teardown preserves primary, release and disposal failures", async () => {
  const primary = new Error("actual read failed");
  const release = new Error("actual release failed");
  const disposal = new Error("actual disposal failed");
  let disposed = false;
  const first = authorityContractCases(name => {
    const value = fixture(name);
    const authority: UpdateAuthority = { ...value.authority, read: (): AuthoritySnapshot => { throw primary; } };
    return { ...value, authority, releasePublication: () => { throw release; },
      dispose: async () => { disposed = true; await value.dispose(); throw disposal; } };
  })[0];
  assert.ok(first);
  await assert.rejects(first.run(), (cause: unknown) => {
    assert.ok(cause instanceof AggregateError);
    assert.deepEqual(cause.errors, [primary, release, disposal]);
    return true;
  });
  assert.equal(disposed, true);
});

await test("basis qualification rejects a fixture that masks the condition with revoked permission", async () => {
  const cases = authorityContractCases(name => {
    const native = createNodeAuthority("masked-basis/" + name);
    return {
      authority: native, candidate: candidate("B"), successor: candidate("C"), observeHead: native.observeHead,
      invalidateBasis: () => { native.grant(false); }, holdPublication: () => { native.publicationMode("delayed"); },
      loseAcknowledgement: () => { native.publicationMode("lost-ack"); }, releasePublication: native.finishPending, dispose: native.dispose,
    };
  });
  const basis = cases.find(value => value.name === "stale-basis");
  assert.ok(basis);
  await assert.rejects(basis.run(), (cause: unknown) => typeof cause === "object" && cause !== null && "code" in cause
    && cause.code === "lmu.testing.authority.stale-basis");
});
