/**
 * Presentation-only formatters shared by every devotional surface
 * (cards, rails, search results) so content length or authoring style
 * can never produce visibly different card systems.
 */

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** One date format everywhere: "21 AUG 2026". */
export function formatDevotionalDate(value?: string | null): string {
  if (!value) return "";
  // Date-only strings ("2026-08-21") must not shift by timezone.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (m) {
    const [, y, mo, d] = m;
    return `${Number(d)} ${MONTHS[Number(mo) - 1]} ${y}`;
  }
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
}

/**
 * Scripture presentation: "Isaiah 12:3 · NIV".
 * Accepts refs already carrying a version in brackets/parens/commas.
 */
export function formatScripture(ref?: string | null, version?: string | null): string {
  const raw = (ref ?? "").replace(/\s+/g, " ").trim();
  if (!raw) return "";

  let base = raw;
  let ver = (version ?? "").trim();

  // "Isaiah 12:3 (NIV)" / "[NIV]" / "- NIV" / ", NIV" / "Isaiah 12:3 NIV"
  const bracket = base.match(/[([]\s*([A-Za-z]{2,10})\s*[)\]]\s*$/);
  if (bracket) {
    ver = ver || bracket[1];
    base = base.slice(0, bracket.index).trim();
  } else {
    const trailing = base.match(/[\s,·-]+((?:[A-Z]{2,6}\d?|NKJV|NASB|AMPC))\s*$/);
    if (trailing) {
      ver = ver || trailing[1];
      base = base.slice(0, trailing.index).trim();
    }
  }

  base = base.replace(/[·,;:\-\s]+$/, "").trim();
  ver = ver.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return ver ? `${base} · ${ver}` : base;
}

/** Series presentation: "Know This & Know Peace · Part 121". */
export function formatSeries(series?: string | null): string {
  const raw = (series ?? "").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  const m = raw.match(/^(.*?)[\s·:,-]*\b(part\s*\d+\w*)\s*$/i);
  if (!m) return raw;
  const name = m[1].replace(/[·:,-]\s*$/, "").trim();
  const part = m[2].replace(/^part\s*/i, "Part ").replace(/\s+/g, " ");
  return name ? `${name} · ${part}` : part;
}
