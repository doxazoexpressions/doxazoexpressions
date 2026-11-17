// Issues short-lived signed URLs for devotional audio. Only the shared music
// bed and audio attached to published devotionals are allowed (admins: any).
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const BUCKET = "devotional-audio";
const BED = "_music/bed.mp3";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const body = await req.json().catch(() => ({}));
    const path = typeof body?.path === "string" ? body.path.trim() : "";
    if (!path || path.length > 300 || path.includes("..") || !/^[A-Za-z0-9_\-./]+$/.test(path)) {
      return json({ error: "Invalid path" }, 400);
    }
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    let allowed = path === BED;
    if (!allowed) {
      const { data } = await admin
        .from("devotionals")
        .select("id")
        .eq("status", "published")
        .or(`audio_female_url.eq."${path}",audio_male_url.eq."${path}"`)
        .limit(1);
      allowed = !!data?.length;
    }
    if (!allowed) {
      const auth = req.headers.get("Authorization") ?? "";
      const token = auth.replace(/^Bearer\s+/i, "");
      if (token) {
        const { data: u } = await admin.auth.getUser(token);
        if (u?.user) {
          const { data: isAdmin } = await admin.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
          allowed = !!isAdmin;
        }
      }
    }
    if (!allowed) return json({ error: "Not found" }, 404);

    const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
    if (error || !data?.signedUrl) return json({ error: "Unavailable" }, 404);
    return json({ signedUrl: data.signedUrl });
  } catch (_e) {
    return json({ error: "Server error" }, 500);
  }
});
