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
    if (newElement) element.replaceWith(newElement);
  }
  const { textMap, dirtyKeys }: any = state;
  const hasDirtyFilter = dirtyKeys instanceof Set && dirtyKeys.size > 0;
  for (const id in textMap) {
    const entry = textMap[id];
    if (!entry) continue;
    const values = entry.values;
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
    let rendered = entry.template;
    for (const key in values) {
      const value = state.data[key];
      if (!value && value !== 0) continue;
      rendered = rendered.replace(`{{${key}}}`, value);
    }
    entry.node.nodeValue = rendered;
  }
}

export default updateDOM;
