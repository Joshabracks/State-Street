"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_street_1 = require("@state-street/state-street");
require("./styles/index.css");
const state_1 = require("./state");
const app_sst_1 = require("./app.sst");
const SiteHeader_sst_1 = require("./components/SiteHeader.sst");
const SiteFooter_sst_1 = require("./components/SiteFooter.sst");
const CodeBlock_sst_1 = require("./components/CodeBlock.sst");
const Landing_sst_1 = require("./views/Landing.sst");
const StyleGuide_sst_1 = require("./views/StyleGuide.sst");
const Docs_sst_1 = require("./views/Docs.sst");
const Examples_sst_1 = require("./views/Examples.sst");
// Component registry. State Street matches `<Tag/>` against these keys, so the
// view names here must line up with the VIEWS map in state.ts.
const components = {
    AppRoot: app_sst_1.AppRoot,
    Content: app_sst_1.Content,
    SiteHeader: SiteHeader_sst_1.SiteHeader,
    SiteFooter: SiteFooter_sst_1.SiteFooter,
    CodeBlock: CodeBlock_sst_1.CodeBlock,
    Landing: Landing_sst_1.Landing,
    StyleGuide: StyleGuide_sst_1.StyleGuide,
    Docs: Docs_sst_1.Docs,
    Examples: Examples_sst_1.Examples,
};
const template = `<AppRoot/>`;
function boot() {
    const app = new state_street_1.State(template, state_1.data, components, state_1.methods);
    // Keep the view in sync with browser back/forward (hash changes not driven by setView).
    window.addEventListener("hashchange", () => {
        const key = (location.hash || "").replace(/^#/, "");
        if (state_1.VIEWS[key] && app.data.view !== key)
            app.data.view = key;
    });
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
}
else {
    boot();
}
//# sourceMappingURL=index.js.map