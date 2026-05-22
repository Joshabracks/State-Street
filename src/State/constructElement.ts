import State from "./State.js";
import { SSID, SSCT } from "./const.js";
import { parseSST } from "../Template/parseSST.js";
import { resolveImageSrc, isBase64DataUri } from "./imageCache.js";

const valsRegex = /{{.[^{]+}}/g;
const cleanerRegex = /{{(.*)}}/;

let entityDecoder: HTMLTextAreaElement | null = null;
function decodeEntities(str: string): string {
  if (str.indexOf("&") === -1) return str;
  if (!entityDecoder) entityDecoder = document.createElement("textarea");
  entityDecoder.innerHTML = str;
  return entityDecoder.value;
}

function getValue(obj: any, values: string[]) {
  if (values.length === 0) return obj;
  const key: string = values.shift() || "";
  const value = obj[key];
  if (!value) return value;
  return getValue(value, values);
}

function unescapeQuotes(str: string): string {
  return str.replace(/\\(["'`\\])/g, "$1");
}

function coerceArg(raw: string, state: State): any {
  const value = (raw ?? "").trim();
  const varMatch = value.match(cleanerRegex);
  if (varMatch) return getValue(state.data, varMatch[1].split("."));
  const q = value[0];
  if (value.length >= 2 && value[value.length - 1] === q && (q === '"' || q === "'" || q === "`")) {
    return unescapeQuotes(value.slice(1, -1));
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (value !== "" && !isNaN(Number(value))) return Number(value);
  return value;
}

function constructElement(data: any, parentSSID: string, state: State) {
  const currentSSID = `${parentSSID}`;
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
    let componentBody = component({state, ...data?.componentProperties});
    const vals = componentBody.match(valsRegex) || [];
    vals.forEach((val: any) => {
      const cleanVal = val.match(cleanerRegex)[1];
      componentBody = componentBody.replace(val, state.data[cleanVal])
    })
    const cached = state.componentMap[currentSSID];
    if (cached && cached.lastBody === componentBody) {
      return null;
    }
    state.componentMap[currentSSID] = data;
    data.lastBody = componentBody;
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
  const isImg = tag === "img";
  const noCache = isImg && attributes.some((a: any) => a.name === "nocache");
  let hasDecoding = false;
  attributes.forEach((attribute: any) => {
    if (isImg && attribute.name === "nocache") return;
    if (attribute.name === "decoding") hasDecoding = true;
    const raw = attribute.value ?? "";
    if (isImg && attribute.name === "src" && !noCache && isBase64DataUri(raw)) {
      element.setAttribute("src", resolveImageSrc(raw));
      return;
    }
    element.setAttribute(attribute.name, decodeEntities(unescapeQuotes(raw)));
  });
  if (isImg) {
    if (!hasDecoding) element.setAttribute("decoding", "async");
    (element as HTMLImageElement).decode?.().catch(() => {});
  }
  const events = data?.events || [];
  events.forEach((event: any) => {
    const eventProps: any = {};
    event.props.forEach((prop: any) => {
      eventProps[prop.key] = coerceArg(prop.value, state);
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
    let innerText = "";
    const mapValues: any = {};
    let stringTemplate;
    let hasVariables = false;
    if (type == "string") {
      const decoded = decodeEntities(child);
      innerText = decoded;
      stringTemplate = decoded;
      const variables = decoded.match(valsRegex) || [];
      hasVariables = variables.length > 0;
      for (let j = 0; j < variables.length; j++) {
        const valuesString: string = variables[j].match(cleanerRegex)?.[1] || "";
        const values = valuesString.split(".");
        const value = getValue(state.data, values);
        mapValues[valuesString] = JSON.parse(JSON.stringify(value || ""));
        innerText = innerText.replace(variables[j], value);
      }
    } else {
      innerText = JSON.stringify(child);
    }
    const textNode = document.createTextNode(innerText);
    if (hasVariables) {
      state.textMap[`${currentSSID}_${i}`] = {
        node: textNode,
        values: mapValues,
        template: stringTemplate,
      };
    }
    element.appendChild(textNode);
  }
  return element;
}

export default constructElement;
