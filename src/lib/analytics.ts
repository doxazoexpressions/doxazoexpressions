// Unified analytics wrapper.
//   - Web  → Google Analytics 4 (loaded only when VITE_GA4_MEASUREMENT_ID is set)
//   - Native shells intentionally use the same web GA4 path for now.
// Falls back to a silent no-op if no provider is available.
//
// Design notes:
//   * SPA page_view is fired manually from <RouteAnalytics /> to avoid
//     double-counting; GA4 is configured with { send_page_view: false }.
//   * Firebase Analytics / Crashlytics are intentionally not initialized here
//     until the native iOS build has a verified GoogleService-Info.plist.
//   * Event names are the canonical set below — please extend the union
//     rather than passing arbitrary strings.

export type AnalyticsEvent =
  // Navigation / CTAs
  | "page_view"
  | "cta_today_devotional"
  | "cta_browse_archive"
  | "cta_explore_categories"
  | "outbound_click"
  | "scroll_depth"
  // Content
  | "devotional_opened"
  | "devotional_completed"
  | "devotional_share"
  | "archive_opened"
  | "theme_browse_opened"
  | "category_open"
  // Audio
  | "audio_started"
  | "audio_paused"
  | "audio_completed"
  | "sleep_timer_used"
  // Auth
  | "sign_in_started"
  | "sign_in_completed"
  // Engagement tools
  | "journal_cta_clicked"
  | "journal_entry_created"
  | "journal_entry_updated"
  | "highlight_created"
  | "plan_opened"
  | "plan_started"
  | "plan_completed"
  | "streak_viewed"
  | "goals_opened"
  | "scripture_search_used"
  | "search_submit"
  // Community
  | "group_opened"
  | "group_joined"
  // App lifecycle (native)
  | "app_open"
  | "onboarding_started"
  | "onboarding_completed"
  | "notification_enabled"
  | "widget_opened"
  | "shortcut_used"
  // Legacy — kept for existing call sites
  | "devotional_open"
  | "contact_submit";

type Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, opts?: { props?: Params }) => void;
  }
}

const GA4_ID = (import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined)?.trim();
let ga4Loaded = false;

const loadGA4 = () => {
  if (ga4Loaded || !GA4_ID || typeof document === "undefined") return;
  ga4Loaded = true;
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  // Disable auto page_view; SPA routing fires it manually.
  window.gtag("config", GA4_ID, { send_page_view: false, anonymize_ip: true });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);
};

if (typeof window !== "undefined") {
  loadGA4();
}


const sanitizeParams = (props?: Params): Params | undefined => {
  if (!props) return undefined;
  const out: Params = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null) continue;
    out[k] = typeof v === "object" ? JSON.stringify(v) : v;
  }
  return out;
};

export const track = (event: AnalyticsEvent, props?: Params) => {
  const params = sanitizeParams(props);
  try {
    if (typeof window === "undefined") return;

    if (typeof window.gtag === "function") {
      window.gtag("event", event, params ?? {});
    }
    if (typeof window.plausible === "function") {
      window.plausible(event, params ? { props: params } : undefined);
    }
    if (import.meta.env.DEV) console.debug("[analytics]", event, params ?? {});
  } catch {
    /* swallow */
  }
};

export const trackPageView = (path: string, title?: string) => {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function" && GA4_ID) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_title: title ?? document.title,
      page_location: window.location.href,
    });
  }
  if (import.meta.env.DEV) console.debug("[analytics] page_view", path);
};

export const setAnalyticsUser = (userId: string | null) => {
  try {
    if (typeof window.gtag === "function" && GA4_ID) {
      window.gtag("config", GA4_ID, { user_id: userId ?? undefined });
    }
  } catch {
    /* swallow */
  }
};

// Lightweight non-fatal error reporter. Kept local-only for now so native
// startup is not coupled to Firebase while the TestFlight build is stabilized.
export const reportError = (error: unknown, context?: Params) => {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  try {
    if (import.meta.env.PROD) {
      // Kept intentionally quiet on web — no third-party monitoring bundled.
      console.error("[error]", message, context ?? {});
    } else {
      console.error("[error]", message, context ?? {}, stack);
    }
  } catch {
    /* swallow */
  }
};
