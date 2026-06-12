/**
 * Code samples shown on the site.
 *
 * These are merged into `state.data` and rendered via `{{key}}` interpolation
 * (see CodeBlock). State Street injects an interpolated value as a literal
 * text-node value — it is NOT re-parsed as SST — so the `<tags>` and `{{vars}}`
 * inside a sample render verbatim, with newlines/indentation preserved by <pre>.
 */
export const snippets: Record<string, string> = {
  quickstart: `import { State } from "@state-street/state-street";

const template = \`
  <main>
    <h1>{{title}}</h1>
    <button :click=inc()>clicked {{count}} times</button>
  </main>
\`;

const data = { title: "Hello, State Street", count: 0 };
const methods = { inc: ({ state }) => state.data.count++ };

// Mounts to <body> and starts a requestAnimationFrame render loop.
new State(template, data, {}, methods);`,

  component: `// A component is just a function that returns an HTML string.
function Counter({ state }) {
  return \`
    <button :click=inc()>count: {{count}}</button>
  \`;
}

// Register it, then drop <Counter/> anywhere in a template.
new State(\`<Counter/>\`, { count: 0 }, { Counter }, { inc });`,
};
