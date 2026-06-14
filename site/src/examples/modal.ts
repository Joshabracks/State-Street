import type { Example } from "./types";

function Modal({ state }: any): string {
  const overlay = state.data.open
    ? `<div class="ex-overlay" :click=backdrop()>
         <div class="ex-dialog">
           <h4>Delete item?</h4>
           <p class="ex-muted">The overlay is just a string the component returns while <code>open</code> is true — no portal, no modal library.</p>
           <div class="ex-row ex-row--end">
             <button class="ex-btn" :click=close()>Cancel</button>
             <button class="ex-btn ex-btn--accent" :click=confirm()>Delete</button>
           </div>
         </div>
       </div>`
    : "";
  return `
    <div class="ex-modal">
      <button class="ex-btn" :click=open()>Open dialog</button>
      <p class="ex-muted">${state.data.result || "No action yet."}</p>
      ${overlay}
    </div>`;
}

export const modal: Example = {
  id: "modal",
  title: "Modal / dialog",
  blurb: "A modal is conditional rendering — the overlay markup is returned only while a flag is set. Clicking the backdrop (but not the dialog) closes it.",
  template: `<Modal/>`,
  data: { open: false, result: "" },
  components: { Modal },
  methods: {
    open: ({ state }: any) => { state.data.open = true; },
    close: ({ state }: any) => { state.data.open = false; },
    confirm: ({ state }: any) => { state.data.open = false; state.data.result = "Deleted."; },
    backdrop: ({ state, event }: any) => { if (event.target.classList.contains("ex-overlay")) state.data.open = false; },
  },
  source: `function Modal({ state }) {
  const overlay = state.data.open ? \`
    <div class="overlay" :click=backdrop()>
      <div class="dialog">
        <h4>Delete item?</h4>
        <button :click=close()>Cancel</button>
        <button :click=confirm()>Delete</button>
      </div>
    </div>\` : "";
  return \`
    <button :click=open()>Open dialog</button>
    <p>\${state.data.result || "No action yet."}</p>
    \${overlay}\`;
}

const methods = {
  open:    ({ state }) => { state.data.open = true; },
  close:   ({ state }) => { state.data.open = false; },
  confirm: ({ state }) => { state.data.open = false; state.data.result = "Deleted."; },
  // close only when the backdrop itself is clicked, not the dialog
  backdrop:({ state, event }) => { if (event.target.classList.contains("overlay")) state.data.open = false; },
};

new State(\`<Modal/>\`, { open: false, result: "" }, { Modal }, methods, { mountTarget: "#app" });`,
};
