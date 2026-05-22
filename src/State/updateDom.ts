import State from "./State.js";
import { SSID } from "./const.js";
import constructElement, { getValue, decodeEntities, unescapeQuotes } from "./constructElement.js";
import { resolveImageSrc, isBase64DataUri } from "./imageCache.js";

const ALL_COMPONENT_SELECTOR = "[ssct]";
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

type FocusSnapshot = {
  ssid: string;
  selectionStart: number | null;
  selectionEnd: number | null;
};

function captureFocus(componentSSID: string): FocusSnapshot | null {
  const active = document.activeElement;
  if (!(active instanceof Element)) return null;
  const id = active.getAttribute(SSID);
  if (!id || !id.startsWith(componentSSID)) return null;
  let selectionStart: number | null = null;
  let selectionEnd: number | null = null;
  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
    try {
      selectionStart = active.selectionStart;
      selectionEnd = active.selectionEnd;
    } catch (_) { /* selection unsupported on this input type */ }
  }
  return { ssid: id, selectionStart, selectionEnd };
}

function restoreFocus(snap: FocusSnapshot, state: State): void {
  const el = state.idMap[snap.ssid];
  if (!(el instanceof HTMLElement)) return;
  el.focus({ preventScroll: true });
  if (
    (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) &&
    snap.selectionStart !== null
  ) {
    try {
      el.setSelectionRange(snap.selectionStart, snap.selectionEnd ?? snap.selectionStart);
    } catch (_) { /* selection unsupported on this input type */ }
  }
}

function intersects(a: Set<string>, b: Set<string>): boolean {
  const [small, big] = a.size <= b.size ? [a, b] : [b, a];
  for (const k of small) if (big.has(k)) return true;
  return false;
}

function updateDOM(state: State) {
  ensureScrollListener();
  // Visit every component (document order: outer -> inner) so nested components
  // are independently dep-gated and updated in place.
  const componentElements = document.querySelectorAll(ALL_COMPONENT_SELECTOR);
  for ( let i  = 0; i < componentElements.length; i++) {
    const element = componentElements[i];
    // Skip nodes an ancestor's rebuild already replaced this tick.
    if (!element.isConnected) continue;
    const ssid: string = element.getAttribute(SSID) || '';
    // Dep-gate: skip re-running a component whose tracked deps are all clean.
    // (Value updates still flow via the textMap/attrMap passes below; descendants
    // remain connected and are visited later in this same loop.)
    const rec = state.componentMap[ssid];
    if (rec?.deps?.size && state.dirtyKeys.size && !intersects(rec.deps, state.dirtyKeys)) continue;
    const stash = captureScroll(ssid, state);
    const focusSnap = captureFocus(ssid);
    const newElement = constructElement(rec?.node, ssid, state)
    if (newElement && newElement !== element) {
      element.replaceWith(newElement);
      if (rec) rec.element = newElement;
      if (stash) restoreScroll(stash, state);
      if (focusSnap) restoreFocus(focusSnap, state);
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
      const value = getValue(state.data, key.split("."));
      rendered = rendered.replace(`{{${key}}}`, value ?? "");
    }
    entry.node.nodeValue = rendered;
  }
  const { attrMap } = state;
  for (const id in attrMap) {
    const entry = attrMap[id];
    if (!entry) continue;
    if (!entry.element.isConnected) { delete attrMap[id]; continue; }
    const values = entry.values;
    if (hasDirtyFilter) {
      let touched = false;
      for (const key in values) {
        if (dirtyKeys.has(key.split(".")[0])) { touched = true; break; }
      }
      if (!touched) continue;
    }
    let rendered = entry.template;
    for (const key in values) {
      const value = getValue(state.data, key.split("."));
      rendered = rendered.replace(`{{${key}}}`, value ?? "");
    }
    const finalVal = entry.isImgSrc && isBase64DataUri(rendered)
      ? resolveImageSrc(rendered)
      : decodeEntities(unescapeQuotes(rendered));
    if (entry.element.getAttribute(entry.attrName) !== finalVal) {
      entry.element.setAttribute(entry.attrName, finalVal);
    }
  }
  for (const ssid in state.nodeMap) {
    if (!state.nodeMap[ssid].isConnected) delete state.nodeMap[ssid];
  }
}

export default updateDOM;
