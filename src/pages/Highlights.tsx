import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Highlighter, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { VerseHighlight, deleteHighlight, listHighlights, swatchFor } from "@/lib/highlights";

const Highlights = () => {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<VerseHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    (async () => {
      try { setRows(await listHighlights()); }
      catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [user?.id, authLoading]);

  const onDelete = async (id: string) => {
    const prev = rows;
    setRows(rows.filter((r) => r.id !== id));
    try { await deleteHighlight(id); }
    catch { setRows(prev); toast({ title: "Delete failed", variant: "destructive" }); }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Highlights" description="Verses you've highlighted from Doxazo Expressions devotionals." path="/highlights" />
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <Highlighter className="w-6 h-6 text-accent" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Personal library</p>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">My Highlights</h1>
            </div>
          </div>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Every verse you've saved, in one place. Tap a highlight to revisit the devotional.
          </p>

          {!user ? (
            <Card><CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Sign in to view your highlights.</p>
              <Button asChild><Link to="/auth">Sign in</Link></Button>
            </CardContent></Card>
          ) : loading ? (
            <p className="text-muted-foreground">Loading your highlights…</p>
          ) : rows.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              No highlights yet. Open a devotional and tap "Highlight verse" under the scripture.
              <div className="mt-4"><Button asChild><Link to="/devotional">Read today's devotional</Link></Button></div>
            </CardContent></Card>
          ) : (
            <ul className="space-y-3">
              {rows.map((r) => (
                <li key={r.id} className="rounded-lg border border-border bg-card p-5 relative overflow-hidden">
                  <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: swatchFor(r.color) }} aria-hidden="true" />
                  <div className="pl-3">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      {r.reference && <p className="text-sm font-semibold text-accent">{r.reference}</p>}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(r.id)} aria-label="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="font-serif italic text-foreground/90 leading-relaxed">"{r.verse_text}"</p>
                    {r.note && <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{r.note}</p>}
                    <p className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      {r.devotional_title && (
                        <>
                          {" · "}
                          {r.devotional_id
                            ? <Link className="hover:text-accent" to={`/devotional/${r.devotional_id}`}>{r.devotional_title}</Link>
                            : r.devotional_title}
                        </>
                      )}
                    </p>
                  </div>
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

export default Highlights;
