/**
 * Live theme manipulation: edits the site's :root design tokens (global), tracks
 * overrides for export/reset, normalizes colors, and runs a WCAG contrast check.
 * The chosen theme is persisted to a cookie, so the applied look survives a refresh
 * (the built-in "State Street" style restores the original).
 */
import { EDITABLE_TOKENS } from "./tokens";
import { getCookie, setCookie } from "./cookies";

const root = () => document.documentElement;
const overrides: Record<string, string> = {};

const CHOSEN = "sst_theme";

// Capture the stylesheet's original token values ONCE, up front — before any persisted
// theme is restored — so the built-in "State Street" style always reflects the originals.
const DEFAULTS: Record<string, string> = (() => {
  const cs = getComputedStyle(root());
  const d: Record<string, string> = {};
  for (const t of EDITABLE_TOKENS) d[t.name] = cs.getPropertyValue(t.name).trim();
  return d;
})();

/** Persist the current overrides as the chosen theme (compact [name,value] pairs). */
function persistChosen(): void {
  const e = currentEdits();
  setCookie(CHOSEN, e.length ? JSON.stringify(e.map((x) => [x.variable, x.value])) : "");
}

/** Re-apply the persisted chosen theme on load (directly, without re-persisting). */
function restoreChosen(): void {
  try {
    const raw = getCookie(CHOSEN);
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return;
    for (const p of arr) {
      if (typeof p?.[0] === "string" && typeof p?.[1] === "string") {
        root().style.setProperty(p[0], p[1]);
        overrides[p[0]] = p[1];
      }
    }
  } catch { /* malformed cookie — ignore */ }
}

/** Current computed value of a token (reflects any override). */
export function getCurrent(name: string): string {
  return getComputedStyle(root()).getPropertyValue(name).trim();
}

/** Set a token on :root (affects the whole site) and record + persist the override. */
export function applyEdit(name: string, value: string): void {
  root().style.setProperty(name, value);
  overrides[name] = value;
  persistChosen();
}

/** Remove all our overrides — back to the stylesheet defaults. */
export function resetTheme(): void {
  for (const name in overrides) root().style.removeProperty(name);
  for (const name in overrides) delete overrides[name];
  persistChosen();
}

export function hasOverrides(): boolean {
  return Object.keys(overrides).length > 0;
}

/** Current overrides as a list of edits (for saving the look as a style). */
export function currentEdits(): { variable: string; value: string }[] {
  return Object.keys(overrides).map((n) => ({ variable: n, value: overrides[n] }));
}

/** Build a copy-pasteable :root block of the current overrides. */
export function exportCss(): string {
  const lines = Object.keys(overrides).map((n) => `  ${n}: ${overrides[n]};`);
  return lines.length ? `:root {\n${lines.join("\n")}\n}` : "/* no changes yet */";
}

/** Normalize any CSS color string to [r,g,b] via the browser. */
export function toRgb(color: string): [number, number, number] | null {
  const el = document.createElement("span");
  el.style.color = "";
  el.style.color = color;
  if (!el.style.color) return null;   // invalid color string
  el.style.display = "none";
  document.body.appendChild(el);
  const rgb = getComputedStyle(el).color;
  el.remove();
  const m = rgb.match(/\d+(\.\d+)?/g);
  return m && m.length >= 3 ? [Number(m[0]), Number(m[1]), Number(m[2])] : null;
}

/** Normalize any color to a #rrggbb hex (for the <input type=color> controls). */
export function toHex(color: string): string {
  const rgb = toRgb(color);
  if (!rgb) return "#000000";
  return "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function luminance([r, g, b]: [number, number, number]): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function ratio(c1: [number, number, number], c2: [number, number, number]): number {
  const l1 = luminance(c1), l2 = luminance(c2);
  const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

/** Returns a (flamboyant) warning if a key text/background pair is unreadable. */
export function contrastWarning(): string {
  // Real fg/bg combinations on the site (see base.css / chrome.css): the body is
  // --ink on --paper; every dark surface (header, footer, table heads, code bars)
  // is --invert-fg on --invert-bg.
  const pairs: [string, string, string][] = [
    ["--ink", "--paper", "body text"],
    ["--invert-fg", "--invert-bg", "the header & footer"],
  ];
  for (const [fg, bg, what] of pairs) {
    const a = toRgb(getCurrent(fg));
    const b = toRgb(getCurrent(bg));
    if (a && b && ratio(a, b) < 3) {
      return `Low contrast — ${what} may be hard to read.`;
    }
  }
  return "";
}

/** The original token values, for the built-in "State Street" style. */
export function defaultEdits(): { variable: string; value: string }[] {
  return EDITABLE_TOKENS.map((t) => ({ variable: t.name, value: DEFAULTS[t.name] }));
}

/** A snapshot of current token values (for the panel + diff). */
export function snapshotTokens(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const t of EDITABLE_TOKENS) out[t.name] = getCurrent(t.name);
  return out;
}

// Re-apply the persisted chosen theme on load (after DEFAULTS is captured above).
restoreChosen();
