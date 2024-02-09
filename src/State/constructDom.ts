import State from "./State.js";
import constructElement from "./constructElement.js";

function constructDOM(state: State) {
  const { data, template } = state;
  if (data.title) document.title = data.title;
  const elements = [];
  for (let i = 0; i < template.length; i++) {
    const element = constructElement(template[i], `${i}`, state);
    elements.push(element);
  }
  document.body.innerHTML = "";
  elements.forEach((element: any) => document.body.appendChild(element));
}

export default constructDOM