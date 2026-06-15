import type { Ctx } from "../types";
import { EXAMPLES, EXAMPLE_MAP, DEFAULT_EXAMPLE } from "../examples";

/** Examples shell: sidebar (example list) + content (live demo + source). */
export function Examples(_ctx: Ctx): string {
  return `
    <div class="docs-layout examples-layout">
      <ExamplesSidebar/>
      <div class="docs-main"><ExamplesContent/></div>
    </div>
  `;
}

/** Left rail: one link per example, active one highlighted. */
export function ExamplesSidebar({ state }: Ctx): string {
  const cur = state.data.exampleId || DEFAULT_EXAMPLE;
  const links = EXAMPLES.map(
    (ex) =>
      `<a class="docs-nav__link" href="#examples/${ex.id}" aria-current="${ex.id === cur}" :click=setExample(id=${ex.id})>${ex.title}</a>`
  ).join("");
  return `
    <aside class="docs-sidebar">
      <div class="eyebrow">Examples // useful</div>
      <nav class="docs-nav">${links}</nav>
    </aside>
  `;
}

/**
 * Content pane for the active example: title, blurb, a live demo frame (the
 * #ex-demo-<id> element a child State mounts into), and the source. Reads only
 * exampleId, so switching rebuilds the demo container — mounting/dismounting the
 * example child States as you navigate.
 */
export function ExamplesContent({ state }: Ctx): string {
  const ex = EXAMPLE_MAP[state.data.exampleId] || EXAMPLE_MAP[DEFAULT_EXAMPLE];
  return `
    <div class="docs-content examples-content">
      <div class="eyebrow">Live // running on State Street</div>
      <h1>${ex.title}</h1>
      <p class="examples-blurb">${ex.blurb}</p>
      <div class="demo-frame ticked">
        <div class="demo-frame__bar"><b>live</b><span>#ex-demo-${ex.id}</span></div>
        <div class="demo-frame__mount" id="ex-demo-${ex.id}"></div>
      </div>
      <div class="eyebrow">Source</div>
      <div class="code">
        <div class="code__bar"><b>${ex.title}</b><span>${ex.id}.sst.ts</span></div>
        <pre :raw=highlightSST>${ex.source}</pre>
      </div>
    </div>
  `;
}
