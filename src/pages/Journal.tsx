import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotebookPen, Mic } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { track } from "@/lib/analytics";
import { JournalEntry, createJournalEntry, deleteJournalEntry, listJournalEntries } from "@/lib/journal";
import JournalEntryCard from "@/components/JournalEntryCard";
import JournalAudioRecorder from "@/components/JournalAudioRecorder";
import { JournalAudio, attachAudioToEntry, listAudioForEntries } from "@/lib/audioJournal";

const Journal = () => {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [audio, setAudio] = useState<JournalAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyEntryId, setBusyEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const rows = await listJournalEntries();
        setEntries(rows);
        setAudio(await listAudioForEntries(rows.map((r) => r.id)));
      }
      catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [user?.id, authLoading]);

  const onDelete = async (id: string) => {
    const prev = entries;
    setEntries(entries.filter((e) => e.id !== id));
    try {
      await deleteJournalEntry(id);
      setAudio((a) => a.filter((x) => x.journal_entry_id !== id));
      track("journal_delete", { entry_id: id, non_interaction: true });
    }
    catch { setEntries(prev); toast({ title: "Delete failed", variant: "destructive" }); }
  };

  const onRecorded = async (entryId: string, blob: Blob, seconds: number) => {
    setBusyEntryId(entryId);
    try {
      const saved = await attachAudioToEntry({ journalEntryId: entryId, blob, durationSeconds: seconds });
      setAudio((a) => [...a, saved]);
      track("journal_audio_recorded", { entry_id: entryId, duration_seconds: seconds });
      toast({ title: "Voice memo saved", description: "It's attached to this journal entry." });
    } catch (e) {
      toast({ title: "Could not save voice memo", description: (e as Error).message, variant: "destructive" });
      throw e;
    } finally {
      setBusyEntryId(null);
    }
  };

  /** New voice reflection — creates the entry first, then attaches the recording. */
  const onNewVoiceEntry = async (blob: Blob, seconds: number) => {
    setBusyEntryId("new");
    try {
      const created = await createJournalEntry({ content: "Voice reflection", mood: null });
      const saved = await attachAudioToEntry({ journalEntryId: created.id, blob, durationSeconds: seconds });
      setEntries((prev) => [created, ...prev]);
      setAudio((a) => [...a, saved]);
      track("journal_create", { entry_id: created.id, mood: "none", character_count: created.content.length });
      toast({ title: "Voice reflection saved", description: "Added to your private journal." });
    } catch (e) {
      toast({ title: "Could not save voice reflection", description: (e as Error).message, variant: "destructive" });
      throw e;
    } finally {
      setBusyEntryId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Journal" description="Your private devotional journal — reflections, prayers, and notes." path="/journal" />
      <Navbar />
      <main className="page-shell-pad pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <NotebookPen className="w-6 h-6 text-accent" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Private</p>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">My Journal</h1>
            </div>
          </div>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Your reflections on each devotional, kept private to your account and synced across your devices.
          </p>

          {!user ? (
            <Card><CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Sign in to view your journal.</p>
              <Button asChild><Link to="/auth">Sign in</Link></Button>
            </CardContent></Card>
          ) : loading ? (
            <p className="text-muted-foreground">Loading your entries…</p>
          ) : (
            <>
              <Card className="mb-6">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="w-4 h-4 text-accent" aria-hidden="true" />
                    <h2 className="font-serif font-semibold">Audio journal</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Speak your reflection instead of typing it. Recordings are private to your account, up to 5 minutes each.
                  </p>
                  <JournalAudioRecorder
                    label="New voice reflection"
                    busy={busyEntryId === "new"}
                    onRecorded={onNewVoiceEntry}
                  />
                </CardContent>
              </Card>

              {entries.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground">
                  You haven't written any journal entries yet. Open today's devotional and add your first reflection.
                  <div className="mt-4"><Button asChild><Link to="/devotional">Read today's devotional</Link></Button></div>
                </CardContent></Card>
              ) : (
                <section aria-labelledby="journal-section-title">
                  <div className="flex items-baseline justify-between mb-3">
                    <h2 id="journal-section-title" className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
                      Journal
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {entries.length} {entries.length === 1 ? "entry" : "entries"}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {entries.map((e) => (
                      <JournalEntryCard
                        key={e.id}
                        entry={e}
                        audio={audio.filter((a) => a.journal_entry_id === e.id)}
                        busyAudio={busyEntryId === e.id}
                        onDelete={onDelete}
                        onRecorded={onRecorded}
                        onAudioDeleted={(id) => setAudio((a) => a.filter((x) => x.id !== id))}
                      />
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Journal;
