import type { Example } from "./types";
import { esc } from "./types";

function addFrom(state: any, inputEl: HTMLInputElement) {
  const text = (inputEl.value || "").trim();
  if (!text) return;
  state.data.items = [...state.data.items, { text, done: false }];   // new array -> "items" dirty
  inputEl.value = "";                                                 // clear the (uncontrolled) field
}

function Todo({ state }: any): string {
  const items = state.data.items;
  const left = items.filter((t: any) => !t.done).length;
  const rows = items.length
    ? `<ul class="ex-todo__list">${items
        .map(
          (it: any, i: number) =>
            `<li class="ex-todo__row ${it.done ? "is-done" : ""}">
               <label><input type="checkbox" ${it.done ? "checked" : ""} :change=toggle(i=${i})/> ${esc(it.text)}</label>
               <button class="ex-x" :click=remove(i=${i})>&times;</button>
             </li>`
        )
        .join("")}</ul>`
    : `<p class="ex-muted">Nothing yet — add something below.</p>`;
  return `
    <div class="ex-todo">
      ${rows}
      <div class="ex-todo__add">
        <input class="ex-input" placeholder="What needs doing?" :keydown=onKey()/>
        <button class="ex-btn" :click=add()>Add</button>
      </div>
      <div class="ex-todo__foot"><span>${left} left</span><button class="ex-link" :click=clearDone()>Clear done</button></div>
    </div>`;
}

export const todo: Example = {
  id: "todo",
  title: "Todo list",
  blurb: "List rendering with plain JS map(), add / toggle / remove, and a derived count. There is no :for directive — a component just returns a string built however you like.",
  template: `<Todo/>`,
  data: { items: [{ text: "Read the docs", done: true }, { text: "Build something", done: false }] },
  components: { Todo },
  methods: {
    // Uncontrolled input: read its value on submit, then clear it.
    onKey: ({ state, event }: any) => { if (event.key === "Enter") addFrom(state, event.target); },
    add: ({ state, event }: any) => { addFrom(state, event.target.previousElementSibling); },
    toggle: ({ state, i }: any) => {
      const items = state.data.items.slice();
      items[i] = { ...items[i], done: !items[i].done };
      state.data.items = items;
    },
    remove: ({ state, i }: any) => { state.data.items = state.data.items.filter((_: any, j: number) => j !== i); },
    clearDone: ({ state }: any) => { state.data.items = state.data.items.filter((t: any) => !t.done); },
  },
  source: `const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

function addFrom(state, inputEl) {
  const text = (inputEl.value || "").trim();
  if (!text) return;
  state.data.items = [...state.data.items, { text, done: false }];   // new array -> "items" dirty
  inputEl.value = "";                                                 // clear the uncontrolled field
}

function Todo({ state }) {
  const rows = state.data.items.map((it, i) => \`
    <li class="\${it.done ? "is-done" : ""}">
      <label><input type="checkbox" \${it.done ? "checked" : ""} :change=toggle(i=\${i})/> \${esc(it.text)}</label>
      <button :click=remove(i=\${i})>&times;</button>
    </li>\`).join("");
  const left = state.data.items.filter((t) => !t.done).length;
  return \`
    <ul>\${rows}</ul>
    <input :keydown=onKey()/>
    <button :click=add()>Add</button>
    <div>\${left} left <button :click=clearDone()>Clear done</button></div>\`;
}

const methods = {
  onKey: ({ state, event }) => { if (event.key === "Enter") addFrom(state, event.target); },
  add:   ({ state, event }) => { addFrom(state, event.target.previousElementSibling); },
  toggle:({ state, i }) => {
    const items = state.data.items.slice();
    items[i] = { ...items[i], done: !items[i].done };
    state.data.items = items;
  },
  remove:    ({ state, i }) => { state.data.items = state.data.items.filter((_, j) => j !== i); },
  clearDone: ({ state }) => { state.data.items = state.data.items.filter((t) => !t.done); },
};

new State(\`<Todo/>\`, { items: [] }, { Todo }, methods, { mountTarget: "#app" });`,
};
