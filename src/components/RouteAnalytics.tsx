import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { track, trackPageView } from "@/lib/analytics";
import { trackLaunchLifecycle } from "@/lib/lifecycleAnalytics";
import { isNative, nativePlatform } from "@/lib/native";

/**
 * Fires a single GA4 / Firebase `page_view` on every SPA route change.
 * Also emits `app_open` once per session so native + web sessions align.
 * Rendered inside <BrowserRouter> in App.tsx.
 */
const RouteAnalytics = () => {
  const location = useLocation();
  const last = useRef<string | null>(null);
  const opened = useRef(false);

  useEffect(() => {
    if (!opened.current) {
      opened.current = true;
      const platform = isNative() ? nativePlatform() : "web";
      track("app_open", { source: "spa", platform });
      // install + retention checkpoints (each fires at most once, ever)
      trackLaunchLifecycle(platform);
    }
  }, []);

  useEffect(() => {
    const path = location.pathname + location.search;
    if (path === last.current) return;
    last.current = path;
    // Defer so <title> updates from Helmet land before we report.
    const id = window.setTimeout(() => trackPageView(path), 50);
    return () => window.clearTimeout(id);
  }, [location.pathname, location.search]);

  return null;
};

export default RouteAnalytics;
