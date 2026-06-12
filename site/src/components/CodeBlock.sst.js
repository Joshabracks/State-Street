"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeBlock = void 0;
/**
 * Framed code panel. `src` is the key of a snippet in state.data (see snippets.ts);
 * it is rendered via {{src}} interpolation so the code shows verbatim. `label`
 * is the caption shown in the title bar.
 *
 * Usage: <CodeBlock label="Quick start" src="quickstart"/>
 */
function CodeBlock({ label, src }) {
    return `
    <div class="code ticked">
      <div class="code__bar"><b>${label}</b><span>${src}.sst.ts</span></div>
      <pre><code>{{${src}}}</code></pre>
    </div>
  `;
}
exports.CodeBlock = CodeBlock;
//# sourceMappingURL=CodeBlock.sst.js.map