import type { Ctx } from "../../types";

export function DocReactivity(_ctx: Ctx): string {
  return `
    <div class="docs-content">
      <div class="eyebrow">Section 05 // reactivity &amp; performance</div>
      <h1>Reactivity &amp; Performance</h1>

      <section class="docs-section" id="model">
        <h2>Reactivity model</h2>
        <p>The hot loop, end to end:</p>
        <ol>
          <li><strong>Mutation.</strong> Your code does <code>state.data.foo = bar</code>.</li>
          <li><strong>Proxy set trap fires.</strong> It stores the value and calls <code>onMutate("foo")</code>.</li>
          <li><strong>Dirty flips.</strong> <code>state.dirty = true; state.dirtyKeys.add("foo")</code>.</li>
          <li><strong>Render loop ticks.</strong> On the next frame (respecting target FPS), <code>updateDom(state)</code> runs.</li>
          <li><strong>Dep gating.</strong> Each tracked component is skipped unless its deps intersect <code>dirtyKeys</code>.</li>
          <li><strong>Re-render survivors.</strong> Identical output short-circuits; otherwise the component's nodes are swapped in place between its markers.</li>
          <li><strong>Interpolations.</strong> Standalone <code>{{path}}</code> text/attrs update if their key is dirty.</li>
          <li><strong>Dirty cleared</strong> until the next mutation.</li>
        </ol>
        <h3>Nested mutations</h3>
        <p>Nested objects are wrapped on read and cached via <code>WeakMap</code>, so a nested write still reports the <strong>root</strong> key dirty:</p>
        <DocCode id="nested-mutations" label="nested"/>
      </section>

      <section class="docs-section" id="scheduling">
        <h2>Render scheduling &amp; marker ranges</h2>
        <p>A component adds <strong>no wrapper element</strong>. Its rendered nodes become direct children of the parent, bracketed by invisible comment markers:</p>
        <DocCode id="marker-html" label="markers" lang="html"/>
        <p>The markers encode the component's hierarchical <code>ssid</code> (parent path + child index) used for dep tracking, node reuse, and as a stable re-render anchor. Comment nodes are not elements, so they never affect CSS layout (grid/flex tracks, percentage heights) or structural selectors — your layout applies directly to component output with no extra rule.</p>
        <h3>Update loop pseudocode</h3>
        <DocCode id="update-loop" label="updateDom" lang="text"/>
      </section>

      <section class="docs-section" id="image-cache">
        <h2>Image cache</h2>
        <p>State Street ships an automatic base64 &rarr; blob URL converter for <code><img></code>. Base64 data URIs decode slowly and are heavy on memory; blob URLs are fast and cached. The cache is bounded by <code>imgMemoryBudget</code> (default 256&nbsp;MB) with LRU eviction that skips any blob still in the DOM.</p>
        <DocCode id="image-cache" label="img cache"/>
      </section>

      <DocPrevNext group="reactivity"/>
    </div>
  `;
}
