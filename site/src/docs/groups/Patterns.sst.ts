import type { Ctx } from "../../types";

export function DocPatterns(_ctx: Ctx): string {
  return `
    <div class="docs-content">
      <div class="eyebrow">Section 06 // patterns &amp; tooling</div>
      <h1>Patterns &amp; Tooling</h1>

      <section class="docs-section" id="production-patterns">
        <h2>Patterns from production</h2>
        <h3>Spread to update a top-level key</h3>
        <p>The canonical mutation pattern — a fresh top-level reference marks the key dirty with no surprises:</p>
        <DocCode id="spread-pattern" label="spread"/>
        <h3>Direct mutation for high-frequency updates</h3>
        <p>For events firing many times per second (token streams, animation frames, polling), the spread idiom can compound proxy depth on nested keys and eventually overflow the stack. Mutate the target field directly instead:</p>
        <DocCode id="direct-mutation" label="high-frequency"/>
        <h3>Helpers are just functions</h3>
        <p>There is no built-in "helpers" concept — a helper is a plain function in scope. In registry-style apps, expose shared helpers on your registry object.</p>
        <h3>The IIFE wrapper</h3>
        <p>In multi-file registry apps, each file is wrapped in an IIFE to keep its private helpers out of global scope while registrations still happen at load time:</p>
        <DocCode id="iife" label="iife"/>
      </section>

      <section class="docs-section" id="registry">
        <h2>The registry pattern</h2>
        <p>The registry style is not part of core — it is a ~100-line boilerplate you copy in. It gives you <strong>late binding</strong> (register after boot), <strong>override semantics</strong> (later registrations win — mods/themes/plugins), and <strong>multi-file structure</strong>. The key hooks:</p>
        <div class="docs-table"><table>
          <thead><tr><th>Hook</th><th>Purpose</th></tr></thead>
          <tbody>
            <tr><td><code>setBaseData(factory)</code></td><td>Initial state factory. Lazy — runs at <code>boot()</code> so it can read registered helpers.</td></tr>
            <tr><td><code>registerComponents(obj)</code></td><td>Add to the components registry; later registrations override.</td></tr>
            <tr><td><code>registerMethods(obj)</code></td><td>Same shape for methods.</td></tr>
            <tr><td><code>registerHelpers(obj)</code></td><td>Shared utility namespace on <code>MY_APP.helpers</code>.</td></tr>
            <tr><td><code>registerListener(name, fn)</code></td><td>Bind a non-DOM event (Tauri, WebSocket, EventTarget). Override-friendly.</td></tr>
            <tr><td><code>registerStartup(fn)</code></td><td>Fire-once init hook run after <code>boot()</code>.</td></tr>
            <tr><td><code>extendData(patch)</code></td><td>Mods append top-level state slices, deep-merged into the factory output.</td></tr>
            <tr><td><code>boot()</code></td><td>Assemble registries, run the data factory + extensions, <code>new State(...)</code>, wire listeners, run startup hooks.</td></tr>
          </tbody>
        </table></div>
        <p>Because State Street resolves <code>state.components[name]</code> and <code>state.methods[name]</code> at render/event time, a registration after boot takes effect on the next update — no reload:</p>
        <DocCode id="registry-usage" label="mod override"/>
      </section>

      <section class="docs-section" id="gotchas">
        <h2>Gotchas</h2>
        <ul>
          <li><strong>Top-level-key gating is the gating.</strong> <code>state.data.user.age = 22</code> marks <code>user</code> dirty — every component reading any part of <code>user</code> re-runs. Split state for finer reactivity.</li>
          <li><strong><code>:click=method()</code> requires parentheses.</strong> <code>:click=method</code> is a plain attribute and does nothing.</li>
          <li><strong>Don't spread the proxy in high-frequency listeners.</strong> Use direct mutation for streams and per-frame handlers.</li>
          <li><strong>Components may return multiple root elements.</strong> All become direct children, bracketed by the markers, re-rendered as a range.</li>
          <li><strong>The state setter replaces the whole tree.</strong> <code>state.data = newObject</code> marks every key dirty — use for resets, not normal updates.</li>
        </ul>
        <DocCode id="gotcha-parens" label="parens"/>
      </section>

      <section class="docs-section" id="tooling">
        <h2>Tooling</h2>
        <p>The official <strong>State Street SST</strong> VS Code extension treats template-literal strings in any <code>.sst.js</code> / <code>.sst.ts</code> file as State Street templates, giving HTML highlighting + completion inside the templates. This site itself is authored entirely in <code>.sst.ts</code> files.</p>
      </section>

      <DocPrevNext group="patterns"/>
    </div>
  `;
}
