"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = exports.data = exports.initialView = exports.NAV = exports.VIEWS = void 0;
const snippets_1 = require("./snippets");
// Routed through webpack's asset pipeline so it resolves in dev and prod.
const sstlogo_png_1 = __importDefault(require("../static/sstlogo.png"));
/**
 * View registry — maps a hash key (in the URL) to a registered component name.
 * State Street identifies component tags by registry membership (see parseSST),
 * so `<${VIEWS[view]}/>` dispatches to the right view component.
 */
exports.VIEWS = {
    landing: "Landing",
    styleguide: "StyleGuide",
    docs: "Docs",
    examples: "Examples",
};
/** Nav items shown in the header, in order. */
exports.NAV = [
    { key: "landing", label: "Index" },
    { key: "styleguide", label: "Type Specimen" },
    { key: "docs", label: "Docs" },
    { key: "examples", label: "Examples" },
];
/** Resolve the initial view from the URL hash (e.g. #docs), defaulting to landing. */
function initialView() {
    const key = (location.hash || "").replace(/^#/, "");
    return exports.VIEWS[key] ? key : "landing";
}
exports.initialView = initialView;
/** The single reactive state object. Top-level keys are the dep-gating unit. */
exports.data = Object.assign({ title: "State Street — the 10kb framework", view: initialView(), logoUrl: sstlogo_png_1.default, 
    // Live-demo state (landing page), proving the site runs on State Street.
    count: 0 }, snippets_1.snippets);
/** Methods wired to `:event=name()` directives in templates. */
exports.methods = {
    // Hash-driven view switch — the canonical State Street "navigation" (no router).
    setView: ({ target, state }) => {
        if (!exports.VIEWS[target])
            return;
        window.scrollTo(0, 0);
        if (location.hash.replace(/^#/, "") !== target)
            location.hash = target;
        state.data.view = target;
    },
    inc: ({ state }) => { state.data.count++; },
    dec: ({ state }) => { state.data.count--; },
    resetCount: ({ state }) => { state.data.count = 0; },
};
//# sourceMappingURL=state.js.map