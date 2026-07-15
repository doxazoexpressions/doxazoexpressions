// Public JSON endpoint consumed by the iOS Home Screen Widget (WidgetKit).
// Returns today's devotional in a compact shape. No auth — the widget is
// unauthenticated. Cache friendly.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("devotionals")
      .select("id, title, scripture_reference, excerpt, slug, publish_date")
      .eq("status", "published")
      .lte("publish_date", today)
      .order("publish_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const payload = data
      ? {
          id: data.id,
          slug: data.slug || data.id,
          title: data.title,
          scripture: data.scripture_reference || "",
          excerpt: data.excerpt || "",
          date: data.publish_date,
          url: `https://doxazoexpressions.com/devotional/${data.slug || data.id}`,
          deeplink: `doxazo://devotional/${data.slug || data.id}`,
        }
      : {
          title: "Doxazo Expressions",
          scripture: "",
          excerpt: "A fresh word will arrive shortly.",
          date: today,
          url: "https://doxazoexpressions.com",
          deeplink: "doxazo://",
        };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        // Widget refreshes hourly; allow CDN caching for 10 minutes.
        "Cache-Control": "public, max-age=600, s-maxage=600",
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
