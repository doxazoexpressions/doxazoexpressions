// Reading-plan (series) progress. Keyed by normalized series slug.
const KEY = "doxazo.plans.v1";

type PlansState = Record<string, { completed: string[]; updatedAt: number }>;

export function planSlug(series: string | null | undefined): string | null {
  if (!series) return null;
  return series
    .toLowerCase()
    .replace(/part\s*\d+.*$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || null;
}

export function planDisplayName(series: string): string {
  return series.replace(/\bpart\s*\d+.*$/i, "").replace(/[&:]$/g, "").trim();
}

function read(): PlansState {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function write(s: PlansState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function markPlanItemRead(plan: string, devotionalId: string) {
  const s = read();
  const cur = s[plan] || { completed: [], updatedAt: 0 };
  if (!cur.completed.includes(devotionalId)) cur.completed.push(devotionalId);
  cur.updatedAt = Date.now();
  s[plan] = cur;
  write(s);
}

export function getPlanCompleted(plan: string): string[] {
  return read()[plan]?.completed ?? [];
}
