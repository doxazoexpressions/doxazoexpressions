// Lightweight analytics wrapper. No-ops if no provider is loaded.
type EventName =
  | "cta_today_devotional"
  | "cta_browse_archive"
  | "cta_explore_categories"
  | "devotional_open"
  | "devotional_share"
  | "search_submit"
  | "category_open"
  | "contact_submit";

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export const track = (event: EventName, props?: Record<string, unknown>) => {
  try {
    if (typeof window === "undefined") return;
    if (typeof window.plausible === "function") {
      window.plausible(event, props ? { props } : undefined);
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", event, props ?? {});
    }
    // Always log in dev for visibility.
    if (import.meta.env.DEV) console.debug("[analytics]", event, props ?? {});
  } catch {
    /* swallow */
  }
};
