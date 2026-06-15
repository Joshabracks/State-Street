/**
 * The Studio app — its own isolated State, mounted into #studio-root (a child State,
 * like the examples). It edits the SITE's :root design tokens live (global). One AI
 * prompt restyles the entire aesthetic (stateless — see llm.ts), and a manual control
 * panel lets you tune every token by hand.
 */
import { EDITABLE_TOKENS, FONT_OPTIONS } from "./tokens";
import { applyEdit, resetTheme, exportCss, toHex, getCurrent, contrastWarning, hasOverrides, currentEdits, defaultEdits } from "./theme";
import { loadStyles, addStyle, removeStyle, getStyle } from "./styles";

const esc = (s: any) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// One prompt -> a complete theme. Stateless: the prompt alone drives the whole look.
async function runPrompt(state: any, text: string) {
  if (!text || state.data.thinking || state.data.modelStatus !== "ready") return;
  state.data.thinking = true;
  state.data.lastPrompt = text;
  try {
    const { generateTheme } = await import("./llm");
    const theme = await generateTheme(text);
    // Each prompt defines the ENTIRE aesthetic — start from the site's defaults so the
    // previous prompt's tokens don't bleed through into this one.
    resetTheme();
    state.data.history = [];
    theme.edits.forEach((e) => edit(state, e.variable, e.value));
    state.data.rev++;                          // covers the empty-edits case (just the reset)
    state.data.warning = contrastWarning();
    state.data.lastCount = theme.edits.length;
    const title = theme.title || text;
    state.data.lastLabel = title;
    // Auto-save the titled theme to the persistent library.
    if (theme.edits.length) { state.data.styles = addStyle(title, theme.edits); state.data.justSaved = true; }
  } catch (err: any) {
    state.data.lastCount = -1;
    state.data.toast = "The model glitched: " + (err?.message || err);
  } finally {
    state.data.thinking = false;
  }
}

// Load the WebLLM engine into the studio state, driving the status/progress UI.
async function startEngineLoad(state: any) {
  if (typeof navigator === "undefined" || !(navigator as any).gpu) { state.data.modelStatus = "nogpu"; return; }
  if (state.data.modelStatus === "loading" || state.data.modelStatus === "ready") return;
  state.data.modelStatus = "loading";
  state.data.modelProgress = 0;
  state.data.modelMsg = "Loading the design model…";
  try {
    const { loadEngine } = await import("./llm");
    await loadEngine((pct: number, txt: string) => {
      state.data.modelProgress = pct;
      state.data.modelMsg = txt;
    });
    state.data.modelStatus = "ready";
    state.data.modelMsg = "";
  } catch (err: any) {
    state.data.modelStatus = "error";
    state.data.modelMsg = "Couldn't load the model: " + (err?.message || err);
  }
}

/**
 * Called when the Studio is opened: if there's no WebGPU, surface that; if the model
 * is already cached locally, kick the load off automatically (it'll init from cache,
 * fast). Otherwise leave the (pulsing) "Load the design model" button for an explicit click.
 */
export async function autoLoadIfCached(state: any) {
  if (state.data.modelStatus !== "idle") return;
  if (typeof navigator === "undefined" || !(navigator as any).gpu) { state.data.modelStatus = "nogpu"; return; }
  try {
    const { isModelCached } = await import("./llm");
    if (await isModelCached()) startEngineLoad(state);
  } catch { /* probe failed — leave the manual button */ }
}

// --- helpers shared by manual + AI edits ---------------------------------
function edit(state: any, name: string, value: string) {
  const prev = getCurrent(name);
  applyEdit(name, value);
  state.data.history = [...state.data.history, { name, prev }];
  state.data.rev++;
  state.data.warning = contrastWarning();
}

// --- components ----------------------------------------------------------
function StudioApp(): string {
  return `
    <div class="st-app">
      <div class="st-banner">⚠ This restyles the <b>live site&nbsp</b> by overwriting its CSS variables. Things can look broken or unreadable. That's half the fun. Your theme is <b>remembered across visits</b>; pick <b>State Street&nbsp</b> to restore the original.</div>
      <div class="st-stage"><StudioStatus/><StudioPrompt/></div>
      <StudioStyles/>
      <div class="st-manual"><div class="eyebrow">Manual tokens</div><StudioPanel/></div>
      <StudioFooter/>
    </div>`;
}

// Model load gate. Renders nothing once ready — the prompt box takes over.
function StudioStatus({ state }: any): string {
  const s = state.data.modelStatus;
  if (s === "ready") return "";
  if (s === "nogpu") return `<div class="st-status st-status--warn">The AI needs a WebGPU browser (recent Chrome/Edge). The manual panel below still works.</div>`;
  if (s === "error") return `<div class="st-status st-status--warn">${esc(state.data.modelMsg)}</div>`;
  if (s === "loading") {
    const pct = Math.round((state.data.modelProgress || 0) * 100);
    return `<div class="st-status">
      <div class="st-progress"><div class="st-progress__bar" style="width:${pct}%"></div></div>
      <div class="ex-muted">${esc(state.data.modelMsg || "Loading the design model…")} ${pct}%</div>
    </div>`;
  }
  return `<div class="st-status">
    <button class="ex-btn ex-btn--accent st-load" :click=loadModel()>Load the design model</button>
    <span class="ex-muted">~1&nbsp;GB one-time download, runs fully on your device.</span>
  </div>`;
}

// The single prompt that drives the whole aesthetic. Hidden until the model is loaded.
function StudioPrompt({ state }: any): string {
  if (state.data.modelStatus !== "ready") return "";
  const thinking = state.data.thinking;
  let status: string;
  if (thinking) status = `<div class="st-result is-thinking">Designing the theme…</div>`;
  else if (state.data.lastCount < 0) status = `<div class="st-result ex-err">The model couldn't theme that — try again.</div>`;
  else if (state.data.lastLabel && state.data.lastCount <= 0) status = `<div class="st-result">Restored “${esc(state.data.lastLabel)}”.</div>`;
  else if (state.data.lastLabel) status = `<div class="st-result">Applied “${esc(state.data.lastLabel)}” — ${state.data.lastCount} change${state.data.lastCount === 1 ? "" : "s"}.${state.data.justSaved ? " Saved below." : ""}</div>`;
  else status = `<div class="st-result ex-muted">One prompt restyles the whole site — try “moody cyberpunk”, “warm newspaper”, “vaporwave sunset”, “brutalist mono”. Each theme is saved automatically.</div>`;
  return `
    <form class="st-prompt" onsubmit="return false">
      <input class="ex-input st-prompt__input" placeholder="Describe an aesthetic…" ${thinking ? "disabled" : ""} :keydown=onPromptKey()/>
      <button class="ex-btn ex-btn--accent st-prompt__go" :click=applyPrompt() ${thinking ? "disabled" : ""}>${thinking ? "Designing…" : "Restyle"}</button>
    </form>
    ${status}`;
}

// The saved-styles library. AI themes auto-save here (titled by the model); a saved
// style re-applies on click. Persisted in localStorage, so it survives a refresh.
// Build the inline --pv-* preview vars so a chip wears its own theme (falling back to
// the site tokens for anything that theme didn't set) — a partial at-a-glance preview.
// Keep " (font stacks need it) but drop ' and ; so a value can't break the attr.
function previewVars(edits: any[]): string {
  const sv = (v: string) => esc(String(v)).replace(/[';]/g, "");
  const m: Record<string, string> = {};
  edits.forEach((e: any) => { m[e.variable] = e.value; });
  return [
    `--pv-bg:${sv(m["--paper"] || m["--paper-hi"] || "var(--paper-hi)")}`,
    `--pv-ink:${sv(m["--ink"] || "var(--ink)")}`,
    `--pv-faint:${sv(m["--ink-faint"] || m["--ink-soft"] || "var(--ink-faint)")}`,
    `--pv-accent:${sv(m["--accent"] || "var(--line)")}`,
    `--pv-accent-ink:${sv(m["--accent-ink"] || "var(--accent-ink)")}`,
    `--pv-font:${m["--font-display"] ? sv(m["--font-display"]) : "inherit"}`,
  ].join(";");
}

function StudioStyles({ state }: any): string {
  // The built-in "State Street" chip restores the original look. It applies through the
  // same path as the others (applyStyle), can't be deleted, and previews the defaults.
  const chip = (id: string, title: string, edits: any[], builtin: boolean) => `
      <div class="st-style${builtin ? " st-style--home" : ""}" style='${previewVars(edits)}'>
        <button class="st-style__apply" :click=applyStyle(id=${id}) title="Apply this style">${esc(title)}${builtin ? "" : ` <em>${edits.length}</em>`}</button>
        ${builtin ? "" : `<button class="st-style__del" :click=deleteStyle(id=${id}) title="Delete">×</button>`}
      </div>`;
  const home = chip("default", "State Street", defaultEdits(), true);
  const saved = state.data.styles.map((s: any) => chip(s.id, s.title, s.edits, false)).join("");
  return `<div class="st-styles"><div class="eyebrow">Styles</div><div class="st-styles__list">${home}${saved}</div></div>`;
}

function StudioPanel({ state }: any): string {
  void state.data.rev; // dep: re-render on any theme change
  const groups: Record<string, typeof EDITABLE_TOKENS> = {};
  EDITABLE_TOKENS.forEach((t) => { (groups[t.group] = groups[t.group] || []).push(t); });
  const control = (t: any) => {
    const cur = getCurrent(t.name);
    // :change (not :input) so the control commits on release/close — a mid-drag
    // re-render would rebuild the <input> and disengage the picker/slider.
    if (t.type === "color")
      return `<label class="st-ctrl" title="${esc(t.desc)}"><span>${t.label}</span><input type="color" value="${toHex(cur)}" :change=setToken(name=${t.name})/></label>`;
    if (t.type === "font")
      return `<label class="st-ctrl" title="${esc(t.desc)}"><span>${t.label}</span><select :change=setToken(name=${t.name})>${FONT_OPTIONS.map((o) => `<option value='${o.value}'>${o.label}</option>`).join("")}</select></label>`;
    return `<label class="st-ctrl" title="${esc(t.desc)}"><span>${t.label}</span><input type="range" min="0" max="28" value="${parseInt(cur) || 0}" :change=setLen(name=${t.name})/><code>${esc(cur)}</code></label>`;
  };
  const sections = Object.keys(groups)
    .map((g) => `<div class="st-tgroup"><h4>${g}</h4>${groups[g].map(control).join("")}</div>`)
    .join("");
  return `<div class="st-panel">${sections}</div>`;
}

function StudioFooter({ state }: any): string {
  void state.data.rev;
  const warn = state.data.warning ? `<div class="st-warn">${esc(state.data.warning)}</div>` : "";
  return `
    <div class="st-footer">
      ${warn}
      <div class="st-row">
        <button class="ex-btn" :click=undo() ${state.data.history.length ? "" : "disabled"}>Undo</button>
        <button class="ex-btn" :click=saveCurrent() ${hasOverrides() ? "" : "disabled"}>Save look</button>
        <button class="ex-btn" :click=exportTheme() ${hasOverrides() ? "" : "disabled"}>Export CSS</button>
        <span class="ex-muted">${esc(state.data.toast || "Your theme & styles are saved in cookies. Pick State Street to restore the original.")}</span>
      </div>
    </div>`;
}

// --- methods -------------------------------------------------------------
const methods: Record<string, (ctx: any) => void> = {
  setToken: ({ state, event, name }: any) => edit(state, name, event.target.value),
  setLen: ({ state, event, name }: any) => edit(state, name, `${event.target.value}px`),
  undo: ({ state }: any) => {
    const h = state.data.history.slice();
    const last = h.pop();
    if (!last) return;
    applyEdit(last.name, last.prev);
    state.data.history = h;
    state.data.rev++;
    state.data.warning = contrastWarning();
  },
  exportTheme: ({ state }: any) => {
    const css = exportCss();
    if (navigator.clipboard) navigator.clipboard.writeText(css).catch(() => {});
    state.data.toast = "Copied :root { … } to your clipboard ✓";
    setTimeout(() => { state.data.toast = ""; }, 2200);
  },
  // --- Saved styles ---
  applyStyle: ({ state, id }: any) => {
    // id "default" is the built-in State Street style: a clean reset to the original.
    const s = id === "default" ? { title: "State Street", edits: [] as any[] } : getStyle(id);
    if (!s) return;
    resetTheme();
    state.data.history = [];
    s.edits.forEach((e: any) => edit(state, e.variable, e.value));
    state.data.rev++;
    state.data.warning = contrastWarning();
    state.data.lastLabel = s.title;
    state.data.lastCount = s.edits.length;
    state.data.justSaved = false;
  },
  deleteStyle: ({ state, id }: any) => { state.data.styles = removeStyle(id); },
  saveCurrent: ({ state }: any) => {
    const edits = currentEdits();
    if (!edits.length) { state.data.toast = "Nothing to save yet — change something first."; return; }
    const title = (window.prompt("Name this style:", `Custom ${state.data.styles.length + 1}`) || "").trim();
    if (!title) return;
    state.data.styles = addStyle(title, edits);
    state.data.lastLabel = title;
    state.data.lastCount = edits.length;
    state.data.justSaved = true;
    state.data.toast = `Saved “${title}”.`;
  },
  // --- AI: load the local model (WebLLM, lazily loaded) ---
  loadModel: ({ state }: any) => { startEngineLoad(state); },
  applyPrompt: ({ state, event }: any) => {
    const input = event?.target?.previousElementSibling;
    const text = (input?.value || "").trim();
    if (input) input.value = "";
    runPrompt(state, text);
  },
  onPromptKey: ({ state, event }: any) => {
    if (event.key !== "Enter") return;
    const text = (event.target.value || "").trim();
    event.target.value = "";
    runPrompt(state, text);
  },
};

export const studioApp = {
  template: `<StudioApp/>`,
  data: {
    modelStatus: "idle",
    modelProgress: 0,
    modelMsg: "",
    thinking: false,
    lastLabel: "",
    lastCount: 0,
    justSaved: false,
    styles: loadStyles(),
    rev: 0,
    history: [] as { name: string; prev: string }[],
    warning: "",
    toast: "",
  },
  components: { StudioApp, StudioStatus, StudioPrompt, StudioStyles, StudioPanel, StudioFooter },
  methods,
};
