import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, User, User2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import {
  VoiceKind,
  getVoicePreference,
  setVoicePreference,
  getMusicBedUrl,
  resolveAudioUrl,
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

// Voice UI names (backend voice IDs are fixed in the edge function):
//   Joy    → ElevenLabs Qggl4b0xRMiqOwhPtVWT (female)
//   Wisdom → ElevenLabs V904i8ujLitGpMyoTznT (male)
const VOICE_LABEL: Record<VoiceKind, string> = {
  female: "Joy",
  male: "Wisdom",
};

const AudioNarration = ({
  title, scripture, body, declaration,
  audioUrl, audioMaleUrl, audioFemaleUrl, defaultVoice,
}: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bedRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [voiceKind, setVoiceKind] = useState<VoiceKind>(() => defaultVoice ?? getVoicePreference());
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [bedUrl, setBedUrl] = useState<string | null>(null);

  // Only use per-devotional narration for the selected voice; fall back to
  // the other voice for this same devotional, or the legacy single URL.
  // No device TTS, no static default clip.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const primary = voiceKind === "female" ? audioFemaleUrl : audioMaleUrl;
      const secondary = voiceKind === "female" ? audioMaleUrl : audioFemaleUrl;
      const source = primary || secondary || audioUrl || null;
      const url = await resolveAudioUrl(source);
      if (!cancelled) setResolvedUrl(url);
    })();
    return () => { cancelled = true; };
  }, [voiceKind, audioFemaleUrl, audioMaleUrl, audioUrl]);

  // Load the shared background music bed once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const url = await getMusicBedUrl();
      if (!cancelled) setBedUrl(url);
    })();
    return () => { cancelled = true; };
  }, []);

  // Fade helpers for the background bed so it eases in/out gracefully.
  // Soft background bed sits well below narration; gentle ducking is applied
  // automatically because narration plays at full volume on top of this bed.
  const BED_VOLUME = 0.12;
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const fadeBed = (target: number, ms = 800) => {
    const bed = bedRef.current;
    if (!bed) return;
    const start = bed.volume;
    const safeTarget = clamp01(target);
    const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / ms);
      bed.volume = clamp01(start + (safeTarget - start) * t);
      if (t < 1) requestAnimationFrame(step);
      else if (safeTarget === 0) bed.pause();
    };
    requestAnimationFrame(step);
  };

  // Reset player when devotional/audio changes
  useEffect(() => {
    setState("idle");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (bedRef.current) {
      bedRef.current.pause();
      bedRef.current.currentTime = 0;
    }
  }, [resolvedUrl]);

  const startBed = async () => {
    const bed = bedRef.current;
    if (!bed) return;
    bed.loop = true;
    bed.volume = 0;
    try { await bed.play(); fadeBed(BED_VOLUME); } catch { /* ignore */ }
  };

  const onPlay = async () => {
    if (!resolvedUrl || !audioRef.current) return;
    try {
      setState("loading");
      await audioRef.current.play();
      startBed();
      setState("playing");
      track("devotional_open", { audio: "stored", voice: voiceKind });
    } catch {
      setState("idle");
    }
  };

  const onPause = () => {
    if (resolvedUrl && audioRef.current) {
      audioRef.current.pause();
      fadeBed(0, 400);
      setState("paused");
    }
  };

  const onRestart = async () => {
    if (!resolvedUrl || !audioRef.current) return;
    audioRef.current.currentTime = 0;
    if (bedRef.current) bedRef.current.currentTime = 0;
    try { await audioRef.current.play(); startBed(); setState("playing"); } catch { setState("idle"); }
  };

  const switchVoice = (kind: VoiceKind) => {
    if (kind === voiceKind) return;
    setVoiceKind(kind);
    setVoicePreference(kind);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    if (bedRef.current) { bedRef.current.pause(); bedRef.current.currentTime = 0; }
    setState("idle");
  };


  const hasBothVersions = !!audioMaleUrl && !!audioFemaleUrl;
  const hasStoredForSelected =
    (voiceKind === "female" ? !!audioFemaleUrl : !!audioMaleUrl);
  const usingFallbackVoice = !hasStoredForSelected && !!resolvedUrl;
  const noAudioAvailable = !resolvedUrl;

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
          onEnded={() => { fadeBed(0, 1200); setState("idle"); }}
          onCanPlay={() => setState((s) => (s === "loading" ? "paused" : s))}
          className="hidden"
        />
      )}
      {bedUrl && (
        <audio
          ref={bedRef}
          src={bedUrl}
          preload="auto"
          loop
          className="hidden"
        />
      )}


      <div className="flex flex-wrap items-center gap-2 mb-3">
        {state !== "playing" ? (
          <Button onClick={onPlay} size="sm" className="gap-2 min-h-11" aria-label="Play narration" disabled={noAudioAvailable}>
            {state === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Play
          </Button>
        ) : (
          <Button onClick={onPause} size="sm" variant="secondary" className="gap-2 min-h-11" aria-label="Pause narration">
            <Pause className="w-4 h-4" /> Pause
          </Button>
        )}
        <Button onClick={onRestart} size="sm" variant="outline" className="gap-2 min-h-11" aria-label="Restart narration" disabled={noAudioAvailable}>
          <RotateCcw className="w-4 h-4" /> Restart
        </Button>

        <div className="ml-auto inline-flex rounded-lg border border-border overflow-hidden" role="group" aria-label="Choose voice">
          <button
            onClick={() => switchVoice("female")}
            className={`px-3 py-2 text-xs font-medium min-h-11 inline-flex items-center gap-1.5 ${voiceKind === "female" ? "bg-accent text-accent-foreground" : "bg-transparent text-foreground/80"}`}
            aria-pressed={voiceKind === "female"}
          >
            <User2 className="w-3.5 h-3.5" /> {VOICE_LABEL.female}
          </button>
          <button
            onClick={() => switchVoice("male")}
            className={`px-3 py-2 text-xs font-medium min-h-11 inline-flex items-center gap-1.5 ${voiceKind === "male" ? "bg-accent text-accent-foreground" : "bg-transparent text-foreground/80"}`}
            aria-pressed={voiceKind === "male"}
          >
            <User className="w-3.5 h-3.5" /> {VOICE_LABEL.male}
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {noAudioAvailable
          ? "Narration for today's devotional is being prepared. Please check back shortly."
          : usingFallbackVoice
            ? `Only the ${voiceKind === "female" ? VOICE_LABEL.male : VOICE_LABEL.female} version is available for this devotional — playing that instead.`
            : hasBothVersions
              ? `Choose ${VOICE_LABEL.female} or ${VOICE_LABEL.male} to switch between our narrators.`
              : "Premium narration by Doxazo Expressions."}
      </p>
    </section>
  );
};

export default AudioNarration;
