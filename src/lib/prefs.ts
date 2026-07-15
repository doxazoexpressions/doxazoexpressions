/**
 * User personalization preferences captured during native onboarding.
 * Stored locally (works offline, cross-user privacy) and read by the
 * "For You" rail plus the audio player defaults.
 */
import type { CategorySlug } from "@/lib/categories";
import type { VoiceKind } from "@/lib/devotionalAudio";

const KEY = "doxazo.prefs.v1";

export type ReadingTime = "morning" | "midday" | "evening" | "night";

export type UserPrefs = {
  categories: CategorySlug[]; // 0..n preferred themes
  voice: VoiceKind;
  readingTime: ReadingTime;
  onboardedAt?: string;
};

const DEFAULT: UserPrefs = {
  categories: [],
  voice: "female",
  readingTime: "morning",
};

export function getPrefs(): UserPrefs {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw);
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      voice: parsed.voice === "male" ? "male" : "female",
      readingTime: (["morning", "midday", "evening", "night"] as const).includes(parsed.readingTime)
        ? parsed.readingTime
        : "morning",
      onboardedAt: typeof parsed.onboardedAt === "string" ? parsed.onboardedAt : undefined,
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function setPrefs(patch: Partial<UserPrefs>) {
  const next = { ...getPrefs(), ...patch };
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  return next;
}

export function hasOnboarded(): boolean {
  return !!getPrefs().onboardedAt;
}
