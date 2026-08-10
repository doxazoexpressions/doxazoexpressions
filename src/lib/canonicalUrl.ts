/**
 * Canonical public URL helper.
 *
 * ROOT CAUSE THIS FIXES: inside the Capacitor shell `window.location.origin`
 * is `capacitor://localhost`, so anything that shared `window.location.href`
 * produced dead links like `capacitor://localhost/devotional`.
 * Every share/copy path must go through here instead.
 */

export const PUBLIC_ORIGIN = "https://www.doxazoexpressions.com";

const isPublicHttpOrigin = (origin: string) =>
  /^https?:\/\//i.test(origin) &&
  !/localhost|127\.0\.0\.1|^capacitor:|^ionic:|^file:/i.test(origin);

/** Absolute, publicly reachable URL for an in-app path. */
export function canonicalUrl(path?: string): string {
  const raw = path ?? (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
  const clean = raw.startsWith("http")
    ? raw
    : `${PUBLIC_ORIGIN}${raw.startsWith("/") ? "" : "/"}${raw}`;
  try {
    const u = new URL(clean);
    if (!isPublicHttpOrigin(u.origin)) {
      return `${PUBLIC_ORIGIN}${u.pathname}${u.search}`;
    }
    // Always normalise onto the canonical host so previews/shell hosts don't leak.
    return `${PUBLIC_ORIGIN}${u.pathname}${u.search}`;
  } catch {
    return PUBLIC_ORIGIN;
  }
}

/** Canonical URL for a devotional, preferring the slug for readable links. */
export function devotionalUrl(idOrSlug?: string | null, slug?: string | null): string {
  const key = (slug || idOrSlug || "").trim();
  return canonicalUrl(key ? `/devotional/${key}` : "/devotional");
}
