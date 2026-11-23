type Version = "A" | "B";
type View = {
  readonly version: Version;
  readonly lazy: () => Promise<{ readonly text: string }>;
};
type Reply = { readonly result?: string; readonly effects?: number };

function element(id: string): HTMLElement {
  const value = document.getElementById(id);
  if (!value) throw Error("missing element: " + id);
  return value;
}
const draftNode = element("draft");
if (!(draftNode instanceof HTMLInputElement)) throw Error("missing draft input");
const draft = draftNode;
let selected: View;
let generation = 0;
let requestId = "original-command";

function set(id: string, value: string): void {
  element(id).textContent = value;
}
async function mount(version: Version): Promise<void> {
  // Fixed test-owned literal loading; not an updater or runtime registry.
  selected = version === "A" ? await import("./view-a.js") : await import("./view-b.js");
  generation++;
  set("view", selected.version);
  set("result", "mounted:" + selected.version);
}

async function query(compatible: boolean): Promise<void> {
  const version = selected.version;
  const url = compatible ? "/api/" + (version === "A" ? "v1" : "v2") + "/preview" : "/api/preview";
  const response = await fetch(url);
  const body: unknown = await response.json();
  if (typeof body !== "object" || body === null) throw Error("invalid body");
  const key = version === "A" ? "summary" : "label";
  const result: unknown = Reflect.get(body, key);
  set("query-result", typeof result === "string" ? result : "incompatible-response");
}

async function lazy(): Promise<void> {
  try {
    set("lazy-result", (await selected.lazy()).text);
  } catch {
    set("lazy-result", "unavailable");
  }
}

async function slow(guarded: boolean): Promise<void> {
  const admitted = generation;
  set("slow-status", "waiting");
  const value = await (await fetch("/api/slow")).text();
  if (guarded && generation !== admitted) {
    set("slow-status", "stale-ignored");
    return;
  }
  set("result", value);
  set("slow-status", "applied");
}

async function command(): Promise<void> {
  const version = selected.version;
  set("command-result", "sending");
  try {
    const response = await fetch("/api/" + (version === "A" ? "v1" : "v2") + "/command", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ requestId, text: draft.value }),
    });
    if (!response.ok) {
      set("command-result", "rejected:" + response.status);
      return;
    }
    const result: Reply = await response.json();
    set("command-result", result.result ?? "invalid-receipt");
    set("effects", String(result.effects));
  } catch {
    // The fixture intentionally drops one reply after its effect is accepted.
    set("command-result", "unknown");
  }
}

function action(id: string, fn: () => void | Promise<void>): void {
  element(id).addEventListener("click", () => {
    void Promise.resolve().then(fn).catch((err: unknown) => {
      set("error", String(err));
    });
  });
}

action("switch", () => mount("B"));
action("legacy-query", () => query(false));
action("compatible-query", () => query(true));
action("lazy", lazy);
action("slow-safe", () => slow(true));
action("slow-unsafe", () => slow(false));
action("submit", command);
action("fresh-id", () => { requestId += "-fresh"; });
const initial = document.body.dataset.version;
if (initial !== "A" && initial !== "B") throw Error("unexpected initial version");
await mount(initial);
set("ready", "ready");
export {};
