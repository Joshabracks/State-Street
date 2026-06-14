import type { Ctx } from "../../types";

export function DocFaq(_ctx: Ctx): string {
  return `
    <div class="docs-content">
      <div class="eyebrow">Section 07 // faq</div>
      <h1>FAQ</h1>

      <section class="docs-section" id="faq">
        <h2>Frequently asked</h2>

        <h3>Why no JSX?</h3>
        <p>Plain template strings work in any editor, any test runner, with no build step. JSX needs a transpiler — a tradeoff State Street declines.</p>

        <h3>Why no virtual DOM?</h3>
        <p>Top-level-key dep gating plus in-place replacement of a component's rendered range is fast enough for the apps State Street targets. There is no per-element diff — just "did this component's tracked state change?".</p>

        <h3>Can I use TypeScript?</h3>
        <p>Yes — the source is TypeScript. The reactive proxy types as <code>any</code> (a proxy can't be type-checked at compile time without significant ceremony). Wrap your own typed accessors if you want stricter types.</p>

        <h3>How big is it?</h3>
        <p>Small enough that it's never the reason your bundle is big. Zero runtime dependencies.</p>

        <h3>Does it work in Node?</h3>
        <p>Not directly — it touches <code>document.body</code> and <code>requestAnimationFrame</code>. Use jsdom or a browser for tests. The reactive proxy logic itself is environment-agnostic.</p>

        <h3>Can I render to a specific container?</h3>
        <p>Not in the current version — the constructor mounts to <code>document.body</code> unconditionally.</p>

        <h3>Server-side rendering?</h3>
        <p>State Street is a runtime reactivity layer, not currently aimed at SSR. Component functions return strings, so you could call them server-side for HTML, but you would lose runtime reactivity.</p>
      </section>

      <section class="docs-section" id="license">
        <h2>License</h2>
        <p>ISC.</p>
        <p class="muted">Found a bug, or a use case the docs don't cover? Open an issue on the <a href="https://github.com/Joshabracks/State-Street" target="_blank" rel="noopener">GitHub repo</a>.</p>
      </section>

      <DocPrevNext group="faq"/>
    </div>
  `;
}
