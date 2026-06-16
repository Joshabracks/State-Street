import type { Ctx } from "../../types";

export function DocFaq(_ctx: Ctx): string {
  return `
    <div class="docs-content">
      <div class="eyebrow">Section 08 // faq</div>
      <h1>FAQ</h1>

      <section class="docs-section" id="faq">
        <h2>Frequently asked</h2>

        <h3>Why no JSX?</h3>
        <p>Plain template strings work in any editor, any test runner, with no build step. JSX needs a transpiler — a tradeoff State Street declines.</p>

        <h3>Why no virtual DOM?</h3>
        <p>A virtual DOM is <em>overhead</em> other frameworks adopt to make coarse "re-render the whole tree on any change" tolerable — diffing a cheap in-memory tree beats blindly re-touching the real DOM. State Street is fine-grained instead of coarse, so it does not need one:</p>
        <ul>
          <li>A <code>{{ }}</code> State Binding updates its text/attribute node <strong>in place</strong> — no component re-run, no tree, no diff (the same approach as Solid/Svelte, and less work than a vDOM diff).</li>
          <li>A component re-runs <strong>only</strong> when a top-level key it read goes dirty (dep gating), and if its new output is byte-identical the DOM is left untouched.</li>
        </ul>
        <p>The one honest tradeoff: when a component <em>does</em> re-render, its whole rendered range is rebuilt and swapped in place rather than diffed element-by-element — so keep components small and put frequently-changing values in State Bindings, and there is nothing a diff engine would have saved.</p>

        <h3>Can I use TypeScript?</h3>
        <p>Yes — the source is TypeScript. The reactive proxy types as <code>any</code> (a proxy can't be type-checked at compile time without significant ceremony). Wrap your own typed accessors if you want stricter types.</p>

        <h3>How big is it?</h3>
        <p>Small enough that it's never the reason your bundle is big. Zero runtime dependencies.</p>

        <h3>Does it work in Node?</h3>
        <p>Not directly — it touches <code>document.body</code> and <code>requestAnimationFrame</code>. Use jsdom or a browser for tests. The reactive proxy logic itself is environment-agnostic.</p>

        <h3>Can I render to a specific container?</h3>
        <p>Yes — <code>document.body</code> is just the default. Pass the <code>mountTarget</code> option (an <code>Element</code> or CSS selector) to mount anywhere, run multiple States on one page, or nest one State inside an element owned by another (auto-preserved). See the API reference &rarr; Mounting &amp; lifecycle and Nested States.</p>

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
