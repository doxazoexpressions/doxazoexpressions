import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Sparkles,
  Heart,
  ArrowRight,
  ArrowLeft,
  Headphones,
  RefreshCw,
  Check,
  WifiOff,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import CategoryBadge from "@/components/CategoryBadge";
import ShareButton from "@/components/ShareButton";
import FavoriteButton from "@/components/FavoriteButton";
import DevotionalCard, { DevotionalCardData } from "@/components/DevotionalCard";
import DevotionalBody from "@/components/DevotionalBody";
import { track } from "@/lib/analytics";
import {
  cacheCurrentDevotional,
  cacheDevotionalById,
  cacheRecentDevotionals,
  getCachedCurrentDevotional,
  getCachedDevotionalById,
  getCachedRecentDevotionals,
} from "@/lib/offlineCache";
import { recordRead } from "@/lib/readingHistory";
import { markReadToday, weekProgress } from "@/lib/streak";
import { markPlanItemRead, planSlug } from "@/lib/planProgress";
import { markStarted, markCompleted, setLastPlan, isCompleted } from "@/lib/devotionalProgress";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAuth } from "@/hooks/useAuth";

import { liveDevotionalOr } from "@/lib/liveDevotional";
import AudioNarration from "@/components/AudioNarration";
import ShareVerseCard from "@/components/ShareVerseCard";
import JournalPanel from "@/components/JournalPanel";
import FaithEssentials from "@/components/FaithEssentials";
import HighlightVerseButton from "@/components/HighlightVerseButton";
import { normalizeReadableText } from "@/lib/textPreview";
import ReflectionPrompt from "@/components/ReflectionPrompt";
import { trackDevotionalOpened, trackDevotionalCompleted } from "@/lib/lifecycleAnalytics";
import { formatSeries } from "@/lib/devotionalFormat";
import { toast } from "@/hooks/use-toast";

type Devotional = {
  id: string;
  title: string;
  scripture_reference: string | null;
  scripture_text: string | null;
  body: string;
  declaration: string | null;
  publish_date: string;
  category: string | null;
  series: string | null;
  audio_url: string | null;
  audio_male_url: string | null;
  audio_female_url: string | null;
  audio_default_voice: "male" | "female" | null;
  excerpt: string | null;
  inspiration_caption: string | null;
  prayer_section: string | null;
  decree_and_declare: string | null;
  day: number | null;
  slug: string | null;
};

type NavItem = { id: string; title: string; slug: string | null; publish_date: string };

/** Local calendar date (YYYY-MM-DD) — devotionals are dated, not timestamped. */
const localToday = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Date-only strings must never shift by timezone. */
const formatLongDate = (value: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const dt = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12) : new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const SectionLabel = ({
  icon: Icon,
  children,
}: {
  icon: typeof BookOpen;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
    <h3 className="text-accent font-semibold text-[11px] uppercase tracking-[0.2em]">{children}</h3>
  </div>
);

const ReadingSkeleton = () => (
  <div className="animate-pulse space-y-6" aria-hidden="true">
    <div className="h-3 w-32 rounded bg-muted" />
    <div className="h-9 w-3/4 rounded bg-muted" />
    <div className="h-24 rounded-lg bg-muted/70" />
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-muted/70" style={{ width: `${92 - i * 4}%` }} />
      ))}
    </div>
  </div>
);

const DailyDevotional = () => {
  const { id: routeId } = useParams<{ id?: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  // Legacy /devotional?id=… links → redirect to /devotional/:id (kept for old shares/SEO)
  const legacyId = params.get("id");
  const requestedId = routeId ?? null;
  const [current, setCurrent] = useState<Devotional | null>(null);
  const [recent, setRecent] = useState<DevotionalCardData[]>([]);
  const [prev, setPrev] = useState<NavItem | null>(null);
  const [next, setNext] = useState<NavItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (legacyId && !routeId) {
      navigate(`/devotional/${legacyId}`, { replace: true });
    }
  }, [legacyId, routeId, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFailed(false);
      const today = localToday();

      // 1) Show cached content immediately for snappy + offline-friendly UX
      const cachedCurrent = requestedId
        ? getCachedDevotionalById<Devotional>(requestedId)
        : getCachedCurrentDevotional<Devotional>();
      if (cachedCurrent && !cancelled) setCurrent(cachedCurrent);
      const cachedRecent = getCachedRecentDevotionals<DevotionalCardData>();
      if (cachedRecent.length && !cancelled) {
        setRecent(cachedRecent.filter((d) => d.id !== requestedId).slice(0, 6));
      }

      const orFilter = liveDevotionalOr();
      // "Live" = published/promoted AND not dated in the future, so a
      // mis-dated published row can never leapfrog today's devotional.
      const base = () =>
        supabase.from("devotionals").select("*").or(orFilter).lte("publish_date", today);

      try {
        let resolved: Devotional | null = null;

        if (requestedId) {
          // Look up by id (uuid) or by slug — both supported in the URL.
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedId);
          const lookup = isUuid
            ? await base().eq("id", requestedId).maybeSingle()
            : await base().eq("slug", requestedId).maybeSingle();
          if (lookup.error) throw lookup.error;
          const data = lookup.data as Devotional | null;
          if (data) {
            const { data: latest } = await base()
              .order("publish_date", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (latest && (latest as Devotional).id === data.id) {
              navigate("/devotional", { replace: true });
            }
            cacheDevotionalById(data.id, data);
          }
          resolved = data ?? cachedCurrent ?? null;
        } else {
          const { data, error } = await base()
            .order("publish_date", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (error) throw error;
          if (data) cacheCurrentDevotional(data);
          resolved = (data as Devotional) ?? cachedCurrent ?? null;
        }

        if (!cancelled) setCurrent(resolved);

        // Previous / next within live, non-future content only.
        if (resolved) {
          const navSelect = "id,title,slug,publish_date";
          const [{ data: prevRow }, { data: nextRow }] = await Promise.all([
            supabase
              .from("devotionals")
              .select(navSelect)
              .or(orFilter)
              .lte("publish_date", today)
              .lt("publish_date", resolved.publish_date)
              .order("publish_date", { ascending: false })
              .limit(1)
              .maybeSingle(),
            supabase
              .from("devotionals")
              .select(navSelect)
              .or(orFilter)
              .lte("publish_date", today)
              .gt("publish_date", resolved.publish_date)
              .order("publish_date", { ascending: true })
              .limit(1)
              .maybeSingle(),
          ]);
          if (!cancelled) {
            setPrev((prevRow as NavItem) ?? null);
            setNext((nextRow as NavItem) ?? null);
          }
        }

        const { data: recentData } = await supabase
          .from("devotionals")
          .select("id,title,scripture_reference,excerpt,body,category,series,publish_date")
          .or(orFilter)
          .lte("publish_date", today)
          .order("publish_date", { ascending: false })
          .limit(7);
        if (recentData && recentData.length) cacheRecentDevotionals(recentData);
        const filtered = (recentData ?? []).filter((d) => d.id !== (resolved?.id ?? requestedId));
        if (!cancelled) setRecent(filtered.slice(0, 6) as DevotionalCardData[]);
      } catch (err) {
        console.warn("Devotional fetch failed, using cached copy.", err);
        // Only a genuine failure with nothing cached is an error state — a
        // backend problem must never look like "no content exists".
        if (!cancelled && !cachedCurrent) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requestedId, navigate, reloadKey]);

  const online = useOnlineStatus();
  const { user } = useAuth();


  useEffect(() => {
    if (current) {
      setCompleted(isCompleted(current.id));
      track("devotional_open", { id: current.id, from: "devotional_page" });
      // Canonical open event + first-ever-open milestone.
      trackDevotionalOpened(current.id, {
        slug: current.slug,
        category: current.category,
        series: current.series,
        from: "devotional_page",
      });
      recordRead({
        id: current.id,
        slug: current.slug,
        title: current.title,
        scripture_reference: current.scripture_reference,
        publish_date: current.publish_date,
      });
      markReadToday();
      markStarted(current.id);
      const plan = planSlug(current.series);
      if (plan) {
        markPlanItemRead(plan, current.id);
        setLastPlan(plan);
      }
    }
  }, [current?.id]);

  // Mark completed when the reader reaches the bottom of the article.
  useEffect(() => {
    if (!current) return;
    const onScroll = () => {
      const scrolled = window.innerHeight + window.scrollY;
      const total = document.body.scrollHeight;
      if (total > 0 && scrolled >= total - 400) {
        markCompleted(current.id);
        setCompleted(true);
        // Deduped in the ledger — fires once per devotional, not per scroll tick.
        trackDevotionalCompleted(current.id, { category: current.category });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [current?.id]);

  const daysThisWeek = useMemo(() => {
    try {
      return weekProgress().filter((d) => d.read).length;
    } catch {
      return 0;
    }
  }, [current?.id, completed]);

  const onMarkComplete = () => {
    if (!current) return;
    markCompleted(current.id);
    setCompleted(true);
    trackDevotionalCompleted(current.id, { category: current.category });
    toast({ title: "Marked as read", description: "Today's devotional is complete." });
  };

  const seoTitle = current?.title ?? "Today's Devotional";
  const seoDescription =
    current?.excerpt ??
    (current?.body ? current.body.replace(/\s+/g, " ").slice(0, 155) : null) ??
    "Today's Christian devotional from Doxazo Expressions — Scripture, reflection, and a faith declaration to shape your day.";
  // Canonicalise to the slug so /devotional/<uuid> and /devotional/<slug> don't
  // become duplicate indexable URLs in Search Console.
  const seoPath = requestedId ? `/devotional/${current?.slug || requestedId}` : "/devotional";
  const scriptureText = normalizeReadableText(current?.scripture_text).trim();
  const articleLd = current
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: current.title,
        description: seoDescription,
        datePublished: current.publish_date,
        author: { "@type": "Organization", name: "Doxazo Expressions" },
        publisher: { "@type": "Organization", name: "Doxazo Expressions" },
        mainEntityOfPage: `https://www.doxazoexpressions.com${seoPath}`,
      }
    : undefined;

  const isToday = !!current && current.publish_date === localToday();
  const intro =
    current?.excerpt?.trim() ||
    "Scripture, reflection and a faith declaration to shape your day.";

  const { reflection, inspiration } = useMemo(() => {
    if (!current) return { reflection: "", inspiration: null as string | null };
    const marker = /(\n\s*)INSPIRATION\s*(?::|—|-)?\s*(\n|$)/i;
    const match = current.body.match(marker);
    const hasMarker = match && match.index !== undefined;
    return {
      reflection: hasMarker ? current.body.slice(0, match!.index).trim() : current.body.trim(),
      inspiration:
        current.inspiration_caption?.trim() ||
        (hasMarker ? current.body.slice(match!.index! + match![0].length).trim() : null),
    };
  }, [current?.id, current?.body, current?.inspiration_caption]);

  // Several stored rows repeat the declaration inside prayer_section; showing
  // both would print the same paragraph twice, so the duplicate is dropped.
  const prayer = useMemo(() => {
    const p = current?.prayer_section?.trim();
    if (!p) return null;
    const decl = (current?.decree_and_declare || current?.declaration || "").trim();
    const key = (s: string) => s.replace(/\s+/g, " ").toLowerCase();
    return decl && key(p) === key(decl) ? null : p;
  }, [current?.prayer_section, current?.decree_and_declare, current?.declaration]);



  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <SEO title={seoTitle} description={seoDescription} path={seoPath} type="article" jsonLd={articleLd} />
      <Navbar />
      <main className="pt-16 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-16">
        {!online && (
          <div className="bg-accent/15 border-b border-accent/30 text-sm text-center py-2 px-4 flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
            You're offline — showing the latest saved devotional.
          </div>
        )}

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="border-b border-border/60 bg-secondary/30">
          <div className="container mx-auto px-4 py-10 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-3xl mx-auto min-w-0"
            >
              <p className="text-accent font-semibold text-[11px] uppercase tracking-[0.22em]">
                {isToday ? "Today's Devotional" : requestedId ? "Devotional" : "Latest Devotional"}
              </p>

              {loading && !current ? (
                <div className="mt-4 space-y-3 animate-pulse" aria-hidden="true">
                  <div className="h-3 w-40 rounded bg-muted" />
                  <div className="h-10 w-4/5 rounded bg-muted" />
                  <div className="h-4 w-2/3 rounded bg-muted/70" />
                </div>
              ) : current ? (
                <>
                  <p className="mt-3 text-sm text-muted-foreground">{formatLongDate(current.publish_date)}</p>
                  <h1 className="mt-2 font-serif font-bold text-3xl md:text-5xl leading-tight text-foreground break-words">
                    {current.title}
                  </h1>
                  {current.scripture_reference && (
                    <p className="mt-3 font-serif italic text-base md:text-lg text-accent break-words">
                      {current.scripture_reference}
                    </p>
                  )}
                  <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">{intro}</p>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Button asChild className="min-h-11 gap-2">
                      <a href="#read">
                        Begin Reading <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="min-h-11 gap-2">
                      <a href="#listen">
                        <Headphones className="w-4 h-4" aria-hidden="true" /> Listen
                      </a>
                    </Button>
                  </div>

                  {daysThisWeek > 0 && (
                    <p className="mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {daysThisWeek} of 7 days this week
                    </p>
                  )}
                </>
              ) : (
                <h1 className="mt-3 font-serif font-bold text-3xl md:text-4xl leading-tight">
                  Begin Your Day with God
                </h1>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Reading experience ─────────────────────────────── */}
        <section id="read" className="py-10 md:py-16 scroll-mt-20">
          <div className="container mx-auto px-4 max-w-3xl min-w-0">
            {loading && !current ? (
              <ReadingSkeleton />
            ) : failed && !current ? (
              <Card className="border-border">
                <CardContent className="p-8 sm:p-10 text-center">
                  <AlertTriangle className="w-9 h-9 text-accent/60 mx-auto mb-4" aria-hidden="true" />
                  <h2 className="text-2xl font-serif font-semibold mb-2">We couldn't load today's devotional</h2>
                  <p className="text-muted-foreground mb-6">
                    Something went wrong on our side. Your devotional is still there — please try again.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button className="min-h-11 gap-2" onClick={() => setReloadKey((k) => k + 1)}>
                      <RefreshCw className="w-4 h-4" aria-hidden="true" /> Try again
                    </Button>
                    <Button asChild variant="outline" className="min-h-11">
                      <Link to="/archive">Browse Archive</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : !current ? (
              <Card className="border-border">
                <CardContent className="p-8 sm:p-10 text-center">
                  <BookOpen className="w-9 h-9 text-accent/40 mx-auto mb-4" aria-hidden="true" />
                  <h2 className="text-2xl font-serif font-semibold mb-2">No devotional for this date</h2>
                  <p className="text-muted-foreground mb-6">
                    A fresh word is on its way. In the meantime, the archive is open to you.
                  </p>
                  <Button asChild variant="outline" className="min-h-11">
                    <Link to="/archive">Browse Archive</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <motion.article
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="min-w-0"
              >
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pb-6 border-b border-border/60">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {formatLongDate(current.publish_date)}
                  </p>
                  <CategoryBadge slug={current.category} />
                  {current.series && (
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80 break-words">
                      {formatSeries(current.series)}
                    </p>
                  )}
                </div>

                {/* Audio sits before the text so the reading flow
                    Scripture → Reflection → Prayer is never interrupted. */}
                <div className="pt-6">
                  <AudioNarration
                    title={current.title}
                    scripture={scriptureText || current.scripture_reference}
                    body={current.body}
                    declaration={current.decree_and_declare || current.declaration}
                    audioUrl={current.audio_url}
                    audioMaleUrl={current.audio_male_url}
                    audioFemaleUrl={current.audio_female_url}
                    defaultVoice={current.audio_default_voice}
                    devotionalId={current.id}
                    devotionalSlug={current.slug}
                  />
                </div>

                {/* Scripture */}
                {current.scripture_reference && (
                  <div className="pt-2">
                    <SectionLabel icon={BookOpen}>Scripture</SectionLabel>
                    <p className="text-sm font-semibold text-accent mb-3 break-words">
                      {current.scripture_reference}
                    </p>
                    {scriptureText && (
                      <blockquote className="border-l-2 border-accent/50 pl-4 sm:pl-5">
                        <p className="font-serif italic text-lg md:text-xl leading-relaxed text-foreground/90 break-words [overflow-wrap:anywhere]">
                          &ldquo;{scriptureText}&rdquo;
                        </p>
                      </blockquote>
                    )}
                    {scriptureText && (
                      <div className="mt-4">
                        <HighlightVerseButton
                          devotionalId={current.id}
                          devotionalTitle={current.title}
                          reference={current.scripture_reference}
                          verseText={scriptureText}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Reflection */}
                <div className="mt-10 border-t border-border/60 pt-8">
                  <SectionLabel icon={Sparkles}>Reflection</SectionLabel>
                  <div className="max-w-[66ch] reader-friendly">
                    <DevotionalBody body={reflection} variant="full" />
                  </div>
                </div>

                {inspiration && (
                  <div className="mt-10 border-t border-border/60 pt-8">
                    <SectionLabel icon={Sparkles}>Inspiration</SectionLabel>
                    <p className="font-serif text-lg md:text-xl font-semibold text-primary leading-relaxed break-words">
                      {inspiration}
                    </p>
                  </div>
                )}

                {/* Prayer — omitted when the stored prayer is the same text as
                    the declaration, so the reader never sees it twice. */}
                {prayer && (
                  <div className="mt-10 border-t border-border/60 pt-8">
                    <SectionLabel icon={Heart}>Prayer</SectionLabel>
                    <p className="font-serif italic text-base md:text-lg leading-relaxed text-foreground/85 whitespace-pre-line break-words">
                      {prayer}
                    </p>
                  </div>
                )}


                {/* Declaration */}
                {(current.declaration || current.decree_and_declare) && (
                  <div className="mt-10 rounded-xl bg-primary text-primary-foreground p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                      <h3 className="text-accent font-semibold text-[11px] uppercase tracking-[0.2em]">
                        Declaration
                      </h3>
                    </div>
                    <p className="font-serif text-lg italic leading-relaxed whitespace-pre-line break-words">
                      {current.decree_and_declare || current.declaration}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-10 border-t border-border/60 pt-6 flex flex-wrap items-center gap-2 sm:gap-3">
                  <FavoriteButton devotionalId={current.id} />
                  <ShareButton
                    title={current.title}
                    path={`/devotional/${current.slug || current.id}`}
                    text={current.excerpt ?? current.scripture_reference ?? undefined}
                  />
                  <Button
                    variant={completed ? "secondary" : "outline"}
                    className="gap-2 min-h-11"
                    onClick={onMarkComplete}
                    disabled={completed}
                    aria-pressed={completed}
                  >
                    <Check className="w-4 h-4" aria-hidden="true" />
                    {completed ? "Read" : "Mark as read"}
                  </Button>
                  <div className="w-full sm:w-auto">
                    <ShareVerseCard
                      title={current.title}
                      scripture={current.scripture_reference}
                      quote={
                        current.decree_and_declare ||
                        current.declaration ||
                        current.excerpt ||
                        current.scripture_text
                      }
                    />
                  </div>
                </div>

                <ReflectionPrompt devotionalId={current.id} devotionalTitle={current.title} />
                {/* The journal panel duplicates the prompt's sign-in call to
                    action when signed out, so it only shows for members. */}
                {user && (
                  <JournalPanel devotionalId={current.id} devotionalTitle={current.title} />
                )}


                {/* Previous / next */}
                {(prev || next) && (
                  <nav aria-label="Devotional navigation" className="mt-12 grid gap-3 sm:grid-cols-2">
                    {prev ? (
                      <Link
                        to={`/devotional/${prev.slug || prev.id}`}
                        className="group rounded-lg border border-border p-4 min-w-0 interactive hover:border-accent/50"
                      >
                        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Previous
                        </span>
                        <span className="block mt-1.5 font-serif text-base font-semibold break-words">
                          {prev.title}
                        </span>
                      </Link>
                    ) : (
                      <span aria-hidden="true" className="hidden sm:block" />
                    )}
                    {next && (
                      <Link
                        to={`/devotional/${next.slug || next.id}`}
                        className="group rounded-lg border border-border p-4 min-w-0 interactive hover:border-accent/50 sm:text-right"
                      >
                        <span className="flex items-center gap-1.5 sm:justify-end text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          Next <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                        <span className="block mt-1.5 font-serif text-base font-semibold break-words">
                          {next.title}
                        </span>
                      </Link>
                    )}
                  </nav>
                )}
              </motion.article>
            )}

            <FaithEssentials />

            {recent.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-serif font-bold mb-8">Recent Devotionals</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {recent.map((d) => (
                    <DevotionalCard key={d.id} d={d} />
                  ))}
                </div>
                <div className="text-center mt-10">
                  <Button asChild variant="outline" className="min-h-11">
                    <Link to="/archive">View Full Archive</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DailyDevotional;
