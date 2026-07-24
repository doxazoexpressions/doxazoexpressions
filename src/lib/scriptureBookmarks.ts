// Local scripture bookmarks — saved references the user wants to return to.
// Fully client-side (native app value; not exposed on web home).
const KEY = "doxazo.scripture.bookmarks.v1";
const MAX = 60;

export type ScriptureBookmark = {
  id: string;         // `${translation}::${reference}` normalized
  reference: string;
  translation: string;
  savedAt: number;
  note?: string | null;
};

function bmKey(reference: string, translation: string) {
  return `${translation.toLowerCase()}::${reference.trim().toLowerCase()}`;
}

function read(): ScriptureBookmark[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(list: ScriptureBookmark[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch {}
}

export function listScriptureBookmarks(): ScriptureBookmark[] {
  return read().sort((a, b) => b.savedAt - a.savedAt);
}

export function isScriptureBookmarked(reference: string, translation: string): boolean {
  return read().some((b) => b.id === bmKey(reference, translation));
}

export function toggleScriptureBookmark(reference: string, translation: string, note?: string | null): boolean {
  const id = bmKey(reference, translation);
  const list = read();
  const existing = list.findIndex((b) => b.id === id);
  if (existing >= 0) {
    list.splice(existing, 1);
    write(list);
    return false;
  }
  list.unshift({ id, reference, translation, savedAt: Date.now(), note: note ?? null });
  write(list);
  return true;
}

export function removeScriptureBookmark(id: string) {
  write(read().filter((b) => b.id !== id));
}
