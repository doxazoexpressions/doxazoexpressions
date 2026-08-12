// OAuth sign-in wrapper.
//
// The Lovable auth helper posts the browser to the RELATIVE broker path
// `/~oauth/initiate`, which only exists on Lovable-hosted origins (the preview
// hosts and the published domain). Inside the sandbox dev server or a bundled
// Capacitor app that path is not served, so the SPA router catches it and the
// user sees the 404 page instead of the provider consent screen.
//
// Web/preview: point the broker (and return URL) at the published origin when the
// current origin cannot serve the broker itself.
//
// Native (iOS/Android): the app has no server at all, so we drive the flow by
// hand — open the published broker in the system browser, let it return to
// `${PUBLISHED_ORIGIN}/auth/callback?native=1`, and that page bounces the tokens
// back into the app via the `doxazo://oauth/callback` deep link.
import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/supabase/client";
import { isNative } from "@/lib/native";

export const PUBLISHED_ORIGIN = "https://www.doxazoexpressions.com";
export const NATIVE_OAUTH_REDIRECT = "doxazo://oauth/callback";

const HOSTED_HOST = /(^|\.)(lovable\.app|lovableproject\.com|doxazoexpressions\.com)$/i;

/** True when window.location can serve `/~oauth/initiate` itself. */
export const canServeOAuthBroker = () =>
  typeof window !== "undefined" &&
  /^https?:$/.test(window.location.protocol) &&
  HOSTED_HOST.test(window.location.hostname);

const randomState = () =>
  "dxnat-" +
  [...crypto.getRandomValues(new Uint8Array(16))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const STATE_KEY = "doxazo:oauth_state";

/** Parse tokens out of either the query string or the fragment of a callback URL. */
export const parseOAuthCallback = (url: string) => {
  let search = "";
  let hash = "";
  try {
    const u = new URL(url);
    search = u.search.replace(/^\?/, "");
    hash = u.hash.replace(/^#/, "");
  } catch {
    const [, q = "", h = ""] = url.match(/\?([^#]*)#?(.*)$/) ?? [];
    search = q;
    hash = h;
  }
  const params = new URLSearchParams(search);
  new URLSearchParams(hash).forEach((v, k) => {
    if (!params.has(k)) params.set(k, v);
  });
  return {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
    state: params.get("state"),
    error: params.get("error_description") || params.get("error"),
  };
};

/** Called from the native deep-link listener when doxazo://oauth/callback arrives. */
export const completeNativeOAuth = async (url: string) => {
  const { access_token, refresh_token, state, error } = parseOAuthCallback(url);
  const expected = sessionStorage.getItem(STATE_KEY) ?? localStorage.getItem(STATE_KEY);
  localStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);

  try {
    const { Browser } = await import("@capacitor/browser");
    await Browser.close();
  } catch {}

  if (error) return { error: new Error(error) };
  if (expected && state && state !== expected) return { error: new Error("State is invalid") };
  if (!access_token || !refresh_token) return { error: new Error("No tokens received") };

  const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
  if (sessionError) return { error: sessionError };
  return { error: null as null };
};

const signInNative = async (
  provider: "google" | "apple",
  extraParams?: Record<string, string>,
) => {
  const state = randomState();
  localStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    ...extraParams,
    provider,
    // No query string here: Apple's Services ID Return URLs must match exactly
    // and reject any `?...` suffix (that is why Google worked but Apple failed).
    redirect_uri: `${PUBLISHED_ORIGIN}/auth/callback`,
    state,
  });

  try {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({
      url: `${PUBLISHED_ORIGIN}/~oauth/initiate?${params.toString()}`,
      presentationStyle: "fullscreen",
    });
    // Tokens arrive later through the deep link -> completeNativeOAuth().
    return { error: null as null, redirected: true as const };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
};

export const signInWithOAuth = async (
  provider: "google" | "apple",
  extraParams?: Record<string, string>,
) => {
  if (isNative()) return signInNative(provider, extraParams);

  const hosted = canServeOAuthBroker();
  const auth = createLovableAuth(
    hosted ? undefined : { oauthBrokerUrl: `${PUBLISHED_ORIGIN}/~oauth/initiate` },
  );

  const result = await auth.signInWithOAuth(provider, {
    redirect_uri: hosted ? window.location.origin : `${PUBLISHED_ORIGIN}/auth/callback`,
    extraParams,
  });

  if (result.redirected || result.error) return result;

  try {
    await supabase.auth.setSession(result.tokens);
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) } as const;
  }
  return result;
};
