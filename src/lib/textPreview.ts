/**
 * Word-boundary safe text preview.
 * Never cuts inside a word (fixes mid-word truncation like "relationshi…").
 */
export function normalizeReadableText(text: string | null | undefined): string {
  return (text ?? "")
    .replace(/[\u00A0\u202F\u2007]/g, " ")
    .replace(/[\u200B\u2060\uFEFF]/g, "")
    .replace(/[\u2028\u2029]/g, "\n");
}

export function preview(text: string | null | undefined, max = 220): string {
  const src = normalizeReadableText(text).replace(/\s+/g, " ").trim();
  if (!src) return "";
  if (src.length <= max) return src;
  const slice = src.slice(0, max + 1);
  const cut = slice.lastIndexOf(" ");
  const base = src.slice(0, cut > 0 ? cut : max).trim();
  // Keep a clean ending: no dangling punctuation before the ellipsis.
  return base.replace(/[.,;:!?—-]+$/, "") + "…";
}
