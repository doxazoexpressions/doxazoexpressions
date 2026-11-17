// Admin-only: returns a CSV manifest of every file in every storage bucket.
// Read-only — changes no bucket settings or permissions.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (b: unknown, s: number) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const csvCell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (!token) return json({ error: "Admin role required" }, 403);
    const { data: u } = await admin.auth.getUser(token);
    if (!u?.user) return json({ error: "Admin role required" }, 403);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Admin role required" }, 403);

    const { data: buckets, error: bErr } = await admin.storage.listBuckets();
    if (bErr) return json({ error: "Could not list buckets" }, 500);

    const rows: string[] = ["bucket,path,size_bytes,last_modified"];
    for (const b of buckets ?? []) {
      const queue: string[] = [""];
      while (queue.length) {
        const prefix = queue.shift()!;
        for (let offset = 0; ; offset += 1000) {
          const { data, error } = await admin.storage.from(b.name).list(prefix, { limit: 1000, offset });
          if (error) break;
          for (const item of data ?? []) {
            const path = prefix ? `${prefix}/${item.name}` : item.name;
            if (item.id === null) { queue.push(path); continue; } // folder
            const meta = (item.metadata ?? {}) as { size?: number };
            rows.push([b.name, path, meta.size ?? "", item.updated_at ?? item.created_at ?? ""].map(csvCell).join(","));
          }
          if (!data || data.length < 1000) break;
        }
      }
    }

    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(rows.join("\n") + "\n", {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="storage-manifest-${stamp}.csv"`,
      },
    });
  } catch (_e) {
    return json({ error: "Server error" }, 500);
  }
});
