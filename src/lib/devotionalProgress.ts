// Devotional completion + continuity state — local, native-first.
// Tracks: which devotionals were "started" (opened but not finished),
// which were "completed" (read-through), and the last plan the user
// interacted with, so the native home can offer a real "Resume" surface.
const STATE_KEY = "doxazo.devotional.state.v1";
const LAST_PLAN_KEY = "doxazo.devotional.lastPlan.v1";

type DevStatus = "started" | "completed";
type StateMap = Record<string, { status: DevStatus; updatedAt: number }>;

function read(): StateMap {
  try { return JSON.parse(localStorage.getItem(STATE_KEY) || "{}"); } catch { return {}; }
}
function write(m: StateMap) {
  try { localStorage.setItem(STATE_KEY, JSON.stringify(m)); } catch {}
}

export function markStarted(devotionalId: string) {
  if (!devotionalId) return;
  const m = read();
  const cur = m[devotionalId];
  if (cur?.status === "completed") return; // don't downgrade
  m[devotionalId] = { status: "started", updatedAt: Date.now() };
  write(m);
}

export function markCompleted(devotionalId: string) {
  if (!devotionalId) return;
  const m = read();
  m[devotionalId] = { status: "completed", updatedAt: Date.now() };
  write(m);
}

export function getStatus(devotionalId: string): DevStatus | null {
  return read()[devotionalId]?.status ?? null;
}

export function isCompleted(devotionalId: string): boolean {
  return read()[devotionalId]?.status === "completed";
}

export function setLastPlan(planSlug: string | null) {
  try {
    if (!planSlug) localStorage.removeItem(LAST_PLAN_KEY);
    else localStorage.setItem(LAST_PLAN_KEY, planSlug);
  } catch {}
}
export function getLastPlan(): string | null {
  try { return localStorage.getItem(LAST_PLAN_KEY); } catch { return null; }
}
