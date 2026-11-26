import type {
  DocumentSnapshot, EditResult, ExportDeliveryPort, ExportPreparation, ExportResult,
} from "@fixture/portable-document";
import { prepareDocumentComposition, type FormatProvider } from "@fixture/portable-document-gm";
import { createScope, type CloseReport, type SetupSpec } from "@get-modular/resources";
import { createInvocationOwner } from "./invocation-owner.js";

export interface BrowserModularHooks {
  readonly wait?: (signal: AbortSignal) => Promise<"ready" | "cancelled">;
  readonly afterAcquire?: (signal: AbortSignal) => Promise<void>;
  readonly beforeRelease?: () => Promise<void>;
}
export interface BrowserModularSession {
  readonly query: () => DocumentSnapshot;
  readonly edit: (revision: number, text: string) => EditResult;
  readonly publish: () => Promise<ExportResult>;
  readonly close: () => Promise<CloseReport>;
  readonly pending: () => number;
  readonly isOpen: () => boolean;
  readonly implementationId: string;
}
export class BrowserHostOpenError extends Error {
  readonly closeReport: CloseReport;
  readonly dispose: () => Promise<void>;
  constructor(cause: unknown, report: CloseReport, dispose: () => Promise<void>) {
    super("Browser composition failed with retained cleanup ownership", { cause });
    this.closeReport = report;
    this.dispose = dispose;
  }
}

/** Independent browser-local state, authority, native preparation and DOM ownership. */
export async function openBrowserModularHost(provider: FormatProvider, initialHooks: BrowserModularHooks = {}) {
  const namespace = "modular-document-" + crypto.randomUUID();
  const stateKey = namespace + "/document";
  const exportsKey = namespace + "/exports";
  const root = document.createElement("section");
  root.id = namespace;
  const output = document.createElement("output");
  output.dataset["modularOutput"] = "";
  root.append(output);
  document.body.append(root);
  const native = new Map<string, () => void>();
  const stageIds: string[] = [];
  const attempts: ReturnType<typeof createInvocationOwner>[] = [];
  let granted = true;
  let disposed = false;
  let restarting = false;
  let blockedReport: CloseReport | undefined;
  let failedOpen: BrowserHostOpenError | undefined;
  let disposeFlight: Promise<void> | undefined;

  function readState(): DocumentSnapshot {
    const value: unknown = JSON.parse(localStorage.getItem(stateKey) ?? "null");
    if (typeof value !== "object" || value === null || !("revision" in value) || !("text" in value)
      || typeof value.revision !== "number" || !Number.isSafeInteger(value.revision)
      || value.revision < 0 || typeof value.text !== "string") throw new Error("invalid browser document");
    return { revision: value.revision, text: value.text };
  }
  function readExports(): { readonly revision: number; readonly content: string }[] {
    const value: unknown = JSON.parse(localStorage.getItem(exportsKey) ?? "null");
    if (!Array.isArray(value)) throw new Error("invalid browser export receipts");
    return value.map((entry: unknown) => {
      if (typeof entry !== "object" || entry === null || !("revision" in entry) || !("content" in entry)
        || typeof entry.revision !== "number" || typeof entry.content !== "string") throw new Error("invalid browser receipt");
      return { revision: entry.revision, content: entry.content };
    });
  }

  function dispose(): Promise<void> {
    if (disposeFlight) return disposeFlight;
    const completion = Promise.withResolvers<void>();
    disposeFlight = completion.promise;
    disposed = true;
    void (async () => {
      try {
        const closing = attempts.map(attempt => attempt.close());
        await Promise.all(closing);
        // Explicit TEST teardown never rewrites an original incomplete close report.
        for (const release of [...native.values()]) release();
        localStorage.removeItem(stateKey);
        localStorage.removeItem(exportsKey);
        root.remove();
        completion.resolve();
      } catch (error) { completion.reject(error); }
    })();
    return disposeFlight;
  }

  async function construct(nextProvider: FormatProvider, hooks: BrowserModularHooks): Promise<BrowserModularSession> {
    if (disposed) throw new Error("Browser Host is disposed");
    const scope = createScope({ name: "browser-document-session-" + (attempts.length + 1) });
    const cancellation = new AbortController();
    const ingress = createInvocationOwner(() => cancellation.abort(), () => scope.control.close());
    attempts.push(ingress);
    const stageId = namespace + "-export-" + attempts.length;
    let dispatch: () => Promise<ExportResult> = () => Promise.resolve({ status: "rejected", reason: "closed" });
    const delivery: SetupSpec<ExportDeliveryPort> = {
      name: "export-action",
      async setup({ signal }): Promise<ExportDeliveryPort> {
        const button = document.createElement("button");
        button.id = stageId;
        button.dataset["modularExport"] = "";
        button.textContent = "Export";
        const onExport = () => {
          void dispatch().then(result => { output.value = JSON.stringify(result); },
            error => { output.value = "error:" + String(error); });
        };
        button.addEventListener("click", onExport);
        root.append(button);
        stageIds.push(stageId);
        const release = () => {
          button.removeEventListener("click", onExport);
          button.remove();
          native.delete(stageId);
        };
        native.set(stageId, release);
        try {
          await hooks.afterAcquire?.(signal);
          if (signal.aborted) throw new Error("Browser setup was cancelled");
          return {
            async prepare(): Promise<ExportPreparation> {
              // Actual browser-native asynchronous work, followed by a controlled finite wait.
              const staged = await new Blob([JSON.stringify(readState())], { type: "application/json" }).text();
              button.dataset["prepared"] = staged;
              const readiness = await hooks.wait?.(cancellation.signal);
              return { status: readiness === "cancelled" || cancellation.signal.aborted ? "cancelled" : "ready" };
            },
            commit(expectedRevision, content): ExportResult {
              if (!ingress.isOpen()) return { status: "rejected", reason: "closed" };
              if (!granted) return { status: "rejected", reason: "denied" };
              if (readState().revision !== expectedRevision) return { status: "rejected", reason: "conflict" };
              const receipt = { revision: expectedRevision, content };
              localStorage.setItem(exportsKey, JSON.stringify([...readExports(), receipt]));
              return { status: "published", ...receipt };
            },
          };
        } catch (error) {
          // The creating adapter cleans an acquired value that setup never returned.
          release();
          throw error;
        }
      },
      async cleanup() {
        await hooks.beforeRelease?.();
        const release = native.get(stageId);
        if (!release) throw new Error("missing browser action ownership");
        release();
      },
    };

    try {
      const selectedProvider = { implementationId: nextProvider.implementationId, create: nextProvider.create };
      const prepared = await prepareDocumentComposition(selectedProvider);
      if (prepared.status !== "prepared") throw new Error("Browser preparation failed", { cause: prepared });
      if (!ingress.isOpen() || disposed) throw new Error("Browser preparation was closed");
      const result = await prepared.prepared.run({
        scope: scope.resources,
        inputs: {
          state: { "fixture/document/state": {
            read: readState,
            commit(expectedRevision, text): EditResult {
              if (!ingress.isOpen()) return { status: "rejected", reason: "closed" };
              if (!granted) return { status: "rejected", reason: "denied" };
              const previous = readState();
              if (previous.revision !== expectedRevision) return { status: "rejected", reason: "conflict" };
              const snapshot = { revision: previous.revision + 1, text };
              localStorage.setItem(stateKey, JSON.stringify(snapshot));
              return { status: "saved", snapshot };
            },
          } },
          delivery: { "fixture/export/delivery": delivery },
        },
      });
      if (result.status !== "succeeded") throw new Error("Browser construction failed", { cause: result });
      if (!ingress.isOpen() || disposed) throw new Error("Browser construction was closed");
      dispatch = () => ingress.invoke<ExportResult>(
        () => result.roots.export.publish(), { status: "rejected", reason: "closed" },
      );
      return {
        implementationId: selectedProvider.implementationId,
        query: () => {
          if (!ingress.isOpen()) throw new Error("Browser session is closed");
          return result.roots.document.query();
        },
        edit: (revision, text) => !ingress.isOpen()
          ? { status: "rejected", reason: "closed" } : result.roots.document.edit(revision, text),
        publish: dispatch, close: ingress.close, pending: ingress.pending, isOpen: ingress.isOpen,
      };
    } catch (cause) {
      const report = await ingress.close();
      if (!report.settled || !report.complete || native.has(stageId)) {
        if (!report.settled || !report.complete) blockedReport = report;
        failedOpen = new BrowserHostOpenError(cause, report, dispose);
        throw failedOpen;
      }
      throw cause;
    }
  }

  let current: BrowserModularSession;
  try {
    localStorage.setItem(stateKey, JSON.stringify({ revision: 0, text: "seed" }));
    localStorage.setItem(exportsKey, "[]");
    current = await construct(provider, initialHooks);
  } catch (cause) {
    if (cause instanceof BrowserHostOpenError) throw cause;
    await dispose();
    throw cause;
  }
  return {
    current: () => current,
    async restart(nextProvider: FormatProvider, hooks: BrowserModularHooks = {}) {
      if (disposed) throw new Error("Browser Host is disposed");
      if (restarting) throw new Error("Browser restart already in progress");
      restarting = true;
      try {
        if (blockedReport) return { status: "refused", report: blockedReport } as const;
        if (failedOpen) throw failedOpen;
        const report = await current.close();
        if (!report.settled || !report.complete) {
          blockedReport = report;
          return { status: "refused", report } as const;
        }
        current = await construct(nextProvider, hooks);
        return { status: "started" } as const;
      } finally { restarting = false; }
    },
    revoke: () => { granted = false; },
    stateKey, exportsKey, root, output,
    stages: (): readonly string[] => [...stageIds],
    dispose,
  };
}
