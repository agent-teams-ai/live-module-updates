import { readFileSync, writeFileSync } from "node:fs";
import { mkdtemp, open, rm, type FileHandle } from "node:fs/promises";
import { join } from "node:path";
import type {
  DocumentSnapshot, EditResult, ExportDeliveryPort, ExportPreparation, ExportResult,
} from "@fixture/portable-document";
import {
  prepareDocumentComposition, type FormatProvider,
} from "@fixture/portable-document-gm";
import { createScope, type CloseReport, type SetupSpec } from "@get-modular/resources";
import { createInvocationOwner } from "./invocation-owner.js";

/** TEST hooks surround actual acquisition, asynchronous work and release. */
export interface NodeModularHooks {
  readonly wait?: (signal: AbortSignal) => Promise<"ready" | "cancelled">;
  readonly afterAcquire?: () => Promise<void>;
  readonly beforeRelease?: () => Promise<void>;
}

export interface NodeModularSession {
  readonly query: () => DocumentSnapshot;
  readonly edit: (expectedRevision: number, text: string) => EditResult;
  readonly publish: () => Promise<ExportResult>;
  readonly close: () => Promise<CloseReport>;
  readonly pending: () => number;
  readonly isOpen: () => boolean;
  readonly implementationId: string;
}

/** A failed open retains the original cleanup report and its explicit teardown owner. */
export class NodeHostOpenError extends Error {
  readonly closeReport: CloseReport;
  readonly dispose: () => Promise<void>;
  constructor(cause: unknown, closeReport: CloseReport, dispose: () => Promise<void>) {
    super("Node composition failed with retained cleanup ownership", { cause });
    this.name = "NodeHostOpenError";
    this.closeReport = closeReport;
    this.dispose = dispose;
  }
}

/** Trusted, single-process TEST Host. Canonical files are borrowed by each session. */
export async function openNodeModularHost(
  parent: string,
  provider: FormatProvider,
  initialHooks: NodeModularHooks = {},
) {
  const root = await mkdtemp(join(parent, "node-modular-owner-"));
  const stateFile = join(root, "document.json");
  const exportsFile = join(root, "exports.json");
  const nativeHandles = new Map<FileHandle, string>();
  const stagePaths: string[] = [];
  const attempts: ReturnType<typeof createInvocationOwner>[] = [];
  let granted = true;
  let disposed = false;
  let restarting = false;
  let blockedReport: CloseReport | undefined;
  let failedOpen: NodeHostOpenError | undefined;
  let disposeFlight: Promise<void> | undefined;

  function readState(): DocumentSnapshot {
    const value: unknown = JSON.parse(readFileSync(stateFile, "utf8"));
    if (typeof value !== "object" || value === null || !("revision" in value) || !("text" in value)
      || typeof value.revision !== "number" || !Number.isSafeInteger(value.revision)
      || value.revision < 0 || typeof value.text !== "string") throw new Error("invalid owned document");
    return { revision: value.revision, text: value.text };
  }

  function readExports(): { readonly revision: number; readonly content: string }[] {
    const value: unknown = JSON.parse(readFileSync(exportsFile, "utf8"));
    if (!Array.isArray(value)) throw new Error("invalid owned export receipts");
    return value.map((entry: unknown) => {
      if (typeof entry !== "object" || entry === null || !("revision" in entry) || !("content" in entry)
        || typeof entry.revision !== "number" || !Number.isSafeInteger(entry.revision)
        || entry.revision < 0 || typeof entry.content !== "string") throw new Error("invalid export receipt");
      return { revision: entry.revision, content: entry.content };
    });
  }

  async function releaseNative(handle: FileHandle): Promise<void> {
    const path = nativeHandles.get(handle);
    if (path === undefined) return;
    await handle.close();
    await rm(path, { force: true });
    nativeHandles.delete(handle);
  }

  function dispose(): Promise<void> {
    if (disposeFlight) return disposeFlight;
    const completion = Promise.withResolvers<void>();
    disposeFlight = completion.promise;
    disposed = true;
    void (async () => {
      // Seal every retained session before yielding, including a successor.
      const closing = attempts.map(attempt => {
        try { return attempt.close(); }
        catch (cause) { return Promise.reject(cause); }
      });
      const failures: unknown[] = [];
      for (const result of await Promise.allSettled(closing)) {
        if (result.status === "rejected") failures.push(result.reason);
      }
      // Explicit TEST teardown can reclaim failed native handles. It neither
      // retries the Resources close nor changes any original incomplete report.
      for (const handle of nativeHandles.keys()) {
        try { await releaseNative(handle); }
        catch (error) { failures.push(error); }
      }
      if (failures.length > 0) throw new AggregateError(failures, "Node Host teardown failed");
      await rm(root, { recursive: true, force: true });
    })().then(completion.resolve, completion.reject);
    return disposeFlight;
  }

  async function construct(nextProvider: FormatProvider, hooks: NodeModularHooks): Promise<NodeModularSession> {
    if (disposed) throw new Error("Node Host is disposed");
    const scope = createScope({ name: "node-document-session-" + (attempts.length + 1) });
    const cancellation = new AbortController();
    const ingress = createInvocationOwner(() => cancellation.abort(), () => scope.control.close());
    attempts.push(ingress); // Retain the attempt before any factory can acquire.
    const stagePath = join(root, "export-stage-" + attempts.length);
    let acquired: FileHandle | undefined;

    const delivery: SetupSpec<ExportDeliveryPort> = {
      name: "export-stage-file",
      async setup({ signal }): Promise<ExportDeliveryPort> {
        const handle = await open(stagePath, "wx+");
        acquired = handle;
        nativeHandles.set(handle, stagePath);
        stagePaths.push(stagePath);
        try {
          await hooks.afterAcquire?.();
          await handle.writeFile("acquired\n");
          if (signal.aborted) throw new Error("Node setup was cancelled");
          return {
            async prepare(): Promise<ExportPreparation> {
              await handle.writeFile("prepared\n");
              const readiness = await hooks.wait?.(cancellation.signal);
              return { status: readiness === "cancelled" || cancellation.signal.aborted ? "cancelled" : "ready" };
            },
            commit(expectedRevision, content): ExportResult {
              if (!ingress.isOpen()) return { status: "rejected", reason: "closed" };
              if (!granted) return { status: "rejected", reason: "denied" };
              if (readState().revision !== expectedRevision) return { status: "rejected", reason: "conflict" };
              const receipt = { revision: expectedRevision, content };
              // Synchronous final check/write in this one-process fixture.
              writeFileSync(exportsFile, JSON.stringify([...readExports(), receipt]));
              return { status: "published", ...receipt };
            },
          };
        } catch (cause) {
          // Resources cannot clean an acquisition that setup never returned.
          try { await releaseNative(handle); }
          catch (cleanup) { throw new AggregateError([cause, cleanup], "Unreturned file cleanup failed"); }
          throw cause;
        }
      },
      async cleanup() {
        await hooks.beforeRelease?.();
        if (acquired === undefined) throw new Error("missing acquired stage file");
        await releaseNative(acquired);
      },
    };

    try {
      const selectedProvider = { implementationId: nextProvider.implementationId, create: nextProvider.create };
      const prepared = await prepareDocumentComposition(selectedProvider);
      if (prepared.status !== "prepared") throw new Error("Node composition preparation failed", { cause: prepared });
      if (!ingress.isOpen() || disposed) throw new Error("Node construction was closed");
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
              writeFileSync(stateFile, JSON.stringify(snapshot));
              return { status: "saved", snapshot };
            },
          } },
          delivery: { "fixture/export/delivery": delivery },
        },
      });
      if (result.status !== "succeeded") throw new Error("Node composition construction failed", { cause: result });
      if (!ingress.isOpen() || disposed) throw new Error("Node construction was closed");
      return {
        implementationId: selectedProvider.implementationId,
        query() {
          if (!ingress.isOpen()) throw new Error("Node session is closed");
          return result.roots.document.query();
        },
        edit(expectedRevision, text) {
          if (!ingress.isOpen()) return { status: "rejected", reason: "closed" };
          return result.roots.document.edit(expectedRevision, text);
        },
        publish: () => ingress.invoke<ExportResult>(
          () => result.roots.export.publish(), { status: "rejected", reason: "closed" },
        ),
        close: ingress.close,
        pending: ingress.pending,
        isOpen: ingress.isOpen,
      };
    } catch (cause) {
      const report = await ingress.close();
      const unreturnedHandle = acquired !== undefined && nativeHandles.has(acquired);
      if (!report.settled || !report.complete || unreturnedHandle) {
        if (!report.settled || !report.complete) blockedReport = report;
        // Keep the original report: an unreturned native handle is not GM debt.
        failedOpen = new NodeHostOpenError(cause, report, dispose);
        throw failedOpen;
      }
      throw cause;
    }
  }

  let current: NodeModularSession;
  try {
    writeFileSync(stateFile, JSON.stringify({ revision: 0, text: "seed" }));
    writeFileSync(exportsFile, "[]");
    current = await construct(provider, initialHooks);
  } catch (cause) {
    if (cause instanceof NodeHostOpenError) throw cause;
    await dispose();
    throw cause;
  }

  return {
    current: () => current,
    async restart(nextProvider: FormatProvider, hooks: NodeModularHooks = {}) {
      if (disposed) throw new Error("Node Host is disposed");
      if (restarting) throw new Error("Node Host restart is already in progress");
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
    stateFile,
    exportsFile,
    root,
    stages: (): readonly string[] => [...stagePaths],
    dispose,
  };
}
