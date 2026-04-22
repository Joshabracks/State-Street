import State from "./State.js";
import { SSID } from "./const.js";
import constructElement from "./constructElement.js";

const TOP_COMPONENT_SELECTOR = "[ssct]:not([ssct] *)";

function updateDOM(state: State) {
  const componentElements = document.querySelectorAll(TOP_COMPONENT_SELECTOR);
  for ( let i  = 0; i < componentElements.length; i++) {
    const element = componentElements[i];
    const ssid: string = element.getAttribute(SSID) || '';
    const newElement = constructElement(state.componentMap[ssid], ssid, state)
    element.replaceWith(newElement);
  }
  const { idMap, dirtyKeys }: any = state;
  const hasDirtyFilter = dirtyKeys instanceof Set && dirtyKeys.size > 0;
  for (const id in idMap) {
    const data = (idMap[id]?.values && idMap[id]) || null;
    let template = data?.template;
    if (data == null || !template) {
      continue;
    }
    const values = data.values;
    if (hasDirtyFilter) {
      let touched = false;
      for (const key in values) {
        const root = key.split(".")[0];
        if (dirtyKeys.has(root)) {
          touched = true;
          break;
        }
      }
      if (!touched) continue;
    }
    const selector = `[${SSID}="${id}"]`;
    const element: HTMLElement | null = document.querySelector(selector);
    if (element === null) {
      continue;
    }
    for (const key in values) {
      const value = state.data[key];
      if (!value && value !== 0) continue;
      template = template.replace(`{{${key}}}`, value);
    }
    element!.innerText = template;
  }
}

export default updateDOM;
