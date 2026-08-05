import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Loader2, AudioLines } from "lucide-react";
import { JournalAudio, deleteAudio, getSignedUrl } from "@/lib/audioJournal";

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

type Props = {
  audio: JournalAudio;
  onDeleted?: (id: string) => void;
};

/** Inline playback for a saved voice memo, with download + delete actions. */
const JournalAudioPlayer = ({ audio, onDeleted }: Props) => {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const signed = await getSignedUrl(audio.storage_path);
        if (active) setUrl(signed);
      } catch {
        if (active) setError("Could not load this recording.");
      }
    })();
    return () => { active = false; };
  }, [audio.storage_path]);

  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteAudio(audio.id);
      onDeleted?.(audio.id);
    } catch (e) {
      setError((e as Error).message || "Delete failed.");
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <AudioLines className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
        <span className="text-xs text-muted-foreground flex-1 min-w-0 truncate">
          Voice memo · {fmt(audio.duration_seconds)}
        </span>
        {url && (
          <a
            href={url}
            download
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            aria-label="Download voice memo"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive"
          onClick={onDelete}
          disabled={deleting}
          aria-label="Delete voice memo"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </div>
      {url ? (
        <audio src={url} controls preload="metadata" className="w-full h-9" />
      ) : !error ? (
        <p className="text-xs text-muted-foreground">Loading recording…</p>
      ) : null}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default JournalAudioPlayer;
