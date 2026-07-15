import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotebookPen, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { JournalEntry, deleteJournalEntry, listJournalEntries } from "@/lib/journal";

const Journal = () => {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    (async () => {
      try { setEntries(await listJournalEntries()); }
      catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [user?.id, authLoading]);

  const onDelete = async (id: string) => {
    const prev = entries;
    setEntries(entries.filter((e) => e.id !== id));
    try { await deleteJournalEntry(id); }
    catch { setEntries(prev); toast({ title: "Delete failed", variant: "destructive" }); }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Journal" description="Your private devotional journal — reflections, prayers, and notes." path="/journal" />
      <Navbar />
      <main className="pt-20 pb-16">
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
          ) : entries.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              You haven't written any journal entries yet. Open today's devotional and add your first reflection.
              <div className="mt-4"><Button asChild><Link to="/devotional">Read today's devotional</Link></Button></div>
            </CardContent></Card>
          ) : (
            <ul className="space-y-3">
              {entries.map((e) => (
                <li key={e.id} className="rounded-lg border border-border bg-card p-5">
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-accent font-semibold">
                        {new Date(e.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        {e.mood && <span className="ml-2 text-muted-foreground">· {e.mood}</span>}
                      </p>
                      {e.devotional_title && (
                        <p className="font-serif font-semibold mt-1">
                          {e.devotional_id
                            ? <Link className="hover:text-accent" to={`/devotional/${e.devotional_id}`}>{e.devotional_title}</Link>
                            : e.devotional_title}
                        </p>
                      )}
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(e.id)} aria-label="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{e.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Journal;
