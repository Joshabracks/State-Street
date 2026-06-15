/**
 * A small persistent library of saved themes, stored in a cookie. AI-generated themes
 * auto-save (the model titles them); the user can also save the current manual look.
 * Cookies are tiny (~4 KB), so the wire format is compact ({ i, t, e:[[name,value]] })
 * and the list is trimmed (oldest dropped) to stay within a safe byte budget.
 */
import { getCookie, setCookie } from "./cookies";

export interface SavedStyle {
  id: string;
  title: string;
  edits: { variable: string; value: string }[];
}

const KEY = "sst_styles";
const MAX = 24;
const MAX_BYTES = 3800; // keep under the ~4 KB per-cookie limit
let counter = 0;

function read(): SavedStyle[] {
  try {
    const raw = getCookie(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((c: any) => ({
      id: String(c.i),
      title: String(c.t),
      edits: Array.isArray(c.e) ? c.e.map((p: any) => ({ variable: p[0], value: p[1] })) : [],
    }));
  } catch {
    return [];
  }
}

function serialize(list: SavedStyle[]): string {
  return JSON.stringify(list.map((s) => ({ i: s.id, t: s.title, e: s.edits.map((e) => [e.variable, e.value]) })));
}

function write(list: SavedStyle[]): void {
  // Trim the oldest entries until the encoded cookie fits the byte budget.
  let l = list.slice(0, MAX);
  let str = serialize(l);
  while (l.length > 1 && encodeURIComponent(str).length > MAX_BYTES) {
    l = l.slice(0, -1);
    str = serialize(l);
  }
  setCookie(KEY, str);
}

export function loadStyles(): SavedStyle[] {
  return read();
}

/** Save a style (newest first), de-duping by title; returns the persisted list. */
export function addStyle(title: string, edits: SavedStyle["edits"]): SavedStyle[] {
  const id = `s${Date.now()}${counter++}`;
  const item: SavedStyle = { id, title: (title || "Untitled").slice(0, 60), edits };
  const list = [item, ...read().filter((s) => s.title !== item.title)].slice(0, MAX);
  write(list);
  return read(); // reflect what actually persisted (after any size-trim)
}

export function removeStyle(id: string): SavedStyle[] {
  write(read().filter((s) => s.id !== id));
  return read();
}

export function getStyle(id: string): SavedStyle | undefined {
  return read().find((s) => s.id === id);
}
