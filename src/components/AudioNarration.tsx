import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, User, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type Props = {
  title: string;
  scripture?: string | null;
  body: string;
  declaration?: string | null;
  audioUrl?: string | null;
};

type VoiceKind = "female" | "male";

const VOICE_HINTS: Record<VoiceKind, string[]> = {
  female: ["samantha", "victoria", "karen", "moira", "tessa", "female", "google us english", "en-us-standard-c", "susan", "zira", "allison"],
  male:   ["daniel", "alex", "fred", "male", "google uk english male", "en-gb-standard-b", "david", "james", "mark"],
};

function pickVoice(voices: SpeechSynthesisVoice[], kind: VoiceKind): SpeechSynthesisVoice | null {
  const en = voices.filter((v) => /^en/i.test(v.lang));
  const pool = en.length ? en : voices;
  const hints = VOICE_HINTS[kind];
  for (const h of hints) {
    const hit = pool.find((v) => v.name.toLowerCase().includes(h));
    if (hit) return hit;
  }
  // Deterministic fallback: female = first pool voice, male = last.
  return kind === "female" ? pool[0] ?? null : pool[pool.length - 1] ?? null;
}

/**
 * Devotional audio narration. Prefers a real audio_url when present; otherwise
 * uses the browser SpeechSynthesis API with male/female voice selection.
 * Fully client-side — no gateway calls, works offline once the page is cached.
 */
const AudioNarration = ({ title, scripture, body, declaration, audioUrl }: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const [voiceKind, setVoiceKind] = useState<VoiceKind>("female");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);

  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      try { window.speechSynthesis.cancel(); } catch {}
    };
  }, [supported]);

  const script = useMemo(() => {
    const parts = [title];
    if (scripture) parts.push(scripture);
    parts.push(body.replace(/\s+/g, " ").trim());
    if (declaration) parts.push(`Declaration. ${declaration}`);
    return parts.join(". ");
  }, [title, scripture, body, declaration]);

  const startTTS = () => {
    if (!supported) return;
    try { window.speechSynthesis.cancel(); } catch {}
    const utter = new SpeechSynthesisUtterance(script);
    const v = pickVoice(voices, voiceKind);
    if (v) utter.voice = v;
    utter.rate = 0.98;
    utter.pitch = voiceKind === "female" ? 1.05 : 0.9;
    utter.onend = () => setState("idle");
    utter.onerror = () => setState("idle");
    window.speechSynthesis.speak(utter);
    setState("playing");
    track("devotional_open", { audio: "tts", voice: voiceKind });
  };

  const onPlay = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setState("playing");
      return;
    }
    if (state === "paused" && supported) {
      window.speechSynthesis.resume();
      setState("playing");
      return;
    }
    startTTS();
  };

  const onPause = () => {
    if (audioUrl && audioRef.current) { audioRef.current.pause(); setState("paused"); return; }
    if (supported) { window.speechSynthesis.pause(); setState("paused"); }
  };

  const onRestart = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setState("playing");
      return;
    }
    startTTS();
  };

  const switchVoice = (kind: VoiceKind) => {
    setVoiceKind(kind);
    if (audioUrl) return;
    if (state !== "idle") startTTS();
  };

  const usingHostedAudio = !!audioUrl;

  return (
    <section
      aria-label="Listen to today's devotional"
      className="mb-8 rounded-xl border border-accent/25 bg-accent/5 p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <Volume2 className="w-4 h-4 text-accent" aria-hidden="true" />
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Listen to today's devotional
        </h3>
      </div>

      {usingHostedAudio && (
        <audio ref={audioRef} src={audioUrl!} preload="none" onEnded={() => setState("idle")} className="hidden" />
      )}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {state !== "playing" ? (
          <Button onClick={onPlay} size="sm" className="gap-2 min-h-11" aria-label="Play narration">
            <Play className="w-4 h-4" /> Play
          </Button>
        ) : (
          <Button onClick={onPause} size="sm" variant="secondary" className="gap-2 min-h-11" aria-label="Pause narration">
            <Pause className="w-4 h-4" /> Pause
          </Button>
        )}
        <Button onClick={onRestart} size="sm" variant="outline" className="gap-2 min-h-11" aria-label="Restart narration">
          <RotateCcw className="w-4 h-4" /> Restart
        </Button>

        {!usingHostedAudio && supported && (
          <div className="ml-auto inline-flex rounded-lg border border-border overflow-hidden" role="group" aria-label="Choose voice">
            <button
              onClick={() => switchVoice("female")}
              className={`px-3 py-2 text-xs font-medium min-h-11 inline-flex items-center gap-1.5 ${voiceKind === "female" ? "bg-accent text-accent-foreground" : "bg-transparent text-foreground/80"}`}
              aria-pressed={voiceKind === "female"}
            >
              <User2 className="w-3.5 h-3.5" /> Female
            </button>
            <button
              onClick={() => switchVoice("male")}
              className={`px-3 py-2 text-xs font-medium min-h-11 inline-flex items-center gap-1.5 ${voiceKind === "male" ? "bg-accent text-accent-foreground" : "bg-transparent text-foreground/80"}`}
              aria-pressed={voiceKind === "male"}
            >
              <User className="w-3.5 h-3.5" /> Male
            </button>
          </div>
        )}
      </div>
      {!usingHostedAudio && !supported && (
        <p className="text-xs text-muted-foreground">Audio narration isn't supported on this device's browser.</p>
      )}
      {!usingHostedAudio && supported && (
        <p className="text-xs text-muted-foreground">
          Narrated using your device's built-in voice. Choose male or female.
        </p>
      )}
    </section>
  );
};

export default AudioNarration;
