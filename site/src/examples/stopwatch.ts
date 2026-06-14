import type { Example } from "./types";

// Split into two components on purpose: the time changes ~60×/sec, but the buttons
// only change when `running` flips. Dep-gating re-renders <SwTime/> every frame while
// leaving <SwControls/> (and its click handlers) untouched — so the buttons stay
// clickable. Render everything in one component and the 60fps rebuild would eat clicks.
function Stopwatch(): string {
  return `<div class="ex-stopwatch"><SwTime/><SwControls/></div>`;
}
function SwTime({ state }: any): string {
  return `<div class="ex-stopwatch__time">${(state.data.elapsed / 1000).toFixed(2)}s</div>`;
}
function SwControls({ state }: any): string {
  return `
    <div class="ex-row">
      <button class="ex-btn ex-btn--accent" :click=toggle()>${state.data.running ? "Stop" : "Start"}</button>
      <button class="ex-btn" :click=reset()>Reset</button>
    </div>`;
}

export const stopwatch: Example = {
  id: "stopwatch",
  title: "Stopwatch",
  blurb: "High-frequency updates done right: a requestAnimationFrame loop mutates one key every frame, and splitting the time from the controls lets dep-gating re-render only the time — the buttons never rebuild, so they stay clickable.",
  template: `<Stopwatch/>`,
  data: { running: false, elapsed: 0 },
  components: { Stopwatch, SwTime, SwControls },
  methods: {
    toggle: ({ state }: any) => {
      state.data.running = !state.data.running;
      if (!state.data.running) return;
      const start = performance.now();
      const base = state.data.elapsed;
      const loop = () => {
        if (!state.data.running) return;
        state.data.elapsed = base + (performance.now() - start);   // direct mutation, ~60/sec
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    },
    reset: ({ state }: any) => { state.data.running = false; state.data.elapsed = 0; },
  },
  source: `// Time changes ~60x/sec; the buttons only change when "running" flips.
// Split them so dep-gating re-renders just <SwTime/> each frame — the buttons
// (and their click handlers) are never rebuilt, so they stay clickable.
function Stopwatch() {
  return \`<Stopwatch><SwTime/><SwControls/></Stopwatch>\`;
}
function SwTime({ state }) {
  return \`<div>\${(state.data.elapsed / 1000).toFixed(2)}s</div>\`;
}
function SwControls({ state }) {
  return \`
    <button :click=toggle()>\${state.data.running ? "Stop" : "Start"}</button>
    <button :click=reset()>Reset</button>\`;
}

const methods = {
  toggle: ({ state }) => {
    state.data.running = !state.data.running;
    if (!state.data.running) return;
    const start = performance.now(), base = state.data.elapsed;
    const loop = () => {
      if (!state.data.running) return;
      state.data.elapsed = base + (performance.now() - start);   // direct mutation each frame
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },
  reset: ({ state }) => { state.data.running = false; state.data.elapsed = 0; },
};

new State(\`<Stopwatch/>\`, { running: false, elapsed: 0 },
  { Stopwatch, SwTime, SwControls }, methods, { mountTarget: "#app" });`,
};
