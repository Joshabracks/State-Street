# State Street — guide for coding agents

You are about to write code in **State Street**, a small reactive single-page-app framework.
It is **not** React/Vue/Svelte/Angular and does not share their APIs or mental model. Read this
first; most bugs come from applying habits from those frameworks. (Human-facing docs:
https://joshabracks.github.io/State-Street/ — this file is the distilled, agent-oriented version.)

## Do NOT do these (they do not exist / will break)

- **No JSX/TSX.** Components return **HTML strings**, written with template literals. There is no
  `.jsx`/`.tsx`, no Babel/JSX transform, no `React.createElement`/`h()`.
- **No virtual DOM, no hooks.** No `useState`, `useEffect`, `useRef`, `useMemo`, no `key` prop, no
  `setState`. State is one plain object.
- **No `className`, no `onClick`.** Use the HTML attribute `class`, and the directive
  `:click=method()` (see Events). React-style `onClick={...}` does nothing.
- **No router.** No `react-router`, `<Link>`, `<Route>`, `history.pushState` routing. Navigation is
  hash + a `view` key (see Navigation).
- **No Context/Redux/stores, no `ReactDOM.render`, no lifecycle methods** (`componentDidMount`…).
- **No `style={{...}}` objects.** Use a normal `style="..."` string, or CSS classes.

## Mental model (read this)

- A **component is a plain function** that takes a context object and **returns an HTML string**:
  `({ state }) => \`<p>\${state.data.count}</p>\``.
- There is **one reactive state object**, `state.data` (a Proxy). Assigning to a top-level key marks
  it dirty and schedules a re-render on the next animation frame.
- Re-rendering is **dependency-gated**: a component re-runs only when a `state.data` key it *read
  during its last render* changes. Reading more keys = more re-renders; read only what you need.
- Components are referenced as **tags** in templates: `<Counter/>`. State Street finds them by name
  in the `components` registry and renders each as its own dep-tracked subtree, delimited by HTML
  comment markers (there is no wrapper element).

## Hello world

```js
import { State } from "@state-street/state-street";

const template = `
  <main>
    <h1>{{title}}</h1>
    <Counter/>
  </main>
`;

const data = { title: "Hello State Street", count: 0 };

const components = {
  Counter: ({ state }) => `
    <p>Count: ${state.data.count}</p>
    <button :click=increment()>+1</button>
    <button :click=reset()>Reset</button>
  `,
};

const methods = {
  increment: ({ state }) => { state.data.count += 1; },
  reset:     ({ state }) => { state.data.count = 0; },
};

// Mounts into <body> and starts a requestAnimationFrame render loop.
new State(template, data, components, methods);
```

## Templates: two kinds of interpolation

- `{{ path }}` — **State Street interpolation.** Reads `state.data.path` reactively and renders as a
  standalone text/attribute node that can update **without re-running the component**. Use it in the
  root `template` and inside component strings for live values: `<h1>{{title}}</h1>`.
- `${ ... }` — **plain JavaScript** template-literal interpolation, evaluated once when the function
  runs (it is not special to State Street). Reading `state.data.x` inside `${}` still registers `x`
  as a dependency of that component.

Component tags accept attributes, passed to the component as named props with **type coercion**:

```js
`<Avatar src="${user.portrait}" size="lg" count=478 active=true label={{name}}/>`
// component receives: { state, src, size: "lg", count: 478, active: true, label: <state.name> }
```

`478` → number, `true`/`false` → boolean, `{{name}}` → the value of `state.data.name`, quoted → string.

## Events / directives

Bind DOM events with `:event=method(args)`. **The parentheses are required** — `:click=submit` is
parsed as a plain attribute and does nothing; `:click=submit()` works.

```js
`<button :click=save()>Save</button>`
`<button :click=removeItem(id="${item.id}")>Delete</button>`
`<input :input=updateField(field="email")/>`
`<input :change=setColor(name="--accent")/>`   // :input, :change, :keydown, etc.
```

The method receives `{ state, event, ...args }` — `event` is the DOM event; args are coerced like
attributes:

```js
const methods = {
  setCount: ({ state, n }) => { state.data.count = n; },   // <button :click=setCount(n=5)>
  onKey:    ({ state, event }) => { if (event.key === "Enter") submit(state, event.target); },
};
```

## Lists and conditionals — just JavaScript

There is **no `:for`, `:if`, or `v-model`.** Build the string with normal JS:

```js
function Cart({ state }) {
  const items = state.data.cart.items;
  if (!items.length) return `<p>Your cart is empty.</p>`;
  const rows = items.map((it) => `<li>${it.name} — $${it.price.toFixed(2)}</li>`).join("");
  return `<ul>${rows}</ul>`;
}
```

## Reactivity rules (important)

- **Reference-based dirty check at the top level.** Assigning a top-level key triggers a render.
  Mutating *into* a nested object also marks the **top-level** key dirty:
  ```js
  state.data.count = 1;                 // "count" dirty
  state.data.user = { ...state.data.user, name: "Mara" };  // "user" dirty (replace to be safe)
  state.data.scene.beatCount = 3;       // "scene" dirty (the root key, not scene.beatCount)
  ```
- To update an array/object and re-render, **replace it** (new reference): `state.data.items = [...]`.
  Pushing in place without reassigning may not re-render dep-gated components.
- For **very high-frequency** updates (e.g. 60fps), mutate a top-level key directly each frame; that
  is the intended fast path.

## Gotchas that bite agents

- **Use the component tag, not a call.** `<Counter/>` is a separate dep-tracked subtree. Writing
  `${Counter({ state })}` inlines it and makes the parent re-render on the child's state. Prefer tags.
- **Controlled inputs don't "stick".** Setting `value="${draft}"` won't overwrite what a user has
  typed (State updates attributes, not the live input value). Use **uncontrolled** inputs: read
  `event.target.value` on submit and clear it imperatively, instead of binding `value`.
- **Split high-frequency UI from stable controls.** If a value changes ~60fps, put it in its own
  small component so the surrounding buttons/inputs aren't rebuilt every frame (rebuilding an input
  mid-interaction loses focus/clicks). Example: a stopwatch splits `<Time/>` from `<Controls/>`.
- **Color pickers / range sliders: use `:change`, not `:input`.** `:input` fires every tick; the
  re-render rebuilds the `<input>` and the drag "disengages." `:change` commits on release.
- **RAWTEXT does not decode HTML entities.** Inside `<code>`/`<script>`/`<style>`, write a literal
  `<`, not `&lt;` (see Raw content).

## Raw content & inline SVG

- `<code>`, `<script>`, `<style>` are **RAWTEXT**: contents are verbatim — not parsed, not
  interpolated (`{{ }}`/`<tags>` are literal). `<textarea>`/`<title>` are **RCDATA**: literal `<` is
  safe, but `{{ }}` still interpolates.
- `:raw` makes **any** element verbatim text: `<div :raw>literal {{x}} and <b>not bold</b></div>`.
- `:raw=formatterName` feeds the raw text to a method and sets the returned string as `innerHTML`
  (e.g. syntax highlighting, Markdown): `formatter: ({ text }) => "<strong>" + text + "</strong>"`.
- **Inline SVG renders** as real namespaced SVG, with reactive/interpolated attributes:
  ```js
  `<svg viewBox="0 0 100 100" width="120"><circle cx="50" cy="50" r="{{radius}}" fill="tomato"/></svg>`
  ```

## Navigation (no router)

Hash-driven view switching is the idiom:

```js
const VIEWS = { home: "Home", about: "About" };          // hash key -> component name
const data = { view: "home" };
const components = {
  App:  ({ state }) => `<${VIEWS[state.data.view] || "Home"}/>`,  // dispatch by view
  Home: () => `<h1>Home</h1>`,
  About:() => `<h1>About</h1>`,
};
const methods = {
  setView: ({ state, target }) => { state.data.view = target; location.hash = target; },
};
// nav: `<a href="#about" :click=setView(target="about")>About</a>`
// keep in sync with back/forward: window.addEventListener("hashchange", ...) -> set state.data.view
```

## Mounting, nested States, third-party DOM

```js
new State(tpl, data, comps, methods);                              // -> <body>
new State(tpl, data, comps, methods, { mountTarget: "#app" });     // selector or Element
```

- A non-`<body>` target **waits for its element** (`mountOnAvailable`, default true): auto-mounts
  when it appears, dismounts if removed, re-mounts when it returns. `state.data` survives a dismount.
- `renderLoop: false` disables the loop — drive it yourself with `s.mountCheck()` and `s.update()`.
- **Nested States:** mount a child State into an element owned by a parent State; every element is
  branded with its owner's id, so the child auto-registers and the parent **preserves** (moves, not
  rebuilds) that subtree across its re-renders. The child's DOM/state are never clobbered.
- **`:preserve`** tells State to keep an element across re-renders and not rebuild its children — for
  hosting DOM State doesn't own (a chart, a map, a code editor) or a manually-mounted child State:
  `<div :preserve id="chart"></div>`.

## API reference

```ts
new State(
  template: string,
  data?: Record<string, any>,
  components?: Record<string, (ctx: any) => string>,   // ctx: { state, ...props }
  methods?: Record<string, (ctx: any) => void | string>, // ctx: { state, event, ...args }
  options?: {
    renderLoop?: boolean;       // default true
    targetFPS?: number;
    mountTarget?: Element | string;   // default <body>
    mountOnAvailable?: boolean; // default true
    preserveInParent?: boolean; // default true
    imgMemoryBudget?: number;
    imgWarmPerFrame?: number;
  }
)
```

Instance: `state.data`, `state.dirty`, `state.id`, `state.root`, `state.mounted`,
`update()`, `forceUpdate()`, `mountCheck()`, `setMountTarget(t)`, `togglePreserve(ssid, on?)`,
`setRenderLoop(on)`, `setTargetFPS(n)`, `setImgMemoryBudget(n)`, `setImgWarmPerFrame(n)`,
`warmImages(list)`, `destroy()`.

## Links

- Full docs: https://joshabracks.github.io/State-Street/
- This guide (web): https://joshabracks.github.io/State-Street/llms-full.txt — index: `/llms.txt`
- GitHub: https://github.com/Joshabracks/State-Street
- npm: `@state-street/state-street`
