// Tracks reading continuity on-device so the native home can show
// "Continue reading" and "Recent reads" without another network call.
const LAST_KEY = "doxazo.lastRead";
const HISTORY_KEY = "doxazo.readHistory";
const MAX_HISTORY = 12;

export type ReadEntry = {
  id: string;
  slug: string | null;
  title: string;
  scripture_reference: string | null;
  publish_date: string;
  readAt: number;
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export function recordRead(entry: Omit<ReadEntry, "readAt">) {
  if (typeof window === "undefined" || !entry?.id) return;
  const full: ReadEntry = { ...entry, readAt: Date.now() };
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify(full));
    const list = safeParse<ReadEntry[]>(localStorage.getItem(HISTORY_KEY)) ?? [];
    const dedup = [full, ...list.filter((r) => r.id !== full.id)].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(dedup));
  } catch {}
}

export function getLastRead(): ReadEntry | null {
  if (typeof window === "undefined") return null;
  return safeParse<ReadEntry>(localStorage.getItem(LAST_KEY));
}

export function getReadHistory(): ReadEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<ReadEntry[]>(localStorage.getItem(HISTORY_KEY)) ?? [];
}

export function clearReadingHistory() {
  try {
    localStorage.removeItem(LAST_KEY);
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}
