import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, NotebookPen, Save, Trash2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  JournalEntry,
  createJournalEntry,
  deleteJournalEntry,
  listJournalEntries,
  updateJournalEntry,
} from "@/lib/journal";

const MOODS = ["Grateful", "Hopeful", "Struggling", "Peaceful", "Convicted", "Joyful"];

type Props = {
  devotionalId: string;
  devotionalTitle: string;
};

const JournalPanel = ({ devotionalId, devotionalTitle }: Props) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const load = async () => {
    if (!user) { setEntries([]); return; }
    setLoading(true);
    try {
      const rows = await listJournalEntries(devotionalId);
      setEntries(rows);
    } catch (e) {
      // silent — panel just shows empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id, devotionalId]);

  const onSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const created = await createJournalEntry({
        content: content.trim(),
        mood,
        devotional_id: devotionalId,
        devotional_title: devotionalTitle,
      });
      setEntries([created, ...entries]);
      setContent("");
      setMood(null);
      toast({ title: "Journal entry saved", description: "Your reflection is stored in your private journal." });
    } catch (e) {
      toast({ title: "Could not save entry", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    const prev = entries;
    setEntries(entries.filter((e) => e.id !== id));
    try { await deleteJournalEntry(id); }
    catch { setEntries(prev); toast({ title: "Delete failed", variant: "destructive" }); }
  };

  const startEdit = (e: JournalEntry) => { setEditingId(e.id); setEditingText(e.content); };
  const cancelEdit = () => { setEditingId(null); setEditingText(""); };
  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const updated = await updateJournalEntry(editingId, { content: editingText.trim() });
      setEntries(entries.map((e) => (e.id === editingId ? updated : e)));
      cancelEdit();
    } catch { toast({ title: "Update failed", variant: "destructive" }); }
  };

  return (
    <section
      aria-label="Your journal for this devotional"
      className="mt-10 rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <NotebookPen className="w-5 h-5 text-accent" aria-hidden="true" />
        <h3 className="font-serif font-semibold text-lg">Your reflection</h3>
        <span className="ml-auto text-xs text-muted-foreground">Private to you</span>
      </div>

      {!user ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to write a private journal entry on today's devotional. Your notes stay private and sync across your devices.
          </p>
          <Button asChild size="sm"><Link to="/auth">Sign in to journal</Link></Button>
        </div>
      ) : (
        <>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What is God speaking to you through this word? Write it out…"
            className="min-h-[120px] mb-3"
            maxLength={4000}
          />
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground mr-1">Mood:</span>
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(mood === m ? null : m)}
                className={`px-2.5 py-1 rounded-full text-xs border transition ${
                  mood === m
                    ? "bg-accent text-accent-foreground border-accent"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex justify-end mb-6">
            <Button onClick={onSave} disabled={!content.trim() || saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save entry
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading your entries…</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet — your reflection above will be the first.</p>
          ) : (
            <ul className="space-y-3">
              {entries.map((e) => (
                <li key={e.id} className="rounded-lg border border-border/60 bg-background p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      {new Date(e.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      {e.mood && <span className="ml-2 text-accent">· {e.mood}</span>}
                    </p>
                    <div className="flex items-center gap-1">
                      {editingId === e.id ? (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveEdit} aria-label="Save changes"><Save className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit} aria-label="Cancel"><X className="w-4 h-4" /></Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(e)} aria-label="Edit entry"><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(e.id)} aria-label="Delete entry"><Trash2 className="w-4 h-4" /></Button>
                        </>
                      )}
                    </div>
                  </div>
                  {editingId === e.id ? (
                    <Textarea value={editingText} onChange={(ev) => setEditingText(ev.target.value)} className="min-h-[100px]" />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{e.content}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
};

export default JournalPanel;
