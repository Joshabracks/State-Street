// {{PROJECT_NAME}} — a State Street app, no build step.
// Everything on the page is rendered by the <Landing/> component below.
// Docs: https://joshabracks.github.io/State-Street/   ·   AI agents: ./AGENTS.md

const template = `<Landing/>`;

const data = {
  name: "{{PROJECT_NAME}}", // shown via the {{name}} State Binding — updates in place, no re-render
  count: 0,
};

const components = {
  // A component is a plain function that returns an HTML string.
  Landing: ({ state }) => `
    <main class="wrap">
      <div class="eyebrow">{{name}} // running on State Street</div>
      <h1 class="wordmark">State Street</h1>
      <p class="lede">
        A lightweight single-page framework. This whole page is a live State Street app —
        open <code>app.js</code>, change something, and reload.
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
  `,
};

const methods = {
  // Mutating state.data re-renders any component that read it (here, <Landing/>).
  inc: ({ state }) => { state.data.count += 1; },
};

// `State` is the global defined by state-street.global.js (loaded in index.html).
new State(template, data, components, methods);
