import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createDocumentCommands, type DocumentSnapshot, type EditResult } from "@fixture/portable-document";

export function openNodeHost(parent: string) {
  const root = mkdtempSync(join(parent, "node-owner-"));
  const stateFile = join(root, "document.json");
  try { writeFileSync(stateFile, JSON.stringify({ revision: 0, text: "seed" })); }
  catch (error) { rmSync(root, { recursive: true, force: true }); throw error; }
  let closed = false;
  let mayWrite = true;
  const receipts: DocumentSnapshot[] = [];
  function read(): DocumentSnapshot {
    if (closed) throw new Error("Node Host is closed");
    const value: unknown = JSON.parse(readFileSync(stateFile, "utf8"));
    if (typeof value !== "object" || value === null || !("revision" in value) || !("text" in value)
      || typeof value.revision !== "number" || typeof value.text !== "string") throw new Error("invalid owned state");
    return { revision: value.revision, text: value.text };
  }
  const commands = createDocumentCommands({
    read,
    commit(expectedRevision, text): EditResult {
      if (closed) return { status: "rejected", reason: "closed" };
      if (!mayWrite) return { status: "rejected", reason: "denied" };
      const previous = read();
      if (previous.revision !== expectedRevision) return { status: "rejected", reason: "conflict" };
      const snapshot = { revision: previous.revision + 1, text };
      // Synchronous single-process fixture; no crash durability claim.
      writeFileSync(stateFile, JSON.stringify(snapshot));
      receipts.push(snapshot);
      return { status: "saved", snapshot };
    },
  });
  return {
    commands,
    root,
    stateFile,
    entry: import.meta.resolve("@fixture/portable-document"),
    receipts: () => receipts.map(value => ({ ...value })),
    revoke: () => { mayWrite = false; },
    close: () => { closed = true; rmSync(root, { recursive: true, force: true }); },
  };
}
