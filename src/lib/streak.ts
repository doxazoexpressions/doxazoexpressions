// Local daily-read streak. Fully client-side; keyed by local date (YYYY-MM-DD).
const KEY = "doxazo.streak.v1";

export type StreakState = {
  current: number;
  longest: number;
  lastReadDate: string | null; // YYYY-MM-DD in local time
  history: string[]; // last 30 days that count as read
};

const empty: StreakState = { current: 0, longest: 0, lastReadDate: null, history: [] };

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayDiff(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export function getStreak(): StreakState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const s = JSON.parse(raw) as StreakState;
    // Grace: if last read was >1 day ago, current streak is broken (visual only).
    if (s.lastReadDate) {
      const diff = dayDiff(s.lastReadDate, todayKey());
      if (diff > 1) return { ...s, current: 0 };
    }
    return s;
  } catch {
    return empty;
  }
}

/** Call when the user opens/reads a devotional. Advances streak once per day. */
export function markReadToday(): StreakState {
  if (typeof window === "undefined") return empty;
  const today = todayKey();
  const prev = (() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "null") as StreakState | null; }
    catch { return null; }
  })() ?? empty;

  if (prev.lastReadDate === today) return prev;

  let current = 1;
  if (prev.lastReadDate) {
    const diff = dayDiff(prev.lastReadDate, today);
    if (diff === 1) current = prev.current + 1;
    else if (diff === 0) current = prev.current;
    else current = 1;
  }
  const longest = Math.max(prev.longest, current);
  const history = Array.from(new Set([...(prev.history || []), today])).slice(-30);
  const next: StreakState = { current, longest, lastReadDate: today, history };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  return next;
}

/** Returns last 7 dates (oldest→newest) with a read flag, for a weekly dot row. */
export function weekProgress(): { date: string; label: string; read: boolean }[] {
  const s = getStreak();
  const set = new Set(s.history || []);
  const out: { date: string; label: string; read: boolean }[] = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const nd = new Date(d);
    nd.setDate(d.getDate() - i);
    const key = todayKey(nd);
    out.push({
      date: key,
      label: nd.toLocaleDateString(undefined, { weekday: "narrow" }),
      read: set.has(key),
    });
  }
  return out;
}
