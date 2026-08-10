// Scripture lookup via bible-api.com (free, CORS-enabled, KJV/WEB).
// Caches responses in localStorage for offline re-reads.

import { getTranslation } from "@/lib/bibleVersions";

const CACHE_KEY = "doxazo.scripture.cache.v1";
const MAX_CACHE = 60;

export type Verse = {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
};

export type Passage = {
  reference: string;
  translation_id: string;
  translation_name: string;
  text: string;
  verses: Verse[];
};

type CacheEntry = { key: string; passage: Passage; ts: number };

function readCache(): CacheEntry[] {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "[]"); }
  catch { return []; }
}

function writeCache(entries: CacheEntry[]) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify(entries.slice(-MAX_CACHE))
    );
  } catch {}
}

function cacheKey(ref: string, translation: string) {
  return `${translation}::${ref.trim().toLowerCase()}`;
}

export function getCachedPassage(ref: string, translation = "kjv"): Passage | null {
  const key = cacheKey(ref, translation);
  const hit = readCache().find((e) => e.key === key);
  return hit?.passage ?? null;
}

export async function lookupPassage(
  reference: string,
  translation: string = "kjv"
): Promise<Passage> {
  const meta = getTranslation(translation);
  if (!meta.available || !meta.apiSlug) {
    // Never silently substitute another translation for a licensed one.
    throw new Error(
      `${meta.full} (${meta.label}) is not licensed for in-app text yet. ${meta.note}`
    );
  }
  translation = meta.apiSlug;
  const trimmed = reference.trim();
  if (!trimmed) throw new Error("Enter a reference like John 3:16");

  const cached = getCachedPassage(trimmed, translation);
  const url = `https://bible-api.com/${encodeURIComponent(trimmed)}?translation=${translation}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    const passage: Passage = {
      reference: data.reference,
      translation_id: data.translation_id,
      translation_name: data.translation_name,
      text: (data.text || "").trim(),
      verses: data.verses || [],
    };
    const entries = readCache().filter((e) => e.key !== cacheKey(trimmed, translation));
    entries.push({ key: cacheKey(trimmed, translation), passage, ts: Date.now() });
    writeCache(entries);
    return passage;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

export function recentLookups(): { reference: string; translation: string }[] {
  return readCache()
    .slice()
    .reverse()
    .map((e) => ({
      reference: e.passage.reference,
      translation: e.passage.translation_id,
    }));
}
