import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import DevotionalCard, { DevotionalCardData } from "@/components/DevotionalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { BookOpen, Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { liveDevotionalOr } from "@/lib/liveDevotional";
import { CATEGORIES, CategorySlug } from "@/lib/categories";
import { useNavigate, useSearchParams } from "react-router-dom";

const PAGE_SIZE = 12;

const Archive = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const activeCategory = (params.get("category") as CategorySlug | null) ?? null;
  const [items, setItems] = useState<DevotionalCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");

  useEffect(() => {
    setPage(0);
  }, [activeCategory]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setShowSkeleton(false);
    // Only show skeleton if request takes >300ms — avoids flash on fast responses.
    const skeletonTimer = setTimeout(() => {
      if (!cancelled) setShowSkeleton(true);
    }, 300);

    (async () => {
      let query = supabase
        .from("devotionals")
        .select("id,title,scripture_reference,excerpt,body,category,series,publish_date", { count: "exact" })
        .or(liveDevotionalOr())
        .order("publish_date", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (activeCategory) query = query.eq("category", activeCategory);
      const { data, count } = await query;
      if (cancelled) return;
      setItems((data as DevotionalCardData[]) ?? []);
      setTotal(count ?? 0);
      setLoading(false);
      setShowSkeleton(false);
    })();

    return () => {
      cancelled = true;
      clearTimeout(skeletonTimer);
    };
  }, [page, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const setCategory = (slug: CategorySlug | null) => {
    const next = new URLSearchParams(params);
    if (slug) next.set("category", slug);
    else next.delete("category");
    setParams(next, { replace: true });
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const heading = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.slug === activeCategory);
    return cat ? `${cat.label} Devotionals` : "Devotional Archive";
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={activeCategory ? `${heading}` : "Devotional Archive"}
        description={
          activeCategory
            ? `Browse every ${CATEGORIES.find((c) => c.slug === activeCategory)?.label} devotional published on Doxazo Expressions.`
            : "Every devotional we've published — searchable, filterable, and ready to revisit."
        }
        path="/archive"
      />
      <Navbar />
      <main className="pt-16">
        <section className="pt-9 pb-8 md:section-padding bg-secondary/30">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-accent mx-auto mb-3 md:mb-4" />
              <p className="text-accent font-medium text-xs md:text-sm mb-1.5 md:mb-2 uppercase tracking-wider">Archive</p>
              <h1 className="text-[28px] leading-tight md:text-5xl font-serif font-bold text-foreground mb-2.5 md:mb-6">{heading}</h1>
              <p className="text-sm md:text-lg text-muted-foreground leading-relaxed mb-5 md:mb-8 max-w-md mx-auto">
                Every devotional we've published — searchable, filterable, and ready to revisit.
              </p>
              <form onSubmit={onSearch} className="relative max-w-md mx-auto">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search devotionals…"
                  className="pl-10 pr-[4.75rem] h-11 rounded-full text-[15px]"
                  aria-label="Search devotionals"
                  enterKeyHint="search"
                  type="search"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1 h-9 rounded-full px-4"
                >
                  Search
                </Button>
              </form>
            </motion.div>
          </div>
        </section>

        <section className="py-8 md:py-12 overflow-x-clip">
          <div className="container mx-auto px-4">
            <div
              className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 scroll-px-4 snap-x snap-mandatory pb-1 mb-7 md:mx-0 md:px-0 md:overflow-visible md:flex-wrap md:justify-center md:mb-10 md:snap-none"
              role="group"
              aria-label="Filter by category"
            >
              <button
                onClick={() => setCategory(null)}
                aria-pressed={!activeCategory}
                className={`shrink-0 snap-start whitespace-nowrap px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-[13px] md:text-sm font-medium border transition ${
                  !activeCategory
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-transparent border-border hover:border-accent/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setCategory(c.slug)}
                  aria-pressed={activeCategory === c.slug}
                  className={`shrink-0 snap-start whitespace-nowrap px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-[13px] md:text-sm font-medium border transition ${
                    activeCategory === c.slug
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-transparent border-border hover:border-accent/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>



            {loading ? (
              showSkeleton ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto" aria-busy="true" aria-live="polite">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-lg border border-border p-6 space-y-3">
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                      <div className="h-16 w-full bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="min-h-[200px]" aria-busy="true" />
              )
            ) : items.length === 0 ? (
              <div className="text-center py-16 max-w-md mx-auto">
                <BookOpen className="w-10 h-10 text-accent/40 mx-auto mb-4" />
                <h2 className="text-xl font-serif font-semibold mb-2">No devotionals here yet</h2>
                <p className="text-muted-foreground text-sm">
                  {activeCategory
                    ? "Nothing's been published in this category yet — check back soon or browse all devotionals."
                    : "Fresh devotionals are coming. Check back tomorrow morning."}
                </p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
                  {items.map((d) => (
                    <DevotionalCard key={d.id} d={d} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-3">
                      Page {page + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page + 1 >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Archive;
