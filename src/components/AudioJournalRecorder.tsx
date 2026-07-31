import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";
import { track } from "@/lib/analytics";

const MAX_SECONDS = 300; // hard cap: 5:00, auto-stops

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

type Props = {
  /** Journal row id once saved, or a draft id — used for the analytics payload. */
  entryId?: string | null;
};

/**
 * Audio journaling — records a voice memo via the MediaRecorder API
 * (supported in the Capacitor WKWebView). Recordings stay on-device;
 * nothing is uploaded automatically.
 */
const AudioJournalRecorder = ({ entryId }: Props) => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  const stop = () => {
    recorderRef.current?.stop();
    recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    recorderRef.current = null;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setRecording(false);
  };

  const start = async () => {
    setError(null);
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Audio journaling isn't available on this device.");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Audio journaling needs microphone access. Enable in Settings.");
      return;
    }
    chunksRef.current = [];
    const rec = new MediaRecorder(stream);
    recorderRef.current = rec;
    rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
      setDuration(seconds);
      track("journal_audio_recorded", {
        entry_id: entryId ?? "draft",
        duration_seconds: seconds,
      });
    };
    rec.start();
    setSeconds(0);
    setRecording(true);
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        if (next >= MAX_SECONDS) stop();
        return next;
      });
    }, 1000);
  };

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) { el.play(); setPlaying(true); }
    else { el.pause(); setPlaying(false); }
  };

  const discard = () => {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setDuration(0);
    setPlaying(false);
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={recording ? "destructive" : "outline"}
        size="sm"
        onClick={recording ? stop : start}
        className="gap-1.5"
        aria-label={recording ? "Stop recording" : "Record a voice memo"}
      >
        {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        {recording ? `Stop ${fmt(seconds)}` : "Voice memo"}
      </Button>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {url && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-2">
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <span className="text-xs text-muted-foreground flex-1">Voice memo · {fmt(duration)}</span>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={discard} aria-label="Delete recording">
            <Trash2 className="w-4 h-4" />
          </Button>
          <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} className="hidden" />
        </div>
      )}
    </div>
  );
};

export default AudioJournalRecorder;
