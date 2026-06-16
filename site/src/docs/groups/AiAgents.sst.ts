import type { Ctx } from "../../types";

export function DocAiAgents(_ctx: Ctx): string {
  return `
    <div class="docs-content">
      <div class="eyebrow">Section 07 // ai agents</div>
      <h1>AI Coding Agents</h1>
      <p>State Street isn't React, Vue, or Svelte — and it isn't widely adopted — so coding assistants tend to apply habits from those frameworks and produce code that doesn't work. Give your agent the correct mental model up front and it writes idiomatic State Street.</p>

      <section class="docs-section" id="ai-why">
        <h2>Why agents need a primer</h2>
        <p>Left to guess, an assistant reaches for things State Street does not have: <code>JSX</code>, a virtual DOM, hooks (<code>useState</code>, <code>useEffect</code>), <code>className</code>, <code>onClick={...}</code>, a router. None of these exist here. The fix is a short, opinionated guide that states the mental model and the anti-patterns explicitly, so the agent stops guessing.</p>
      </section>

      <section class="docs-section" id="ai-setup">
        <h2>Set up your agent</h2>
        <p>State Street ships a distilled agent guide, <code>AGENTS.md</code>. Drop it into the project you're building so your assistant reads it as project context:</p>
        <DocCode id="agent-setup" label="shell" lang="bash"/>
        <p>Most agents (Cursor, Copilot, and others) read a root <code>AGENTS.md</code>; Claude Code reads <code>CLAUDE.md</code>. Either copy works. The guide is also hosted on this site, so you can point a web-capable agent straight at it:</p>
        <ul>
          <li><a href="llms-full.txt" target="_blank" rel="noopener">/llms-full.txt</a> — the full guide.</li>
          <li><a href="llms.txt" target="_blank" rel="noopener">/llms.txt</a> — a short index (the <code>llms.txt</code> convention).</li>
        </ul>
        <div class="callout"><span class="callout__tag">Bonus</span> The npm package ships TypeScript declarations (<code>build/*.d.ts</code>), so your editor and your agent get real type signatures for <code>State</code>, its options, and the context object.</div>
      </section>

      <section class="docs-section" id="ai-rules">
        <h2>The rules, in brief</h2>
        <p>The guide covers everything in full; these are the corrections that prevent the most common mistakes.</p>
        <ul>
          <li><strong>Components return HTML strings</strong> from plain functions — no JSX, no <code>.tsx</code>.</li>
          <li><strong>State Bindings vs <code>\${}</code>.</strong> <code>{{path}}</code> is a <strong>State Binding</strong> — a reactive reference that updates its own node in place, without re-running the component; <code>\${...}</code> is ordinary JavaScript, evaluated once when the function runs. <strong>Prefer State Bindings for reactive values;</strong> reserve <code>\${}</code> for control flow, derived strings, and composition.</li>
          <li><strong>The read is the subscription.</strong> Any <code>state.data.<key></code> read anywhere in a component's body subscribes it — even in a conditional or inside a <code>\${}</code>, even if the value isn't shown. Read only what you need.</li>
          <li><strong>Event directives need parentheses.</strong> <code>:click=save()</code> works; <code>:click=save</code> is treated as a plain attribute and does nothing. The method receives <code>{ state, event, ...args }</code>.</li>
          <li><strong>Use <code>class</code>, not <code>className</code>; use <code>:click</code>, not <code>onClick</code>.</strong></li>
          <li><strong>Loops and conditionals are JavaScript</strong> — there is no <code>:for</code> or <code>:if</code>. Build the string with <code>.map().join("")</code> and early returns.</li>
          <li><strong>Reactivity is reference-based at the top level.</strong> Replace arrays/objects (<code>state.data.items = [...]</code>) to trigger a re-render; mutating a nested field marks its <em>top-level</em> key dirty.</li>
          <li><strong>Navigation is hash-driven</strong> (a <code>view</code> key + <code>hashchange</code>), not a router.</li>
        </ul>
        <p>A minimal, idiomatic component and method:</p>
        <DocCode id="quick-direct" label="counter" lang="js"/>
        <div class="callout"><span class="callout__tag">#1 mistake</span> Forgetting the parentheses on an event directive.</div>
        <DocCode id="gotcha-parens" label="events"/>
      </section>

      <section class="docs-section" id="ai-resources">
        <h2>Resources</h2>
        <ul>
          <li><a href="https://github.com/Joshabracks/State-Street/blob/main/AGENTS.md" target="_blank" rel="noopener">AGENTS.md</a> — the canonical guide (also shipped in the npm package).</li>
          <li><a href="llms-full.txt" target="_blank" rel="noopener">/llms-full.txt</a> and <a href="llms.txt" target="_blank" rel="noopener">/llms.txt</a> — the hosted guide and its index.</li>
          <li>The rest of these docs — the long-form version of everything the guide distills.</li>
        </ul>
      </section>

      <DocPrevNext group="ai-agents"/>
    </div>
  `;
}
