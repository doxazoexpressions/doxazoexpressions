// Shared types for the Faith Essentials original devotional content set.
// kat_4_2_minimum: true

export type DevotionalDay = {
  day_id: string;
  day_number: number;
  /** ISO date (yyyy-mm-dd) this day is scheduled for. */
  date: string;
  title: string;
  quote: { text: string; author: string };
  passage: { reference: string; body: string; translation: string };
  devotional: string;
  prayer: string;
  /** Audio is intentionally not implemented yet — slot renders "Coming soon". */
  audio: null;
  audio_estimate_minutes: number;
};
