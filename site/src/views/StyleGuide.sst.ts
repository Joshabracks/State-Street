import type { Ctx } from "../types";
import { VERSION } from "../state";

const SWATCHES: Array<[string, string]> = [
  ["--ink", "ink"],
  ["--paper", "paper"],
  ["--paper-lo", "paper-lo"],
  ["--accent", "accent"],
  ["--accent-hi", "accent-hi"],
  ["--signal", "signal"],
];

const swatch = ([varName, label]: [string, string]): string => `
  <div class="stack" style="--sp-4:.5rem">
    <div class="swatch" style="background: var(${varName})"></div>
    <div class="mono" style="font-size: var(--fs-300)">${label}</div>
  </div>`;

/**
 * Type specimen / living style guide. Renders the design tokens and a gallery of
 * every standard HTML element so base.css can be reviewed at a glance — and so the
 * site exercises the full breadth of HTML element kinds.
 */
export function StyleGuide(_ctx: Ctx): string {
  return `
    <section class="section">
      <div class="wrap stack-lg">
        <div class="eyebrow">Cat. No. SS&middot;${VERSION} // type specimen</div>
        <h1>Type Specimen</h1>
        <p class="hero__lead">The design system, printed. Tokens, type, and every HTML element the framework renders.</p>

        <div class="panel ticked">
          <span class="panel__label">001 // palette</span>
          <div class="grid grid--auto">
            ${SWATCHES.map(swatch).join("")}
          </div>
        </div>

        <div class="panel ticked stack">
          <span class="panel__label">002 // typography</span>
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>
          <p>Body copy in Space Grotesk. The quick brown fox jumps over the lazy dog. Inline elements: <a href="#styleguide">a link</a>, <strong>strong</strong>, <em>emphasis</em>, <mark>highlight</mark>, <code>inline code</code>, <kbd>Ctrl</kbd> + <kbd>K</kbd>, <abbr title="Single Page Application">SPA</abbr>, <del>removed</del> <ins>added</ins>, H<sub>2</sub>O, x<sup>2</sup>, and <small>small print</small>.</p>
          <blockquote>Mutate state directly — the next frame re-renders what changed.<cite>The State Street README</cite></blockquote>
        </div>

        <div class="grid grid--2">
          <div class="panel ticked stack">
            <span class="panel__label">003 // lists</span>
            <ul><li>Unordered item</li><li>Another item</li><li>Third item</li></ul>
            <ol><li>Ordered item</li><li>Second step</li><li>Third step</li></ol>
            <dl>
              <dt>Version</dt><dd>${VERSION}</dd>
              <dt>Size</dt><dd>negligible</dd>
              <dt>Deps</dt><dd>0</dd>
            </dl>
          </div>
          <div class="panel ticked stack">
            <span class="panel__label">004 // table</span>
            <table>
              <caption>Render options</caption>
              <thead><tr><th>Option</th><th>Default</th></tr></thead>
              <tbody>
                <tr><td>renderLoop</td><td>true</td></tr>
                <tr><td>targetFPS</td><td>60</td></tr>
                <tr><td>imgWarmPerFrame</td><td>4</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel ticked stack">
          <span class="panel__label">005 // forms</span>
          <form class="grid grid--2" onsubmit="return false">
            <fieldset class="stack">
              <legend>Text inputs</legend>
              <label>Name <input type="text" placeholder="Ada Lovelace"/></label>
              <label>Email <input type="email" placeholder="ada@example.com"/></label>
              <label>Search <input type="search" placeholder="filter&hellip;"/></label>
              <label>Amount <input type="number" value="10"/></label>
              <label>Notes <textarea placeholder="Multi-line&hellip;"></textarea></label>
            </fieldset>
            <fieldset class="stack">
              <legend>Controls</legend>
              <label>Framework
                <select>
                  <option>State Street</option>
                  <option>Something heavier</option>
                </select>
              </label>
              <label>Range <input type="range" min="0" max="100" value="60"/></label>
              <label>Date <input type="date"/></label>
              <label class="flex">Colour <input type="color" value="#cf4d1a"/></label>
              <label class="flex"><input type="checkbox" checked/> Reactive</label>
              <label class="flex"><input type="radio" name="r" checked/> Option A</label>
              <label class="flex"><input type="radio" name="r"/> Option B</label>
              <label>Progress <progress value="0.7"></progress></label>
              <label>Meter <meter min="0" max="1" value="0.4"></meter></label>
              <button type="submit">Submit</button>
              <button disabled>Disabled</button>
            </fieldset>
          </form>
        </div>

        <div class="grid grid--2">
          <div class="panel ticked stack">
            <span class="panel__label">006 // disclosure</span>
            <details open><summary>What is a component?</summary><p>A function that returns an HTML string. Register it and drop its tag into a template.</p></details>
            <details><summary>Does it use a virtual DOM?</summary><p>No — State Bindings update nodes in place, and a component re-renders only when a key it read changes. No per-element diff.</p></details>
            <dialog open>
              <h4>Inline dialog</h4>
              <p class="muted">Rendered with the <code>open</code> attribute.</p>
            </dialog>
          </div>
          <div class="panel ticked stack">
            <span class="panel__label">007 // figure + code</span>
            <figure>
              <img src="{{logoUrl}}" alt="State Street logo" width="96" height="96"/>
              <figcaption>Fig. &mdash; the State Street mark</figcaption>
            </figure>
            <CodeBlock label="Component" src="component"/>
          </div>
        </div>

        <hr/>
        <p class="muted center mono">end of specimen // SS&middot;${VERSION}</p>
      </div>
    </section>
  `;
}
