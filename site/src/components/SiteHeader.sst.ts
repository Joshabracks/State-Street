import type { Ctx } from "../types";
import { NAV, VERSION } from "../state";
import { LOGO_SVG } from "./logo";

/**
 * Sticky site header: brand mark + catalog stamp + hash-nav.
 * Reads `state.data.view` so it re-renders on navigation to move the
 * aria-current highlight. Nav links are anchors (real #hash URLs) that also
 * fire `setView` — the canonical State Street navigation, no router.
 */
export function SiteHeader({ state }: Ctx): string {
  const current = state.data.view;
  const links = NAV.map(
    (item) =>
      `<a class="nav__link" href="#${item.key}" aria-current="${item.key === current}" :click=setView(target=${item.key})>${item.label}</a>`
  ).join("");

  return `
    <header class="site-header">
      <div class="wrap site-header__bar">
        <div class="brand">
          <a class="brand__home" href="#landing" aria-label="State Street — home" :click=setView(target=landing)>
            ${LOGO_SVG}
            <span class="brand__mark">State Street</span>
          </a>
          <span class="brand__cat">[SS&middot;${VERSION}]</span>
        </div>
        <nav class="nav">
          ${links}
          <a class="nav__link" href="https://github.com/Joshabracks/State-Street" target="_blank" rel="noopener">GitHub &#8599;</a>
        </nav>
      </div>
    </header>
  `;
}
