// Reading-plan (series) progress. Keyed by normalized series slug.
// Persists locally AND syncs to Supabase when the user is signed in, so
// progress follows them across devices (iOS, Android, web).
import { supabase } from "@/integrations/supabase/client";

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
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

export function markPlanItemRead(plan: string, devotionalId: string) {
  const s = read();
  const cur = s[plan] || { completed: [], updatedAt: 0 };
  if (!cur.completed.includes(devotionalId)) cur.completed.push(devotionalId);
  cur.updatedAt = Date.now();
  s[plan] = cur;
  write(s);
  // Fire-and-forget cloud sync (RLS ensures per-user isolation).
  void supabase.auth.getUser().then(({ data }) => {
    const uid = data.user?.id;
    if (!uid) return;
    return supabase
      .from("plan_progress")
      .upsert(
        { user_id: uid, plan_slug: plan, devotional_id: devotionalId },
        { onConflict: "user_id,plan_slug,devotional_id", ignoreDuplicates: true },
      );
  }).catch(() => { /* offline is fine — localStorage has it */ });
}

export function getPlanCompleted(plan: string): string[] {
  return read()[plan]?.completed ?? [];
}

export function resetPlanCompleted(plan: string, ids: string[]) {
  const s = read();
  s[plan] = { completed: Array.from(new Set(ids)), updatedAt: Date.now() };
  write(s);
}

/** Pull the signed-in user's progress from the cloud and merge into local. */
export async function syncPlanProgressFromCloud(): Promise<void> {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) return;
  const { data, error } = await supabase
    .from("plan_progress")
    .select("plan_slug,devotional_id");
  if (error || !data) return;
  const local = read();
  for (const row of data as { plan_slug: string; devotional_id: string }[]) {
    const cur = local[row.plan_slug] || { completed: [], updatedAt: 0 };
    if (!cur.completed.includes(row.devotional_id)) cur.completed.push(row.devotional_id);
    cur.updatedAt = Date.now();
    local[row.plan_slug] = cur;
  }
  write(local);
}
