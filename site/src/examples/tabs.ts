import type { Example } from "./types";

const TABS = [
  { id: "overview", label: "Overview", body: "Tabs are just conditional rendering. The component reads <code>state.data.tab</code> and returns the matching panel — no &lt;Tabs&gt; widget, no directive." },
  { id: "specs", label: "Specs", body: "Switching a tab mutates one top-level key, so only this component re-runs. The active button is a class toggled from the same state." },
  { id: "reviews", label: "Reviews", body: "Because the panel is plain JavaScript, you can compute it however you like — map an array, branch on a flag, format a value." },
];

function Tabs({ state }: any): string {
  const cur = state.data.tab;
  const bar = TABS.map(
    (t) => `<button class="ex-tab ${t.id === cur ? "is-active" : ""}" :click=pick(id=${t.id})>${t.label}</button>`
  ).join("");
  const panel = (TABS.find((t) => t.id === cur) || TABS[0]).body;
  return `<div class="ex-tabs"><div class="ex-tabbar">${bar}</div><div class="ex-tabpanel">${panel}</div></div>`;
}

export const tabs: Example = {
  id: "tabs",
  title: "Tabs",
  blurb: "In-component view switching via plain JS. A single state key picks the active panel; only this component re-renders on a switch.",
  template: `<Tabs/>`,
  data: { tab: "overview" },
  components: { Tabs },
  methods: { pick: ({ state, id }: any) => { state.data.tab = id; } },
  source: `const TABS = [
  { id: "overview", label: "Overview", body: "..." },
  { id: "specs",    label: "Specs",    body: "..." },
  { id: "reviews",  label: "Reviews",  body: "..." },
];

function Tabs({ state }) {
  const cur = state.data.tab;
  const bar = TABS.map((t) =>
    \`<button class="\${t.id === cur ? "is-active" : ""}" :click=pick(id=\${t.id})>\${t.label}</button>\`
  ).join("");
  const panel = TABS.find((t) => t.id === cur).body;
  return \`<div class="tabbar">\${bar}</div><div class="panel">\${panel}</div>\`;
}

new State(\`<Tabs/>\`, { tab: "overview" }, { Tabs },
  { pick: ({ state, id }) => { state.data.tab = id; } },
  { mountTarget: "#app" });`,
};
