import State from "./State.js";
import { SSID } from "./const.js";
import constructElement from "./constructElement.js";

const TOP_COMPONENT_SELECTOR = "[ssct]:not([ssct] *)";

function updateDOM(state: State) {
  console.log(state)
  const componentElements = document.querySelectorAll(TOP_COMPONENT_SELECTOR);
  for ( let i  = 0; i < componentElements.length; i++) {
    const element = componentElements[i];
    const ssid: string = element.getAttribute(SSID) || '';
    const newElement = constructElement(state.componentMap[ssid], ssid, state)
    element.replaceWith(newElement);
  }
  const { idMap }: any = state;
  for (const id in idMap) {
    const data = (idMap[id]?.values && idMap[id]) || null;
    let template = data?.template;
    if (data == null || !template) {
      continue;
    }
    const selector = `[${SSID}="${id}"]`;
    const element: HTMLElement | null = document.querySelector(selector);
    if (element === null) {
      continue;
    }
    const values = data.values;
    for (const key in values) {
      const value = state.data[key];
      if (!value && value !== 0) continue;
      template = template.replace(`{{${key}}}`, value);
    }
    element!.innerText = template;
  }
}

export default updateDOM;
