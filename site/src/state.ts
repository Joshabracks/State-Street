import type { Ctx } from "./types";
import { highlightSST } from "./highlight";
import { DOC_GROUP_MAP, DEFAULT_DOC_GROUP } from "./docs/groups";
import { EXAMPLE_MAP, DEFAULT_EXAMPLE } from "./examples";
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

/**
 * Parse `location.hash` into a view + optional sub-group (e.g. `#docs/api`).
 * Section/TOC links never set the hash, so the router only deals with two levels.
 */
export function parseHash(): { view: string; group: string } {
  const raw = (location.hash || "").replace(/^#/, "");
  const slash = raw.indexOf("/");
  const v = slash === -1 ? raw : raw.slice(0, slash);
  const g = slash === -1 ? "" : raw.slice(slash + 1);
  return { view: VIEWS[v] ? v : "landing", group: g };
}

const initial = parseHash();

/** The single reactive state object. Top-level keys are the dep-gating unit. */
export const data: Record<string, any> = {
  title: "State Street — a tiny reactive framework",
  view: initial.view,
  // Docs sub-route + scroll-spy state.
  docGroup: DOC_GROUP_MAP[initial.group] ? initial.group : DEFAULT_DOC_GROUP,
  docActiveSection: "",
  // Examples sub-route.
  exampleId: initial.view === "examples" && EXAMPLE_MAP[initial.group] ? initial.group : DEFAULT_EXAMPLE,
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
    if (target === "docs") {
      const g = state.data.docGroup || DEFAULT_DOC_GROUP;
      state.data.docGroup = g;
      if (location.hash.replace(/^#/, "") !== `docs/${g}`) location.hash = `docs/${g}`;
    } else if (target === "examples") {
      const id = state.data.exampleId || DEFAULT_EXAMPLE;
      state.data.exampleId = id;
      if (location.hash.replace(/^#/, "") !== `examples/${id}`) location.hash = `examples/${id}`;
    } else if (location.hash.replace(/^#/, "") !== target) {
      location.hash = target;
    }
    state.data.view = target;
  },
  // Switch the active example (sidebar). A `#examples/<id>` sub-route.
  setExample: ({ id, state }: Ctx) => {
    if (!EXAMPLE_MAP[id]) return;
    window.scrollTo(0, 0);
    state.data.exampleId = id;
    state.data.view = "examples";
    if (location.hash.replace(/^#/, "") !== `examples/${id}`) location.hash = `examples/${id}`;
  },
  // Switch the active docs group (sidebar). A `#docs/<group>` sub-route.
  setDocGroup: ({ group, state }: Ctx) => {
    if (!DOC_GROUP_MAP[group]) return;
    window.scrollTo(0, 0);
    state.data.docGroup = group;
    state.data.docActiveSection = "";
    state.data.view = "docs";
    if (location.hash.replace(/^#/, "") !== `docs/${group}`) location.hash = `docs/${group}`;
  },
  // Scroll a docs section into view (TOC). Does not touch the hash.
  docScrollTo: ({ id, state }: Ctx) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    state.data.docActiveSection = id;
  },
  inc: ({ state }: Ctx) => { state.data.count++; },
  dec: ({ state }: Ctx) => { state.data.count--; },
  resetCount: ({ state }: Ctx) => { state.data.count = 0; },
  // `:raw=highlightSST` formatter — syntax-highlights a code sample, returning
  // HTML that the framework sets as the element's innerHTML (see highlight.ts).
  highlightSST: ({ text }: Ctx) => highlightSST(text),
};
