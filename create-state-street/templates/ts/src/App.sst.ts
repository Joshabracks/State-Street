/** The landing component. A component is a plain function that returns an HTML string. */
export function App({ state }: any): string {
  return `
    <main class="wrap">
      <div class="eyebrow">{{name}} // running on State Street</div>
      <h1 class="wordmark">State Street</h1>
      <p class="lede">
        A lightweight single-page framework. This whole page is a live State Street app —
        open <code>src/App.sst.ts</code>, change something, and reload.
      </p>
      <nav class="links">
        <a class="btn btn--accent" href="https://joshabracks.github.io/State-Street/" target="_blank" rel="noopener">Website</a>
        <a class="btn" href="https://github.com/Joshabracks/State-Street" target="_blank" rel="noopener">GitHub</a>
        <a class="btn" href="https://discord.gg/WDDDquMNFs" target="_blank" rel="noopener">Discord</a>
      </nav>
      <div class="demo">
        <button class="btn btn--ghost" :click=inc()>Clicked ${state.data.count} time${state.data.count === 1 ? "" : "s"}</button>
        <span class="demo__hint">&larr; reactivity in one line (see methods.inc)</span>
      </div>
      <div class="foot">Made with State Street</div>
    </main>
  `;
}
