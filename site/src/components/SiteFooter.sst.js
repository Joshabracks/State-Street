"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteFooter = void 0;
/** Technical footer: barcode strip, links of record, and a print-style colophon. */
function SiteFooter(_ctx) {
    return `
    <footer class="site-footer">
      <div class="wrap site-footer__grid">
        <div class="stack">
          <div class="barcode barcode--invert"></div>
          <div class="site-footer__meta">STATE&middot;STREET / EST. 2026 / A LIGHTWEIGHT SINGLE PAGE FRAMEWORK</div>
        </div>
        <nav class="flex">
          <a href="https://github.com/Joshabracks/State-Street">GitHub</a>
          <a href="https://www.npmjs.com/package/@state-street/state-street">npm</a>
          <a href="https://github.com/Joshabracks/State-Street#readme">README</a>
          <a href="#docs">Docs</a>
        </nav>
      </div>
      <div class="wrap site-footer__meta" style="padding-bottom: var(--sp-5)">
        &copy; 2026 &middot; ISC License &middot; 0 dependencies &middot; ~10kb min
      </div>
    </footer>
  `;
}
exports.SiteFooter = SiteFooter;
//# sourceMappingURL=SiteFooter.sst.js.map