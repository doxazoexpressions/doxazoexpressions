import { supabase } from "@/integrations/supabase/client";

export const AUDIO_BUCKET = "audio-journal";
export const MAX_DURATION_SECONDS = 300; // 5 minutes — audio journals are brief reflections

export type JournalAudio = {
  id: string;
  journal_entry_id: string;
  user_id: string;
  storage_path: string;
  mime_type: string;
  duration_seconds: number;
  size_bytes: number;
  created_at: string;
};

export const isRecordingSupported = () =>
  typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

/** Upload a recorded blob to `audio-journal/<user_id>/<uuid>.<ext>`. */
export async function uploadAudio(
  userId: string,
  blob: Blob,
): Promise<{ path: string; size_b: number }> {
  const ext = blob.type.includes("webm") ? "webm" : blob.type.includes("mp4") ? "m4a" : "m4a";
  const id = crypto.randomUUID();
  const path = `${userId}/${id}.${ext}`;

  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(path, blob, { contentType: blob.type || "audio/webm", upsert: false });
  if (error) throw error;

  return { path, size_b: blob.size };
}

/** Upload + persist a row in one step. */
export async function attachAudioToEntry(input: {
  journalEntryId: string;
  blob: Blob;
  durationSeconds: number;
}): Promise<JournalAudio> {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) throw new Error("Sign in to save your voice memo.");

  const duration = Math.max(1, Math.round(input.durationSeconds));
  if (duration > MAX_DURATION_SECONDS) {
    throw new Error("Voice memos are limited to 5 minutes. Please record a shorter reflection.");
  }

  const { path, size_b } = await uploadAudio(uid, input.blob);

  const { data, error } = await supabase
    .from("journal_audio_entries")
    .insert({
      journal_entry_id: input.journalEntryId,
      user_id: uid,
      storage_path: path,
      mime_type: input.blob.type || "audio/webm",
      duration_seconds: duration,
      size_bytes: size_b,
    })
    .select("*")
    .single();

  if (error) {
    // Don't orphan the storage object if the row insert fails.
    await supabase.storage.from(AUDIO_BUCKET).remove([path]);
    throw error;
  }
  return data as JournalAudio;
}

export async function listAudioForEntries(entryIds: string[]): Promise<JournalAudio[]> {
  if (entryIds.length === 0) return [];
  const { data, error } = await supabase
    .from("journal_audio_entries")
    .select("*")
    .in("journal_entry_id", entryIds)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as JournalAudio[];
}

export async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .createSignedUrl(path, 60 * 60); // 1 hour
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteAudio(audioId: string): Promise<void> {
  const { data, error } = await supabase
    .from("journal_audio_entries")
    .select("storage_path")
    .eq("id", audioId)
    .single();
  if (error) throw error;

  const { error: rmError } = await supabase.storage
    .from(AUDIO_BUCKET)
    .remove([data.storage_path]);
  if (rmError) throw rmError;

  const { error: delError } = await supabase
    .from("journal_audio_entries")
    .delete()
    .eq("id", audioId);
  if (delError) throw delError;
}

/** Remove every storage object under `audio-journal/<user_id>/` (account deletion). */
export async function deleteAllAudioObjectsForUser(userId: string): Promise<number> {
  const { data: objs } = await supabase.storage
    .from(AUDIO_BUCKET)
    .list(userId, { limit: 200 });
  if (objs && objs.length > 0) {
    await supabase.storage
      .from(AUDIO_BUCKET)
      .remove(objs.map((o) => `${userId}/${o.name}`));
    return objs.length;
  }
  return 0;
}
