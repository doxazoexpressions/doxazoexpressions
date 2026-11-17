import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { BACKUP_BUCKETS, BACKUP_LINK_SECONDS, canExportStorage } from "../_shared/storageBackup.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return json({ error: "Storage service unavailable" }, 500);
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!await canExportStorage(client, token)) return json({ error: "Admin role required" }, 403);
    // No caller-selected bucket, path, or user ID is accepted.
    const body = await req.text();
    if (body && body.trim() !== "{}") return json({ error: "No parameters accepted" }, 400);
    const files: { bucket: string; path: string; size_bytes: number; last_modified: string; download_url: string }[] = [];
    for (const bucket of BACKUP_BUCKETS) {
      const paths: { path: string; size: number; modified: string }[] = [];
      const queue = [""];
      while (queue.length) {
        const prefix = queue.shift();
        if (prefix === undefined) break;
        for (let offset = 0; ; offset += 1000) {
          const { data, error } = await client.storage.from(bucket).list(prefix, {
            limit: 1000, offset, sortBy: { column: "name", order: "asc" },
          });
          if (error) throw new Error("Could not list storage files");
          for (const item of data ?? []) {
            const path = prefix ? `${prefix}/${item.name}` : item.name;
            if (item.id === null) { queue.push(path); continue; }
            paths.push({ path, size: Number(item.metadata?.size ?? 0), modified: item.updated_at ?? item.created_at ?? "" });
          }
          if (!data || data.length < 1000) break;
        }
      }
      for (let offset = 0; offset < paths.length; offset += 100) {
        const batch = paths.slice(offset, offset + 100);
        const { data, error } = await client.storage.from(bucket).createSignedUrls(
          batch.map((file) => file.path), BACKUP_LINK_SECONDS, { download: true },
        );
        if (error || !data || data.length !== batch.length) throw new Error("Could not create all download links");
        for (let i = 0; i < batch.length; i++) {
          const link = data[i];
          const file = batch[i];
          if (!link?.signedUrl || link.error || !file) throw new Error("Could not create all download links");
          files.push({ bucket, path: file.path, size_bytes: file.size, last_modified: file.modified, download_url: link.signedUrl });
        }
      }
    }
    return json({ files, total_bytes: files.reduce((sum, file) => sum + file.size_bytes, 0), expires_at: new Date(Date.now() + BACKUP_LINK_SECONDS * 1000).toISOString() });
  } catch {
    return json({ error: "Could not prepare a complete storage backup. Please try again." }, 500);
  }
});