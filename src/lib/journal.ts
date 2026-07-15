import { supabase } from "@/integrations/supabase/client";

export type JournalEntry = {
  id: string;
  user_id: string;
  devotional_id: string | null;
  devotional_title: string | null;
  content: string;
  mood: string | null;
  created_at: string;
  updated_at: string;
};

export async function listJournalEntries(devotionalId?: string) {
  let q = supabase
    .from("journal_entries")
    .select("*")
    .order("created_at", { ascending: false });
  if (devotionalId) q = q.eq("devotional_id", devotionalId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as JournalEntry[];
}

export async function createJournalEntry(input: {
  content: string;
  mood?: string | null;
  devotional_id?: string | null;
  devotional_title?: string | null;
}) {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) throw new Error("Sign in to save your journal entry.");
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: uid,
      content: input.content,
      mood: input.mood ?? null,
      devotional_id: input.devotional_id ?? null,
      devotional_title: input.devotional_title ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as JournalEntry;
}

export async function updateJournalEntry(id: string, patch: { content?: string; mood?: string | null }) {
  const { data, error } = await supabase
    .from("journal_entries")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as JournalEntry;
}

export async function deleteJournalEntry(id: string) {
  const { error } = await supabase.from("journal_entries").delete().eq("id", id);
  if (error) throw error;
}
