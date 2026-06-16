import type { Ctx } from "../../types";

export function DocCoreConcepts(_ctx: Ctx): string {
  return `
    <div class="docs-content">
      <div class="eyebrow">Section 02 // core concepts</div>
      <h1>Core Concepts</h1>
      <p>State Street has four ideas. That is the whole API surface to internalize.</p>

      <section class="docs-section" id="reactive-state">
        <h2>1. Reactive state</h2>
        <p><code>state.data</code> is a <code>Proxy</code> with two traps. Writing <code>state.data.foo = bar</code> trips the <code>set</code> trap, which marks the top-level key <code>foo</code> dirty for the next render frame. Reading <code>state.data.foo</code> trips the <code>get</code> trap, which records <code>foo</code> as a dependency of the component currently running (see below).</p>
        <DocCode id="reactive-state" label="mutation"/>
      </section>

      <section class="docs-section" id="dep-gating">
        <h2>2. Top-level-key dep gating</h2>
        <p>Each component instance has its own dep-tracking proxy. While the component function runs, every <code>state.data.<key></code> it reads (via the <code>get</code> trap) is recorded into that instance's <code>deps</code> set. On the next frame the scheduler only re-runs components whose tracked keys intersect the dirty set.</p>
        <div class="callout"><span class="callout__tag">The read is the subscription</span> Any <code>state.data.<key></code> touched <em>anywhere</em> in the body subscribes the component to that key — in a conditional, a computed local, an existence check, or inside a <code>\${}</code> — <strong>even if the value never appears in the output</strong>. Read only what you need.</div>
        <div class="callout"><span class="callout__tag">Granularity</span> Gating is top-level-key granular. <code>state.data.user.name</code> marks <code>user</code> dirty, not <code>user.name</code> — any component reading <code>user</code> re-runs. Need finer reactivity? Split into more top-level keys.</div>
      </section>

      <section class="docs-section" id="return-strings">
        <h2>3. Components return strings</h2>
        <p>A component is a plain function returning an HTML string. No virtual DOM, no per-element diff. When its tracked state goes dirty the function re-runs; if the output is byte-identical the DOM is left untouched, otherwise its rendered nodes are rebuilt and swapped in place between a pair of invisible comment markers — no wrapper element.</p>
        <DocCode id="return-strings" label="component"/>
      </section>

      <section class="docs-section" id="tag-vs-call">
        <h2>4. Tag syntax vs inline calls</h2>
        <p>Render components with the tag syntax <code><Counter/></code> so they get their own dep-tracked range. Do <strong>not</strong> interpolate component output directly — <code>\${Counter()}</code> inlines the string into the parent, so the parent inherits the child's deps and re-runs whenever the child's state changes.</p>
        <DocCode id="tag-vs-call" label="good vs bad"/>
        <p>A real composition — each <code><Wv…/></code> is independently gated, so changing the selected sidebar tab re-runs only the parts that read it:</p>
        <DocCode id="worldview" label="composition"/>
      </section>

      <DocPrevNext group="core-concepts"/>
    </div>
  `;
}
