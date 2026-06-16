import type { Ctx } from "../../types";

export function DocTemplates(_ctx: Ctx): string {
  return `
    <div class="docs-content">
      <div class="eyebrow">Section 03 // templates &amp; rendering</div>
      <h1>Templates &amp; Rendering</h1>

      <section class="docs-section" id="interpolation">
        <h2>State Bindings: <code>{{path}}</code></h2>
        <p>A <strong>State Binding</strong> — <code>{{path}}</code> — is a reactive reference to a <code>state.data</code> value. State Street keeps it as a standalone text or attribute node and updates that node <strong>in place</strong> when the bound key changes, <strong>without re-running the component</strong>. It resolves the value at <code>path</code> in the local scope (props + values in scope), including dotted paths. Inline <code>\${js}</code> works too but is plain JavaScript, computed <strong>once</strong> when the function runs.</p>
        <DocCode id="interp-card" label="state bindings"/>
        <div class="callout"><span class="callout__tag">Best practice</span> Prefer State Bindings over <code>\${}</code> for reactive values. <code>{{count}}</code> patches just that node; <code>\${state.data.count}</code> re-runs the whole component whenever <code>count</code> changes. Reserve <code>\${}</code> for control flow (loops, conditionals), derived strings, and composition — things a binding can't express.</div>
      </section>

      <section class="docs-section" id="component-tags">
        <h2>Component tags</h2>
        <p>Self-closing tags whose name matches a registered component invoke it. Attributes are passed as props.</p>
        <DocCode id="component-tags" label="component tags"/>
      </section>

      <section class="docs-section" id="events">
        <h2>Event directives</h2>
        <p>Wire any DOM event to a registered method with <code>:event=method(args)</code>. The handler receives <code>{ state, event, ...args }</code>. Supported events are anything DOM — State Street just registers a listener for whatever name follows the <code>:</code>.</p>
        <DocCode id="events-basic" label="events"/>
        <p>Args are <code>name=value</code> pairs separated by commas; values can be string literals, numbers, or <code>\${interpolated}</code> expressions:</p>
        <DocCode id="events-args" label="event args"/>
        <div class="callout"><span class="callout__tag">Required</span> The parentheses. <code>:click=submit</code> without <code>()</code> is parsed as a regular HTML attribute and does nothing.</div>
      </section>

      <section class="docs-section" id="coercion">
        <h2>Attribute &amp; argument coercion</h2>
        <p>Component props and event-directive args are <strong>coerced to a type</strong> before they reach your function — they are not always strings. The same rules apply to both:</p>
        <div class="docs-table"><table>
          <thead><tr><th>In the template</th><th>Arrives as</th></tr></thead>
          <tbody>
            <tr><td><code>"text"</code> (quoted)</td><td>the string <code>text</code> (quotes stripped)</td></tr>
            <tr><td><code>{{path}}</code></td><td>the value at <code>path</code> in state (any type)</td></tr>
            <tr><td><code>true</code> / <code>false</code> (unquoted)</td><td>boolean</td></tr>
            <tr><td><code>478</code> (unquoted, numeric)</td><td>number <code>478</code></td></tr>
            <tr><td>a bare attribute, no value</td><td>boolean <code>true</code></td></tr>
            <tr><td>anything else (unquoted)</td><td>string</td></tr>
          </tbody>
        </table></div>
        <DocCode id="coercion" label="coercion"/>
        <div class="callout"><span class="callout__tag">Heads up</span> To keep something that looks like a number as a string, quote it: <code>code="0420"</code> is the string <code>"0420"</code>, while <code>code=0420</code> is the number <code>420</code>.</div>
      </section>

      <section class="docs-section" id="no-directives">
        <h2>No if / for / bind</h2>
        <p>There are no built-in conditional or loop directives. Conditionals and loops are plain JavaScript inside the component body — return different strings.</p>
        <DocCode id="no-directives" label="plain JS"/>
      </section>

      <section class="docs-section" id="raw">
        <h2>Raw content &amp; formatters</h2>
        <p>Some elements opt out of template parsing so you can show literal markup (code samples, user text) or post-process content:</p>
        <ul>
          <li><strong>RAWTEXT</strong> — <code><script></code>, <code><style></code>, <code><code></code>: contents are verbatim text — no child-tag parsing, no State Bindings (<code>{{ }}</code> stays literal).</li>
          <li><strong>RCDATA</strong> — <code><textarea></code>, <code><title></code>: child tags are not parsed (a literal <code><</code> is safe), but State Bindings (<code>{{ }}</code>) still resolve.</li>
          <li><strong><code>:raw</code></strong> — makes any element's content verbatim text.</li>
        </ul>
        <DocCode id="raw-elements" label="raw content"/>
        <p><code>:raw=formatterName</code> feeds the raw text to a method (resolved from <code>methods</code>, called <code>fn({ text, state })</code>) and sets the returned string as the element's <code>innerHTML</code> — the hook for syntax highlighting, Markdown, and the like. (This very page's code blocks use it.)</p>
        <DocCode id="raw-formatter" label="formatter"/>
        <div class="callout"><span class="callout__tag">Note</span> <code><pre></code> is intentionally not RAWTEXT, so the common <code><pre></code> + <code><code></code> code-block idiom keeps working. Formatter output is set as <code>innerHTML</code> — the formatter owns escaping.</div>
      </section>

      <section class="docs-section" id="svg">
        <h2>Inline SVG &amp; namespaces</h2>
        <p>Inline <code><svg></code> (and <code><math></code>) render as real namespaced elements — State Street creates them with <code>createElementNS</code> and threads the namespace through the subtree, including across component boundaries and independent re-renders. Attribute interpolation and events work as usual.</p>
        <DocCode id="svg-inline" label="inline svg" lang="js"/>
        <DocCode id="svg-reactive" label="reactive svg"/>
        <div class="callout"><span class="callout__tag">Note</span> Legacy <code>xlink:</code> and <code>xml:</code> namespaced attributes are supported via <code>setAttributeNS</code>; prefer the modern SVG2 plain <code>href</code> where you can.</div>
      </section>

      <section class="docs-section" id="preserve">
        <h2>Preserving elements</h2>
        <p>The <code>:preserve</code> attribute tells State to <strong>reuse</strong> that element in place across re-renders and never rebuild its children. Use it to host DOM that State doesn't own — a chart, a map, a rich-text editor — or an element a separate child State mounts into.</p>
        <DocCode id="preserve" label="preserve"/>
        <p>On first render the element is built (empty); after that it is moved, not recreated, so whatever drew into it survives. For composing two States, you usually don't need <code>:preserve</code> at all — see <code>Nested States</code> in the API reference, where a child mounted into a parent's element registers itself automatically.</p>
      </section>

      <DocPrevNext group="templates"/>
    </div>
  `;
}
