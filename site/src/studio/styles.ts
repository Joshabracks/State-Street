/**
 * A small persistent library of saved themes. AI-generated themes auto-save (the model
 * titles them); the user can also save the current manual look. Stored in localStorage,
 * so the library survives a refresh even though the live theme does not.
 */
export interface SavedStyle {
  id: string;
  title: string;
  edits: { variable: string; value: string }[];
}

const KEY = "sst-studio-styles";
const MAX = 30;
let counter = 0;

function read(): SavedStyle[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(list: SavedStyle[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage full / blocked */ }
}

export function loadStyles(): SavedStyle[] {
  return read();
}

/** Save a style (newest first), de-duping by title; returns the updated list. */
export function addStyle(title: string, edits: SavedStyle["edits"]): SavedStyle[] {
  // Non-numeric id so the framework keeps it a string in :click=apply(id=...).
  const id = `s${Date.now()}${counter++}`;
  const item: SavedStyle = { id, title: (title || "Untitled").slice(0, 60), edits };
  const list = [item, ...read().filter((s) => s.title !== item.title)].slice(0, MAX);
  write(list);
  return list;
}

export function removeStyle(id: string): SavedStyle[] {
  const list = read().filter((s) => s.id !== id);
  write(list);
  return list;
}

export function getStyle(id: string): SavedStyle | undefined {
  return read().find((s) => s.id === id);
}
