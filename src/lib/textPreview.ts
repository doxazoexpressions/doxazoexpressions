/**
 * Word-boundary safe text preview.
 * Never cuts inside a word (fixes mid-word truncation like "relationshi…").
 */
export function preview(text: string | null | undefined, max = 220): string {
  const src = (text ?? "").replace(/\s+/g, " ").trim();
  if (!src) return "";
  if (src.length <= max) return src;
  const slice = src.slice(0, max + 1);
  const cut = slice.lastIndexOf(" ");
  const base = src.slice(0, cut > 0 ? cut : max).trim();
  // Keep a clean ending: no dangling punctuation before the ellipsis.
  return base.replace(/[.,;:!?—-]+$/, "") + "…";
}
