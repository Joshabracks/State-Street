import type { Ctx } from "../../types";

export function DocApi(_ctx: Ctx): string {
  return `
    <div class="docs-content">
      <div class="eyebrow">Section 04 // api reference</div>
      <h1>The State class</h1>

      <section class="docs-section" id="constructor">
        <h2>Constructor</h2>
        <DocCode id="constructor" label="signature" lang="ts"/>
        <div class="docs-table"><table>
          <thead><tr><th>Parameter</th><th>Type</th><th>Purpose</th></tr></thead>
          <tbody>
            <tr><td><code>template</code></td><td><code>string</code></td><td>Root template. Any <code><Component/></code> tag references a key in <code>components</code>.</td></tr>
            <tr><td><code>data</code></td><td><code>object</code></td><td>Initial state. Becomes reactive on construction. A <code>title</code> property becomes <code>document.title</code> at mount.</td></tr>
            <tr><td><code>components</code></td><td><code>{ [name]: (props) => string }</code></td><td>Component registry.</td></tr>
            <tr><td><code>methods</code></td><td><code>{ [name]: (args) => void }</code></td><td>Method registry. Bound to <code>:event=name()</code> directives.</td></tr>
            <tr><td><code>options</code></td><td><code>object</code></td><td>See below.</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="docs-section" id="options">
        <h2>Options</h2>
        <div class="docs-table"><table>
          <thead><tr><th>Option</th><th>Default</th><th>Purpose</th></tr></thead>
          <tbody>
            <tr><td><code>renderLoop</code></td><td><code>true</code></td><td>When true, an internal <code>requestAnimationFrame</code> loop calls <code>update()</code> continuously. When false, call <code>update()</code> / <code>forceUpdate()</code> yourself after mutations.</td></tr>
            <tr><td><code>targetFPS</code></td><td><code>60</code></td><td>When the render loop is on, throttle to roughly this many updates per second.</td></tr>
            <tr><td><code>imgMemoryBudget</code></td><td><code>256 MB</code></td><td>Max bytes of cached image blobs. LRU eviction over budget; in-DOM blobs are never evicted.</td></tr>
            <tr><td><code>imgWarmPerFrame</code></td><td><code>4</code></td><td>How many queued data URIs <code>warmImages()</code> decodes per idle frame.</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="docs-section" id="instance">
        <h2>Instance members</h2>
        <div class="docs-table"><table>
          <thead><tr><th>Member</th><th>Purpose</th></tr></thead>
          <tbody>
            <tr><td><code>.data</code></td><td>Reactive proxy (getter/setter). The setter replaces the whole tree and marks every top-level key dirty.</td></tr>
            <tr><td><code>.update()</code></td><td>Process one frame: drain the warm queue, then re-render dirty components if it is time. Re-schedules itself when <code>renderLoop: true</code>.</td></tr>
            <tr><td><code>.forceUpdate()</code></td><td>Immediately re-render every dirty component and clear the dirty set. Bypasses the FPS throttle.</td></tr>
            <tr><td><code>.sameState()</code></td><td><code>true</code> if nothing is dirty.</td></tr>
            <tr><td><code>.warmImages(uris)</code></td><td>Queue base64 data URIs for off-screen decode.</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="docs-section" id="mounting">
        <h2>Mounting</h2>
        <p>The <code>State</code> constructor mounts to <code>document.body</code> automatically — it clears <code>document.body</code> and appends the rendered root. There is no <code>app.mount(el)</code> step.</p>
      </section>

      <section class="docs-section" id="methods">
        <h2>Methods</h2>
        <p>A method is a function called by an event directive:</p>
        <DocCode id="methods-sig" label="method"/>
        <DocCode id="methods-examples" label="examples"/>
        <h3>Rules of thumb</h3>
        <ul>
          <li><strong>Mutate state directly.</strong> <code>state.data.foo = bar</code> — the proxy marks <code>foo</code> dirty; no extra step.</li>
          <li><strong>Args arrive coerced.</strong> Unquoted numbers and <code>true</code>/<code>false</code> become numbers/booleans; <code>{{path}}</code> resolves from state.</li>
          <li><strong>Async is fine.</strong> Methods can <code>await</code> and dispatch more mutations later; State Street picks them up on the next frame.</li>
        </ul>
      </section>

      <DocPrevNext group="api"/>
    </div>
  `;
}
