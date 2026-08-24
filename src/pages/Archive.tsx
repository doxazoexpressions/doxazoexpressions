import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import DevotionalCard, { DevotionalCardData } from "@/components/DevotionalCard";
import CategoryRail from "@/components/CategoryRail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { BookOpen, Search as SearchIcon, WifiOff, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { liveDevotionalOr } from "@/lib/liveDevotional";
import { CATEGORIES, CategorySlug } from "@/lib/categories";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const PAGE_SIZE = 12;
const STATE_KEY = "doxazo.archive.state";

type Persisted = { q: string; page: number };

const readPersisted = (): Persisted => {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) return { q: "", page: 0 };
    const p = JSON.parse(raw);
    return { q: typeof p?.q === "string" ? p.q : "", page: Number.isInteger(p?.page) ? p.page : 0 };
  } catch {
    return { q: "", page: 0 };
  }
};

type ArchiveProps = {
  /** When set, the page is locked to one theme (used by /categories/:slug). */
  lockedCategory?: CategorySlug;
};

const Archive = ({ lockedCategory }: ArchiveProps = {}) => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const activeCategory = lockedCategory ?? ((params.get("category") as CategorySlug | null) ?? null);
  const restored = useRef(readPersisted());


  const [items, setItems] = useState<DevotionalCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(restored.current.page);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState(restored.current.q);
  const [reloadKey, setReloadKey] = useState(0);
  const firstRun = useRef(true);

  // Preserve query + page across "open a devotional → back".
  useEffect(() => {
    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({ q, page }));
    } catch {
      /* ignore */
    }
  }, [q, page]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setPage(0);
  }, [activeCategory]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setShowSkeleton(false);
    // Only show skeleton if request takes >300ms — avoids flash on fast responses.
    const skeletonTimer = setTimeout(() => {
      if (!cancelled) setShowSkeleton(true);
    }, 300);

    (async () => {
      try {
        let query = supabase
          .from("devotionals")
          .select("id,title,scripture_reference,excerpt,body,category,series,publish_date", { count: "exact" })
          .or(liveDevotionalOr())
          .order("publish_date", { ascending: false })
          .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
        if (activeCategory) query = query.eq("category", activeCategory);
        const { data, count, error } = await query;
        if (cancelled) return;
        if (error) {
          setFailed(true);
          setItems([]);
          setTotal(0);
        } else {
          setItems((data as DevotionalCardData[]) ?? []);
          setTotal(count ?? 0);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
          setItems([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setShowSkeleton(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(skeletonTimer);
    };
  }, [page, activeCategory, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const setCategory = (slug: CategorySlug | null) => {
    if (lockedCategory) {
      // Locked theme view (/categories/:slug) — switching moves to the new theme route.
      navigate(slug ? `/categories/${slug}` : "/archive");
      return;
    }
    const next = new URLSearchParams(params);
    if (slug) next.set("category", slug);
    else next.delete("category");
    setParams(next, { replace: true });
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const activeMeta = useMemo(
    () => CATEGORIES.find((c) => c.slug === activeCategory),
    [activeCategory],
  );

  const heading = activeMeta ? (lockedCategory ? activeMeta.label : `${activeMeta.label} Devotionals`) : "Devotional Archive";

  return (
    <div className="min-h-dvh bg-background">
      <SEO
        title={activeMeta ? `${activeMeta.label} Devotionals` : "Devotional Archive"}
        description={
          activeMeta
            ? `Browse every ${activeMeta.label} devotional published on Doxazo Expressions.`
            : "Every devotional we've published — searchable, filterable, and ready to revisit."
        }
        path={lockedCategory ? `/categories/${lockedCategory}` : "/archive"}
      />
      <Navbar />
      <main className="pt-16">
        <section className="pt-9 pb-8 md:section-padding bg-secondary/30">
          <div className="container mx-auto page-x max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-accent mx-auto mb-3 md:mb-4" aria-hidden="true" />
              <p className="type-meta text-accent mb-2">{lockedCategory ? "Exploring Theme" : "Archive"}</p>
              <h1 className="type-display text-[28px] md:text-5xl text-foreground mb-3 md:mb-6 break-words">
                {heading}
              </h1>
              <p className="type-body text-sm md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-md mx-auto">
                {lockedCategory && activeMeta
                  ? activeMeta.description
                  : "Every devotional we've published — searchable, filterable, and ready to revisit."}
              </p>
              {lockedCategory && (
                <div className="mb-5">
                  <Link
                    to="/categories"
                    className="type-meta inline-flex items-center gap-1.5 text-muted-foreground hover:text-accent interactive"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" /> All Themes
                  </Link>
                </div>
              )}

              <form onSubmit={onSearch} className="relative max-w-md mx-auto" role="search">
                <SearchIcon
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                  aria-hidden="true"
                />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search devotionals…"
                  className={`pl-10 h-11 rounded-full text-[15px] ${q ? "pr-[7.25rem]" : "pr-[4.75rem]"}`}
                  aria-label="Search devotionals"
                  enterKeyHint="search"
                  type="search"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    aria-label="Clear search"
                    className="absolute right-[4.75rem] top-1/2 -translate-y-1/2 w-9 h-9 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground interactive"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
                <Button type="submit" size="sm" className="absolute right-1 top-1 h-9 rounded-full px-4">
                  Search
                </Button>
              </form>
            </motion.div>
          </div>
        </section>

        <section className="py-8 md:py-12 overflow-x-clip">
          <div className="container mx-auto page-x">
            <CategoryRail active={activeCategory} onChange={setCategory} className="mb-7 md:mb-10" />

            {loading ? (
              showSkeleton ? (
                <div
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto"
                  aria-busy="true"
                  aria-live="polite"
                >
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
            ) : failed ? (
              <div className="text-center py-16 max-w-md mx-auto" role="alert">
                {online ? (
                  <AlertTriangle className="w-10 h-10 text-destructive/70 mx-auto mb-4" aria-hidden="true" />
                ) : (
                  <WifiOff className="w-10 h-10 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                )}
                <h2 className="type-heading text-xl mb-2">
                  {online ? "We couldn't load the archive" : "You're offline"}
                </h2>
                <p className="type-body text-sm text-muted-foreground mb-5">
                  {online
                    ? "Something went wrong on our side — your devotionals are safe. Please try again."
                    : "Reconnect to load the archive. Downloaded devotionals are still available offline."}
                </p>
                <Button variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
                  Try again
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 max-w-md mx-auto">
                <BookOpen className="w-10 h-10 text-accent/40 mx-auto mb-4" aria-hidden="true" />
                <h2 className="type-heading text-xl mb-2">No devotionals here yet</h2>
                <p className="type-body text-sm text-muted-foreground mb-5">
                  {activeCategory
                    ? "Nothing's been published in this category yet — browse all devotionals instead."
                    : "Fresh devotionals are coming. Check back tomorrow morning."}
                </p>
                {activeCategory && (
                  <Button variant="outline" onClick={() => setCategory(null)}>
                    Browse all devotionals
                  </Button>
                )}
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
