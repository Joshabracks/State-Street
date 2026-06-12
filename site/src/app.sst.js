"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Content = exports.AppRoot = void 0;
const state_1 = require("./state");
/** Root shell: sticky header, the active view, and the footer. */
function AppRoot(_ctx) {
    return `
    <div class="shell">
      <SiteHeader/>
      <main><Content/></main>
      <SiteFooter/>
    </div>
  `;
}
exports.AppRoot = AppRoot;
/**
 * View dispatcher. Reads only `state.data.view`, so it is the single component
 * that re-renders on navigation. `<${name}/>` resolves to a registered view
 * component (State Street matches component tags by registry membership).
 */
function Content({ state }) {
    const name = state_1.VIEWS[state.data.view] || "Landing";
    return `<${name}/>`;
}
exports.Content = Content;
//# sourceMappingURL=app.sst.js.map