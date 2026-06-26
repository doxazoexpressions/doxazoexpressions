// Lovable-managed edge function: generate-social-pack
// Verifies admin role, calls Lovable AI Gateway with a strict Doxazo voice prompt,
// upserts the result into public.social_packs.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return json({ error: "LOVABLE_API_KEY missing" }, 500);
    }

    // Auth: verify caller is admin
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await userClient.auth.getUser();
    const user = userRes?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden" }, 403);

    const { devotional_id } = await req.json();
    if (!devotional_id || typeof devotional_id !== "string") {
      return json({ error: "devotional_id required" }, 400);
    }

    const { data: dev, error: devErr } = await admin
      .from("devotionals")
      .select("id,title,scripture_reference,scripture_text,body,excerpt,category")
      .eq("id", devotional_id)
      .maybeSingle();
    if (devErr || !dev) return json({ error: "Devotional not found" }, 404);

    const system = `You are Doxazo Expressions' social copywriter. Voice: scriptural, premium, clear, spiritually weighty, calm. Never gimmicky, noisy, or over-long. Do NOT copy the devotional verbatim — adapt it natively for each platform. Return ONLY valid JSON matching the schema.`;

    const user_prompt = `Devotional:
Title: ${dev.title}
Scripture: ${dev.scripture_reference ?? ""} ${dev.scripture_text ? `— "${dev.scripture_text}"` : ""}
Body:
${dev.body}

Produce a daily social pack as JSON with EXACTLY these keys (all strings):
{
  "instagram_caption": "Warm, reflective IG caption ~120-180 words ending with a clear CTA to read today's devotional.",
  "facebook_caption": "Slightly longer, conversational FB caption ~150-220 words.",
  "x_post": "One single tweet ≤ 270 chars, punchy, high-clarity, no hashtags inline (hashtags go in their field).",
  "tiktok_script": "Spoken 20-45s script. Open with a strong hook line, deliver one truth, close with a soft CTA.",
  "reel_hook": "One short hook line (≤ 12 words) for the first 2 seconds of a Reel.",
  "quote_graphic": "One strong excerpt or scripture statement (≤ 22 words) for a Canva quote card.",
  "story_cta": "One short Story/Status CTA line.",
  "notification_cta": "One short push-notification line (≤ 90 chars).",
  "hashtags_instagram": "8-12 space-separated hashtags, Christian/devotional, no banned tags.",
  "hashtags_facebook": "4-6 hashtags.",
  "hashtags_x": "2-3 hashtags.",
  "hashtags_tiktok": "5-8 hashtags including 1-2 niche tags.",
  "canva_headline": "Graphic title (≤ 7 words).",
  "canva_excerpt": "One short paragraph (≤ 35 words) for the graphic body.",
  "canva_scripture": "Scripture reference only (e.g. 'Psalm 145:8').",
  "canva_cta": "Footer CTA line (e.g. 'Read today's devotional at doxazoexpressions.com')."
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "raw-fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user_prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return json({ error: `AI gateway error ${aiRes.status}: ${txt.slice(0, 500)}` }, 502);
    }
    const aiJson = await aiRes.json();
    const content = aiJson?.choices?.[0]?.message?.content;
    let pack: Record<string, string> = {};
    try {
      pack = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      return json({ error: "AI returned non-JSON content", raw: content }, 502);
    }

    const allowed = [
      "instagram_caption","facebook_caption","x_post","tiktok_script","reel_hook",
      "quote_graphic","story_cta","notification_cta",
      "hashtags_instagram","hashtags_facebook","hashtags_x","hashtags_tiktok",
      "canva_headline","canva_excerpt","canva_scripture","canva_cta",
    ];
    const row: Record<string, unknown> = { devotional_id };
    for (const k of allowed) if (typeof pack[k] === "string") row[k] = pack[k];

    const { data: saved, error: upErr } = await admin
      .from("social_packs")
      .upsert(row, { onConflict: "devotional_id" })
      .select()
      .maybeSingle();
    if (upErr) return json({ error: upErr.message }, 500);

    return json({ pack: saved });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
