import type { Ctx } from "../../types";

export function DocGettingStarted(_ctx: Ctx): string {
  return `
    <div class="docs-content">
      <div class="eyebrow">Section 01 // getting started</div>
      <h1>Getting Started</h1>

      <section class="docs-section" id="why">
        <h2>Why State Street</h2>
        <ul>
          <li><strong>Plain template strings.</strong> No JSX, no required compile step. Views are template literals that return HTML strings — your editor highlights them, your tests can read them.</li>
          <li><strong>Mutate state directly.</strong> <code>state.data.foo = bar</code> triggers a dep-gated re-render on the next animation frame. No setters, actions, or reducers.</li>
          <li><strong>One file, one class.</strong> The whole library is <code>new State(template, data, components, methods)</code>.</li>
          <li><strong>Tiny.</strong> ~10&nbsp;KB minified, zero runtime dependencies.</li>
        </ul>
        <p>It stays small on purpose: there is no virtual DOM, and conditionals and loops are plain JavaScript inside your component functions rather than template directives.</p>
      </section>

      <section class="docs-section" id="install">
        <h2>Install</h2>
        <p>Via npm / any bundler:</p>
        <DocCode id="install-npm" label="shell" lang="bash"/>
        <DocCode id="install-import" label="import"/>
        <p>Or with a single global script — every release ships a minified UMD build, <code>state-street.global.js</code>, that defines <code>window.State</code>:</p>
        <DocCode id="install-cdn" label="no build step" lang="html"/>
        <div class="callout"><span class="callout__tag">Heads up</span> Pin a version in production by adding <code>@<version></code> after the package name in the CDN URL.</div>
      </section>

      <section class="docs-section" id="quick-direct">
        <h2>Quick start — direct style</h2>
        <p>A counter in one file. The constructor mounts to <code><body></code> automatically; <code>state.data.count += 1</code> marks the top-level <code>count</code> key dirty and the <code><Counter/></code> component re-renders in place on the next frame.</p>
        <DocCode id="quick-direct" label="counter" lang="js"/>
        <div class="callout"><span class="callout__tag">Heads up</span> <code>:click=increment()</code> requires the parentheses, even with no arguments. <code>:click=increment</code> is silently treated as a regular HTML attribute and does nothing.</div>
      </section>

      <section class="docs-section" id="quick-registry">
        <h2>Quick start — registry style</h2>
        <p>The same app written with a ~100-line registration boilerplate — useful once your app grows past one file or needs runtime extension (mods, themes, plugins). See <code>Patterns & Tooling → Registry pattern</code> for the full reference.</p>
        <DocCode id="registry-boot" label="registry"/>
        <p><code>MY_APP.boot()</code> assembles the accumulated registries, calls <code>new State(...)</code>, and you are live. Both styles converge on the same <code>State</code> class — only the wiring differs.</p>
      </section>

      <DocPrevNext group="getting-started"/>
    </div>
  `;
}
