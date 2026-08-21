import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DevotionalCard, { DevotionalCardData } from "@/components/DevotionalCard";
import { Search as SearchIcon, X, AlertTriangle } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { track } from "@/lib/analytics";
import { liveDevotionalOr } from "@/lib/liveDevotional";

const Search = () => {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [results, setResults] = useState<DevotionalCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const [ran, setRan] = useState(false);

  useEffect(() => {
    const raw = (params.get("q") ?? "").trim();
    // Normalize: collapse whitespace, strip surrounding punctuation.
    const term = raw.replace(/\s+/g, " ").replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "");
    if (!term) {
      setResults([]);
      setRan(false);
      return;
    }
    (async () => {
      setLoading(true);
      track("search_submit", { q: term });

      // Build singular/plural variants so "Prayer" also matches "Prayers", etc.
      const lower = term.toLowerCase();
      const variants = new Set<string>([lower]);
      if (lower.endsWith("ies") && lower.length > 4) variants.add(lower.slice(0, -3) + "y"); // categories -> category
      else if (lower.endsWith("es") && lower.length > 3) variants.add(lower.slice(0, -2)); // favourites (n/a), classes -> class
      else if (lower.endsWith("s") && lower.length > 3) variants.add(lower.slice(0, -1)); // prayers -> prayer
      if (lower.endsWith("y") && lower.length > 2) variants.add(lower.slice(0, -1) + "ies"); // category -> categories
      if (!lower.endsWith("s")) variants.add(lower + "s"); // prayer -> prayers

      const escaped = Array.from(variants)
        .map((v) => v.replace(/[%_,()]/g, "").trim())
        .filter(Boolean);

      // `category` is a DB enum — cast to text so ilike works on it.
      const fields = ["title", "scripture_reference", "body", "excerpt", "category::text", "series"];

      const orFilter = escaped
        .flatMap((v) => fields.map((f) => `${f}.ilike.%${v}%`))
        .join(",");

      if (import.meta.env.DEV) console.info("[search] execute", { term, variants: escaped });

      const { data, error } = await supabase
        .from("devotionals")
        .select("id,title,scripture_reference,excerpt,body,category,series,publish_date")
        .or(liveDevotionalOr())
        .or(orFilter)
        .order("publish_date", { ascending: false })
        .limit(50);

      if (error) {
        if (import.meta.env.DEV) console.warn("[search] error", error.message);
        setFailed(true);
        setResults([]);
      } else {
        setFailed(false);
        setResults((data as DevotionalCardData[]) ?? []);
      }
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
              <form onSubmit={onSubmit} className="flex gap-2 max-w-xl mx-auto" role="search">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="e.g. Psalm 23, faith, surrender…"
                    className={q ? "pl-9 pr-10" : "pl-9"}
                    aria-label="Search query"
                    enterKeyHint="search"

                    autoFocus
                  />
                  {q && (
                    <button
                      type="button"
                      onClick={() => setQ("")}
                      aria-label="Clear search"
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground interactive"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
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
            ) : failed ? (
              <div className="text-center py-16 max-w-md mx-auto" role="alert">
                <AlertTriangle className="w-10 h-10 text-destructive/70 mx-auto mb-4" aria-hidden="true" />
                <h2 className="type-heading text-xl mb-2">Search couldn't run</h2>
                <p className="type-body text-sm text-muted-foreground mb-6">
                  This wasn't an empty result — the request failed. Check your connection and try again.
                </p>
                <Button variant="outline" onClick={() => setParams({ q: initialQ }, { replace: true })}>
                  Try again
                </Button>
              </div>
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
