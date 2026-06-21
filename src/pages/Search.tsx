import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DevotionalCard, { DevotionalCardData } from "@/components/DevotionalCard";
import { Search as SearchIcon } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { track } from "@/lib/analytics";

const Search = () => {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [results, setResults] = useState<DevotionalCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    const term = (params.get("q") ?? "").trim();
    if (!term) {
      setResults([]);
      setRan(false);
      return;
    }
    (async () => {
      setLoading(true);
      track("search_submit", { q: term });
      const nowIso = new Date().toISOString();
      const like = `%${term.replace(/[%_]/g, "")}%`;
      const { data } = await supabase
        .from("devotionals")
        .select("id,title,scripture_reference,excerpt,body,category,series,publish_date")
        .eq("published", true)
        .or(`scheduled_for.is.null,scheduled_for.lte.${nowIso}`)
        .or(`title.ilike.${like},scripture_reference.ilike.${like},body.ilike.${like},excerpt.ilike.${like}`)
        .order("publish_date", { ascending: false })
        .limit(50);
      setResults((data as DevotionalCardData[]) ?? []);
      setLoading(false);
      setRan(true);
    })();
  }, [params]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    setParams(term ? { q: term } : {}, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={initialQ ? `Search: ${initialQ}` : "Search Devotionals"}
        description="Search Doxazo Expressions devotionals by title, scripture reference, or content."
        path={initialQ ? `/search?q=${encodeURIComponent(initialQ)}` : "/search"}
      />
      <Navbar />
      <main className="pt-16">
        <section className="section-padding bg-secondary/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <SearchIcon className="w-10 h-10 text-accent mx-auto mb-4" />
              <p className="text-accent font-medium text-sm mb-2 uppercase tracking-wider">Search</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
                Find a Devotional
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Search by title, scripture reference, or any word from the body.
              </p>
              <form onSubmit={onSubmit} className="flex gap-2 max-w-xl mx-auto">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="e.g. Psalm 23, faith, surrender…"
                    className="pl-9"
                    aria-label="Search query"
                    autoFocus
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
            </motion.div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border p-6 space-y-3">
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                    <div className="h-16 w-full bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : !ran ? (
              <p className="text-center text-muted-foreground py-12">Type a query above to begin.</p>
            ) : results.length === 0 ? (
              <div className="text-center py-16 max-w-md mx-auto">
                <h2 className="text-xl font-serif font-semibold mb-2">No matches found</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Try a different word, a scripture reference, or browse by theme.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button asChild variant="outline">
                    <Link to="/archive">Browse Archive</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/categories">Explore Categories</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6 text-center">
                  {results.length} result{results.length === 1 ? "" : "s"}
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {results.map((d) => (
                    <DevotionalCard key={d.id} d={d} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Search;
