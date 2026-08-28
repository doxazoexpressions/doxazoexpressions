import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Route-level scroll reset.
 *
 * The app scrolls the document (window), not an inner container, so resetting
 * window is sufficient for both web and the Capacitor WebView. Intentional
 * navigation (PUSH/REPLACE) opens at the top; POP (browser/native Back) is
 * left alone so returning to content preserves the reading position.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === "POP") return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;
