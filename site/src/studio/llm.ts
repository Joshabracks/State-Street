/**
 * The client-side theming model. Lazily loads WebLLM (~1 GB model, cached in-browser),
 * runs it in a Web Worker, and turns a single aesthetic prompt into grammar-constrained
 * JSON: { edits: [{ variable: <one of our tokens>, value: string }] }. The `variable`
 * enum is generated from the token registry, so XGrammar guarantees the model can only
 * ever name a real design token — it cannot invent CSS. No chat, no history, no reply:
 * each prompt is stateless and yields a titled, complete set of token edits to apply.
 */
import { TOKEN_NAMES, EDITABLE_TOKENS, FONT_OPTIONS } from "./tokens";

const MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

export interface Edit { variable: string; value: string }
export interface Theme { title: string; edits: Edit[] }

// JSON schema handed to WebLLM's response_format (stringified). The enum is the real
// token list, so the model is structurally prevented from naming anything else.
const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    edits: {
      type: "array",
      items: {
        type: "object",
        properties: {
          variable: { type: "string", enum: TOKEN_NAMES },
          value: { type: "string" },
        },
        required: ["variable", "value"],
      },
    },
  },
  required: ["title", "edits"],
};
const SCHEMA_STR = JSON.stringify(SCHEMA);

const TOKEN_LINES = EDITABLE_TOKENS.map((t) => `  ${t.name} (${t.label}) — ${t.desc}`).join("\n");
const FONT_LINES = FONT_OPTIONS.map((f) => `  ${f.value}`).join("\n");

const SYSTEM_PROMPT = `You are a CSS design-token theming engine. Given a desired aesthetic, output a COMPLETE set of token edits that restyle an entire website to match. No commentary, no explanation — JSON only.

Editable tokens (use these names exactly, nothing else):
${TOKEN_LINES}

Rules:
- Output ONLY this shape: { "title": <short evocative name, 2-5 words>, "edits": [ { "variable": <token>, "value": <css value> } ] }. No other keys, no prose.
- "title" names the theme you made (e.g. "Neon Obsidian", "Sunbleached Linen") — it is saved as a label.
- Always produce a full, coordinated theme: set the backgrounds (--paper, --paper-hi, --paper-lo), every text level (--ink, --ink-soft, --ink-faint), the accents (--accent, --accent-hi), the link (--signal), and the dark surfaces (--invert-bg, --invert-fg). Add fonts and --radius when the aesthetic calls for it. A theme is many edits, never one or two.
- Keep on-fill text readable against its fill: --accent-ink on --accent, --signal-ink on --signal, --invert-fg on --invert-bg.
- Colors must be valid CSS (hex like #ff3366, rgb(), or named).
- Font tokens must use one of these exact stacks:
${FONT_LINES}
- --radius is a length like "0px", "8px", "20px".

Example —
prompt: moody cyberpunk terminal
{"title":"Neon Obsidian","edits":[{"variable":"--paper","value":"#0a0e14"},{"variable":"--paper-hi","value":"#111722"},{"variable":"--paper-lo","value":"#070b10"},{"variable":"--ink","value":"#9efeff"},{"variable":"--ink-soft","value":"#5fd0d6"},{"variable":"--ink-faint","value":"#3f8f95"},{"variable":"--accent","value":"#ff2bd6"},{"variable":"--accent-hi","value":"#ff6be0"},{"variable":"--accent-ink","value":"#0a0e14"},{"variable":"--signal","value":"#22e3ff"},{"variable":"--signal-ink","value":"#05080d"},{"variable":"--invert-bg","value":"#05080d"},{"variable":"--invert-fg","value":"#9efeff"},{"variable":"--radius","value":"0px"}]}`;

let engine: any = null;
let loading: Promise<any> | null = null;

/**
 * Is the model already downloaded? A lightweight probe of WebLLM's Cache Storage
 * (the `webllm/model` cache) — it does NOT import the heavy WebLLM runtime, so it's
 * cheap to call on Studio open for users who never load the AI.
 */
export async function isModelCached(): Promise<boolean> {
  if (typeof caches === "undefined") return false;
  try {
    if (!(await caches.has("webllm/model"))) return false;
    const c = await caches.open("webllm/model");
    return (await c.keys()).length > 0;
  } catch {
    return false;
  }
}

/** Lazily create (or reuse) the worker-hosted engine. onProgress drives the bar. */
export async function loadEngine(onProgress: (pct: number, text: string) => void): Promise<any> {
  if (engine) return engine;
  if (loading) return loading;
  loading = (async () => {
    const webllm = await import("@mlc-ai/web-llm");
    const worker = new Worker(new URL("./llm.worker.ts", import.meta.url), { type: "module" });
    engine = await webllm.CreateWebWorkerMLCEngine(worker, MODEL_ID, {
      initProgressCallback: (r: any) => onProgress(r.progress || 0, r.text || ""),
    });
    return engine;
  })();
  return loading;
}

/**
 * Turn one aesthetic prompt into a complete set of token edits. Stateless: no history,
 * no current-theme context — the prompt alone drives the whole theme. Returns only the
 * edits whose variable is a real token.
 */
export async function generateTheme(prompt: string): Promise<Theme> {
  if (!engine) throw new Error("model not loaded");
  // Drop any internal conversation / KV state so one prompt never bleeds into the next.
  if (engine.resetChat) { try { await engine.resetChat(); } catch { /* non-fatal */ } }
  const res = await engine.chat.completions.create({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    stream: false,
    temperature: 0.7,
    max_tokens: 800,
    response_format: { type: "json_object", schema: SCHEMA_STR },
  });

  const raw = res.choices?.[0]?.message?.content || "";
  let parsed: any = {};
  try { parsed = JSON.parse(raw); } catch { parsed = {}; }

  const edits: Edit[] = Array.isArray(parsed.edits)
    ? parsed.edits.filter((e: any) => e && TOKEN_NAMES.includes(e.variable) && typeof e.value === "string")
    : [];
  const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
  return { title, edits };
}
