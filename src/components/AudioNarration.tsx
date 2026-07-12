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

  // Web Audio graph for real-time ducking
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bedGainRef = useRef<GainNode | null>(null);
  const narrationAnalyserRef = useRef<AnalyserNode | null>(null);
  const graphBuiltRef = useRef(false);
  const duckRafRef = useRef<number | null>(null);

  // Ducking levels (linear gain on the bed):
  //  BED_BASE  → when the narrator is quiet/paused between phrases
  //  BED_DUCK  → when Joy/Wisdom is actively speaking (voice sits clearly on top)
  const BED_BASE = 0.16;
  const BED_DUCK = 0.05;
  const SPEECH_THRESHOLD = 0.045; // RMS threshold on the narration signal

  // Only use per-devotional narration for the selected voice; fall back to
  // the other voice for this same devotional, or the legacy single URL.
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

  // Build the Web Audio graph on first play:
  //   narration → analyser → destination
  //   bed → highpass(~180Hz) → gainNode → destination
  // The analyser measures narration RMS in real time and drives the bed gain
  // for smooth broadcast-style ducking. The highpass carves low-mid space so
  // Joy/Wisdom's warmth sits clearly on top of the pad.
  const buildGraph = () => {
    if (graphBuiltRef.current) return;
    const audioEl = audioRef.current;
    const bedEl = bedRef.current;
    if (!audioEl || !bedEl) return;
    try {
      const Ctx: typeof AudioContext =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;

      const narrSrc = ctx.createMediaElementSource(audioEl);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.75;
      // Main audible path: narration → destination (unchanged, full volume)
      narrSrc.connect(ctx.destination);
      // Side-chain tap for RMS-based ducking (analyser NOT connected to output)
      narrSrc.connect(analyser);
      narrationAnalyserRef.current = analyser;

      const bedSrc = ctx.createMediaElementSource(bedEl);
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 180;
      hp.Q.value = 0.7;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      bedSrc.connect(hp);
      hp.connect(gain);
      gain.connect(ctx.destination);
      bedGainRef.current = gain;

      graphBuiltRef.current = true;
    } catch (e) {
      console.warn("Web Audio graph unavailable, falling back:", (e as Error).message);
    }
  };

  const startDuckingLoop = () => {
    if (duckRafRef.current != null) return;
    const analyser = narrationAnalyserRef.current;
    const ctx = audioCtxRef.current;
    const gain = bedGainRef.current;
    if (!analyser || !ctx || !gain) return;
    const buf = new Float32Array(analyser.fftSize);
    const tick = () => {
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / buf.length);
      const target = rms > SPEECH_THRESHOLD ? BED_DUCK : BED_BASE;
      // ~120ms attack, ~350ms release for a natural sidechain feel
      const tc = target < gain.gain.value ? 0.12 : 0.35;
      gain.gain.setTargetAtTime(target, ctx.currentTime, tc);
      duckRafRef.current = requestAnimationFrame(tick);
    };
    duckRafRef.current = requestAnimationFrame(tick);
  };

  const stopDuckingLoop = () => {
    if (duckRafRef.current != null) {
      cancelAnimationFrame(duckRafRef.current);
      duckRafRef.current = null;
    }
  };

  const fadeBedGain = (target: number, ms = 600) => {
    const gain = bedGainRef.current;
    const ctx = audioCtxRef.current;
    if (!gain || !ctx) return;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, target)), ctx.currentTime + ms / 1000);
  };

  // Reset player when devotional/audio changes
  useEffect(() => {
    setState("idle");
    stopDuckingLoop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (bedRef.current) {
      bedRef.current.pause();
      bedRef.current.currentTime = 0;
    }
  }, [resolvedUrl]);

  useEffect(() => {
    return () => {
      stopDuckingLoop();
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const startBed = async () => {
    const bed = bedRef.current;
    if (!bed) return;
    bed.loop = true;
    // If the Web Audio graph is live, the <audio> element output is routed
    // ONLY through the graph — set element volume to 1 and control level via
    // the GainNode. If the graph failed to build, fall back to element volume.
    bed.volume = graphBuiltRef.current ? 1 : BED_BASE;
    try {
      await bed.play();
      if (graphBuiltRef.current) {
        fadeBedGain(BED_BASE, 900);
        startDuckingLoop();
      }
    } catch { /* ignore */ }
  };

  const onPlay = async () => {
    if (!resolvedUrl || !audioRef.current) return;
    try {
      setState("loading");
      buildGraph();
      if (audioCtxRef.current?.state === "suspended") {
        await audioCtxRef.current.resume();
      }
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
      fadeBedGain(0, 400);
      stopDuckingLoop();
      window.setTimeout(() => { bedRef.current?.pause(); }, 450);
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
          crossOrigin="anonymous"
          src={resolvedUrl}
          preload="none"
          onEnded={() => { fadeBedGain(0, 1200); stopDuckingLoop(); window.setTimeout(() => bedRef.current?.pause(), 1250); setState("idle"); }}
          onCanPlay={() => setState((s) => (s === "loading" ? "paused" : s))}
          className="hidden"
        />
      )}
      {bedUrl && (
        <audio
          ref={bedRef}
          crossOrigin="anonymous"
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
