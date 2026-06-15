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

// Inline social icons (footer only). fill=currentColor so they take the link colour
// (--invert-fg, hover --accent-hi) and stay on-theme with the rest of the footer.
const GITHUB_ICON = `<svg class="ico" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><g fill="currentColor" fill-rule="evenodd"><g transform="translate(-140,-7559)"><g transform="translate(56,160)"><path d="M94,7399 C99.523,7399 104,7403.59 104,7409.253 C104,7413.782 101.138,7417.624 97.167,7418.981 C96.66,7419.082 96.48,7418.762 96.48,7418.489 C96.48,7418.151 96.492,7417.047 96.492,7415.675 C96.492,7414.719 96.172,7414.095 95.813,7413.777 C98.04,7413.523 100.38,7412.656 100.38,7408.718 C100.38,7407.598 99.992,7406.684 99.35,7405.966 C99.454,7405.707 99.797,7404.664 99.252,7403.252 C99.252,7403.252 98.414,7402.977 96.505,7404.303 C95.706,7404.076 94.85,7403.962 94,7403.958 C93.15,7403.962 92.295,7404.076 91.497,7404.303 C89.586,7402.977 88.746,7403.252 88.746,7403.252 C88.203,7404.664 88.546,7405.707 88.649,7405.966 C88.01,7406.684 87.619,7407.598 87.619,7408.718 C87.619,7412.646 89.954,7413.526 92.175,7413.785 C91.889,7414.041 91.63,7414.493 91.54,7415.156 C90.97,7415.418 89.522,7415.871 88.63,7414.304 C88.63,7414.304 88.101,7413.319 87.097,7413.247 C87.097,7413.247 86.122,7413.234 87.029,7413.87 C87.029,7413.87 87.684,7414.185 88.139,7415.37 C88.139,7415.37 88.726,7417.2 91.508,7416.58 C91.513,7417.437 91.522,7418.245 91.522,7418.489 C91.522,7418.76 91.338,7419.077 90.839,7418.982 C86.865,7417.627 84,7413.783 84,7409.253 C84,7403.59 88.478,7399 94,7399"/></g></g></g></svg>`;
const DISCORD_ICON = `<svg class="ico ico--wide" viewBox="0 -28.5 256 256" preserveAspectRatio="xMidYMid" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="nonzero" d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"/></svg>`;

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
          <a class="footer-link" href="https://github.com/Joshabracks/State-Street" target="_blank" rel="noopener">${GITHUB_ICON}<span>GitHub</span></a>
          <a class="footer-link" href="https://discord.gg/WDDDquMNFs" target="_blank" rel="noopener">${DISCORD_ICON}<span>Discord</span></a>
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
