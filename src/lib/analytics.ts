// Unified analytics wrapper.
//   - Web  → Google Analytics 4 (loaded only when VITE_GA4_MEASUREMENT_ID is set)
//   - iOS  → Firebase Analytics via @capacitor-firebase/analytics
// Falls back to a silent no-op if neither provider is available.
//
// Design notes:
//   * SPA page_view is fired manually from <RouteAnalytics /> to avoid
//     double-counting; GA4 is configured with { send_page_view: false }.
//   * Every event fires on BOTH channels so a native web-view session
//     inside the Capacitor shell still lands in GA4 alongside Firebase.
//   * Event names are the canonical set below — please extend the union
//     rather than passing arbitrary strings.

import { Capacitor } from "@capacitor/core";

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
const isNative = typeof window !== "undefined" && Capacitor?.isNativePlatform?.();
let ga4Loaded = false;
let nativeReady = false;

const loadGA4 = () => {
  if (ga4Loaded || !GA4_ID || typeof document === "undefined" || isNative) return;
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

// Hide Firebase plugin specifiers from Rollup so the web build doesn't try to
// resolve their optional `firebase/*` peer dep. These modules only execute on
// native, where Capacitor bridges to the Swift/Kotlin impl.
const loadFirebaseAnalytics = async (): Promise<any> => {
  if (!isNative) return null;
  const id = "@capacitor-firebase" + "/analytics";
  return import(/* @vite-ignore */ id).catch(() => null);
};
const loadFirebaseCrashlytics = async (): Promise<any> => {
  if (!isNative) return null;
  const id = "@capacitor-firebase" + "/crashlytics";
  return import(/* @vite-ignore */ id).catch(() => null);
};

const initNative = async () => {
  if (nativeReady || !isNative) return;
  nativeReady = true;
  const mod = await loadFirebaseAnalytics();
  try {
    await mod?.FirebaseAnalytics?.setEnabled({ enabled: true });
  } catch (err) {
    if (import.meta.env.DEV) console.debug("[analytics] Firebase Analytics unavailable", err);
  }
};

if (typeof window !== "undefined") {
  loadGA4();
  void initNative();
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
    if (isNative) {
      void loadFirebaseAnalytics().then((mod) =>
        mod?.FirebaseAnalytics?.logEvent({ name: event, params: (params as Record<string, string | number | boolean>) ?? {} }),
      ).catch(() => {});
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
  if (isNative) {
    void loadFirebaseAnalytics().then((mod) =>
      mod?.FirebaseAnalytics?.setCurrentScreen({ screenName: path, screenClassOverride: title ?? path }),
    ).catch(() => {});
  }
  if (import.meta.env.DEV) console.debug("[analytics] page_view", path);
};

export const setAnalyticsUser = (userId: string | null) => {
  try {
    if (typeof window.gtag === "function" && GA4_ID) {
      window.gtag("config", GA4_ID, { user_id: userId ?? undefined });
    }
    if (isNative) {
      void loadFirebaseAnalytics().then((mod) => {
        const FA = mod?.FirebaseAnalytics;
        if (!FA) return;
        return userId ? FA.setUserId({ userId }) : FA.setUserId({ userId: null as unknown as string });
      }).catch(() => {});
    }
  } catch {
    /* swallow */
  }
};

// Lightweight non-fatal error reporter. Uses Firebase Crashlytics on native
// and console.error on web (keeps the site free of extra vendor scripts).
export const reportError = (error: unknown, context?: Params) => {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  try {
    if (isNative) {
      void import("@capacitor-firebase/crashlytics").then(({ FirebaseCrashlytics }) => {
        if (context) {
          for (const [key, value] of Object.entries(context)) {
            try { FirebaseCrashlytics.setCustomKey({ key, value: String(value), type: "string" }); } catch { /* ignore */ }
          }
        }
        FirebaseCrashlytics.recordException({ message, stacktrace: stack ? [{ fileName: "js", lineNumber: 0 }] : undefined });
      }).catch(() => {});
    } else if (import.meta.env.PROD) {
      // Kept intentionally quiet on web — no third-party monitoring bundled.
      console.error("[error]", message, context ?? {});
    } else {
      console.error("[error]", message, context ?? {}, stack);
    }
  } catch {
    /* swallow */
  }
};
