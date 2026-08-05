import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { JournalEntry } from "@/lib/journal";
import { JournalAudio } from "@/lib/audioJournal";
import JournalAudioPlayer from "@/components/JournalAudioPlayer";
import JournalAudioRecorder from "@/components/JournalAudioRecorder";

type Props = {
  entry: JournalEntry;
  /** Audio slot — rendered when this entry has attachments. */
  audio?: JournalAudio[];
  busyAudio?: boolean;
  onDelete: (id: string) => void;
  onRecorded: (entryId: string, blob: Blob, seconds: number) => Promise<void>;
  onAudioDeleted: (audioId: string) => void;
};

const JournalEntryCard = ({
  entry,
  audio = [],
  busyAudio,
  onDelete,
  onRecorded,
  onAudioDeleted,
}: Props) => (
  <li className="rounded-lg border border-border bg-card p-5">
    <div className="flex items-start justify-between gap-3 mb-2 flex-nowrap">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-widest text-accent font-semibold">
          {new Date(entry.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          {entry.mood && <span className="ml-2 text-muted-foreground">· {entry.mood}</span>}
        </p>
        {entry.devotional_title && (
          <p className="font-serif font-semibold mt-1 break-words">
            {entry.devotional_id
              ? <Link className="hover:text-accent" to={`/devotional/${entry.devotional_id}`}>{entry.devotional_title}</Link>
              : entry.devotional_title}
          </p>
        )}
      </div>
      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive" onClick={() => onDelete(entry.id)} aria-label="Delete">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
    <p className="text-sm whitespace-pre-wrap leading-relaxed">{entry.content}</p>

    {audio.length > 0 && (
      <div className="mt-3 space-y-2">
        {audio.map((a) => (
          <JournalAudioPlayer key={a.id} audio={a} onDeleted={onAudioDeleted} />
        ))}
      </div>
    )}

    <div className="mt-3">
      <JournalAudioRecorder
        label="Add audio"
        busy={busyAudio}
        onRecorded={(blob, seconds) => onRecorded(entry.id, blob, seconds)}
      />
    </div>
  </li>
);

export default JournalEntryCard;
