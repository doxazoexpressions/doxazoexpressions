import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v5.9.6/index.ts";
import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, reason: "method-not-allowed" }, 405);

  const TEAM_ID = Deno.env.get("APPLE_TEAM_ID");
  const SERVICES_ID = Deno.env.get("APPLE_SERVICES_ID");
  const KEY_ID = Deno.env.get("APPLE_KEY_ID");
  const PRIVATE_KEY = Deno.env.get("APPLE_PRIVATE_KEY");
  const DB_URL = Deno.env.get("SUPABASE_DB_URL");

  if (!TEAM_ID || !SERVICES_ID || !KEY_ID || !PRIVATE_KEY || !DB_URL) {
    return json({ ok: false, reason: "config-missing" }, 500);
  }

  let user_id: string | undefined;
  try {
    const body = await req.json();
    user_id = typeof body?.user_id === "string" ? body.user_id : undefined;
  } catch {
    // ignore
  }
  if (!user_id) return json({ ok: false, reason: "invalid-body" }, 400);

  // 1. Look up the Apple identity's refresh token directly in Postgres.
  let refreshToken: string | null = null;
  const client = new Client(DB_URL);
  try {
    await client.connect();
    const result = await client.queryObject<{ provider_refresh_token: string | null }>(
      `SELECT (identity_data->>'provider_refresh_token') AS provider_refresh_token
         FROM auth.identities
        WHERE user_id = $1 AND provider = 'apple'
        LIMIT 1`,
      [user_id],
    );
    refreshToken = result.rows[0]?.provider_refresh_token ?? null;
  } catch (e) {
    console.log(JSON.stringify({ event: "apple-revoke-on-delete", user_id, error: "db-query-failed", message: (e as Error).message }));
    return json({ ok: false, reason: "db-query-failed" }, 500);
  } finally {
    try { await client.end(); } catch { /* noop */ }
  }

  if (!refreshToken) {
    console.log(JSON.stringify({ event: "apple-revoke-on-delete", user_id, skipped: true, reason: "no-apple-identity" }));
    return json({ skipped: true, reason: "no-apple-identity" }, 200);
  }

  // 2. Build the client_secret JWT (ES256).
  let jwt: string;
  try {
    const pem = PRIVATE_KEY.includes("\\n") ? PRIVATE_KEY.replace(/\\n/g, "\n") : PRIVATE_KEY;
    const key = await importPKCS8(pem.trim(), "ES256");
    const now = Math.floor(Date.now() / 1000);
    jwt = await new SignJWT({})
      .setProtectedHeader({ alg: "ES256", kid: KEY_ID })
      .setIssuer(TEAM_ID)
      .setIssuedAt(now)
      .setExpirationTime(now + 300)
      .setAudience("https://appleid.apple.com")
      .setSubject(SERVICES_ID)
      .sign(key);
  } catch (e) {
    console.log(JSON.stringify({ event: "apple-revoke-on-delete", user_id, error: "jwt-sign-failed", message: (e as Error).message }));
    return json({ ok: false, reason: "jwt-sign-failed" }, 500);
  }

  // 3. Revoke with Apple.
  const body = new URLSearchParams({
    client_id: SERVICES_ID,
    client_secret: jwt,
    token: refreshToken,
    token_type_hint: "refresh_token",
  }).toString();

  const appleRes = await fetch("https://appleid.apple.com/auth/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const status = appleRes.status;
  let appleError: string | undefined;
  const text = await appleRes.text();
  if (status !== 200) {
    try { appleError = JSON.parse(text)?.error; } catch { /* noop */ }
  }

  console.log(JSON.stringify({ event: "apple-revoke-on-delete", user_id, status, ok: status === 200, apple_error: appleError }));

  if (status === 200) return json({ ok: true }, 200);
  if (status === 400 && appleError === "invalid_client") return json({ ok: false, reason: "apple-invalid-client" }, 502);
  if (status === 400 && appleError === "invalid_grant") return json({ ok: false, reason: "apple-invalid-grant" }, 502);
  return json({ ok: false, reason: "apple-other", status }, 502);
});
