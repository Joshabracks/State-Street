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
            <tr><td><code>mountTarget</code></td><td><code>document.body</code></td><td>Where to mount: an <code>Element</code>, or a CSS-selector string (re-resolved over time). State <strong>owns</strong> the target (clears it on mount); <code>document.title</code> is set from <code>data.title</code> only when the target is <code>&lt;body&gt;</code>.</td></tr>
            <tr><td><code>mountOnAvailable</code></td><td><code>true</code></td><td>For non-body targets: while the render loop runs, auto-mount when the target appears, dismount if it's removed, re-mount when it returns. When <code>false</code>, mounting is manual (see <code>mountCheck()</code>).</td></tr>
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
            <tr><td><code>.mountCheck()</code></td><td>Reconcile mount state with the DOM: dismount if the target is gone, mount if it's available. Call it yourself when <code>renderLoop</code> is off.</td></tr>
            <tr><td><code>.setMountTarget(t)</code></td><td>Dismount, set a new target (Element or selector), and re-mount if found.</td></tr>
            <tr><td><code>.togglePreserve(ssid, on?)</code></td><td>Preserve (or release) the element at <code>ssid</code> across re-renders. Used automatically by nested States.</td></tr>
            <tr><td><code>.setRenderLoop(b)</code></td><td>Turn the rAF loop on/off at runtime (guarded against starting a second loop).</td></tr>
            <tr><td><code>.setTargetFPS(n)</code> / <code>.setImgMemoryBudget(n)</code> / <code>.setImgWarmPerFrame(n)</code></td><td>Adjust the matching option at runtime.</td></tr>
            <tr><td><code>.destroy()</code></td><td>Dismount and unregister from the global state registry. Call it for transient States to avoid leaks.</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="docs-section" id="mounting">
        <h2>Mounting &amp; lifecycle</h2>
        <p>By default the constructor mounts to <code>document.body</code> (it owns the target: clears it, appends the render). Pass <code>mountTarget</code> to mount elsewhere — an <code>Element</code> or a CSS-selector string:</p>
        <DocCode id="mount-target" label="mount target"/>
        <p>For non-body targets, <code>mountOnAvailable</code> (default <code>true</code>) makes mounting a <strong>lifecycle</strong>: while the render loop runs, State waits for the target, mounts when it appears, dismounts if it's removed, and re-mounts when it returns. <code>State.data</code> survives a dismount — only the DOM is rebuilt — so a panel can come and go and keep its state. When <code>renderLoop</code> is off there's no loop, so you drive it with <code>mountCheck()</code>:</p>
        <DocCode id="mount-lifecycle" label="lifecycle"/>
        <div class="callout"><span class="callout__tag">Note</span> A string <code>mountTarget</code> is a live selector — if it stops matching the mounted element (e.g. you toggle a class), State dismounts and waits. This lets you drive mounting from markup.</div>
      </section>

      <section class="docs-section" id="nested-states">
        <h2>Nested States</h2>
        <p>You can mount a State into an element that belongs to another State. Every element is branded with its owner State's id (a <code>stid</code> attribute, alongside <code>ssid</code>), so when a child mounts into a parent's element it looks up the parent and registers itself. The parent then <strong>preserves</strong> that element across its own re-renders — reusing it in place (moved, not rebuilt), so the child's DOM and state are never clobbered. On dismount the child un-registers.</p>
        <DocCode id="nested-states" label="nested"/>
        <p>No template annotation is needed for the nested-State case — registration is automatic. For DOM that isn't a child State (third-party widgets), mark the host element with <code>:preserve</code> (see <code>Templates &amp; Rendering &rarr; Preserving elements</code>), or call <code>togglePreserve(ssid)</code> directly.</p>
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
