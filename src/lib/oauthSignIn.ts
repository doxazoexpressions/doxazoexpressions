// OAuth sign-in wrapper.
//
// The Lovable auth helper posts the browser to the RELATIVE broker path
// `/~oauth/initiate`, which only exists on Lovable-hosted origins (the preview
// hosts and the published domain). Inside the sandbox dev server or a bundled
// Capacitor app that path is not served, so the SPA router catches it and the
// user sees the 404 page instead of the provider consent screen.
//
// Here we point the broker (and the return URL) at the published origin whenever
// the current origin cannot serve the broker itself.
import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/supabase/client";

export const PUBLISHED_ORIGIN = "https://www.doxazoexpressions.com";

const HOSTED_HOST = /(^|\.)(lovable\.app|lovableproject\.com|doxazoexpressions\.com)$/i;

/** True when window.location can serve `/~oauth/initiate` itself. */
export const canServeOAuthBroker = () =>
  typeof window !== "undefined" &&
  /^https?:$/.test(window.location.protocol) &&
  HOSTED_HOST.test(window.location.hostname);

export const signInWithOAuth = async (
  provider: "google" | "apple",
  extraParams?: Record<string, string>,
) => {
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
