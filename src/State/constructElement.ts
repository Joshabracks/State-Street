import State from "./State.js";
import { SSID } from "./const.js";
import { parseSST } from "../Template/parseSST.js";
import { resolveImageSrc, isBase64DataUri } from "./imageCache.js";
import { makeDepTracker } from "./trackDeps.js";

const valsRegex = /{{.[^{]+}}/g;
const cleanerRegex = /{{(.*)}}/;

const REUSABLE_TAGS = new Set(["img", "input", "textarea", "select", "canvas", "video", "audio", "iframe"]);

// Reuse parsed trees across components/instances with identical (placeholder) bodies.
const parseCache = new Map<string, any>();

let entityDecoder: HTMLTextAreaElement | null = null;
export function decodeEntities(str: string): string {
  if (str.indexOf("&") === -1) return str;
  if (!entityDecoder) entityDecoder = document.createElement("textarea");
  entityDecoder.innerHTML = str;
  return entityDecoder.value;
}

export function getValue(obj: any, values: string[]) {
  if (values.length === 0) return obj;
  const key: string = values.shift() || "";
  const value = obj[key];
  if (!value) return value;
  return getValue(value, values);
}

export function unescapeQuotes(str: string): string {
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

// Resolve a component reference, build its dep-tracking proxy + coerced props,
// run the component function, and return its rendered body + tracked deps.
// Shared by constructElement (mount / full rebuild) and updateDom's in-place rebuild.
export function runComponent(data: any, state: State): { componentBody: string; deps: Set<string> } | null {
  const component = state.components[data?.componentName];
  if (!component) {
    console.error(`invalid component: ${data?.componentName}`);
    return null;
  }
  const { trackedState, deps } = makeDepTracker(state);
  const cp = data?.componentProperties || {};
  const props: any = {};
  for (const k in cp) props[k] = cp[k] === undefined ? true : coerceArg(cp[k], trackedState);
  const componentBody = component({ state: trackedState, ...props });
  return { componentBody, deps };
}

// Parse a component body once and cache the resulting element tree.
export function parseComponentBody(componentBody: string, state: State): any {
  let parsedBody = parseCache.get(componentBody);
  if (!parsedBody) {
    parsedBody = parseSST(componentBody, state.components);
    parseCache.set(componentBody, parsedBody);
  }
  return parsedBody;
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
    const result = runComponent(data, state);
    if (!result) return null;
    const { componentBody, deps } = result;
    const parsedBody = parseComponentBody(componentBody, state);
    // A component renders with no wrapper element. Instead its rendered nodes are
    // delimited by a pair of comment markers, so the component's real root(s) become
    // direct children of the parent (no layout/structural-selector interference).
    // The markers are a stable re-render anchor even when the body renders nothing.
    const startMarker = document.createComment(`ss:${currentSSID}:${data?.componentName}`);
    const endMarker = document.createComment(`/ss:${currentSSID}`);
    const frag = document.createDocumentFragment();
    frag.appendChild(startMarker);
    for (let i = 0; i < parsedBody.length; i++) {
      const ssid = `${currentSSID}${i}`;
      const subElement: any = constructElement(parsedBody[i], ssid, state);
      if (subElement) frag.appendChild(subElement);
    }
    frag.appendChild(endMarker);
    state.componentMap[currentSSID] = { node: data, lastBody: componentBody, deps, startMarker, endMarker, tick: state.tick };
    return frag;
  }
  const attributes = data?.attributes || [];
  const isImg = tag === "img";
  const reusable = REUSABLE_TAGS.has(tag);
  const cached = reusable ? state.nodeMap[currentSSID] : undefined;
  const reuse = cached && cached.tagName.toLowerCase() === tag ? cached : undefined;
  const element = reuse || document.createElement(tag);

  const noCache = isImg && attributes.some((a: any) => a.name === "nocache");
  const desired = new Map<string, string>();
  attributes.forEach((attribute: any) => {
    if (isImg && attribute.name === "nocache") return;
    const raw = attribute.value ?? "";
    const isImgSrc = isImg && attribute.name === "src" && !noCache;
    const vars = raw.match(valsRegex);
    if (vars) {
      const values: any = {};
      let rendered = raw;
      for (let j = 0; j < vars.length; j++) {
        const key = vars[j].match(cleanerRegex)?.[1] || "";
        const value = getValue(state.data, key.split("."));
        values[key] = value;
        rendered = rendered.replace(vars[j], value ?? "");
      }
      desired.set(attribute.name, isImgSrc && isBase64DataUri(rendered) ? resolveImageSrc(rendered) : decodeEntities(unescapeQuotes(rendered)));
      state.attrMap[`${currentSSID}@${attribute.name}`] = { element, attrName: attribute.name, template: raw, values, isImgSrc };
    } else if (isImgSrc && isBase64DataUri(raw)) {
      desired.set("src", resolveImageSrc(raw));
    } else {
      desired.set(attribute.name, decodeEntities(unescapeQuotes(raw)));
    }
  });
  if (isImg && !desired.has("decoding")) desired.set("decoding", "async");

  if (reuse) {
    for (const attr of Array.from((element as HTMLElement).attributes)) {
      if (attr.name !== SSID && !desired.has(attr.name)) element.removeAttribute(attr.name);
    }
    desired.forEach((v, n) => { if (element.getAttribute(n) !== v) element.setAttribute(n, v); });
  } else {
    desired.forEach((v, n) => element.setAttribute(n, v));
    if (isImg) (element as HTMLImageElement).decode?.().catch(() => {});
  }

  const prev = (element as any).__sstEvents as Array<{ type: string; fn: any }> | undefined;
  if (prev) for (const p of prev) element.removeEventListener(p.type, p.fn);
  const bound: Array<{ type: string; fn: any }> = [];
  const events = data?.events || [];
  events.forEach((event: any) => {
    const eventProps: any = {};
    event.props.forEach((prop: any) => {
      eventProps[prop.key] = coerceArg(prop.value, state);
    });
    const fn = (e: any) => state.methods[event.function]({ ...eventProps, event: e, state });
    element.addEventListener(event.type, fn);
    bound.push({ type: event.type, fn });
  });
  (element as any).__sstEvents = bound;

  state.idMap[currentSSID] = element;
  element.setAttribute(SSID, currentSSID);
  if (reusable) state.nodeMap[currentSSID] = element;
  // Raw element (RAWTEXT tag or `:raw`): its content was stashed verbatim by the
  // parser. Plain raw -> literal textContent. `:raw=formatter` -> feed the text
  // to the named method and use its return value as HTML (the formatter owns
  // escaping/XSS). Attributes + events above still apply to raw elements.
  if (data?.raw) {
    const rawText = `${content[0] ?? ""}`;
    if (data.rawFormatter) {
      const fn = state.methods[data.rawFormatter];
      if (fn) element.innerHTML = `${fn({ text: rawText, state })}`;
      else { console.error(`invalid :raw formatter: ${data.rawFormatter}`); element.textContent = rawText; }
    } else {
      element.textContent = rawText;
    }
    return element;
  }
  if (data?.selfClosing) {
    return element;
  }
  if (reuse) {
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
        innerText = innerText.replace(variables[j], value ?? "");
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
