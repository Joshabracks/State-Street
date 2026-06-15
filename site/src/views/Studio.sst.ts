import type { Ctx } from "../types";

/**
 * Studio view (main-State component). It only renders the shell + the #studio-root
 * mount point; the actual Studio is its own isolated child State (see studio/app.ts),
 * mounted into #studio-root at boot — the same child-State pattern as the examples.
 * Leaving the view tears the mount down; returning re-mounts it.
 */
export function Studio(_ctx: Ctx): string {
  return `
    <div class="studio">
      <div class="studio-head">
        <div class="eyebrow">Studio // a client-side design model</div>
        <h1>Redress the site, live.</h1>
        <p class="studio-lede">A tiny language model runs <b>entirely in your browser</b> and turns <b>one prompt</b> into a full design — or skip the AI and turn the knobs yourself. Everything you change here re-themes the <b>whole site</b> instantly.</p>
      </div>
      <div class="demo-frame ticked">
        <div class="demo-frame__bar"><b>live</b><span>#studio-root — its own State</span></div>
        <div class="demo-frame__mount" id="studio-root"></div>
      </div>
    </div>
  `;
}
