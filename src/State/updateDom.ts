import State from "./State.js";
import { SSID } from "./const.js";
import constructElement from "./constructElement.js";

const TOP_COMPONENT_SELECTOR = "[ssct]:not([ssct] *)";
const scrolledSSIDs = new Set<string>();
let scrollListenerInstalled = false;

function ensureScrollListener(): void {
  if (scrollListenerInstalled || typeof document === "undefined") return;
  scrollListenerInstalled = true;
  document.addEventListener(
    "scroll",
    (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const id = t.getAttribute(SSID);
      if (id) scrolledSSIDs.add(id);
    },
    { capture: true, passive: true }
  );
}

function captureScroll(componentSSID: string, state: State): Map<string, [number, number]> | null {
  if (scrolledSSIDs.size === 0) return null;
  let stash: Map<string, [number, number]> | null = null;
  scrolledSSIDs.forEach((id) => {
    if (!id.startsWith(componentSSID)) return;
    const el = state.idMap[id];
    if (!(el instanceof Element)) {
      scrolledSSIDs.delete(id);
      return;
    }
    if (el.scrollTop || el.scrollLeft) {
      if (!stash) stash = new Map();
      stash.set(id, [el.scrollTop, el.scrollLeft]);
    }
  });
  return stash;
}

function restoreScroll(stash: Map<string, [number, number]>, state: State): void {
  stash.forEach(([top, left], id) => {
    const el = state.idMap[id];
    if (el instanceof Element) {
      el.scrollTop = top;
      el.scrollLeft = left;
    }
  });
}

function updateDOM(state: State) {
  ensureScrollListener();
  const componentElements = document.querySelectorAll(TOP_COMPONENT_SELECTOR);
  for ( let i  = 0; i < componentElements.length; i++) {
    const element = componentElements[i];
    const ssid: string = element.getAttribute(SSID) || '';
    const stash = captureScroll(ssid, state);
    const newElement = constructElement(state.componentMap[ssid], ssid, state)
    if (newElement) {
      element.replaceWith(newElement);
      if (stash) restoreScroll(stash, state);
    }
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
