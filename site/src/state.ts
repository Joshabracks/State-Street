import type { Ctx } from "./types";
import { highlightSST } from "./highlight";
// Routed through webpack's asset pipeline so it resolves in dev and prod.
import logoUrl from "../static/sstlogo.png";

/**
 * View registry — maps a hash key (in the URL) to a registered component name.
 * State Street identifies component tags by registry membership (see parseSST),
 * so `<${VIEWS[view]}/>` dispatches to the right view component.
 */
export const VIEWS: Record<string, string> = {
  landing: "Landing",
  styleguide: "StyleGuide",
  docs: "Docs",
  examples: "Examples",
};

/** Nav items shown in the header, in order. */
export const NAV: Array<{ key: string; label: string }> = [
  { key: "landing", label: "Index" },
  { key: "styleguide", label: "Type Specimen" },
  { key: "docs", label: "Docs" },
  { key: "examples", label: "Examples" },
];

/** Resolve the initial view from the URL hash (e.g. #docs), defaulting to landing. */
export function initialView(): string {
  const key = (location.hash || "").replace(/^#/, "");
  return VIEWS[key] ? key : "landing";
}

/** The single reactive state object. Top-level keys are the dep-gating unit. */
export const data: Record<string, any> = {
  title: "State Street — the 10kb framework",
  view: initialView(),
  logoUrl,
  // Live-demo state (landing page), proving the site runs on State Street.
  count: 0,
};

/** Methods wired to `:event=name()` directives and `:raw=fn` formatters.
 *  Event handlers return void; `:raw` formatters return an HTML string. */
export const methods: Record<string, (ctx: Ctx) => void | string> = {
  // Hash-driven view switch — the canonical State Street "navigation" (no router).
  setView: ({ target, state }: Ctx) => {
    if (!VIEWS[target]) return;
    window.scrollTo(0, 0);
    if (location.hash.replace(/^#/, "") !== target) location.hash = target;
    state.data.view = target;
  },
  inc: ({ state }: Ctx) => { state.data.count++; },
  dec: ({ state }: Ctx) => { state.data.count--; },
  resetCount: ({ state }: Ctx) => { state.data.count = 0; },
  // `:raw=highlightSST` formatter — syntax-highlights a code sample, returning
  // HTML that the framework sets as the element's innerHTML (see highlight.ts).
  highlightSST: ({ text }: Ctx) => highlightSST(text),
};
