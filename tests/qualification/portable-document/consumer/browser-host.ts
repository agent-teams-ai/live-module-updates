import { createDocumentCommands, type DocumentSnapshot, type EditResult } from "@fixture/portable-document";

// A separate browser Host owns storage, authority and event registration.
const text = document.querySelector<HTMLInputElement>("#text");
const revision = document.querySelector<HTMLInputElement>("#revision");
const save = document.querySelector<HTMLButtonElement>("#save");
const query = document.querySelector<HTMLButtonElement>("#query");
const revoke = document.querySelector<HTMLButtonElement>("#revoke");
const close = document.querySelector<HTMLButtonElement>("#close");
const output = document.querySelector<HTMLOutputElement>("#output");
if (!text || !revision || !save || !query || !revoke || !close || !output) throw new Error("incomplete fixture view");
const storageKey = "portable-document-fixture";
localStorage.setItem(storageKey, JSON.stringify({ revision: 0, text: "seed" }));
localStorage.setItem("portable-document-receipts", "[]");
let closed = false;
let allowed = true;
function read(): DocumentSnapshot {
  if (closed) throw new Error("browser Host is closed");
  const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "null");
  if (typeof value !== "object" || value === null || !("text" in value) || !("revision" in value)
    || typeof value.text !== "string" || typeof value.revision !== "number") throw new Error("invalid browser state");
  return { text: value.text, revision: value.revision };
}
const receipts: DocumentSnapshot[] = [];
const commands = createDocumentCommands({
  read,
  commit(expectedRevision, nextText): EditResult {
    if (closed) return { status: "rejected", reason: "closed" };
    if (!allowed) return { status: "rejected", reason: "denied" };
    const current = read();
    if (current.revision !== expectedRevision) return { status: "rejected", reason: "conflict" };
    const snapshot = { revision: current.revision + 1, text: nextText };
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
    receipts.push(snapshot);
    localStorage.setItem("portable-document-receipts", JSON.stringify(receipts));
    return { status: "saved", snapshot };
  },
});
const onSave = () => { output.value = JSON.stringify(commands.edit(Number(revision.value), text.value)); };
const onQuery = () => { output.value = JSON.stringify(commands.query()); };
const onRevoke = () => { allowed = false; output.value = "revoked"; };
const onClose = () => {
  closed = true;
  save.removeEventListener("click", onSave);
  query.removeEventListener("click", onQuery);
  revoke.removeEventListener("click", onRevoke);
  close.removeEventListener("click", onClose);
  output.value = "closed";
};
save.addEventListener("click", onSave);
query.addEventListener("click", onQuery);
revoke.addEventListener("click", onRevoke);
close.addEventListener("click", onClose);
onQuery();
