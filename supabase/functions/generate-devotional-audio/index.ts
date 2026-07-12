// Generates ElevenLabs narration for a devotional using the fixed Doxazo voice
// mapping and uploads the MP3 to the `devotional-audio` bucket, then updates
// the devotional row's per-voice audio column.
//
// FIXED VOICE MAPPING (do not change without product confirmation):
//   UI "Joy"    (female) → ElevenLabs voice ID: Qggl4b0xRMiqOwhPtVWT
//   UI "Wisdom" (male)   → ElevenLabs voice ID: V904i8ujLitGpMyoTznT
//
// Auth: this function requires a valid Supabase user JWT belonging to a user
// with the `admin` role (checked via public.has_role).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type VoiceKind = "female" | "male";

const VOICE_IDS: Record<VoiceKind, string> = {
  female: "Qggl4b0xRMiqOwhPtVWT", // Joy
  male:   "V904i8ujLitGpMyoTznT", // Wisdom
};

const BUCKET = "devotional-audio";
const MODEL_ID = "eleven_multilingual_v2";

const STANDARD_INTRO =
  "Welcome to Doxazo Expressions, where the presence of God meets us daily, His glory is revealed, and Jesus is glorified through His Word. Let us receive today's devotional.";
const STANDARD_CLOSING =
  "This is Doxazo Expressions. May the presence of God remain with you, may His glory rest upon your day, and may Jesus Christ be revealed and glorified in your life. Amen.";

// Narration order (Declaration is intentionally suppressed for now):
//  1. soft intro music (prepended as audio, not narrated)
//  2. standard Doxazo intro line
//  3. devotional series / part
//  4. today's title
//  5. scripture
//  6. reflection (body)
//  7. prayer section only
//  8. inspiration caption
//  9. standard Doxazo closing line
// 10. soft outro music (appended as audio)
function buildScript(d: {
  title?: string | null;
  series?: string | null;
  day?: number | null;
  scripture_reference?: string | null;
  scripture_text?: string | null;
  body?: string | null;
  prayer_section?: string | null;
  inspiration_caption?: string | null;
}): string {
  const parts: string[] = [];
  parts.push(STANDARD_INTRO);

  const seriesLine = [
    d.series ? d.series.trim() : null,
    d.day ? `Part ${d.day}` : null,
  ].filter(Boolean).join(" — ");
  if (seriesLine) parts.push(seriesLine + ".");

  if (d.title) parts.push(`Today's title: ${d.title.trim()}.`);

  if (d.scripture_reference || d.scripture_text) {
    const ref = d.scripture_reference?.trim();
    const text = d.scripture_text?.trim();
    parts.push(
      `Scripture. ${[ref, text].filter(Boolean).join(" — ")}`,
    );
  }

  if (d.body) parts.push(`Reflection. ${d.body.replace(/\s+/g, " ").trim()}`);

  if (d.prayer_section) parts.push(`Prayer. ${d.prayer_section.trim()}`);

  // Declaration / decree_and_declare intentionally omitted per current directive.

  if (d.inspiration_caption) {
    parts.push(`Inspiration. ${d.inspiration_caption.trim()}`);
  }

  parts.push(STANDARD_CLOSING);

  return parts.join(" \n\n ");
}

// Generate (and cache) a soft, loopable ambient music bed via ElevenLabs
// sound-generation. Stored at `_music/bed.mp3` in the audio bucket so the
// client can layer it underneath the narration at a low volume as calm
// background atmosphere while Joy/Wisdom read the devotional.
async function ensureMusicBed(
  admin: ReturnType<typeof createClient>,
  apiKey: string,
): Promise<void> {
  const path = `_music/bed.mp3`;
  try {
    const { data: existing } = await admin.storage.from(BUCKET).download(path);
    if (existing) return;
  } catch { /* fall through to generate */ }

  const prompt =
    "Soft, reverent worship pad. Warm gentle piano and ambient strings, slow evolving, peaceful and prayerful. No drums, no percussion, no vocals, no melody hook. Seamless loopable devotional background bed.";

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: 22,
        prompt_influence: 0.5,
      }),
    });
    if (!res.ok) {
      console.warn("music bed generation failed", res.status, await res.text());
      return;
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    await admin.storage.from(BUCKET).upload(path, bytes, {
      contentType: "audio/mpeg",
      upsert: true,
      cacheControl: "31536000",
    });
  } catch (e) {
    console.warn("music bed error", (e as Error).message);
  }
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ELEVENLABS_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is an admin
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing bearer token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id, _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin role required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const devotionalId: string | undefined = body.devotionalId;
    const voice: VoiceKind = body.voice === "male" ? "male" : "female";
    if (!devotionalId) {
      return new Response(JSON.stringify({ error: "devotionalId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: dev, error: devErr } = await admin
      .from("devotionals").select("*").eq("id", devotionalId).maybeSingle();
    if (devErr || !dev) {
      return new Response(JSON.stringify({ error: "Devotional not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const script = buildScript(dev);
    if (!script || script.length < 20) {
      return new Response(JSON.stringify({ error: "Devotional has no content to narrate" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const voiceId = VOICE_IDS[voice];
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text: script,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      },
    );
    if (!ttsRes.ok) {
      const detail = await ttsRes.text();
      console.error("ElevenLabs TTS failed", ttsRes.status, detail);
      const friendly = ttsRes.status === 402
        ? "Your ElevenLabs plan does not allow API access to these library voices. Upgrade the ElevenLabs account (Starter tier or higher) or clone Joy/Wisdom into your account and update the voice IDs."
        : `ElevenLabs TTS failed (${ttsRes.status}).`;
      return new Response(
        JSON.stringify({ error: friendly, status: ttsRes.status, details: detail }),
        { status: ttsRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const narration = new Uint8Array(await ttsRes.arrayBuffer());

    // Wrap with soft intro/outro music beds (cached in storage). MP3 frame
    // concatenation plays back sequentially in standard audio elements.
    const [intro, outro] = await Promise.all([
      getMusicBed(admin, apiKey, "intro"),
      getMusicBed(admin, apiKey, "outro"),
    ]);
    const chunks = [intro, narration, outro].filter(Boolean) as Uint8Array[];
    const total = chunks.reduce((n, c) => n + c.byteLength, 0);
    const audio = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) { audio.set(c, offset); offset += c.byteLength; }

    const path = `${devotionalId}/${voice}-${Date.now()}.mp3`;
    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, audio, {
      contentType: "audio/mpeg",
      upsert: true,
      cacheControl: "3600",
    });
    if (upErr) {
      return new Response(JSON.stringify({ error: "Storage upload failed", details: upErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const col = voice === "female" ? "audio_female_url" : "audio_male_url";
    const statusCol = voice === "female" ? "audio_female_status" : "audio_male_status";
    const { error: updErr } = await admin
      .from("devotionals")
      .update({ [col]: path, [statusCol]: "published" })
      .eq("id", devotionalId);
    if (updErr) {
      return new Response(JSON.stringify({ error: "Devotional update failed", details: updErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, voice, path, bytes: audio.byteLength }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("generate-devotional-audio error", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
