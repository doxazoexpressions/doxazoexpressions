/**
 * Private per-user prayer list. Stored in Supabase (cloud sync + RLS),
 * with a local cache so the list appears instantly and works offline for
 * the read-only view. Writes go straight to the cloud when signed in.
 */
import { supabase } from "@/integrations/supabase/client";

export type PrayerRequest = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  category: string | null;
  scripture_reference: string | null;
  devotional_id: string | null;
  is_answered: boolean;
  answered_at: string | null;
  answered_note: string | null;
  remind_at: string | null;
  remind_frequency: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type NewPrayerRequest = {
  title: string;
  body?: string | null;
  category?: string | null;
  scripture_reference?: string | null;
  devotional_id?: string | null;
  remind_at?: string | null;
  remind_frequency?: "once" | "daily" | "weekly" | null;
};

const CACHE_KEY = "doxazo.prayers.cache.v1";

function writeCache(rows: PrayerRequest[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(rows)); } catch {}
}
export function readCache(): PrayerRequest[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as PrayerRequest[]) : [];
  } catch { return []; }
}

export async function listPrayers(opts?: { includeArchived?: boolean; includeAnswered?: boolean }) {
  let q = supabase.from("prayer_requests").select("*").order("created_at", { ascending: false });
  if (!opts?.includeArchived) q = q.eq("archived", false);
  const { data, error } = await q;
  if (error) throw error;
  let rows = (data ?? []) as PrayerRequest[];
  if (!opts?.includeAnswered) rows = rows.filter((r) => !r.is_answered);
  writeCache(rows);
  return rows;
}

export async function createPrayer(input: NewPrayerRequest) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) throw new Error("Sign in to save prayer requests.");
  const { data, error } = await supabase
    .from("prayer_requests")
    .insert({
      user_id: uid,
      title: input.title,
      body: input.body ?? null,
      category: input.category ?? null,
      scripture_reference: input.scripture_reference ?? null,
      devotional_id: input.devotional_id ?? null,
      remind_at: input.remind_at ?? null,
      remind_frequency: input.remind_frequency ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as PrayerRequest;
}

export async function updatePrayer(id: string, patch: Partial<Omit<PrayerRequest, "id" | "user_id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase.from("prayer_requests").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as PrayerRequest;
}

export async function markAnswered(id: string, note?: string) {
  return updatePrayer(id, {
    is_answered: true,
    answered_at: new Date().toISOString(),
    answered_note: note ?? null,
  });
}

export async function reopenPrayer(id: string) {
  return updatePrayer(id, { is_answered: false, answered_at: null });
}

export async function archivePrayer(id: string, archived = true) {
  return updatePrayer(id, { archived });
}

export async function deletePrayer(id: string) {
  const { error } = await supabase.from("prayer_requests").delete().eq("id", id);
  if (error) throw error;
}
