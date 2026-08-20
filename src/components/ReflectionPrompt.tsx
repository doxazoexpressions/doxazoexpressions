import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Loader2, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { track } from "@/lib/analytics";
import {
  listJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  type JournalEntry,
} from "@/lib/journal";

/**
 * One lightweight reflection question at the end of every devotional.
 * Stored as a private journal entry (mood = "reflection") so it lands in the
 * user's account history and can be reopened/edited any time.
 */
export const REFLECTION_MOOD = "reflection";
export const REFLECTION_QUESTION = "What is God saying to you today?";

type Props = {
  devotionalId: string;
  devotionalTitle: string;
};

const ReflectionPrompt = ({ devotionalId, devotionalTitle }: Props) => {
  const { user } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setEntry(null); setText(""); setEditing(false); return; }
      setLoading(true);
      try {
        const rows = await listJournalEntries(devotionalId);
        const found = rows.find((r) => r.mood === REFLECTION_MOOD) ?? null;
        if (cancelled) return;
        setEntry(found);
        setText(found?.content ?? "");
        setEditing(!found);
      } catch {
        if (!cancelled) setEditing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, devotionalId]);

  const save = async () => {
    const content = text.trim();
    if (!content) return;
    setSaving(true);
    try {
      if (entry) {
        const updated = await updateJournalEntry(entry.id, { content });
        setEntry(updated);
        track("journal_entry_updated", { devotional_id: devotionalId, source: "reflection_prompt" });
      } else {
        const created = await createJournalEntry({
          content,
          mood: REFLECTION_MOOD,
          devotional_id: devotionalId,
          devotional_title: devotionalTitle,
        });
        setEntry(created);
        track("journal_entry_created", { devotional_id: devotionalId, source: "reflection_prompt" });
      }
      setEditing(false);
      toast({ title: "Reflection saved", description: "Only you can see this. Edit it any time." });
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-10 rounded-xl border border-accent/25 bg-accent/5 p-5 sm:p-7 box-border max-w-full overflow-x-clip">
      <div className="flex items-center gap-2 mb-1">
        <Lock className="w-4 h-4 text-accent" />
        <p className="text-accent font-semibold text-[11px] uppercase tracking-[0.18em]">
          Private reflection
        </p>
      </div>
      <h3 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-1">
        {REFLECTION_QUESTION}
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Just a line or two. Saved privately to your journal — never shared.
      </p>

      {!user ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">Sign in to keep your reflections.</p>
          <Button asChild size="sm" variant="outline">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      ) : loading ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading your reflection…
        </p>
      ) : editing ? (
        <div className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write what you're hearing…"
            rows={3}
            className="resize-none bg-background/70"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving || !text.trim()} className="gap-2 min-h-11">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {entry ? "Update" : "Save privately"}
            </Button>
            {entry && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setText(entry.content); setEditing(false); }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="font-serif text-base leading-relaxed whitespace-pre-line text-foreground/90">
            {entry?.content}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full max-w-full">
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-2 min-h-11 w-full sm:w-auto">
              <Pencil className="w-4 h-4 shrink-0" /> Edit reflection
            </Button>
            <Button asChild size="sm" variant="ghost" className="min-h-11 w-full sm:w-auto">
              <Link to="/journal">See all reflections</Link>
            </Button>
          </div>

        </div>
      )}
    </section>
  );
};

export default ReflectionPrompt;
