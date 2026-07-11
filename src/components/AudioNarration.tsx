import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, User, User2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import {
  VoiceKind,
  getVoicePreference,
  setVoicePreference,
  resolveAudioUrl,
  DEFAULT_VOICE_PATHS,
} from "@/lib/devotionalAudio";

type Props = {
  title: string;
  scripture?: string | null;
  body: string;
  declaration?: string | null;
  /** Legacy single-URL fallback. */
  audioUrl?: string | null;
  audioMaleUrl?: string | null;
  audioFemaleUrl?: string | null;
  defaultVoice?: VoiceKind | null;
};

const TTS_HINTS: Record<VoiceKind, string[]> = {
  female: ["samantha", "victoria", "karen", "moira", "tessa", "female", "google us english", "susan", "zira", "allison"],
  male:   ["daniel", "alex", "fred", "male", "google uk english male", "david", "james", "mark"],
};

function pickTtsVoice(voices: SpeechSynthesisVoice[], kind: VoiceKind) {
  const en = voices.filter((v) => /^en/i.test(v.lang));
  const pool = en.length ? en : voices;
  for (const h of TTS_HINTS[kind]) {
    const hit = pool.find((v) => v.name.toLowerCase().includes(h));
    if (hit) return hit;
  }
  return kind === "female" ? pool[0] ?? null : pool[pool.length - 1] ?? null;
}

const AudioNarration = ({
  title, scripture, body, declaration,
  audioUrl, audioMaleUrl, audioFemaleUrl, defaultVoice,
}: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [voiceKind, setVoiceKind] = useState<VoiceKind>(() => defaultVoice ?? getVoicePreference());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [usingTts, setUsingTts] = useState(false);
  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Resolve the correct stored URL for the chosen voice, with fallbacks.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const primary = voiceKind === "female" ? audioFemaleUrl : audioMaleUrl;
      const secondary = voiceKind === "female" ? audioMaleUrl : audioFemaleUrl;
      const source = primary || secondary || audioUrl || null;
      const url = await resolveAudioUrl(source);
      if (!cancelled) {
        setResolvedUrl(url);
        setUsingTts(!url);
      }
    })();
    return () => { cancelled = true; };
  }, [voiceKind, audioFemaleUrl, audioMaleUrl, audioUrl]);

  useEffect(() => {
    if (!ttsSupported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { try { window.speechSynthesis.cancel(); } catch {} };
  }, [ttsSupported]);

  // Reset player when devotional/audio changes
  useEffect(() => {
    setState("idle");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (ttsSupported) { try { window.speechSynthesis.cancel(); } catch {} }
  }, [resolvedUrl]);

  const script = useMemo(() => {
    const parts = [title];
    if (scripture) parts.push(scripture);
    parts.push(body.replace(/\s+/g, " ").trim());
    if (declaration) parts.push(`Declaration. ${declaration}`);
    return parts.join(". ");
  }, [title, scripture, body, declaration]);

  const startTts = () => {
    if (!ttsSupported) return;
    try { window.speechSynthesis.cancel(); } catch {}
    const utter = new SpeechSynthesisUtterance(script);
    const v = pickTtsVoice(voices, voiceKind);
    if (v) utter.voice = v;
    utter.rate = 0.98;
    utter.pitch = voiceKind === "female" ? 1.05 : 0.9;
    utter.onend = () => setState("idle");
    utter.onerror = () => setState("idle");
    window.speechSynthesis.speak(utter);
    setState("playing");
    track("devotional_open", { audio: "tts", voice: voiceKind });
  };

  const onPlay = async () => {
    if (resolvedUrl && audioRef.current) {
      try {
        setState("loading");
        await audioRef.current.play();
        setState("playing");
        track("devotional_open", { audio: "stored", voice: voiceKind });
      } catch {
        setState("idle");
      }
      return;
    }
    if (state === "paused" && ttsSupported) {
      window.speechSynthesis.resume();
      setState("playing");
      return;
    }
    startTts();
  };

  const onPause = () => {
    if (resolvedUrl && audioRef.current) { audioRef.current.pause(); setState("paused"); return; }
    if (ttsSupported) { window.speechSynthesis.pause(); setState("paused"); }
  };

  const onRestart = async () => {
    if (resolvedUrl && audioRef.current) {
      audioRef.current.currentTime = 0;
      try { await audioRef.current.play(); setState("playing"); } catch { setState("idle"); }
      return;
    }
    startTts();
  };

  const switchVoice = (kind: VoiceKind) => {
    if (kind === voiceKind) return;
    setVoiceKind(kind);
    setVoicePreference(kind);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    if (ttsSupported) { try { window.speechSynthesis.cancel(); } catch {} }
    setState("idle");
  };

  const hasBothVersions = !!audioMaleUrl && !!audioFemaleUrl;
  const hasStoredForSelected =
    (voiceKind === "female" ? !!audioFemaleUrl : !!audioMaleUrl);
  const usingFallbackVoice = !hasStoredForSelected && !!resolvedUrl;

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

      {resolvedUrl && (
        <audio
          ref={audioRef}
          src={resolvedUrl}
          preload="none"
          onEnded={() => setState("idle")}
          onCanPlay={() => setState((s) => (s === "loading" ? "paused" : s))}
          className="hidden"
        />
      )}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {state !== "playing" ? (
          <Button onClick={onPlay} size="sm" className="gap-2 min-h-11" aria-label="Play narration">
            {state === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Play
          </Button>
        ) : (
          <Button onClick={onPause} size="sm" variant="secondary" className="gap-2 min-h-11" aria-label="Pause narration">
            <Pause className="w-4 h-4" /> Pause
          </Button>
        )}
        <Button onClick={onRestart} size="sm" variant="outline" className="gap-2 min-h-11" aria-label="Restart narration">
          <RotateCcw className="w-4 h-4" /> Restart
        </Button>

        <div className="ml-auto inline-flex rounded-lg border border-border overflow-hidden" role="group" aria-label="Choose voice">
          <button
            onClick={() => switchVoice("female")}
            className={`px-3 py-2 text-xs font-medium min-h-11 inline-flex items-center gap-1.5 ${voiceKind === "female" ? "bg-accent text-accent-foreground" : "bg-transparent text-foreground/80"}`}
            aria-pressed={voiceKind === "female"}
          >
            <User2 className="w-3.5 h-3.5" /> Jane
          </button>
          <button
            onClick={() => switchVoice("male")}
            className={`px-3 py-2 text-xs font-medium min-h-11 inline-flex items-center gap-1.5 ${voiceKind === "male" ? "bg-accent text-accent-foreground" : "bg-transparent text-foreground/80"}`}
            aria-pressed={voiceKind === "male"}
          >
            <User className="w-3.5 h-3.5" /> Sam
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {usingTts
          ? "Premium narration coming soon — using your device's built-in voice for now."
          : usingFallbackVoice
            ? `Only the ${voiceKind === "female" ? "male (Sam)" : "female (Jane)"} version is available for this devotional — playing that instead.`
            : hasBothVersions
              ? "Choose Jane or Sam to switch between our premium narrators."
              : "Premium narration by Doxazo Expressions."}
      </p>
    </section>
  );
};

export default AudioNarration;
