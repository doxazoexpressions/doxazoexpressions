import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronLeft,
  AlertTriangle,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { liveDevotionalOr } from "@/lib/liveDevotional";
import { planSlug, planDisplayName, getPlanCompleted, syncPlanProgressFromCloud } from "@/lib/planProgress";

type Row = { id: string; title: string; series: string | null; publish_date: string; slug: string | null; day: number | null; scripture_reference: string | null };

const PlanDetail = () => {
  const { slug: planId } = useParams<{ slug: string }>();
  const [items, setItems] = useState<Row[]>([]);
  const [name, setName] = useState("Reading Plan");
  const [completed, setCompleted] = useState<string[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = async () => {
    if (!planId) return;
    setStatus("loading");
    await syncPlanProgressFromCloud().catch(() => { /* offline OK */ });
    const { data, error } = await supabase
      .from("devotionals")
      .select("id,title,series,publish_date,slug,day,scripture_reference")
      .or(liveDevotionalOr())
      .not("series", "is", null)
      .order("publish_date", { ascending: true });
    if (error) {
      setStatus("error");
      return;
    }
    const rows = (data as Row[] | null)?.filter((r) => planSlug(r.series) === planId) ?? [];
    setItems(rows);
    if (rows[0]?.series) setName(planDisplayName(rows[0].series));
    setCompleted(getPlanCompleted(planId));
    setStatus("ready");
  };

  useEffect(() => { void load(); }, [planId]);

  // Only count completions that map to a devotional actually in this plan.
  // Prevents impossible states like "18/5" when legacy/stale ids linger in local
  // storage or cloud rows reference devotionals no longer in the live plan.
  const itemIds = new Set(items.map((i) => i.id));
  const completedCount = Math.min(
    items.length,
    completed.filter((id) => itemIds.has(id)).length,
  );
  const allDone = items.length > 0 && completedCount >= items.length;
  const nextItem = items.find((i) => !completed.includes(i.id));
  const pct = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="min-h-dvh bg-background">
      <SEO title={name} description={`Reading plan: ${name}`} path={`/plans/${planId}`} />
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to="/plans"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground interactive"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" /> All plans
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-accent shrink-0" strokeWidth={2} aria-hidden="true" />
            <p className="type-meta">Reading Plan</p>
          </div>
          <h1 className="type-display text-2xl md:text-3xl break-words">{name}</h1>

          {status === "error" && (
            <div role="alert" className="mt-6 rounded-xl border border-destructive/40 bg-destructive/[0.04] p-6 text-center">
              <AlertTriangle className="w-5 h-5 text-destructive mx-auto mb-3" aria-hidden="true" />
              <p className="type-body text-sm font-medium">We couldn't load this plan.</p>
              <Button variant="outline" onClick={() => void load()} className="mt-4 gap-1.5 min-h-11">
                <RotateCcw className="w-4 h-4" aria-hidden="true" /> Try again
              </Button>
            </div>
          )}

          {status === "loading" && (
            <div className="mt-6 space-y-3" aria-busy="true" aria-live="polite">
              <span className="sr-only">Loading plan…</span>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-border/70 bg-card/40 p-4">
                  <div className="h-3 w-1/5 rounded bg-muted/70 animate-pulse" />
                  <div className="h-4 w-3/5 rounded bg-muted animate-pulse mt-2" />
                </div>
              ))}
            </div>
          )}

          {status === "ready" && items.length === 0 && (
            <div className="mt-6 rounded-xl border border-border/70 bg-card/40 p-8 text-center">
              <p className="type-body text-sm font-medium">This plan has no parts yet</p>
              <p className="type-body text-xs text-muted-foreground mt-1">
                Check back soon, or browse the other plans.
              </p>
              <Button asChild variant="outline" className="mt-4 min-h-11">
                <Link to="/plans">Back to plans</Link>
              </Button>
            </div>
          )}

          {status === "ready" && items.length > 0 && (
            <>
              <div className="flex items-center gap-3 mt-4 mb-6">
                <div
                  className="flex-1 h-2 rounded-full bg-muted overflow-hidden"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${name} progress`}
                >
                  <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
                <span className="type-body text-sm text-muted-foreground shrink-0">
                  {completedCount}/{items.length}
                </span>
              </div>

              {allDone ? (
                <div className="mb-6 rounded-xl border border-accent/40 bg-accent/[0.06] p-5 text-center">
                  <CheckCircle2 className="w-5 h-5 text-accent mx-auto mb-2" aria-hidden="true" />
                  <p className="type-heading text-base">Plan complete</p>
                  <p className="type-body text-xs text-muted-foreground mt-1">
                    You've read all {items.length} parts of {name}. Well done.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                    <Button asChild variant="outline" className="min-h-11">
                      <Link to="/plans">Choose another plan</Link>
                    </Button>
                    <Button asChild className="min-h-11">
                      <Link to="/devotional">Today's devotional</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                nextItem && (
                  <div className="mb-6 rounded-xl border border-accent/40 bg-accent/[0.05] p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                    <div className="min-w-0">
                      <p className="type-meta !text-accent">
                        {completedCount === 0 ? "Start here" : "Up next"} · Part{" "}
                        {nextItem.day ?? items.indexOf(nextItem) + 1} of {items.length}
                      </p>
                      <p className="type-heading text-base leading-snug mt-1 break-words">
                        {nextItem.title}
                      </p>
                    </div>
                    <Button asChild size="sm" className="gap-2 shrink-0 min-h-11 w-full sm:w-auto">
                      <Link to={`/devotional/${nextItem.slug || nextItem.id}`}>
                        {completedCount === 0 ? "Start" : "Continue"}
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                )
              )}

              <h2 className="type-group-label mb-2 px-1">All parts</h2>
              <ul className="space-y-2">
                {items.map((r, i) => {
                  const done = completed.includes(r.id);
                  const isNext = !done && nextItem?.id === r.id;
                  return (
                    <li key={r.id}>
                      <Link
                        to={`/devotional/${r.slug || r.id}`}
                        className={`flex items-center gap-3 rounded-lg border bg-card/40 p-4 interactive press hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          isNext ? "border-accent/40" : "border-border/70"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="type-meta">
                            Part {r.day ?? i + 1} of {items.length} ·{" "}
                            {done ? "Read" : isNext ? "Up next" : "Not read"}
                          </p>
                          <p className="type-heading text-sm leading-snug mt-0.5 break-words">
                            {r.title}
                          </p>
                          {r.scripture_reference && (
                            <p className="type-scripture mt-0.5 break-words">{r.scripture_reference}</p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlanDetail;
