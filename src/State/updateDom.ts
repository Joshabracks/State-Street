import State from "./State.js";
import { SSID } from "./const.js";
function updateDOM(state: State) {
  console.log('updating dom');
  const { idMap }: any = state;
  for ( const id in idMap) {
    const data = idMap[id]?.values && idMap[id] || null;
    let template = data?.template;
    if (data == null || !template) {
      continue;
    }
    const selector = `[${SSID}="${id}"]`;
    const element: HTMLElement | null = document.querySelector(selector);
    if (element === null) {
      console.error(`unable to update element at ${selector}.\n element does not exist.`);
      continue;
    }
    const values = data.values;
    for (const key in values) {
      const value = state.data[key];
      if ((!value && value !== 0)) continue;
      template = template.replace(`{{${key}}}`, value);
    }
    element!.innerHTML = template;
  }
}

export default updateDOM