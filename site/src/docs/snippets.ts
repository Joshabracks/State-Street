/**
 * Doc code samples. Rendered verbatim + highlighted via <DocCode id="…"/> →
 * `:raw=highlightSST`. Backticks and ${} are escaped here (once), so the displayed
 * text shows real template literals.
 */
export const docSnippets: Record<string, string> = {
  // --- Getting Started ---------------------------------------------------
  "install-npm": `npm i @state-street/state-street`,

  "install-import": `import { State } from "@state-street/state-street";`,

  "install-cdn": `<!-- self-hosted, next to your HTML -->
<script src="state-street.global.js"></script>

<!-- or via CDN (jsDelivr) -->
<script src="https://cdn.jsdelivr.net/npm/@state-street/state-street/build/state-street.global.js"></script>

<script>
  // the script defines the global State (window.State)
  const app = new State(template, data, components, methods);
</script>`,

  "quick-direct": `const template = \`
  <main>
    <h1>{{title}}</h1>
    <Counter/>
  </main>
\`;

const data = { title: "Hello State Street", count: 0 };

const components = {
  Counter: ({ state }) => \`
    <p>Count: \${state.data.count}</p>
    <button :click=increment()>+1</button>
    <button :click=reset()>Reset</button>
  \`,
};

const methods = {
  increment: ({ state }) => { state.data.count += 1; },
  reset:     ({ state }) => { state.data.count = 0; },
};

// Mounts to <body> and starts a requestAnimationFrame render loop.
new State(template, data, components, methods);`,

  "registry-boot": `MY_APP.setBaseData(() => ({ title: "Hello", count: 0 }));

// components/counter.js
(function () {
  function Counter({ state }) {
    return \`<button :click=inc()>count: \${state.data.count}</button>\`;
  }
  MY_APP.registerComponents({ Counter });
})();

// methods/counter.js
MY_APP.registerMethods({ inc: ({ state }) => { state.data.count += 1; } });

MY_APP.boot();   // assembles the registries and calls new State(...)`,

  // --- Core Concepts -----------------------------------------------------
  "reactive-state": `state.data.count = state.data.count + 1;        // marks "count" dirty
state.data.user  = { name: "Marie", age: 21 };  // marks "user" dirty
state.data.user.name = "Jasmine";               // marks "user" dirty (top-level)`,

  "return-strings": `function Greeting({ state, name }) {
  return \`<h1>Hello, \${state.data.user.name || name}!</h1>\`;
}`,

  "tag-vs-call": `// Good — Counter is its own dep-tracked subtree.
function App() {
  return \`<main><Counter/></main>\`;
}

// Bad — App now re-runs whenever Counter's state changes.
function App({ state }) {
  return \`<main>\${Counter({ state })}</main>\`;
}`,

  "worldview": `function WorldView() {
  return \`
    <div class="page wv-page">
      <WvTopbar/>
      <div class="wv-body">
        <aside class="wv-sidebar">
          <WvSidebarTabs/>
          <WvSidebarBody/>
        </aside>
        <section class="wv-main"><WvMain/></section>
      </div>
    </div>
  \`;
}`,

  // --- Templates ---------------------------------------------------------
  "interp-card": `// State Bindings — {{path}} — patch just their own node in place, no re-run.
function Card({ state, npc }) {
  return \`<h2>{{npc.name}} — age {{npc.age}}</h2>\`;
}

// Binding vs \${}: same output, different cost on change.
function Count({ state }) {
  return \`<p>{{count}}</p>\`;             // ✅ patches this text node only
  // return \`<p>\${state.data.count}</p>\`;  // ⛔ reading count re-runs all of Count
}`,

  "component-tags": `const components = {
  Avatar: ({ state, src, size }) =>
    \`<img class="avatar avatar--\${size}" src="\${src}"/>\`,
};

// In a parent template:
\`<Avatar src="\${user.portrait}" size="lg"/>\``,

  "events-basic": `\`<button :click=submit()>Save</button>\`
\`<button :click=removeItem(id="\${item.id}")>Delete</button>\`
\`<input :input=updateField(field="email")/>\``,

  "events-args": `\`<button :click=jumpTo(scene="\${state.data.targetScene}", from="\${currentScene}")>Go</button>\``,

  "coercion": `\`<PropTest numberVal=478 booleanVal=true stringVal="a string" varVal={{total}}/>\`
// component receives:
//   { state, numberVal: 478, booleanVal: true,
//     stringVal: "a string", varVal: <state.total> }

\`<button :click=setCount(n=5, reset=false)>Set</button>\`
// method receives: { state, event, n: 5, reset: false }`,

  "no-directives": `function CartSummary({ state }) {
  const items = state.data.cart.items;
  if (items.length === 0) {
    return \`<p class="empty">Your cart is empty.</p>\`;
  }
  const rows = items
    .map((it) => \`<li>\${it.name} — $\${it.price.toFixed(2)}</li>\`)
    .join("");
  return \`<ul class="cart">\${rows}</ul>\`;
}`,

  "raw-elements": `// <code>, <script>, <style> render verbatim — no tag parsing, no {{ }}:
\`<code><button :click=inc()>{{count}}</button></code>\`
//        ^ shown literally, not parsed or interpolated

// <textarea>/<title> are RCDATA: literal "<" is safe, but {{ }} still interpolates:
\`<textarea>{{message}}</textarea>\`

// :raw makes ANY element verbatim text:
\`<div :raw>literal {{x}} and <b>not bold</b></div>\``,

  "raw-formatter": `// :raw=formatterName feeds the raw text to a method and sets the
// returned string as innerHTML — e.g. syntax highlighting or markdown.
const methods = {
  shout: ({ text }) => \`<strong>\${text.toUpperCase()}!</strong>\`,
};

\`<div :raw=shout>hello</div>\`   // renders <strong>HELLO!</strong>`,

  "svg-inline": `// Inline SVG renders as real, namespaced SVG (createElementNS):
\`<svg viewBox="0 0 24 24" width="48" height="48">
  <rect x="2" y="2" width="20" height="20" rx="3" fill="royalblue"/>
  <path d="M6 12 L11 17 L18 7" stroke="white" stroke-width="2" fill="none"/>
</svg>\``,

  "svg-reactive": `// SVG attributes interpolate and stay reactive:
function Chart({ state }) {
  return \`<svg viewBox="0 0 100 100" width="120">
    <circle cx="50" cy="50" r="{{radius}}" fill="tomato"/>
  </svg>\`;
}

// Legacy xlink: attributes work too (createElementNS); prefer SVG2 href.
\`<use xlink:href="#icon"/>\``,

  // --- API ---------------------------------------------------------------
  "constructor": `new State(template, data, components, methods, options?)`,

  "methods-sig": `function methodName({ state, event, ...args }) {
  // mutate state.data; the event object is the DOM event.
}`,

  "methods-examples": `// View dispatcher used by every nav button.
function go({ view, state }) {
  state.data.view = view;
}

// Wiring in a template:
\`<button :click=go(view="Settings")>Settings</button>\``,

  // --- Reactivity --------------------------------------------------------
  "nested-mutations": `state.data.scene.beatCount = 3;
// walks: get "scene" (cached wrapper proxy) -> set beatCount
//        -> onMutate("scene")  (the root key, not scene.beatCount)
// Every component reading "scene" re-runs.`,

  "marker-html": `<!--ss:012:Counter-->
<p>Count: 3</p>
<button>+1</button>
<!--/ss:012-->`,

  "update-loop": `on each requestAnimationFrame:
  drain image warm queue
  if !state.dirty or not yet time for next update: return
  for each component (outer -> inner, by ssid):
    if start marker not connected: continue
    if already rebuilt this tick: continue
    if rec.deps intersect state.dirtyKeys:
      capture scroll + focus
      run rec.fn under a fresh proxy
      if body differs from last frame:
        replace the nodes between the markers in place
        restore scroll + focus
  update standalone {{interpolation}} text + attr nodes
  prune removed component records
  clear dirty`,

  "image-cache": `\`<img src="\${b64}" nocache/>\`   // opt out of blob caching

// Pre-warm images you know are coming (decoded a few per idle frame):
state.warmImages(nextPage.thumbnails);`,

  // --- Patterns ----------------------------------------------------------
  "spread-pattern": `const wv = state.data.worldView || {};
state.data.worldView = {
  ...wv,
  selectedCastId: id,
};`,

  "direct-mutation": `// 50–300 events/sec from a token stream — direct mutation, no full spread.
function onToken(event) {
  const p = event.payload || {};
  const sc = state.data.scene;
  if (!sc) return;
  const streamingLines = { ...(sc.streamingLines || {}) };
  streamingLines[p.seq] = (streamingLines[p.seq] || "") + p.delta;
  sc.streamingLines = streamingLines;   // reuse the existing top-level proxy
}`,

  "iife": `(function () {
  function MyComponent({ state }) { /* ... */ }
  MY_APP.registerComponents({ MyComponent });
})();`,

  "registry-usage": `// mods/dark-theme.js — loaded AFTER boot
MY_APP.registerComponents({
  Home: ({ state }) =>
    \`<h1 class="dark">Hello, \${state.data.user?.name || "stranger"}!</h1>\`,
});
// The next state mutation re-resolves components.Home — the override is live.`,

  // --- Preserve / mounting -----------------------------------------------
  "preserve": `// :preserve makes State reuse this element in place across re-renders and
// never rebuild its children — for hosting DOM State doesn't own (a chart, a
// map, a code editor) or a manually-mounted child State.
\`<div :preserve id="chart"></div>\`

// Some third-party lib draws into #chart; it survives the parent's re-renders.
new Chart(document.getElementById("chart"), config);`,

  "mount-target": `// Mount into a specific element instead of <body>:
new State(template, data, components, methods, { mountTarget: "#app" });

// A string target is a selector, re-resolved over time; an Element works too.
new State(template, data, components, methods, { mountTarget: panelEl });`,

  "mount-lifecycle": `// Non-body targets wait for their element and track it (mountOnAvailable,
// default true): auto-mount when it appears, dismount if it's removed, re-mount
// when it returns. State.data survives a dismount — only the DOM is rebuilt.
new State(tpl, data, comps, methods, { mountTarget: "#panel" });

// renderLoop:false -> no loop -> drive the check yourself:
const s = new State(tpl, data, comps, methods,
  { mountTarget: "#panel", renderLoop: false });
s.mountCheck();        // mount/dismount as needed
s.update();            // render once
s.setMountTarget("#other");   // dismount, move, re-mount`,

  "nested-states": `// A parent State, then a child mounted INTO one of the parent's elements.
new State(\`<main><div id="widget"></div></main>\`, parentData, comps, methods);

// The child renders into #widget. Because every element is branded with its
// owner State's id (stid), the child auto-registers with the parent, which then
// preserves #widget across its re-renders — the child's DOM is never clobbered.
new State(widgetTpl, widgetData, {}, widgetMethods, { mountTarget: "#widget" });`,

  // --- Gotchas -----------------------------------------------------------
  "gotcha-parens": `// Does nothing — parsed as a plain HTML attribute.
\`<button :click=submit>Save</button>\`

// Works.
\`<button :click=submit()>Save</button>\``,

  // --- AI agents ---------------------------------------------------------
  "agent-setup": `# Most agents read a root AGENTS.md — copy it from the installed package:
cp node_modules/@state-street/state-street/AGENTS.md ./AGENTS.md

# Claude Code reads CLAUDE.md (same content):
cp AGENTS.md CLAUDE.md

# No install yet? Fetch the hosted guide:
curl -o AGENTS.md https://joshabracks.github.io/State-Street/llms-full.txt`,
};
