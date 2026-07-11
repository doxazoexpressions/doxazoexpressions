import { supabase } from "@/integrations/supabase/client";

export type VoiceKind = "female" | "male";
export const AUDIO_BUCKET = "devotional-audio";
const PREF_KEY = "doxazo:voice-preference";

/**
 * Approved Sam/Jane narration references — used as the standard voice
 * whenever a specific devotional has no per-voice audio uploaded yet.
 * Stored under devotional-audio/defaults/{voice}.mp3.
 */
export const DEFAULT_VOICE_PATHS: Record<VoiceKind, string> = {
  male: "defaults/sam.mp3",
  female: "defaults/jane.mp3",
};

export function getVoicePreference(): VoiceKind {
  if (typeof window === "undefined") return "female";
  const v = window.localStorage.getItem(PREF_KEY);
  return v === "male" || v === "female" ? v : "female";
}

export function setVoicePreference(v: VoiceKind) {
  try { window.localStorage.setItem(PREF_KEY, v); } catch {}
}

/** Resolve a stored value (external URL or bucket path) to a playable URL. */
export async function resolveAudioUrl(value?: string | null): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || value.startsWith("blob:") || value.startsWith("data:")) {
    return value;
  }
  // Treat as storage path within the devotional-audio bucket.
  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .createSignedUrl(value, 60 * 60);
  if (error) {
    console.warn("resolveAudioUrl failed:", error.message);
    return null;
  }
  return data?.signedUrl ?? null;
}

/** Upload an audio file for a devotional voice; returns the stored path. */
export async function uploadDevotionalAudio(
  devotionalId: string,
  voice: VoiceKind,
  file: File,
): Promise<string> {
  const ext = (file.name.split(".").pop() || "mp3").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp3";
  const path = `${devotionalId}/${voice}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "audio/mpeg",
    });
  if (error) throw error;
  return path;
}

/** Read the duration (in seconds) from an audio file client-side. */
export function readAudioDurationSeconds(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const a = new Audio();
      a.preload = "metadata";
      a.src = url;
      a.onloadedmetadata = () => {
        const d = Number.isFinite(a.duration) ? Math.round(a.duration) : null;
        URL.revokeObjectURL(url);
        resolve(d);
      };
      a.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    } catch { resolve(null); }
  });
}
