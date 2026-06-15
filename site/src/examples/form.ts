import type { Example } from "./types";
import { esc } from "./types";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function Form({ state }: any): string {
  const { name, email } = state.data;
  const nameErr = name.trim().length < 2 ? "At least 2 characters." : "";
  const emailErr = !EMAIL_RE.test(email) ? "Enter a valid email." : "";
  const valid = !nameErr && !emailErr;
  const field = (label: string, key: string, val: string, err: string, type: string) => `
    <label class="ex-field">
      <span class="ex-field__label">${label}</span>
      <input class="ex-input ${err && val ? "is-invalid" : ""}" type="${type}" value="${esc(val)}" :input=set(key=${key})/>
      ${err && val ? `<span class="ex-err">${err}</span>` : ""}
    </label>`;
  return `
    <form class="ex-form" onsubmit="return false">
      ${field("Name", "name", name, nameErr, "text")}
      ${field("Email", "email", email, emailErr, "email")}
      <button class="ex-btn ex-btn--accent" :click=submit() ${valid ? "" : "disabled"}>Submit</button>
      <p class="ex-muted">${state.data.msg || (valid ? "Looks good." : "Fill the fields in.")}</p>
    </form>`;
}

export const form: Example = {
  id: "form",
  title: "Form validation",
  blurb: "Validation is derived on every render from the current state — error messages and the submit button's disabled state are computed, never stored.",
  template: `<Form/>`,
  data: { name: "", email: "", msg: "" },
  components: { Form },
  methods: {
    set: ({ state, event, key }: any) => { state.data[key] = event.target.value; state.data.msg = ""; },
    submit: ({ state }: any) => { state.data.msg = "Submitted as " + state.data.name + "."; },
  },
  source: `const EMAIL_RE = /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/;

function Form({ state }) {
  const { name, email } = state.data;
  // derived every render — nothing is stored
  const nameErr  = name.trim().length < 2 ? "At least 2 characters." : "";
  const emailErr = !EMAIL_RE.test(email)  ? "Enter a valid email."   : "";
  const valid = !nameErr && !emailErr;
  return \`
    <input value="\${name}"  :input=set(key=name)/>  \${name  && nameErr  ? nameErr  : ""}
    <input value="\${email}" :input=set(key=email)/> \${email && emailErr ? emailErr : ""}
    <button :click=submit() \${valid ? "" : "disabled"}>Submit</button>\`;
}

const methods = {
  set:    ({ state, event, key }) => { state.data[key] = event.target.value; },
  submit: ({ state }) => { state.data.msg = "Submitted as " + state.data.name; },
};

new State(\`<Form/>\`, { name: "", email: "", msg: "" }, { Form }, methods, { mountTarget: "#app" });`,
};
