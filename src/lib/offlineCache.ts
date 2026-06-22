// Lightweight offline cache for devotionals using localStorage.
// Caches today's devotional + most recent entries so the reading
// experience survives flaky connections.

const KEY_CURRENT = "doxazo.offline.current";
const KEY_RECENT = "doxazo.offline.recent";
const KEY_BY_ID = "doxazo.offline.byId";
const MAX_BY_ID = 20;

function safeGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function cacheCurrentDevotional(d: unknown) {
  if (!d) return;
  safeSet(KEY_CURRENT, d);
}

export function getCachedCurrentDevotional<T = unknown>(): T | null {
  return safeGet<T>(KEY_CURRENT);
}

export function cacheRecentDevotionals(list: unknown[]) {
  if (!Array.isArray(list)) return;
  safeSet(KEY_RECENT, list);
}

export function getCachedRecentDevotionals<T = unknown>(): T[] {
  return safeGet<T[]>(KEY_RECENT) ?? [];
}

export function cacheDevotionalById(id: string, d: unknown) {
  if (!id || !d) return;
  const map = safeGet<Record<string, unknown>>(KEY_BY_ID) ?? {};
  map[id] = d;
  const keys = Object.keys(map);
  if (keys.length > MAX_BY_ID) {
    // simple FIFO trim
    for (const k of keys.slice(0, keys.length - MAX_BY_ID)) delete map[k];
  }
  safeSet(KEY_BY_ID, map);
}

export function getCachedDevotionalById<T = unknown>(id: string): T | null {
  const map = safeGet<Record<string, T>>(KEY_BY_ID);
  return map?.[id] ?? null;
}

export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine !== false;
}
