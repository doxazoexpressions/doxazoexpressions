// Weekly reading goal + milestone badges. Fully client-side.
import { getStreak } from "./streak";

const GOAL_KEY = "doxazo.goal.v1";
const BADGES_KEY = "doxazo.badges.v1";

export type Goal = { weeklyTarget: number }; // days per week
export type Badge = {
  id: string;
  label: string;
  description: string;
  earnedAt: string; // ISO
};

const DEFAULT_GOAL: Goal = { weeklyTarget: 5 };

export function getGoal(): Goal {
  if (typeof window === "undefined") return DEFAULT_GOAL;
  try {
    const raw = localStorage.getItem(GOAL_KEY);
    if (!raw) return DEFAULT_GOAL;
    return { ...DEFAULT_GOAL, ...(JSON.parse(raw) as Goal) };
  } catch {
    return DEFAULT_GOAL;
  }
}

export function setGoal(g: Goal) {
  try { localStorage.setItem(GOAL_KEY, JSON.stringify(g)); } catch {}
}

export function getBadges(): Badge[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(BADGES_KEY) || "[]"); }
  catch { return []; }
}

function saveBadges(b: Badge[]) {
  try { localStorage.setItem(BADGES_KEY, JSON.stringify(b)); } catch {}
}

const MILESTONES: { id: string; days: number; label: string; description: string }[] = [
  { id: "streak-3", days: 3, label: "Rooted", description: "3-day streak" },
  { id: "streak-7", days: 7, label: "One Week Faithful", description: "7-day streak" },
  { id: "streak-14", days: 14, label: "Two Weeks Strong", description: "14-day streak" },
  { id: "streak-30", days: 30, label: "Anointed Month", description: "30-day streak" },
  { id: "streak-60", days: 60, label: "Consecrated", description: "60-day streak" },
  { id: "streak-100", days: 100, label: "Century of Grace", description: "100-day streak" },
];

/** Evaluate current streak against milestones and award new badges. Idempotent. */
export function evaluateBadges(): Badge[] {
  const { current } = getStreak();
  const existing = getBadges();
  const owned = new Set(existing.map((b) => b.id));
  const now = new Date().toISOString();
  const additions: Badge[] = [];
  for (const m of MILESTONES) {
    if (current >= m.days && !owned.has(m.id)) {
      additions.push({ id: m.id, label: m.label, description: m.description, earnedAt: now });
    }
  }
  if (additions.length) {
    const next = [...existing, ...additions];
    saveBadges(next);
    return next;
  }
  return existing;
}

export const ALL_MILESTONES = MILESTONES;
