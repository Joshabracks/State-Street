# {{PROJECT_NAME}}

A [State Street](https://joshabracks.github.io/State-Street/) app — TypeScript + webpack, authored
in `.sst.ts` component files.

## Develop

```sh
npm install
npm run dev        # webpack dev server (http://localhost:8080)
```

## Build

```sh
npm run build      # production bundle -> dist/
npm run typecheck  # tsc --noEmit
```

## What's here

- `src/index.ts` — boots the app (`new State(...)`).
- `src/App.sst.ts` — the `<App/>` landing component.
- `styles.css` — the look.
- `webpack.config.js`, `tsconfig.json` — build config.

State Street ships TypeScript types, so `import { State } from "@state-street/state-street"` is fully
typed. The [VS Code extension](https://marketplace.visualstudio.com/items?itemName=beetnick82.vscode-sst)
adds HTML highlighting + completion inside `.sst.ts` template literals.

## Using an AI coding assistant?

This project ships [`AGENTS.md`](./AGENTS.md) (and `CLAUDE.md`) — the State Street guide for coding
agents. Most assistants read it automatically; it stops them from applying React/Vue assumptions.

Docs: https://joshabracks.github.io/State-Street/
