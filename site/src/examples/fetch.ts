import type { Example } from "./types";
import { esc } from "./types";

// Mocked async source so the demo is self-contained (no network).
function mockFetch(): Promise<{ name: string; email: string }> {
  return new Promise((res) => setTimeout(() => res({ name: "Ada Lovelace", email: "ada@example.com" }), 700));
}

function Fetcher({ state }: any): string {
  const { status, user, error } = state.data;
  let body = `<p class="ex-muted">Click to load a user.</p>`;
  if (status === "loading") body = `<p class="ex-muted">Loading&hellip;</p>`;
  else if (status === "error") body = `<p class="ex-err">${esc(error)}</p>`;
  else if (status === "done" && user) body = `<div class="ex-usercard"><strong>${esc(user.name)}</strong><span class="ex-muted">${esc(user.email)}</span></div>`;
  return `
    <div class="ex-fetch">
      <button class="ex-btn" :click=load() ${status === "loading" ? "disabled" : ""}>Fetch user</button>
      ${body}
    </div>`;
}

export const fetchEx: Example = {
  id: "fetch",
  title: "Async fetch",
  blurb: "Async methods just mutate state across the await — loading, error, and data are three states the component renders. State Street picks up each mutation on the next frame.",
  template: `<Fetcher/>`,
  data: { status: "idle", user: null, error: "" },
  components: { Fetcher },
  methods: {
    load: async ({ state }: any) => {
      state.data.status = "loading";
      state.data.error = "";
      try {
        const user = await mockFetch();
        state.data.user = user;
        state.data.status = "done";
      } catch (e: any) {
        state.data.error = String(e?.message || e);
        state.data.status = "error";
      }
    },
  },
  source: `function Fetcher({ state }) {
  const { status, user, error } = state.data;
  if (status === "loading") return \`<p>Loading…</p>\`;
  if (status === "error")   return \`<p class="err">\${error}</p>\`;
  if (status === "done")    return \`<div>\${user.name} — \${user.email}</div>\`;
  return \`<button :click=load()>Fetch user</button>\`;
}

const methods = {
  load: async ({ state }) => {
    state.data.status = "loading";              // re-renders -> "Loading…"
    try {
      state.data.user = await fetch("/api/user").then((r) => r.json());
      state.data.status = "done";               // re-renders -> the card
    } catch (e) {
      state.data.error = String(e); state.data.status = "error";
    }
  },
};

new State(\`<Fetcher/>\`, { status: "idle", user: null, error: "" }, { Fetcher }, methods, { mountTarget: "#app" });`,
};
