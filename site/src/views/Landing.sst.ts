import type { Ctx } from "../types";

const FEATURES: Array<{ no: string; title: string; body: string }> = [
  { no: "01", title: "Reactive state", body: "Mutate a plain object. Only the components that actually read the changed key re-render." },
  { no: "02", title: "No virtual DOM", body: "No per-element diffing, no reconciler — a component re-runs only when its tracked state changes, and what you write is what renders." },
  { no: "03", title: "Dep-gating", body: "Tracking is per top-level key. A change touches just the subtree that depends on it." },
  { no: "04", title: "Image cache", body: "Base64 sources become cached blob URLs automatically, with LRU eviction and pre-warming." },
  { no: "05", title: "State preserved", body: "Scroll, focus and selection survive re-renders. Inputs, canvas and media are reused, not rebuilt." },
  { no: "06", title: "No build required", body: "Plain template literals. TypeScript and a bundler are optional, never mandatory." },
];

const SPECS: Array<[string, string]> = [
  ["Version", "2.0.0"],
  ["Bundle size", "negligible"],
  ["Dependencies", "0"],
  ["Module", "ESM + UMD"],
  ["Renderer", "rAF loop, dep-gated"],
  ["License", "ISC"],
];

const featureCard = (f: { no: string; title: string; body: string }): string => `
  <div class="feature ticked">
    <span class="feature__no">[#${f.no}]</span>
    <div class="feature__title">${f.title}</div>
    <p class="feature__body">${f.body}</p>
  </div>`;

const specRow = ([k, v]: [string, string]): string => `
  <div class="spec__row"><div class="spec__k">${k}</div><div class="spec__v">${v}</div></div>`;

/** The landing page / index sheet. */
export function Landing(_ctx: Ctx): string {
  return `
    <section class="section hero">
      <div class="wrap stack">
        <div class="eyebrow">Cat. No. SS&middot;2.0.0 // single page framework</div>
        <h1 class="hero__wordmark">State<br/><span>Street</span></h1>
        <p class="hero__lead">A reactive framework so small it disappears into whatever you ship. No virtual DOM, no compiler, no ceremony.</p>
        <div class="hero__cta">
          <a class="btn btn--accent" href="#docs" :click=setView(target=docs)>Get started</a>
          <a class="btn" href="#examples" :click=setView(target=examples)>Examples</a>
          <span class="install">npm i @state-street/state-street</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="panel ticked stack">
          <span class="panel__label">Fig. 01 &mdash; live // running on State Street 2.0.0</span>
          <div class="demo">
            <button :click=dec()>&minus;</button>
            <div class="demo__count">{{count}}</div>
            <button :click=inc()>+</button>
            <button class="btn--ghost" :click=resetCount()>Reset</button>
          </div>
          <p class="muted">This counter is a real State Street component. A click mutates <code>state.data.count</code>; only this panel re-renders &mdash; the rest of the page is untouched.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap stack-lg">
        <div class="eyebrow">Specification // features</div>
        <div class="grid grid--3">
          ${FEATURES.map(featureCard).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap stack-lg">
        <div class="eyebrow">Quick start // direct style</div>
        <div class="grid grid--2">
          <CodeBlock label="Quick start" src="quickstart"/>
          <div class="stack">
            <p>Hand <code>State</code> a template, some data, your components and methods. It mounts to <code><body></code> and keeps the DOM in sync on a requestAnimationFrame loop.</p>
            <div class="spec">
              ${SPECS.map(specRow).join("")}
            </div>
            <a class="btn" href="#docs" :click=setView(target=docs)>Read the docs &#8594;</a>
          </div>
        </div>
      </div>
    </section>
  `;
}
