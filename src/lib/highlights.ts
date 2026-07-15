import { supabase } from "@/integrations/supabase/client";

export type HighlightColor = "gold" | "sky" | "rose" | "emerald" | "violet";

export const HIGHLIGHT_COLORS: { key: HighlightColor; label: string; swatch: string }[] = [
  { key: "gold", label: "Gold", swatch: "#d4af37" },
  { key: "sky", label: "Sky", swatch: "#38bdf8" },
  { key: "rose", label: "Rose", swatch: "#fb7185" },
  { key: "emerald", label: "Emerald", swatch: "#34d399" },
  { key: "violet", label: "Violet", swatch: "#a78bfa" },
];

export type VerseHighlight = {
  id: string;
  user_id: string;
  devotional_id: string | null;
  devotional_title: string | null;
  reference: string | null;
  verse_text: string;
  color: HighlightColor;
  note: string | null;
  created_at: string;
};

export async function listHighlights(devotionalId?: string) {
  let q = supabase
    .from("verse_highlights")
    .select("*")
    .order("created_at", { ascending: false });
  if (devotionalId) q = q.eq("devotional_id", devotionalId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as VerseHighlight[];
}

export async function createHighlight(input: {
  verse_text: string;
  reference?: string | null;
  color?: HighlightColor;
  note?: string | null;
  devotional_id?: string | null;
  devotional_title?: string | null;
}) {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) throw new Error("Sign in to save highlights.");
  const { data, error } = await supabase
    .from("verse_highlights")
    .insert({
      user_id: uid,
      verse_text: input.verse_text,
      reference: input.reference ?? null,
      color: input.color ?? "gold",
      note: input.note ?? null,
      devotional_id: input.devotional_id ?? null,
      devotional_title: input.devotional_title ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as VerseHighlight;
}

export async function deleteHighlight(id: string) {
  const { error } = await supabase.from("verse_highlights").delete().eq("id", id);
  if (error) throw error;
}

export function swatchFor(color: string) {
  return HIGHLIGHT_COLORS.find((c) => c.key === color)?.swatch ?? "#d4af37";
}
