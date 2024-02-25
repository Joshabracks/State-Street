import State from "./State.js";
import { SSID } from "./const.js";
import { parseSST } from "../Template/parseSST.js";

const valsRegex = /{{.[^{]+}}/g;
const cleanerRegex = /{{(.*)}}/;

function getValue(obj: any, values: string[]) {
  if (values.length === 0) return obj;
  const key: string = values.shift() || "";
  const value = obj[key];
  if (!value) return value;
  return getValue(value, values);
}

function constructElement(data: any, depth: string, state: State) {
  const content = data?.content || [];
  if (content?.constructor?.name !== "Array") {
    return Error(
      "Failed to construct element: content object must be an Array"
    );
  }
  const tag = data?.type || "div";
  if (tag === "_component") {
    const component = state.components[data?.componentName];
    if (!component) {
      console.error(`invalid component: ${data?.componentName}`);
      return null;
    }
    const componentBody = component(data?.componentProperties || {});
    const parsedBody = parseSST(componentBody);
    const element = document.createElement('div');
    element.setAttribute(SSID, depth);
    // const subElements = [];
    for (let i = 0; i < parsedBody.length; i++) {
      const subDepth = `${depth}${i}`
      const subElement: any = constructElement(parsedBody[i], subDepth, state);
      element.appendChild(subElement);
    }
    state.idMap[depth] = element;
    return element;
  }
  const element = document.createElement(tag);
  const attributes = data?.attributes || [];
  attributes.forEach((attribute: any) => {
    element.setAttribute(attribute.name, attribute.value);
  });
  state.idMap[depth] = element;
  element.setAttribute(SSID, depth);
  if (data?.selfClosing) {
    return element;
  }
  for (let i = 0; i < content.length; i++) {
    const child = content[i];
    const type = typeof child;
    const subDepth = `${depth}${i}`;
    if (type === "object" && type !== null) {
      element.appendChild(constructElement(child, subDepth, state));
      continue;
    }
      const subElement = document.createElement("span");
      subElement.setAttribute(SSID, subDepth);
      let innerText = "";
      const mapValues: any = {};
      let stringTemplate;
      if (type == "string") {
        innerText = child;
        stringTemplate = "" + innerText;
        const variables = child.match(valsRegex) || [];
        for (let j = 0; j < variables.length; j++) {
          const valuesString: string =
            variables[j].match(cleanerRegex)[1] || "";
          const values = valuesString.split(".");
          const value = getValue(state.data, values);
          mapValues[valuesString] = JSON.parse(JSON.stringify(value || ""));
          innerText = innerText.replace(variables[j], value);
        }
      } else {
        innerText = JSON.stringify(child);
      }
      subElement.innerText = innerText;
      state.idMap[subDepth] = {
        element: subElement,
        values: mapValues,
        template: stringTemplate,
      };
      element.appendChild(subElement);
  }
  return element;
}

export default constructElement;
