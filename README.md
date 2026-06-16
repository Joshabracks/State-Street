# ![State Street](https://github.com/Joshabracks/State-Street/blob/main/sstlogo.png?raw=true)

[![CI](https://github.com/Joshabracks/State-Street/actions/workflows/ci.yml/badge.svg)](https://github.com/Joshabracks/State-Street/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@state-street/state-street.svg)](https://www.npmjs.com/package/@state-street/state-street)
[![license: ISC](https://img.shields.io/badge/license-ISC-blue.svg)](#license)
[![zero deps](https://img.shields.io/badge/dependencies-0-success)](https://www.npmjs.com/package/@state-street/state-street)

A no-build reactive UI layer that fits in a single global script. Plain JS template strings, dep-gated re-renders, no JSX, no compile step.

Want to contribute or need help? [Join the State Street Discord!](https://discord.gg/a7AycPG2)

---

## Table of contents

- [Why State Street](#why-state-street)
- [Using with AI coding agents](#using-state-street-with-ai-coding-agents)
- [Install](#install)
- [Quick start — direct style](#quick-start--direct-style)
- [Quick start — registry style](#quick-start--registry-style)
- [Core concepts](#core-concepts)
- [Template syntax](#template-syntax)
- [The `State` class — API reference](#the-state-class--api-reference)
- [Components](#components)
- [Methods](#methods)
- [Reactivity model](#reactivity-model)
- [Render scheduling + component marker ranges](#render-scheduling--component-marker-ranges)
- [Image cache](#image-cache)
- [Patterns from production](#patterns-from-production)
- [The registry pattern — full reference](#the-registry-pattern--full-reference)
- [Gotchas](#gotchas)
- [Tooling](#tooling)
- [FAQ](#faq)
- [License](#license)

### Sites and applications powered by State Street

- [joshuabracks.com](https://www.joshuabracks.com)
- [omosuen-editor](https://github.com/joshabracks/omosuen-editor)

---

## Why State Street

- **Plain template strings.** No JSX and no required compile step. Your views are template literals that return strings of HTML. Your editor highlights them as HTML. Your tests can read them.
- **Mutate state directly.** `state.data.foo = bar` triggers a dep-gated re-render on the next animation frame. No setters, no actions, no reducers.
- **One file, one class.** The entire library is `new State(template, data, components, methods)`. Read the source in an afternoon.
- **First-class tooling.** Written in TypeScript and happy to be consumed as TS or plain JS, with any bundler or none at all. The official [State Street SST](https://marketplace.visualstudio.com/items?itemName=beetnick82.vscode-sst) VS Code extension gives you HTML highlighting + completion inside `.sst.js` / `.sst.ts` template literals.
- **Tiny.** Small enough to disappear into whatever you ship, with zero runtime dependencies.

### Is this for me?

State Street fits apps where you own the HTML and want reactive, HTML-shaped templates — tools, internal dashboards, Tauri/Electron apps, browser-extension UIs, single-page games, and production SPAs. It works with plain JavaScript or TypeScript, with or without a bundler, and can also run straight from a single global script with no build at all. The [VS Code extension](#tooling) gives you template highlighting either way.

It stays small on purpose: there's no virtual DOM, and conditionals and loops are plain JavaScript inside your component functions rather than template directives. If that trade sounds good, State Street is for you.

---

## Using State Street with AI coding agents

State Street isn't React/Vue, so coding assistants often misapply patterns from those frameworks (JSX, hooks, `className`, a router). Give your agent the correct mental model up front:

- **Drop [`AGENTS.md`](./AGENTS.md) into your project.** It lives at this repo's root and ships inside the npm package (`node_modules/@state-street/state-street/AGENTS.md`). Copy it to your project root as `AGENTS.md` (read by most agents) or `CLAUDE.md` (Claude Code), or paste it into your assistant's rules/context.
- **Or point your agent at the hosted guide:** [`/llms-full.txt`](https://joshabracks.github.io/State-Street/llms-full.txt) (the full guide) — discoverable via [`/llms.txt`](https://joshabracks.github.io/State-Street/llms.txt).

It's a distilled cheat-sheet — what State Street is *not*, the reactivity model, the directive syntax, and the gotchas that trip up agents — so they write idiomatic State Street instead of guessing from other frameworks. The package also ships TypeScript declarations (`build/*.d.ts`), so editors and agents get real type signatures.

---

## Install

**Scaffold a new app** (a starter landing page, agent-ready):

```bash
npm create @state-street@latest my-app          # asks: JavaScript or TypeScript?
```

Pass `--typescript` (or `--js`) to skip the prompt. The default JS template has no build step;
TypeScript adds a webpack toolchain.

**Add to an existing project (npm / module bundler):**

```bash
npm i @state-street/state-street
```

```js
import { State } from "@state-street/state-street";
```

**Global script tag (no build step):**

Every release ships a minified UMD build, `state-street.global.js`, that defines the global `State` (`window.State`). You can get it from any of these:

- **GitHub Releases** — attached as a downloadable asset on each [release](https://github.com/Joshabracks/State-Street/releases) (e.g. the latest at [releases/latest](https://github.com/Joshabracks/State-Street/releases/latest)). Download it and host it yourself.
- **jsDelivr CDN** — `https://cdn.jsdelivr.net/npm/@state-street/state-street/build/state-street.global.js`
- **unpkg CDN** — `https://unpkg.com/@state-street/state-street/build/state-street.global.js`

```html
<!-- self-hosted, next to your HTML -->
<script src="state-street.global.js"></script>

<!-- or via CDN (jsDelivr) -->
<script src="https://cdn.jsdelivr.net/npm/@state-street/state-street/build/state-street.global.js"></script>

<script>
  // the script defines the global `State` (window.State)
  const app = new State(template, data, components, methods);
</script>
```

> **Pin a version in production.** The CDN URLs above always resolve to the latest published version. To lock to a specific release, add `@<version>` after the package name, e.g.
> `https://cdn.jsdelivr.net/npm/@state-street/state-street@1.4.1/build/state-street.global.js`.

If you use a bundler (webpack, esbuild, vite, rollup, …), the named export is `State`. The library has zero runtime dependencies, so the build is trivial.

---

## Quick start — direct style

A counter app in one file:

```html
<!doctype html>
<html>
<body>
  <script src="state-street.global.js"></script>
  <script>
    const template = `
      <main>
        <h1>{{title}}</h1>
        <Counter/>
      </main>
    `;

    const data = {
      title: "Hello State Street",
      count: 0,
    };

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

    new State(template, data, components, methods);
  </script>
</body>
</html>
```

That's the whole pattern. The constructor mounts to `document.body` automatically. `state.data.count += 1` marks the top-level `count` key dirty; on the next animation frame, the `<Counter/>` component re-runs and its rendered nodes are swapped in place. The component adds no wrapper element to the DOM, so no special CSS is needed — `<Counter/>`'s `<p>` and `<button>`s are direct children of `<main>`.

> **Heads up:** `:click=increment()` requires the parentheses, even with no arguments. `:click=increment` without parens is silently treated as a regular HTML attribute and the click does nothing.

---

## Quick start — registry style

The same app, written with a registration boilerplate. Useful when your app grows past one file or when you want to support runtime extension (mods, themes, plugins). The boilerplate itself is ~100 lines you copy in once; see [the registry pattern reference](#the-registry-pattern--full-reference) below.

**index.html:**

```html
<script src="state-street.global.js"></script>
<script src="my-app/core.js"></script>              <!-- the registry boilerplate -->
<script src="my-app/base_data.js"></script>         <!-- setBaseData(...) -->
<script src="my-app/components/counter.js"></script>
<script src="my-app/methods/counter.js"></script>
<script>MY_APP.boot();</script>
```

**base_data.js:**

```js
MY_APP.setBaseData(() => ({
  title: "Hello State Street",
  count: 0,
}));
```

**components/counter.js:**

```js
(function () {
  function Counter({ state }) {
    return `
      <p>Count: ${state.data.count}</p>
      <button :click=increment()>+1</button>
      <button :click=reset()>Reset</button>
    `;
  }
  MY_APP.registerComponents({ Counter });
})();
```

**methods/counter.js:**

```js
(function () {
  MY_APP.registerMethods({
    increment: ({ state }) => { state.data.count += 1; },
    reset:     ({ state }) => { state.data.count = 0; },
  });
})();
```

`MY_APP.boot()` assembles the accumulated registries, calls `new State(...)`, and you're live. Both styles converge on the same `State` class — only the wiring differs.

---

## Core concepts

State Street has four ideas. That's the whole API surface to internalize.

### 1. Reactive state

`state.data` is a `Proxy` with two traps. Writing `state.data.foo = bar` triggers the **`set` trap**, which marks the top-level key `foo` as dirty for the next render frame. Reading `state.data.foo` triggers the **`get` trap**, which records `foo` as a dependency of the component currently running — see dep gating below.

```js
state.data.count = state.data.count + 1;        // marks "count" dirty
state.data.user  = { name: "Marie", age: 21 };  // marks "user" dirty
state.data.user.name = "Jasmine";               // marks "user" dirty (top-level)
```

### 2. Top-level-key dep gating

Each component instance has its own dep-tracking proxy. While the component function runs, every `state.data.<key>` it reads (via the `get` trap) is recorded into that instance's `deps: Set<string>`. On the next frame, the render scheduler only re-runs components whose tracked keys intersect with the set of dirty keys.

> **The read is the subscription.** Any `state.data.<key>` you touch *anywhere in the body* subscribes the component to that key — in a conditional, a computed local, an existence check, or inside a `${}` — **even if the value never appears in the output**. Read only what you need.

> **Gating is top-level-key granular.** `state.data.user.name` marks `user` dirty, not `user.name`. Components reading any part of `user` will re-run. If you need finer reactivity, split your state into more top-level keys.

### 3. Components return strings

A component is a plain function that returns a string of HTML. There is no virtual DOM and no per-element diff. When a component's tracked state goes dirty, the function re-runs; if its output is byte-identical to the previous frame the DOM is left untouched, otherwise its rendered nodes are rebuilt and swapped in place (within a pair of invisible comment markers that bound the component — no wrapper element). (Plain reusable elements are reused and patched in place rather than recreated.)

```js
function Greeting({ state, name }) {
  return `<h1>Hello, ${state.data.user.name || name}!</h1>`;
}
```

### 4. `<Tag/>` vs `${Tag()}`

Render components with the tag syntax `<Counter/>` so they get their own dep-tracked range. **Don't** interpolate component output directly — `${Counter()}` inlines the string into the parent, which means the parent inherits the child's deps and re-runs whenever the child's state changes.

```js
// ✅ Good — Counter is its own dep-tracked subtree.
function App() {
  return `<main><Counter/></main>`;
}

// ❌ Bad — App now re-runs whenever Counter's state changes.
function App({ state }) {
  return `<main>${Counter({ state })}</main>`;
}
```

Real example from a Tauri narrative game's world-view screen:

```js
function WorldView() {
  return `
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
  `;
}
```

Each `<Wv…/>` is independently gated. Changing the selected sidebar tab marks `worldView` dirty, which re-runs `<WvSidebarTabs/>` and `<WvMain/>` but leaves `<WvTopbar/>` untouched (it only reads `game`).

---

## Template syntax

### State Bindings: `{{path}}`

A **State Binding** — `{{path}}` — is a reactive reference to a `state.data` value. State Street keeps it as a standalone text or attribute node and updates that node **in place** when the bound key changes, **without re-running the component**. It replaces with the value at `path` in the local scope (the props you passed to the component plus the values in its scope) and resolves dotted paths.

```js
function Card({ state, npc }) {
  return `<h2>{{npc.name}} — age {{npc.age}}</h2>`;
}
```

If you'd rather inline JavaScript, template literals work too: `${npc.name}`. Both produce the same string, but they behave differently on change: a `{{ }}` State Binding patches just its own node, while `${state.data.x}` is evaluated **once** when the function runs and its read subscribes the whole component, so a change to `x` re-runs and rebuilds it.

> **Prefer State Bindings over `${}` for reactive values.** `{{count}}` updates just that node in place; `${state.data.count}` re-runs the whole component whenever `count` changes. Reserve `${}` for control flow (loops, conditionals), derived/computed strings, and composition — things a binding can't express.

### Component tags: `<Component prop="value"/>`

Self-closing tags whose name matches a registered component invoke that component. Attributes are passed as props.

```js
const components = {
  Avatar: ({ state, src, size }) =>
    `<img class="avatar avatar--${size}" src="${src}"/>`,
};

// In a parent template:
`<Avatar src="${user.portrait}" size="lg"/>`
```

### Event directives: `:event=method(arg=value, ...)`

Wire any standard DOM event to a registered method. The handler receives `{ state, event, ...args }`.

```js
`<button :click=submit()>Save</button>`
`<button :click=removeItem(id="${item.id}")>Delete</button>`
`<input :input=updateField(field="email")/>`
```

**Required:** the parentheses. `:click=submit` without `()` is silently parsed as a regular HTML attribute and the click does nothing.

Args are name=value pairs separated by commas. Values can be string literals, numbers, or `${interpolated}` expressions:

```js
`<button :click=jumpTo(scene="${state.data.targetScene}", from="${currentScene}")>Go</button>`
```

Supported events: anything DOM (`:click`, `:input`, `:change`, `:submit`, `:mouseenter`, `:keydown`, `:focus`, `:blur`, `:mouseleave`, …). State Street doesn't sniff the list — it just registers an event listener for whatever event name follows the `:`.

### Attribute & argument coercion

Component props and event-directive args are **coerced to a type** before they reach your function — they are not always strings. The same rules apply to both component attributes and `:event=method(arg=value)` arguments:

| In the template | Arrives as |
|---|---|
| `"text"`, `'text'`, `` `text` `` (quoted) | the string `text` (quotes stripped) |
| `{{path}}` | the value at `path` in state (any type) |
| `true` / `false` (unquoted) | boolean `true` / `false` |
| `478` (unquoted, numeric) | number `478` |
| a bare attribute with no value | boolean `true` |
| anything else (unquoted) | string |

```js
`<PropTest numberVal=478 booleanVal=true stringVal="this is a string" varVal={{total}}/>`
// component receives:
//   { state, numberVal: 478 (number), booleanVal: true (boolean),
//     stringVal: "this is a string" (string), varVal: <state.total> }
```

```js
`<button :click=setCount(n=5, reset=false)>Set</button>`
// method receives: { state, event, n: 5 (number), reset: false (boolean) }
```

> **Heads up:** to keep something that *looks* like a number or boolean as a string, quote it: `code="0420"` arrives as the string `"0420"`, while `code=0420` arrives as the number `420`.

### No `:if` / `:for` / `:bind`

State Street has no built-in conditional or loop directives. Conditionals and loops are plain JavaScript inside the component body. Return different strings.

```js
function CartSummary({ state }) {
  const items = state.data.cart.items;
  if (items.length === 0) {
    return `<p class="empty">Your cart is empty.</p>`;
  }
  const rows = items.map((it) =>
    `<li>${it.name} — $${it.price.toFixed(2)}</li>`
  ).join("");
  return `<ul class="cart">${rows}</ul>`;
}
```

This is the design: the template syntax is small because JavaScript already does the work.

### Raw content: `<code>`, `:raw`, and formatters

Some elements opt out of template parsing so you can show literal markup (code samples, user text) or post-process content:

- **RAWTEXT** — `<script>`, `<style>`, `<code>`: contents are verbatim text — no child-tag parsing, no `{{ }}` interpolation.
- **RCDATA** — `<textarea>`, `<title>`: child tags aren't parsed (a literal `<` is safe), but `{{ }}` interpolation and entity decoding are kept.
- **`:raw`** — makes any element's content verbatim text.

```js
// shown literally — not parsed, not interpolated
`<code><button :click=inc()>{{count}}</button></code>`

// :raw on any element
`<div :raw>literal {{x}} and <b>not bold</b></div>`
```

`:raw=formatterName` feeds the raw text to a method (resolved from `methods`, called as `fn({ text, state })`) and sets the returned string as the element's `innerHTML` — the hook for syntax highlighting, Markdown, etc.

```js
const methods = {
  shout: ({ text }) => `<strong>${text.toUpperCase()}!</strong>`,
};
// `<div :raw=shout>hello</div>` renders <strong>HELLO!</strong>
```

> **Heads up:** `<pre>` is intentionally **not** RAWTEXT, so the common `<pre><code>…</code></pre>` idiom keeps working. RAWTEXT content can't contain the element's own closing tag (a literal `</code>` inside a `<code>` ends it early). Formatter output is set via `innerHTML` — the formatter owns escaping.

### Inline SVG & namespaced elements

Inline `<svg>` (and `<math>`) render as real namespaced elements — State Street builds them with `createElementNS` and threads the namespace through the subtree, across component boundaries and independent re-renders. Attribute interpolation and events work as usual.

```js
function Chart({ state }) {
  return `
    <svg viewBox="0 0 100 100" width="120">
      <circle cx="50" cy="50" r="{{radius}}" fill="tomato"/>
    </svg>
  `;
}
```

Legacy `xlink:` / `xml:` namespaced attributes are supported via `setAttributeNS`; prefer the modern SVG2 plain `href` where you can.

### Preserving elements: `:preserve`

`:preserve` makes State **reuse** an element in place across re-renders and never rebuild its children — for hosting DOM State doesn't own (a chart, a map, a rich-text editor):

```js
`<div :preserve id="chart"></div>`
```

On first render the element is built (empty); after that it's moved, not recreated, so whatever drew into it survives. For composing two States you usually don't need `:preserve` — see [Mounting & lifecycle](#mounting--lifecycle), where a child mounted into a parent's element registers itself automatically.

---

## The `State` class — API reference

```ts
new State(template, data, components, methods, options?)
```

### Constructor parameters

| Parameter | Type | Purpose |
|---|---|---|
| `template` | `string` | Root template. Any `<Component/>` tag references a key in `components`. |
| `data` | `object` | Initial state. Becomes reactive on construction. If it has a `title` property, that value becomes `document.title` when mounted to `<body>`. |
| `components` | `{ [name]: (props) => string }` | Component registry. |
| `methods` | `{ [name]: (args) => void }` | Method registry. Bound to `:event=name()` directives. |
| `options` | `object` | See below. |

### Options

| Option | Default | Purpose |
|---|---|---|
| `renderLoop` | `true` | When `true`, an internal `requestAnimationFrame` loop calls `update()` continuously. When `false`, you call `state.update()` (or `state.forceUpdate()`) yourself after mutations. Useful in apps with a lot of state where you want manual control. |
| `targetFPS` | `60` | When the render loop is on, throttle to roughly this many updates per second. |
| `imgMemoryBudget` | `256 MB` | Max bytes of cached image blobs from base64 → blob URL conversion. LRU eviction over this budget; blobs still in the DOM are never evicted. |
| `imgWarmPerFrame` | `4` | When `warmImages()` queues data URIs, how many to decode per idle frame. |
| `mountTarget` | `document.body` | Where to mount: an `Element`, or a CSS-selector string (re-resolved over time). State **owns** the target (clears it on mount); `document.title` is set from `data.title` only when the target is `<body>`. |
| `mountOnAvailable` | `true` | For non-body targets: while the render loop runs, auto-mount when the target appears, dismount if it's removed, re-mount when it returns. When `false`, mounting is manual (see `mountCheck()`). |

### Instance properties + methods

| Member | Type | Purpose |
|---|---|---|
| `.data` | getter / setter | Reactive proxy. Reads + writes go through it. The setter replaces the whole tree and marks every top-level key dirty. |
| `.update()` | `() => void` | One render tick: drain the warm queue, mount-check, then re-render dirty components (throttled to the target FPS when the loop is on). The internal loop drives this; call it yourself when `renderLoop` is off. |
| `.forceUpdate()` | `() => void` | Immediately re-render every dirty component and clear the dirty set. Bypasses the FPS throttle. |
| `.sameState()` | `() => boolean` | `true` if nothing is dirty. |
| `.warmImages(uris)` | `(string[]) => void` | Queue base64 data URIs for off-screen decode. See [Image cache](#image-cache). |
| `.mountCheck()` | `() => void` | Reconcile mount state with the DOM: dismount if the target is gone, mount if available. Call it yourself when `renderLoop` is off. |
| `.setMountTarget(t)` | `(Element \| string) => void` | Dismount, set a new target, re-mount if found. |
| `.togglePreserve(ssid, on?)` | `(string, boolean?) => void` | Preserve/release the element at `ssid` across re-renders (used automatically by nested States). |
| `.setRenderLoop(b)` / `.setTargetFPS(n)` / `.setImgMemoryBudget(n)` / `.setImgWarmPerFrame(n)` | setters | Adjust the matching option at runtime. `setRenderLoop` is guarded against starting a second loop. |
| `.destroy()` | `() => void` | Dismount and unregister from the global state registry. Call it for transient States to avoid leaks. |

### Mounting & lifecycle

By default the constructor mounts to `document.body` (it owns the target: clears it, appends the render, sets `document.title` from `data.title`). Pass `mountTarget` to mount elsewhere — an `Element` or a CSS-selector string:

```js
new State(template, data, components, methods, { mountTarget: "#app" });
```

For non-body targets, `mountOnAvailable` (default `true`) makes mounting a **lifecycle**: while the render loop runs, State waits for the target, mounts when it appears, dismounts if it's removed, and re-mounts when it returns. `state.data` survives a dismount — only the DOM is rebuilt, so a panel can come and go and keep its state. With `renderLoop: false` there's no loop, so you drive it yourself:

```js
const s = new State(tpl, data, comps, methods, { mountTarget: "#panel", renderLoop: false });
s.mountCheck();              // mount/dismount as needed
s.update();                 // render once
s.setMountTarget("#other"); // dismount, move, re-mount
```

A string `mountTarget` is a live selector — if it stops matching the mounted element (e.g. you toggle a class), State dismounts and waits. That lets you drive mounting from markup.

### Nested States

You can mount a State into an element owned by another State. Every element is branded with its owner State's id (a `stid` attribute, alongside `ssid`), so a child mounting into a parent's element looks the parent up and registers itself; the parent then **preserves** that element across its own re-renders — reusing it in place (moved, not rebuilt), so the child's DOM and state are never clobbered. On dismount the child un-registers.

```js
new State(`<main><div id="widget"></div></main>`, parentData, comps, methods);
// The child auto-registers with the parent; #widget survives the parent's re-renders.
new State(widgetTpl, widgetData, {}, widgetMethods, { mountTarget: "#widget" });
```

For non-State DOM (third-party widgets), mark the host element with [`:preserve`](#preserving-elements-preserve) instead, or call `togglePreserve(ssid)` directly.

---

## Components

A component is a function:

```js
function Name({ state, ...props }) {
  // ... returns an HTML string
}
```

Real example, trimmed for clarity (a game's loading screen):

```js
function LoadingScreen({ state }) {
  const game = state.data.game;
  const time = game?.in_game_time || { day: 1, phase: "early_morning" };
  const phaseLabel = String(time.phase).replace(/_/g, "-");
  const entry = pickNarrativeEntry(state);
  const body = entry ? renderNarrative(entry) : renderShimmer();
  return `
    <div class="page ls-page">
      <section class="ls-frame">
        <h1 class="ls-title">Day ${time.day}, ${phaseLabel}</h1>
        ${body}
      </section>
    </div>
  `;
}
```

### Rules of thumb

- **Components are pure functions of state.** Side-effects belong in methods (event handlers) or in external code (listeners, network callbacks).
- **Use `<Tag/>` for any non-trivial subtree.** Inline interpolation `${tag()}` defeats dep gating — the parent inherits all the child's deps.
- **Read what you need, no more.** Each `state.data.<key>` you touch becomes a dependency — the read *is* the subscription. Touching `state.data.game` even just to check if it exists subscribes the component to every change under `game`, whether or not the value reaches the output.
- **Prefer State Bindings over `${}` for reactive values.** `{{count}}` patches just that node in place; `${state.data.count}` re-runs the whole component on every change to `count`. Reserve `${}` for control flow, derived strings, and composition.
- **Props are typed values from the tag.** `<Avatar size="lg"/>` arrives as `{ state, size: "lg" }`. Unquoted `true`/`false` and numbers are coerced to booleans/numbers, `{{path}}` resolves from state, and a bare attribute with no value is `true`. See [Attribute & argument coercion](#attribute--argument-coercion).

---

## Methods

A method is a function called by an event directive:

```js
function methodName({ state, event, ...args }) {
  // mutate state.data; the event object is the DOM event.
}
```

Real examples:

```js
// View dispatcher used by every nav button.
function go({ view, state }) {
  state.data.view = view;
}

// Continue button on a loading screen — mutates two pieces of state and
// kicks off an external (Tauri) command.
function lsContinueToWorldView({ state }) {
  state.data.loadingProgress = { current: 0, total: 0, label: "" };
  state.data.view = "WorldView";
  invoke("world_view_bake_phase_art")
    .catch((err) => console.error(err));
}
```

Wiring in a template:

```js
`<button :click=go(view="Settings")>Settings</button>`
`<button :click=lsContinueToWorldView()>Continue →</button>`
```

### Rules of thumb

- **Mutate state directly.** `state.data.foo = bar`. The proxy marks `foo` dirty; no extra step.
- **Args arrive coerced to their type.** Unquoted numbers and `true`/`false` become numbers/booleans, quoted values stay strings, and `{{path}}` resolves from state. See [Attribute & argument coercion](#attribute--argument-coercion).
- **Async work is fine.** Methods can `await` and dispatch more mutations later. State Street picks them up on the next frame.

---

## Reactivity model

The hot loop, end to end:

1. **Mutation.** Your code (a method, a listener, anywhere) does `state.data.foo = bar`.
2. **Proxy set trap fires.** The set handler stores the new value AND calls the constructor-provided `onMutate("foo")` callback.
3. **`onMutate` flips dirty.** `state.dirty = true; state.dirtyKeys.add("foo")`.
4. **Render loop ticks.** On the next `requestAnimationFrame`, if enough time has elapsed for the target FPS, `updateDom(state)` runs.
5. **Dep gating.** For each tracked component (outer → inner, including nested ones), the scheduler checks whether the component's recorded deps intersect with `dirtyKeys`. If not, skip.
6. **Re-render the survivors.** Each surviving component function runs against a fresh dep-tracking proxy — every `state.data` key it reads fires the **`get` trap** and is recorded as next frame's deps. If its output matches last frame, nothing changes; otherwise its rendered nodes are rebuilt and swapped in place between the component's comment markers.
7. **State Bindings.** Any `{{path}}` State Binding is updated in place if its source key is dirty — this happens independently of step 6, so a binding refreshes without re-running its component.
8. **Dirty cleared.** Until the next mutation.

### Nested mutations

Nested objects are wrapped on read and cached via `WeakMap`. So:

```js
state.data.scene.beatCount = 3;
```

walks: get `scene` (returns a cached wrapper proxy) → set `beatCount = 3` → calls `onMutate("scene")` (the root key, not `scene.beatCount`). Every component reading `scene` re-runs.

---

## Render scheduling + component marker ranges

A component adds **no wrapper element** to the DOM. Its rendered nodes become direct children of the parent, bracketed by a pair of invisible HTML comment markers:

```html
<!--ss:012:Counter-->
<p>Count: 3</p>
<button>+1</button>
<!--/ss:012-->
```

- The markers encode the component's hierarchical instance path (`ssid`) — the parent's path plus this child's index (e.g. `"0"`, `"01"`, `"012"`), used internally for dep tracking, node reuse, and as a stable re-render anchor.
- Comment nodes are **not elements**, so they never affect CSS layout (grid/flex tracks, `min-height: 0` propagation, percentage heights) or structural selectors (`:nth-child`, `>`, `:first-child`). A component's real root element(s) sit exactly where you wrote `<Component/>`.

### No CSS rule needed

Earlier versions wrapped each component in a `<div>` and required you to add `[ssct] { display: contents; }` to undo its layout effect. That wrapper is gone — your CSS Grid / flexbox / percentage-height layouts and structural selectors apply directly to component output with no extra rule.

### Update loop pseudocode

```
on each requestAnimationFrame:
  drain image warm queue
  if !state.dirty or not yet time for next update: return
  for each component in componentMap (outer → inner, by ssid):
    if start marker not connected: continue    // already removed by an ancestor this tick
    if already rebuilt this tick: continue      // an ancestor recreated it
    if rec.deps ∩ state.dirtyKeys is non-empty:
      capture scroll + focus inside this range
      run rec.fn under a fresh proxy
      if body differs from last frame:          // identical output short-circuits
        replace the nodes between the markers in place
        restore scroll + focus
  update standalone {{interpolation}} text + attr nodes
  prune component records whose range was removed
  clear dirty
```

The actual code lives in `src/State/updateDom.ts` — under 200 lines.

---

## Image cache

State Street ships with an automatic base64 → blob URL converter for `<img>` elements. Base64 data URIs decode slowly and are heavy on memory; blob URLs are fast.

### Automatic behavior

Whenever you render an `<img src="data:image/png;base64,…">`, State Street swaps the `src` with a cached blob URL. Subsequent renders of the same data URI reuse the cached blob. The cache is bounded by `imgMemoryBudget` (default 256 MB); LRU eviction kicks in over that, skipping any blob still in the DOM.

### Opt out per image

If you need the raw data URI (e.g. you're going to download it), add `nocache`:

```js
`<img src="${b64}" nocache/>`
```

### Pre-warming

If you know which images will appear soon, call `state.warmImages([dataUri1, dataUri2, …])`. State Street queues them and decodes a few per idle frame (controlled by `imgWarmPerFrame`, default 4).

```js
// In a route change or pagination handler:
state.warmImages(nextPage.thumbnails);
```

---

## Patterns from production

Patterns this library's users converged on after substantial real-world use.

### 1. Spread to update a top-level key

This is the canonical mutation pattern — produces a fresh top-level reference, marks the key dirty, no surprises:

```js
const wv = state.data.worldView || {};
state.data.worldView = {
  ...wv,
  selectedCastId: id,
};
```

The set handler unwraps the top-level value (it stores the plain object you provided). The proxy doesn't deepen on this idiom.

### 2. Direct mutation for high-frequency updates

For events that fire many times per second — token streams, animation frames, polling — the spread idiom can compound proxy depth on nested keys and eventually overflow the JS call stack. Mutate the target field directly:

```js
// 50–300 events per second from an LLM token stream.
function onToken(event) {
  const p = event.payload || {};
  const sc = state.data.scene;
  if (!sc) return;
  const streamingLines = { ...(sc.streamingLines || {}) };
  streamingLines[p.seq] = (streamingLines[p.seq] || "") + p.delta;
  sc.streamingLines = streamingLines;   // direct mutation; no full-scene spread
}
```

**Why:** `state.data.scene = { ...sc, streamingLines }` reads every key of `sc` through the proxy. Each nested object value comes back as a fresh wrapper. The state setter stores the new plain object — but the wrappers it contains accumulate one extra layer per call. After enough events, any nested read overflows the stack.

Direct field mutation (`sc.streamingLines = newMap`) reuses the existing top-level proxy and never spreads it, so no chain grows.

### 3. Helpers are just functions

State Street has no built-in "helpers" concept. A helper is a plain function in scope:

```js
function padTilesOnce(rawTiles, count) {
  const out = (rawTiles || []).slice();
  while (out.length < count) {
    out.push({ kind: "color", color: randomTileColor() });
  }
  return out;
}

function HomeTiles({ state }) {
  const padded = padTilesOnce(state.data.sceneTilesRaw, 12);
  return `<div class="tiles">${padded.map(renderTile).join("")}</div>`;
}
```

If you want a shared namespace across many components (typical in a registry-style app), expose helpers on your registry object (see [the registry pattern](#the-registry-pattern--full-reference)).

### 4. The IIFE wrapper

In multi-file registry-style apps, every file is typically wrapped in an immediately-invoked function expression:

```js
(function () {
  function MyComponent({ state }) { /* ... */ }
  MY_APP.registerComponents({ MyComponent });
})();
```

The IIFE keeps each file's private helpers and constants out of the global scope. Registrations still happen at file-load time via the closures over `MY_APP`. Order matters within a load order, but State Street resolves components / methods live at render / event time, so you can override registrations from later files.

---

## The registry pattern — full reference

The registry style isn't part of State Street's core; it's a ~100-line boilerplate you copy into your project. It gives you:

- **Late binding** — register components and methods after the page boots.
- **Override semantics** — later registrations replace earlier ones (mods, themes, plugins).
- **Multi-file structure** — each file owns its own slice of the app.

### The boilerplate

```js
// my-app/core.js — load FIRST (after the State Street global), before anything else.
(function () {
  "use strict";

  function deepMerge(target, src) {
    for (const k in src) {
      const sv = src[k];
      const tv = target[k];
      if (sv && typeof sv === "object" && !Array.isArray(sv)
          && tv && typeof tv === "object" && !Array.isArray(tv)) {
        deepMerge(tv, sv);
      } else {
        target[k] = sv;
      }
    }
    return target;
  }

  const MY_APP = {
    // ----- live registries (passed to `new State`) -----
    State: window.State,
    components: {},
    methods: {},
    helpers: {},
    listeners: {},
    startup: [],
    dataExtensions: [],
    baseDataFactory: null,
    template: "<AppRoot/>",
    app: null,

    // ----- registration hooks -----
    registerComponent(name, fn) {
      if (this.components[name]) console.info(`[MY_APP] overriding component "${name}"`);
      this.components[name] = fn;
    },
    registerComponents(obj) {
      for (const k in obj) this.registerComponent(k, obj[k]);
    },
    registerMethod(name, fn) {
      if (this.methods[name]) console.info(`[MY_APP] overriding method "${name}"`);
      this.methods[name] = fn;
    },
    registerMethods(obj) {
      for (const k in obj) this.registerMethod(k, obj[k]);
    },
    registerHelper(name, val) { this.helpers[name] = val; },
    registerHelpers(obj) { for (const k in obj) this.helpers[k] = obj[k]; },

    // External events (e.g. Tauri, WebSocket, EventTarget). Override-friendly.
    registerListener(eventName, fn) {
      if (this.listeners[eventName]) console.info(`[MY_APP] overriding listener "${eventName}"`);
      this.listeners[eventName] = fn;
    },

    // Fire-once init run after boot() builds the app.
    registerStartup(fn) { if (typeof fn === "function") this.startup.push(fn); },

    // Initial state factory (lazy so it can read previously-registered helpers).
    setBaseData(factory) { this.baseDataFactory = factory; },

    // Mods append top-level state slices. Deep-merged into the factory's output.
    extendData(ext) { this.dataExtensions.push(ext); },

    // ----- boot: assemble + start State -----
    boot() {
      if (!this.State) {
        throw new Error("[MY_APP] window.State missing — load state-street.global.js first");
      }
      const data = this.baseDataFactory ? this.baseDataFactory() : {};
      for (const ext of this.dataExtensions) {
        const patch = typeof ext === "function" ? ext(data) : ext;
        if (patch && typeof patch === "object") deepMerge(data, patch);
      }
      this.app = new this.State(this.template, data, this.components, this.methods);
      // Wire your external event source here. Example for Tauri:
      // for (const key in this.listeners) tauri.event.listen(key, this.listeners[key]);
      for (const fn of this.startup) {
        try { fn(); } catch (e) { console.error("[MY_APP] startup hook threw:", e); }
      }
      return this.app;
    },
  };

  window.MY_APP = MY_APP;
})();
```

### Hook reference

| Hook | Purpose |
|---|---|
| `setBaseData(factory)` | Register the initial state factory. Lazy — runs at `boot()` so it can read previously-registered helpers. |
| `registerComponent(name, fn)` / `registerComponents(obj)` | Add to the components registry. Subsequent registrations of the same name override (with a console.info). |
| `registerMethod(name, fn)` / `registerMethods(obj)` | Same shape for methods. |
| `registerHelper(name, val)` / `registerHelpers(obj)` | Shared utility namespace any component or method can read off `MY_APP.helpers`. |
| `registerListener(eventName, fn)` | Bind a non-DOM event handler (Tauri events, WebSocket messages, EventTarget…). Override-friendly. |
| `registerStartup(fn)` | Fire-once init hook run after `boot()` builds the app and listeners are wired. |
| `extendData(patch \| (data) => patch)` | Mods append extra top-level state slices. Deep-merged into the factory's output. |
| `boot()` | Assemble: run the data factory, apply data extensions, `new State(template, data, components, methods)`, wire listeners, run startup hooks. Returns the live `State` instance. |

### Usage

```js
// base_data.js
MY_APP.setBaseData(() => ({
  title: "My App",
  view: "Home",
  user: null,
}));

// components/home.js
(function () {
  function Home({ state }) {
    return `<h1>Hello, ${state.data.user?.name || "stranger"}!</h1>`;
  }
  MY_APP.registerComponents({ Home });
})();

// methods/auth.js
(function () {
  MY_APP.registerMethods({
    logIn:  ({ state, name }) => { state.data.user = { name }; },
    logOut: ({ state }) => { state.data.user = null; },
  });
})();

// boot.js (last)
MY_APP.boot();
```

### Mod / plugin override example

Once `MY_APP.boot()` has run, any subsequent `registerComponent` / `registerMethod` call replaces the previous registration. Because State Street resolves `state.components[name]` and `state.methods[name]` at render and event time, the override takes effect immediately:

```js
// mods/dark-theme.js — loaded after boot
MY_APP.registerComponents({
  Home: ({ state }) =>
    `<h1 class="dark">Hello, ${state.data.user?.name || "stranger"}!</h1>`,
});
```

The next state mutation triggers an update, the update loop re-resolves `state.components.Home`, and the new version runs. No reload required.

---

## Gotchas

A short list of things this library's users have hit. Read once, save yourself an evening.

### Top-level-key gating is the gating

`state.data.user.age = 22` marks `user` dirty. Every component reading any part of `user` re-runs. There is no `user.age` granularity. If you want finer reactivity, split: `state.data.userName`, `state.data.userAge`. Most apps don't need to.

### `:click=method()` requires parentheses

`:click=method` is silently parsed as a regular HTML attribute. Always include the parens, even when there are no arguments.

```js
// ❌ Does nothing.
`<button :click=submit>Save</button>`

// ✅
`<button :click=submit()>Save</button>`
```

### Don't spread the proxy in high-frequency listeners

The convenient `state.data.scene = { ...state.data.scene, x }` pattern can compound proxy layers on nested keys when called dozens or hundreds of times per second. Use [direct mutation](#2-direct-mutation-for-high-frequency-updates) for streams, animation frames, and per-token handlers. The spread pattern is fine for one-shot events (clicks, form submits, route changes).

### Components may return multiple root elements

A component can return any number of top-level nodes — `"<p>hi</p><p>bye</p>"` is fine. All of them become direct children of the parent, bracketed by the component's comment markers, and are re-rendered together as a range. Each top-level element must still be well-formed (its own children form a single tree).

### State setter replaces the whole tree

`state.data = newObject` is supported but marks **every** top-level key in `newObject` dirty and re-renders the whole app. Use it for resets / hot reloads, not for normal updates.

### Methods always need `()` even with `state`-only args

State Street injects `state` and `event` into every method call automatically — but only when the directive uses the call syntax. `:click=method` is not a call.

---

## Tooling

### VSCode syntax highlighting

There's an official VSCode plugin for State Street templates:

- [**State Street SST**](https://marketplace.visualstudio.com/items?itemName=beetnick82.vscode-sst)

After installing, any TypeScript or JavaScript files with the sub-extension `.sst` (e.g. `counter.sst.js`, `home.sst.ts`) have their template-literal strings treated as State Street templates, which gives you HTML highlighting + completion inside the templates.

### Recommended file structure (registry style)

```
src/
  core.js              ← registry boilerplate
  base_data.js         ← setBaseData(...)
  views/               ← *.sst.js, one component (or component group) per file
  methods/             ← registerMethods(...)
  listeners/           ← registerListener(...) for external events
  helpers/             ← registerHelpers(...)
  boot.js              ← MY_APP.boot()
```

In one Tauri narrative game running State Street, this layout currently runs ~21 view files, ~6 methods/listeners/helpers files, and ~37 JS files total — bootstrapping happens in under 50 ms.

---

## FAQ

**Why no JSX?** Plain template strings work in any editor, in any test runner, with no build step. JSX needs a transpiler. This is a tradeoff State Street picks.

**Why no virtual DOM?** A virtual DOM is *overhead* other frameworks adopt to make coarse "re-render the whole tree on any change" tolerable — diffing a cheap in-memory tree beats blindly re-touching the real DOM. State Street is fine-grained instead of coarse, so it doesn't need one:

- A `{{ }}` **State Binding** updates its text/attribute node **in place** — no component re-run, no tree, no diff (the same approach as Solid/Svelte, and less work than a vDOM diff).
- A component re-runs **only** when a top-level key it read goes dirty (dep gating), and if its new output is byte-identical the DOM is left untouched.

The one honest tradeoff: when a component *does* re-render, its whole rendered range is rebuilt and swapped in place rather than diffed element-by-element — so keep components small and put frequently-changing values in State Bindings, and there's nothing a diff engine would have saved. (Reusable elements — inputs, canvas, media — are transplanted across a re-render, not recreated.)

**Can I use TypeScript?** Yes — the source is TypeScript. The reactive proxy types as `any` (a proxy fundamentally can't be type-checked at compile time without significant ceremony). Wrap your own typed accessors if you want stricter types in your app.

**How big is it?** Small enough that it's never the reason your bundle is big. Zero runtime dependencies.

**Does it work in Node?** Not directly — it touches `document.body` and `requestAnimationFrame`. For testing components in Node, use jsdom or run in a browser. The reactive proxy logic itself is environment-agnostic.

**Can I render to a specific container instead of `document.body`?** Yes — `document.body` is just the default. Pass the `mountTarget` option (an `Element` or a CSS-selector string) to mount anywhere, run **multiple States** on one page, or mount one State into an element owned by another (nested States, auto-preserved). See [Mounting & lifecycle](#mounting--lifecycle) and [Nested States](#nested-states).

**What if I want server-side rendering?** State Street is a runtime reactivity layer — not currently aimed at SSR. Component functions return strings, so you could call them server-side to get HTML, but you'd lose reactivity at runtime.

---

## License

ISC.

---

*Found a bug? Have a use case the docs don't cover? Open an issue on the [GitHub repo](https://github.com/Joshabracks/State-Street) or [join the Discord](https://discord.gg/a7AycPG2).*
