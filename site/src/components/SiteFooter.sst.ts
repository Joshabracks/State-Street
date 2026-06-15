import type { Ctx } from "../types";

/**
 * A real-looking barcode as inline SVG: alternating bars/spaces of randomized widths.
 * Generated once per page load (module scope), so it's stable across re-renders but
 * fresh each visit. Bars use currentColor, tinted by the .barcode CSS.
 */
function buildBarcode(width = 180, height = 38): string {
  const rects: string[] = [];
  let x = 0;
  let bar = true; // alternate bar / space
  while (x < width) {
    const w = 1 + Math.floor(Math.random() * 4); // 1–4px modules
    if (bar) {
      const ww = Math.min(w, width - x);
      rects.push(`<rect x="${x}" y="0" width="${ww}" height="${height}" fill="currentColor"/>`);
    }
    x += w;
    bar = !bar;
  }
  return `<svg class="barcode barcode--invert" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="none" role="img" aria-label="barcode">${rects.join("")}</svg>`;
}

const BARCODE = buildBarcode();

/** Technical footer: barcode strip, links of record, and a print-style colophon. */
export function SiteFooter(_ctx: Ctx): string {
  return `
    <footer class="site-footer">
      <div class="wrap site-footer__grid">
        <div class="stack">
          ${BARCODE}
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
        &copy; 2026 &middot; ISC License &middot; 0 dependencies &middot; negligible footprint
      </div>
    </footer>
  `;
}
