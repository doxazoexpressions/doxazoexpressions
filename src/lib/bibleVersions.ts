/**
 * Bible translation registry.
 *
 * IMPORTANT — LICENSING:
 * KJV and WEB are public domain / freely redistributable and are served live
 * from bible-api.com. NIV (Biblica) and AMP (The Lockman Foundation) are
 * copyright-protected: full-text API access requires a signed licence and an
 * API key. We deliberately DO NOT ship NIV/AMP text without that licence, so
 * those options are surfaced as "licence pending" instead of silently falling
 * back to a different translation (which would misattribute Scripture).
 */

export type TranslationId = "kjv" | "web" | "asv" | "niv" | "amp";

export type TranslationMeta = {
  id: TranslationId;
  label: string;
  full: string;
  /** Available to read in-app right now. */
  available: boolean;
  /** bible-api.com translation slug (only for available ones). */
  apiSlug?: string;
  note: string;
};

export const TRANSLATIONS: TranslationMeta[] = [
  {
    id: "kjv",
    label: "KJV",
    full: "King James Version",
    available: true,
    apiSlug: "kjv",
    note: "Public domain — included.",
  },
  {
    id: "amp",
    label: "AMP",
    full: "Amplified Bible",
    available: false,
    note: "Licence required from The Lockman Foundation before the text can ship.",
  },
  {
    id: "niv",
    label: "NIV",
    full: "New International Version",
    available: false,
    note: "Licence required from Biblica/Zondervan before the text can ship.",
  },
  {
    id: "web",
    label: "WEB",
    full: "World English Bible",
    available: true,
    apiSlug: "web",
    note: "Modern English, public domain — included.",
  },
  {
    id: "asv",
    label: "ASV",
    full: "American Standard Version",
    available: true,
    apiSlug: "asv",
    note: "Public domain — included.",
  },
];

export const AVAILABLE_TRANSLATIONS = TRANSLATIONS.filter((t) => t.available);
export const PENDING_TRANSLATIONS = TRANSLATIONS.filter((t) => !t.available);

export const getTranslation = (id: string): TranslationMeta =>
  TRANSLATIONS.find((t) => t.id === id) ?? TRANSLATIONS[0];

export const DEFAULT_TRANSLATION: TranslationId = "kjv";
