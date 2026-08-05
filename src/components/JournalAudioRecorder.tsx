import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { MAX_DURATION_SECONDS, isRecordingSupported } from "@/lib/audioJournal";

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

type Props = {
  /** Called with the finished recording. Return a promise so we can show a busy state. */
  onRecorded: (blob: Blob, durationSeconds: number) => Promise<void> | void;
  busy?: boolean;
  label?: string;
};

/**
 * Record/stop control with a live duration counter. Wraps the MediaRecorder API
 * (supported in the iOS WKWebView from 14.3+). Microphone permission is only
 * requested on the first tap of Record.
 */
const JournalAudioRecorder = ({ onRecorded, busy, label = "Record voice memo" }: Props) => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  if (!isRecordingSupported()) {
    return (
      <p className="text-xs text-muted-foreground">
        Audio recording is not supported on this device. Please use the text journal.
      </p>
    );
  }

  const stop = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    recorderRef.current?.stop();
    setRecording(false);
  };

  const start = async () => {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access is needed to record. Enable it in Settings and try again.");
      return;
    }

    const mimeType = MediaRecorder.isTypeSupported?.("audio/webm")
      ? "audio/webm"
      : undefined;
    const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    recorderRef.current = mr;
    chunksRef.current = [];

    mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
    mr.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      recorderRef.current = null;
      const elapsed = Math.round((Date.now() - startedAtRef.current) / 1000);
      const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
      setSeconds(0);
      if (elapsed < 1) {
        setError("That recording was too short. Hold on a moment longer.");
        return;
      }
      if (elapsed > MAX_DURATION_SECONDS) {
        setError("Voice memos are limited to 5 minutes. Please record a shorter reflection.");
        return;
      }
      try {
        await onRecorded(blob, elapsed);
      } catch (e) {
        setError((e as Error).message || "Could not save that recording.");
      }
    };

    mr.start();
    startedAtRef.current = Date.now();
    setSeconds(0);
    setRecording(true);
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        if (next >= MAX_DURATION_SECONDS) stop();
        return next;
      });
    }, 1000);
  };

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        size="sm"
        variant={recording ? "destructive" : "outline"}
        onClick={recording ? stop : start}
        disabled={busy}
        className="gap-1.5"
        aria-label={recording ? "Stop recording" : label}
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : recording ? (
          <Square className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
        {busy ? "Saving…" : recording ? `Stop · ${fmt(seconds)}` : label}
      </Button>
      {recording && (
        <p className="text-xs text-accent" role="status" aria-live="polite">
          Recording… {fmt(seconds)} / {fmt(MAX_DURATION_SECONDS)}
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default JournalAudioRecorder;
