// Sends push notifications across all delivery channels:
//   - Web Push (VAPID) to browsers via push_subscriptions
//   - FCM HTTP v1 to Android devices via device_tokens
//   - APNs HTTP/2 to iOS devices via device_tokens
// Admin-only: requires the caller to have the `admin` role.

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:hello@doxazoexpressions.com";

// FCM (Android) — Firebase Admin service account JSON, full object stringified.
const FIREBASE_SERVICE_ACCOUNT_JSON = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON") ?? "";
// APNs (iOS) — auth-key based (p8 .p8 file contents incl. BEGIN/END PRIVATE KEY).
const APNS_KEY_P8 = Deno.env.get("APNS_KEY_P8") ?? "";
const APNS_KEY_ID = Deno.env.get("APNS_KEY_ID") ?? "";
const APNS_TEAM_ID = Deno.env.get("APNS_TEAM_ID") ?? "";
const APNS_BUNDLE_ID = Deno.env.get("APNS_BUNDLE_ID") ?? "app.lovable.7c926cd50e074118871e5ab8fb64751c";
const APNS_PRODUCTION = (Deno.env.get("APNS_PRODUCTION") ?? "false").toLowerCase() === "true";

// ---------- helpers ----------
function b64url(input: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof input === "string") bytes = new TextEncoder().encode(input);
  else if (input instanceof Uint8Array) bytes = input;
  else bytes = new Uint8Array(input);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToDer(pem: string): Uint8Array {
  const body = pem.replace(/-----BEGIN [^-]+-----/, "").replace(/-----END [^-]+-----/, "").replace(/\s+/g, "");
  const bin = atob(body);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ---------- FCM v1 ----------
let fcmTokenCache: { token: string; exp: number } | null = null;
async function getFcmAccessToken(sa: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (fcmTokenCache && fcmTokenCache.exp > now + 60) return fcmTokenCache.token;
  const header = { alg: "RS256", typ: "JWT", kid: sa.private_key_id };
  const claims = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const headerB64 = b64url(JSON.stringify(header));
  const claimsB64 = b64url(JSON.stringify(claims));
  const signingInput = `${headerB64}.${claimsB64}`;
  const key = await crypto.subtle.importKey(
    "pkcs8", pemToDer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput));
  const jwt = `${signingInput}.${b64url(sig)}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`FCM token error: ${JSON.stringify(j)}`);
  fcmTokenCache = { token: j.access_token, exp: now + (j.expires_in ?? 3600) };
  return j.access_token;
}

async function sendFcm(deviceToken: string, title: string, body: string, url: string, sa: any) {
  const accessToken = await getFcmAccessToken(sa);
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          token: deviceToken,
          notification: { title, body },
          data: { path: url, url },
          android: { priority: "HIGH", notification: { channel_id: "default", click_action: "OPEN_DEVOTIONAL" } },
        },
      }),
    }
  );
  if (!res.ok) {
    const errBody = await res.text();
    const err: any = new Error(`FCM ${res.status}: ${errBody}`);
    err.statusCode = res.status;
    throw err;
  }
}

// ---------- APNs ----------
let apnsTokenCache: { token: string; exp: number } | null = null;
async function getApnsJwt(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (apnsTokenCache && apnsTokenCache.exp > now + 60) return apnsTokenCache.token;
  const header = { alg: "ES256", kid: APNS_KEY_ID };
  const claims = { iss: APNS_TEAM_ID, iat: now };
  const headerB64 = b64url(JSON.stringify(header));
  const claimsB64 = b64url(JSON.stringify(claims));
  const signingInput = `${headerB64}.${claimsB64}`;
  const key = await crypto.subtle.importKey(
    "pkcs8", pemToDer(APNS_KEY_P8),
    { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(signingInput))
  );
  const jwt = `${signingInput}.${b64url(sig)}`;
  // APNs tokens are valid up to 1h; refresh every ~50min.
  apnsTokenCache = { token: jwt, exp: now + 50 * 60 };
  return jwt;
}

async function sendApns(deviceToken: string, title: string, body: string, url: string) {
  const host = APNS_PRODUCTION ? "api.push.apple.com" : "api.sandbox.push.apple.com";
  const jwt = await getApnsJwt();
  const res = await fetch(`https://${host}/3/device/${deviceToken}`, {
    method: "POST",
    headers: {
      authorization: `bearer ${jwt}`,
      "apns-topic": APNS_BUNDLE_ID,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      aps: { alert: { title, body }, sound: "default", "mutable-content": 1 },
      path: url,
      url,
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    const err: any = new Error(`APNs ${res.status}: ${errBody}`);
    err.statusCode = res.status;
    throw err;
  }
}

// ---------- handler ----------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Auth: require admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimErr } = await userClient.auth.getClaims(token);
    if (claimErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub as string;
    const { data: roleRow } = await userClient
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const title = (body.title as string) ?? "Today's Devotional";
    const message = (body.body as string) ?? "A fresh word is ready for you.";
    const url = (body.url as string) ?? "/devotional";

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const result = {
      web: { sent: 0, removed: 0, total: 0, skipped: false as boolean | string },
      android: { sent: 0, removed: 0, total: 0, skipped: false as boolean | string },
      ios: { sent: 0, removed: 0, total: 0, skipped: false as boolean | string },
    };

    // ---- Web Push (VAPID) ----
    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
      const { data: subs } = await admin
        .from("push_subscriptions").select("id,endpoint,p256dh,auth_key");
      result.web.total = subs?.length ?? 0;
      const payload = JSON.stringify({ title, body: message, url });
      for (const sub of subs ?? []) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
            payload
          );
          result.web.sent++;
        } catch (err: any) {
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await admin.from("push_subscriptions").delete().eq("id", sub.id);
            result.web.removed++;
          } else {
            console.error("webpush error", err?.statusCode, err?.body);
          }
        }
      }
    } else {
      result.web.skipped = "VAPID keys not configured";
    }

    // ---- Native device tokens ----
    const { data: devices } = await admin
      .from("device_tokens").select("id,token,platform");
    const androidDevs = (devices ?? []).filter((d) => d.platform === "android");
    const iosDevs = (devices ?? []).filter((d) => d.platform === "ios");
    result.android.total = androidDevs.length;
    result.ios.total = iosDevs.length;

    // FCM
    if (androidDevs.length > 0) {
      if (!FIREBASE_SERVICE_ACCOUNT_JSON) {
        result.android.skipped = "FIREBASE_SERVICE_ACCOUNT_JSON not configured";
      } else {
        try {
          const sa = JSON.parse(FIREBASE_SERVICE_ACCOUNT_JSON);
          for (const d of androidDevs) {
            try {
              await sendFcm(d.token, title, message, url, sa);
              result.android.sent++;
            } catch (err: any) {
              const s = err?.statusCode;
              if (s === 404 || s === 400 || s === 403) {
                await admin.from("device_tokens").delete().eq("id", d.id);
                result.android.removed++;
              } else {
                console.error("fcm error", err?.message);
              }
            }
          }
        } catch (e: any) {
          result.android.skipped = `FCM init failed: ${e?.message}`;
        }
      }
    }

    // APNs
    if (iosDevs.length > 0) {
      if (!APNS_KEY_P8 || !APNS_KEY_ID || !APNS_TEAM_ID) {
        result.ios.skipped = "APNS_KEY_P8 / APNS_KEY_ID / APNS_TEAM_ID not configured";
      } else {
        for (const d of iosDevs) {
          try {
            await sendApns(d.token, title, message, url);
            result.ios.sent++;
          } catch (err: any) {
            const s = err?.statusCode;
            if (s === 410 || s === 400) {
              await admin.from("device_tokens").delete().eq("id", d.id);
              result.ios.removed++;
            } else {
              console.error("apns error", err?.message);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-push fatal", err);
    return new Response(JSON.stringify({ error: err?.message ?? "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
