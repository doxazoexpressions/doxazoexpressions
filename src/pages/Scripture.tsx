import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search as SearchIcon, WifiOff, Copy, Share2 } from "lucide-react";
import { lookupPassage, recentLookups, type Passage } from "@/lib/scripture";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { toast } from "sonner";

const SUGGESTIONS = [
  "John 3:16", "Psalm 23", "Romans 8:28", "Philippians 4:6-7",
  "Isaiah 41:10", "Jeremiah 29:11", "Proverbs 3:5-6", "2 Corinthians 5:17",
];

const Scripture = () => {
  const [query, setQuery] = useState("");
  const [translation, setTranslation] = useState<"kjv" | "web">("kjv");
  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recents, setRecents] = useState(() => recentLookups());
  const online = useOnlineStatus();

  useEffect(() => { setRecents(recentLookups()); }, [passage]);

  const doLookup = async (ref: string) => {
    setLoading(true);
    setError(null);
    try {
      const p = await lookupPassage(ref, translation);
      setPassage(p);
      setQuery(p.reference);
    } catch (e: any) {
      setError(e?.message || "Passage not found");
      setPassage(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) doLookup(query.trim());
  };

  const copy = async () => {
    if (!passage) return;
    try {
      await navigator.clipboard.writeText(
        `${passage.reference} (${passage.translation_id.toUpperCase()})\n\n${passage.text}`
      );
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const share = async () => {
    if (!passage) return;
    const text = `${passage.reference} (${passage.translation_id.toUpperCase()})\n\n${passage.text}`;
    if (navigator.share) {
      try { await navigator.share({ title: passage.reference, text }); } catch {}
    } else {
      copy();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Scripture Lookup"
        description="Instantly read any Bible passage. Works offline for verses you've viewed before."
        path="/scripture"
      />
      <Navbar />
      <main className="pt-20 pb-16">
        <section className="container mx-auto px-4 max-w-3xl">
          <header className="mb-6 text-center">
            <BookOpen className="w-10 h-10 text-accent mx-auto mb-3" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Scripture Lookup</h1>
            <p className="text-muted-foreground">
              Type any reference — chapter, verse, or range.
            </p>
          </header>

          {!online && (
            <div className="mb-4 rounded-md bg-accent/15 border border-accent/30 text-sm py-2 px-3 flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              Offline — only previously viewed passages are available.
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-wrap gap-2 mb-3">
            <div className="relative flex-1 min-w-[220px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. John 3:16 or Psalm 23"
                className="pl-9"
              />
            </div>
            <select
              value={translation}
              onChange={(e) => setTranslation(e.target.value as "kjv" | "web")}
              className="rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Translation"
            >
              <option value="kjv">KJV</option>
              <option value="web">WEB</option>
            </select>
            <Button type="submit" disabled={loading}>
              {loading ? "Looking up…" : "Read"}
            </Button>
          </form>

          <div className="flex flex-wrap gap-1.5 mb-6">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setQuery(s); doLookup(s); }}
                className="text-xs rounded-full border border-border bg-muted/40 hover:bg-accent/10 hover:border-accent/40 px-3 py-1 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {error && (
            <Card className="border-destructive/40 mb-6">
              <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
            </Card>
          )}

          {passage && (
            <Card className="mb-8">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div>
                    <p className="text-accent text-xs font-semibold uppercase tracking-[0.18em]">
                      {passage.translation_name}
                    </p>
                    <h2 className="font-serif text-2xl font-bold">{passage.reference}</h2>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copy} className="gap-1.5">
                      <Copy className="w-4 h-4" /> Copy
                    </Button>
                    <Button size="sm" variant="outline" onClick={share} className="gap-1.5">
                      <Share2 className="w-4 h-4" /> Share
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 font-serif text-lg leading-relaxed">
                  {passage.verses.map((v) => (
                    <p key={`${v.chapter}-${v.verse}`}>
                      <sup className="text-accent font-sans font-semibold mr-1">{v.verse}</sup>
                      {v.text.trim()}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {recents.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-2">
                Recently viewed
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recents.slice(0, 12).map((r, i) => (
                  <button
                    key={`${r.reference}-${i}`}
                    onClick={() => { setTranslation(r.translation as any); setQuery(r.reference); doLookup(r.reference); }}
                    className="text-xs rounded-full border border-border px-3 py-1 hover:bg-accent/10"
                  >
                    {r.reference}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Scripture;
