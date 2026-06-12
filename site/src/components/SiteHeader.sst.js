"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteHeader = void 0;
const state_1 = require("../state");
/**
 * Sticky site header: brand mark + catalog stamp + hash-nav.
 * Reads `state.data.view` so it re-renders on navigation to move the
 * aria-current highlight. Nav links are anchors (real #hash URLs) that also
 * fire `setView` — the canonical State Street navigation, no router.
 */
function SiteHeader({ state }) {
    const current = state.data.view;
    const links = state_1.NAV.map((item) => `<a class="nav__link" href="#${item.key}" aria-current="${item.key === current}" :click=setView(target=${item.key})>${item.label}</a>`).join("");
    return `
    <header class="site-header">
      <div class="wrap site-header__bar">
        <div class="brand">
          <img class="brand__logo" src="{{logoUrl}}" alt="State Street logo" width="67" height="24"/>
          <span class="brand__mark">State Street</span>
          <span class="brand__cat">[SS&middot;2.0.0]</span>
        </div>
        <nav class="nav">
          ${links}
          <a class="nav__link" href="https://github.com/Joshabracks/State-Street" target="_blank" rel="noopener">GitHub &#8599;</a>
        </nav>
      </div>
    </header>
  `;
}
exports.SiteHeader = SiteHeader;
//# sourceMappingURL=SiteHeader.sst.js.map