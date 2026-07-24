import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, BookOpen, Heart, Compass, ArrowRight, Clock, Sparkles, WifiOff, Headphones, Highlighter, NotebookPen, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  cacheCurrentDevotional,
  cacheRecentDevotionals,
  getCachedCurrentDevotional,
  getCachedRecentDevotionals,
} from "@/lib/offlineCache";
import { getLastRead, getReadHistory, type ReadEntry } from "@/lib/readingHistory";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import CategoryBadge from "@/components/CategoryBadge";
import { CATEGORIES } from "@/lib/categories";
import { liveDevotionalOr } from "@/lib/liveDevotional";
import StreakCard from "@/components/StreakCard";
import ThemesGrid from "@/components/ThemesGrid";
import ForYouRail from "@/components/ForYouRail";
import { hapticLight } from "@/lib/haptics";
import { getLastListened, type LastListened } from "@/lib/audioProgress";
import { getLastPlan, isCompleted } from "@/lib/devotionalProgress";
import { getPlanCompleted, planDisplayName, planSlug, syncPlanProgressFromCloud } from "@/lib/planProgress";
import { listJournalEntries } from "@/lib/journal";
import { listHighlights } from "@/lib/highlights";
const devotionalHref = (d: { slug?: string | null; id: string }) =>
  `/devotional/${d.slug || d.id}`;

type Devotional = {
  id: string;
  title: string;
  scripture_reference: string | null;
  excerpt: string | null;
  body: string;
  category: string | null;
  series: string | null;
  publish_date: string;
  slug: string | null;
};

/**
 * Native-first home dashboard. Rendered only inside the Capacitor iOS/Android
 * shell (see Index.tsx). Emphasizes daily devotional utility, reading continuity,
 * saved library, and thematic browsing — not marketing copy.
 */
type PlanState = {
  slug: string;
  name: string;
  completed: number;
  total: number;
  next: { id: string; title: string; slug: string | null; scripture_reference: string | null } | null;
};

const NativeHome = () => {
  const online = useOnlineStatus();
  const { user } = useAuth();
  const { ids: favoriteIds } = useFavorites();
  const [today, setToday] = useState<Devotional | null>(() => getCachedCurrentDevotional<Devotional>());
  const [recent, setRecent] = useState<Devotional[]>(() => getCachedRecentDevotionals<Devotional>());
  const [lastRead, setLastRead] = useState<ReadEntry | null>(() => getLastRead());
  const [history] = useState<ReadEntry[]>(() => getReadHistory());
  const [loading, setLoading] = useState(!today);
  const [lastListened, setLastListened] = useState<LastListened | null>(() => getLastListened());
  const [currentPlan, setCurrentPlan] = useState<PlanState | null>(null);
  const [journalCount, setJournalCount] = useState<number>(0);
  const [highlightCount, setHighlightCount] = useState<number>(0);
  const [lastJournalAt, setLastJournalAt] = useState<number | null>(null);

  const greet = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  useEffect(() => {
    setLastRead(getLastRead());
    setLastListened(getLastListened());
  }, []);

  // Personal library counts + last-journal recency
  useEffect(() => {
    if (!user) { setJournalCount(0); setHighlightCount(0); setLastJournalAt(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const [j, h] = await Promise.all([listJournalEntries(), listHighlights()]);
        if (cancelled) return;
        setJournalCount(j.length);
        setHighlightCount(h.length);
        setLastJournalAt(j[0]?.created_at ? new Date(j[0].created_at).getTime() : null);
      } catch { /* offline */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Current plan continuity — pick the last-touched plan (or biggest with progress).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await syncPlanProgressFromCloud().catch(() => {});
        const { data } = await supabase
          .from("devotionals")
          .select("id,title,series,publish_date,slug,scripture_reference")
          .or(liveDevotionalOr())
          .not("series", "is", null)
          .order("publish_date", { ascending: true });
        if (!data || cancelled) return;
        const groups = new Map<string, { name: string; items: any[] }>();
        for (const r of data as any[]) {
          const slug = planSlug(r.series);
          if (!slug) continue;
          const g = groups.get(slug) ?? { name: planDisplayName(r.series || ""), items: [] };
          g.items.push(r);
          groups.set(slug, g);
        }
        const preferred = getLastPlan();
        const candidateSlugs = preferred && groups.has(preferred)
          ? [preferred, ...Array.from(groups.keys()).filter((s) => s !== preferred)]
          : Array.from(groups.keys());
        for (const slug of candidateSlugs) {
          const g = groups.get(slug)!;
          const done = getPlanCompleted(slug);
          const completed = g.items.filter((i) => done.includes(i.id)).length;
          if (completed === 0 && slug !== preferred) continue;
          const next = g.items.find((i) => !done.includes(i.id)) ?? null;
          setCurrentPlan({
            slug,
            name: g.name,
            completed,
            total: g.items.length,
            next: next ? { id: next.id, title: next.title, slug: next.slug ?? null, scripture_reference: next.scripture_reference ?? null } : null,
          });
          return;
        }
      } catch { /* offline */ }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const orFilter = liveDevotionalOr();
        const { data: t } = await supabase
          .from("devotionals")
          .select("*")
          .or(orFilter)
          .order("publish_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (t) {
          cacheCurrentDevotional(t);
          if (!cancelled) setToday(t as Devotional);
        }
        const { data: r } = await supabase
          .from("devotionals")
          .select("id,title,scripture_reference,excerpt,body,category,series,publish_date,slug")
          .or(orFilter)
          .order("publish_date", { ascending: false })
          .limit(6);
        if (r) {
          cacheRecentDevotionals(r);
          if (!cancelled) setRecent(r as Devotional[]);
        }
      } catch {
        /* offline — cache already loaded */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const savedFromRecent = recent.filter((d) => favoriteIds.includes(d.id)).slice(0, 3);
  const themePicks = CATEGORIES.slice(0, 6);
  const continueEntry = lastRead && today && lastRead.id !== today.id ? lastRead : null;

  return (
    <div
      className="min-h-screen bg-background pb-24"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 4rem)" }}
    >
      {!online && (
        <div className="bg-accent/15 border-b border-accent/30 text-xs text-center py-2 px-4 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          Offline — reading saved content
        </div>
      )}

      <div className="px-5 pt-6 pb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-1">
          {greet}
        </p>
        <h1 className="text-2xl font-serif font-bold leading-tight">
          Today with the Word
        </h1>
      </div>

      {/* Today's Word — hero card */}
      <div className="px-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-accent/30 bg-gradient-to-br from-primary/95 to-primary text-primary-foreground shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-4 h-4 text-accent" />
                <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold">
                  Today's Word
                </p>
              </div>
              {loading && !today ? (
                <p className="text-primary-foreground/70">Loading today's devotional…</p>
              ) : today ? (
                <>
                  <p className="text-xs text-primary-foreground/70 mb-2">
                    {new Date(today.publish_date).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <h2 className="text-2xl font-serif font-bold leading-tight mb-3">
                    {today.title}
                  </h2>
                  {today.scripture_reference && (
                    <p className="text-sm text-accent font-medium mb-3">
                      {today.scripture_reference}
                    </p>
                  )}
                  {today.excerpt && (
                    <p className="text-sm text-primary-foreground/85 leading-relaxed mb-5 line-clamp-3">
                      {today.excerpt}
                    </p>
                  )}
                  <Button asChild size="lg" variant="secondary" className="w-full gap-2" onClick={() => hapticLight()}>
                    <Link to={devotionalHref(today)}>
                      Begin today's devotion <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-primary-foreground/80 mb-4">
                    A fresh devotional will appear here each morning.
                  </p>
                  <Button asChild variant="secondary" className="w-full">
                    <Link to="/archive">Browse the archive</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Streak */}
      <div className="px-5 mt-5">
        <StreakCard />
      </div>
      {/* For You — personalized by onboarding preferences */}
      <ForYouRail />


      {/* Continue listening — resume audio narration where you left off */}
      {lastListened && lastListened.position > 8 && (
        <section className="px-5 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Headphones className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Continue listening
            </h3>
          </div>
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-4">
              <p className="text-[11px] uppercase tracking-widest text-accent font-semibold mb-1">
                {lastListened.voice === "male" ? "Wisdom" : "Joy"} · paused at {Math.floor(lastListened.position / 60)}:{String(Math.floor(lastListened.position % 60)).padStart(2, "0")}
              </p>
              <p className="font-serif font-semibold text-base leading-snug mb-1 line-clamp-2">
                {lastListened.title}
              </p>
              {lastListened.scripture_reference && (
                <p className="text-xs text-accent mb-3">{lastListened.scripture_reference}</p>
              )}
              <Button asChild size="sm" className="gap-2" onClick={() => hapticLight()}>
                <Link to={`/devotional/${lastListened.slug || lastListened.devotionalId}`}>
                  Resume playback <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Continue reading */}
      {continueEntry && (
        <section className="px-5 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Continue reading
            </h3>
          </div>
          <Card className="border-border">
            <CardContent className="p-4">
              {isCompleted(continueEntry.id) && (
                <p className="text-[11px] uppercase tracking-widest text-accent font-semibold mb-1 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completed · revisit
                </p>
              )}
              <p className="font-serif font-semibold text-base leading-snug mb-1 line-clamp-2">
                {continueEntry.title}
              </p>
              {continueEntry.scripture_reference && (
                <p className="text-xs text-accent mb-3">{continueEntry.scripture_reference}</p>
              )}
              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link to={devotionalHref(continueEntry)}>
                  Pick back up <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Current reading plan progress */}
      {currentPlan && currentPlan.total > 0 && (
        <section className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Your current plan
              </h3>
            </div>
            <Link to={`/plans/${currentPlan.slug}`} className="text-xs text-accent inline-flex items-center gap-1">
              Open <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="font-serif font-semibold text-base leading-snug mb-2">{currentPlan.name}</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${Math.round((currentPlan.completed / currentPlan.total) * 100)}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{currentPlan.completed}/{currentPlan.total}</span>
              </div>
              {currentPlan.next ? (
                <>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Up next</p>
                  <p className="text-sm font-serif leading-snug line-clamp-2 mb-3">{currentPlan.next.title}</p>
                  <Button asChild size="sm" className="gap-2" onClick={() => hapticLight()}>
                    <Link to={`/devotional/${currentPlan.next.slug || currentPlan.next.id}`}>
                      Resume plan <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Plan complete — well done.</p>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Journal reminder */}
      {user && (() => {
        const daysSince = lastJournalAt ? (Date.now() - lastJournalAt) / 86400000 : Infinity;
        if (journalCount > 0 && daysSince < 2) return null;
        return (
          <section className="px-5 mt-6">
            <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-transparent">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                  <NotebookPen className="w-5 h-5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif font-semibold text-sm leading-snug">
                    {journalCount === 0 ? "Write your first reflection" : "Add today's reflection"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Private to your account. Sync across your devices.
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0">
                  <Link to={today ? devotionalHref(today) : "/journal"}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        );
      })()}

      {/* Quick actions */}
      <section className="px-5 mt-6 grid grid-cols-2 gap-3">
        <Link
          to="/journal"
          className="rounded-xl border border-border bg-card p-4 flex flex-col items-start gap-2 active:scale-[0.98] transition"
        >
          <NotebookPen className="w-5 h-5 text-accent" />
          <div>
            <p className="font-semibold text-sm">Journal</p>
            <p className="text-xs text-muted-foreground">
              {journalCount} {journalCount === 1 ? "entry" : "entries"}
            </p>
          </div>
        </Link>
        <Link
          to="/highlights"
          className="rounded-xl border border-border bg-card p-4 flex flex-col items-start gap-2 active:scale-[0.98] transition"
        >
          <Highlighter className="w-5 h-5 text-accent" />
          <div>
            <p className="font-semibold text-sm">Highlights</p>
            <p className="text-xs text-muted-foreground">
              {highlightCount} verse{highlightCount === 1 ? "" : "s"}
            </p>
          </div>
        </Link>
        <Link
          to="/favorites"
          className="rounded-xl border border-border bg-card p-4 flex flex-col items-start gap-2 active:scale-[0.98] transition"
        >
          <Heart className="w-5 h-5 text-accent" />
          <div>
            <p className="font-semibold text-sm">Saved</p>
            <p className="text-xs text-muted-foreground">
              {favoriteIds.length} devotional{favoriteIds.length === 1 ? "" : "s"}
            </p>
          </div>
        </Link>
        <Link
          to="/scripture"
          className="rounded-xl border border-border bg-card p-4 flex flex-col items-start gap-2 active:scale-[0.98] transition"
        >
          <BookOpen className="w-5 h-5 text-accent" />
          <div>
            <p className="font-semibold text-sm">Scripture</p>
            <p className="text-xs text-muted-foreground">Lookup & save</p>
          </div>
        </Link>
      </section>


      {/* Saved snippet */}
      {savedFromRecent.length > 0 && (
        <section className="px-5 mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Your saved
            </h3>
            <Link to="/favorites" className="text-xs text-accent inline-flex items-center gap-1">
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {savedFromRecent.map((d) => (
              <Link
                key={d.id}
                to={devotionalHref(d)}
                className="block rounded-lg border border-border bg-card p-3 active:scale-[0.99] transition"
              >
                <p className="font-serif font-semibold text-sm leading-snug line-clamp-2">{d.title}</p>
                {d.scripture_reference && (
                  <p className="text-xs text-accent mt-1">{d.scripture_reference}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent reads */}
      {history.length > 0 && (
        <section className="px-5 mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Recently read
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x">
            {history.slice(0, 8).map((h) => (
              <Link
                key={h.id + h.readAt}
                to={devotionalHref(h)}
                className="snap-start shrink-0 w-56 rounded-lg border border-border bg-card p-3"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  {new Date(h.readAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </p>
                <p className="font-serif font-semibold text-sm leading-snug line-clamp-2">{h.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Themes */}
      <section className="px-5 mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Themes for this season
        </h3>
        <ThemesGrid />
      </section>

      {/* Reading Plans preview */}
      <section className="px-5 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Reading plans
          </h3>
          <Link to="/plans" className="text-xs text-accent inline-flex items-center gap-1">
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <Link
          to="/plans"
          onClick={() => hapticLight()}
          className="block rounded-xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-4 active:scale-[0.99] transition"
        >
          <p className="font-serif font-semibold text-base leading-snug">Walk through a devotional series</p>
          <p className="text-xs text-muted-foreground mt-1">Multi-part journeys with progress tracking.</p>
        </Link>
      </section>

      {/* Recent devotionals list */}
      {recent.length > 0 && (
        <section className="px-5 mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Latest devotionals
            </h3>
            <Link to="/archive" className="text-xs text-accent inline-flex items-center gap-1">
              Full archive <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recent.slice(0, 5).map((d) => (
              <Link
                key={d.id}
                to={devotionalHref(d)}
                className="block rounded-lg border border-border bg-card p-3"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  {new Date(d.publish_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </p>
                <p className="font-serif font-semibold text-sm leading-snug line-clamp-2">{d.title}</p>
                {d.scripture_reference && (
                  <p className="text-xs text-accent mt-1">{d.scripture_reference}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default NativeHome;
