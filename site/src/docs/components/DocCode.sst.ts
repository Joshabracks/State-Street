import type { Ctx } from "../../types";
import { docSnippets } from "../snippets";

/**
 * Doc code block. `id` is a key in docSnippets; the sample is inlined as the raw
 * content of a `<pre :raw=highlightSST>` element so the framework hands it to the
 * highlighter (highlight.ts) and sets the highlighted HTML as innerHTML.
 *
 * The wrapper is `<pre>` (not `<pre><code>`) on purpose: a sample may legitimately
 * contain a literal `</code>` (e.g. the raw-content docs), which would prematurely
 * close a `<code :raw>` wrapper. Snippets never contain `</pre>`.
 *
 * Usage: <DocCode id="quick-direct" label="counter.html" lang="html"/>
 */
export function DocCode({ id, label, lang }: Ctx): string {
  const code = docSnippets[id] ?? `// missing snippet: ${id}`;
  return `
    <div class="code">
      <div class="code__bar"><b>${label || ""}</b><span>${lang || "js"}</span></div>
      <pre :raw=highlightSST>${code}</pre>
    </div>
  `;
}
