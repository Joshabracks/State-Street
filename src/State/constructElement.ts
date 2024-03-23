import State from "./State.js";
import { SSID, SSCT } from "./const.js";
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

function constructElement(data: any, parentSSID: string, state: State) {
  let currentSSID = `${parentSSID}`;
  const existingElement = state?.idMap?.[currentSSID];
  if (existingElement && existingElement.template) {
    currentSSID = parentSSID + "t";
  }

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
    state.componentMap[currentSSID] = data;
    let componentBody = component(data?.componentProperties || {});
    const vals = componentBody.match(valsRegex) || [];
    vals.forEach((val: any) => {
      const cleanVal = val.match(cleanerRegex)[1];
      componentBody = componentBody.replace(val, state.data[cleanVal])
    })
    const parsedBody = parseSST(componentBody, state.components);
    const subElements = [];
    for (let i = 0; i < parsedBody.length; i++) {
      const ssid = `${currentSSID}${i}`;
      const subElement: any = constructElement(parsedBody[i], ssid, state);
      if (subElement) {
        subElements.push(subElement);
      }
    }
    const element = document.createElement("div");
    element.setAttribute(SSID, currentSSID);
    element.setAttribute(SSCT, data?.componentName);
    subElements.forEach((subElement) => {
      element.appendChild(subElement);
    });
    return element;
  }
  const element = document.createElement(tag);
  const attributes = data?.attributes || [];
  attributes.forEach((attribute: any) => {
    element.setAttribute(attribute.name, attribute.value);
  });
  const events = data?.events || [];
  events.forEach((event: any) => {
    const eventProps: any = {};
    event.props.forEach((prop: string) => {
      const tuple = prop.split("=");
      const key: string = tuple[0] || "";
      const valueMatch = tuple[1]?.match(cleanerRegex) || null;
      eventProps[key] = (valueMatch && state.data[valueMatch[1]]) || tuple[1];
    });
    element.addEventListener(event.type, (e: any) =>
      state.methods[event.function]({ ...eventProps, event: e, state })
    );
  });
  state.idMap[currentSSID] = element;
  element.setAttribute(SSID, currentSSID);
  if (data?.selfClosing) {
    return element;
  }
  for (let i = 0; i < content.length; i++) {
    const child = content[i];
    const type = typeof child;
    const ssid = `${currentSSID}${i}`;
    if (type === "object" && type !== null) {
      const subElement = constructElement(child, ssid, state);
      if (subElement) {
        element.appendChild(subElement);
      }
      continue;
    }
    const subElement = document.createElement("span");
    subElement.setAttribute(SSID, ssid);
    let innerText = "";
    const mapValues: any = {};
    let stringTemplate;
    if (type == "string") {
      innerText = child;
      stringTemplate = "" + innerText;
      const variables = child.match(valsRegex) || [];
      for (let j = 0; j < variables.length; j++) {
        const valuesString: string = variables[j].match(cleanerRegex)[1] || "";
        const values = valuesString.split(".");
        const value = getValue(state.data, values);
        mapValues[valuesString] = JSON.parse(JSON.stringify(value || ""));
        innerText = innerText.replace(variables[j], value);
      }
    } else {
      innerText = JSON.stringify(child);
    }
    subElement.innerText = innerText;
    state.idMap[ssid] = {
      element: subElement,
      values: mapValues,
      template: stringTemplate,
    };
    element.appendChild(subElement);
  }
  return element;
}

export default constructElement;
