# {{PROJECT_NAME}}

A [State Street](https://joshabracks.github.io/State-Street/) app — **no build step**.

## Run

```sh
npm run dev
```

…or just open `index.html` in a browser.

## What's here

- `index.html` — loads State Street (a global `<script>`) + `app.js`.
- `app.js` — the app: a `<Landing/>` component and a reactive counter.
- `styles.css` — the look.

State Street is loaded from a CDN as `window.State`. To go offline / pin a version, download
`state-street.global.js` from the [package](https://www.npmjs.com/package/@state-street/state-street)
and point the `<script>` in `index.html` at your local copy.

## Using an AI coding assistant?

This project ships [`AGENTS.md`](./AGENTS.md) (and `CLAUDE.md`) — the State Street guide for coding
agents. Most assistants read it automatically; it stops them from applying React/Vue assumptions.

Docs: https://joshabracks.github.io/State-Street/
