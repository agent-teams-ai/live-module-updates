import type { CloseReport } from "@get-modular/resources";

/** Finite TEST Host ingress/drain owner. No routing, generations or public LMU API. */
export function createInvocationOwner(cancel: () => void, release: () => Promise<CloseReport>) {
  let accepting = true;
  let closeFlight: Promise<CloseReport> | undefined;
  const operations = new Set<{ raw: Promise<unknown> | undefined; settled: Promise<void> }>();

  function invoke<T>(work: () => Promise<T>, closed: T): Promise<T> {
    if (!accepting) return Promise.resolve(closed);
    const settlement = Promise.withResolvers<void>();
    const record: { raw: Promise<unknown> | undefined; settled: Promise<void> } = {
      raw: undefined, settled: settlement.promise,
    };
    // Reserve custody before work can synchronously call close or another entry.
    operations.add(record);
    const finish = () => { operations.delete(record); settlement.resolve(); };
    try {
      const raw = work();
      record.raw = raw;
      return raw.then(value => { finish(); return value; }, error => { finish(); throw error; });
    } catch (error) {
      finish();
      return Promise.reject(error);
    }
  }

  function close(): Promise<CloseReport> {
    if (closeFlight) return closeFlight;
    const completion = Promise.withResolvers<CloseReport>();
    closeFlight = completion.promise;
    accepting = false;
    const retained = [...operations].map(operation => operation.settled);
    // Publish the close flight and seal ingress before synchronous abort listeners.
    // The Host supplies its nonthrowing native AbortController action.
    cancel();
    void (async () => {
      try {
        await Promise.all(retained);
        completion.resolve(await release());
      } catch (error) { completion.reject(error); }
    })();
    return closeFlight;
  }

  return { isOpen: () => accepting, pending: () => operations.size, invoke, close };
}
