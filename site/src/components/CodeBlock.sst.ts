import type { Ctx } from "../types";
import { snippets } from "../snippets";

/**
 * Framed code panel. `src` is a snippet key (see snippets.ts). The snippet text
 * is inlined as the verbatim content of a `<code :raw=highlightSST>` element, so
 * State Street hands it to the `highlightSST` formatter (see highlight.ts) and
 * sets the highlighted HTML as the element's innerHTML. `label` is the caption.
 *
 * Usage: <CodeBlock label="Quick start" src="quickstart"/>
 *
 * Note: a snippet must not contain the literal `</code>` (the :raw capture ends
 * at the first one). None of the current snippets do.
 */
export function CodeBlock({ label, src }: Ctx): string {
  const code = snippets[src] ?? "";
  return `
    <div class="code ticked">
      <div class="code__bar"><b>${label}</b><span>${src}.sst.ts</span></div>
      <pre><code :raw=highlightSST>${code}</code></pre>
    </div>
  `;
}
