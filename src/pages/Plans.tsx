import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, CheckCircle2, AlertTriangle, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { liveDevotionalOr } from "@/lib/liveDevotional";
import { planSlug, planDisplayName, getPlanCompleted, syncPlanProgressFromCloud } from "@/lib/planProgress";
import { useAuth } from "@/hooks/useAuth";

type Row = { id: string; title: string; series: string | null; publish_date: string; slug: string | null; day: number | null };
type Plan = { slug: string; name: string; items: Row[]; completed: number };

const Plans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = async () => {
    setStatus("loading");
    await syncPlanProgressFromCloud().catch(() => { /* offline OK */ });
    const { data, error } = await supabase
      .from("devotionals")
      .select("id,title,series,publish_date,slug,day")
      .or(liveDevotionalOr())
      .not("series", "is", null)
      .order("publish_date", { ascending: true });
    if (error) {
      setStatus("error");
      return;
    }
    const grouped = new Map<string, Plan>();
    (data as Row[] | null)?.forEach((r) => {
      const slug = planSlug(r.series);
      if (!slug) return;
      const name = planDisplayName(r.series || "");
      const existing = grouped.get(slug) ?? { slug, name, items: [], completed: 0 };
      existing.items.push(r);
      grouped.set(slug, existing);
    });
    const list = Array.from(grouped.values()).map((p) => {
      // Only count completions that map to devotionals actually in this plan,
      // so stale/local ids can never inflate the count past the plan length.
      const done = new Set(getPlanCompleted(p.slug));
      return { ...p, completed: p.items.filter((i) => done.has(i.id)).length };
    });
    list.sort((a, b) => b.items.length - a.items.length);
    setPlans(list);
    setStatus("ready");
  };

  useEffect(() => { void load(); }, []);

  return (
    <div className="min-h-dvh bg-background">
      <SEO title="Reading Plans & Series" description="Walk through guided devotional journeys from Doxazo Expressions — one intentional step at a time." path="/plans" />
      <Navbar />
      <main className="page-shell-pad pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Restrained hero */}
          <header className="mb-8 md:mb-10">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-accent shrink-0" strokeWidth={2} aria-hidden="true" />
              <p className="type-meta">Reading Plans</p>
            </div>
            <h1 className="type-display text-2xl sm:text-3xl md:text-4xl">Grow with intention</h1>
            <p className="type-body text-sm md:text-base text-muted-foreground mt-2 max-w-xl">
              Plans gather devotionals into a guided journey. Start one, keep your place, and
              return whenever you're ready.
            </p>
          </header>

          {status === "loading" && (
            <div className="space-y-3" aria-busy="true" aria-live="polite">
              <span className="sr-only">Loading reading plans…</span>
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-border/70 bg-card/40 p-5">
                  <div className="h-4 w-2/5 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-1/4 rounded bg-muted/70 animate-pulse mt-3" />
                  <div className="h-1.5 w-full rounded-full bg-muted/60 animate-pulse mt-4" />
                </div>
              ))}
            </div>
          )}

          {status === "error" && (
            <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/[0.04] p-6 text-center">
              <AlertTriangle className="w-5 h-5 text-destructive mx-auto mb-3" aria-hidden="true" />
              <p className="type-body text-sm font-medium">We couldn't load your reading plans.</p>
              <p className="type-body text-xs text-muted-foreground mt-1">
                This looks like a connection problem, not an empty library.
              </p>
              <Button variant="outline" onClick={() => void load()} className="mt-4 gap-1.5 min-h-11">
                <RotateCcw className="w-4 h-4" aria-hidden="true" /> Try again
              </Button>
            </div>
          )}

          {status === "ready" && plans.length === 0 && (
            <div className="rounded-xl border border-border/70 bg-card/40 p-8 text-center">
              <BookOpen className="w-5 h-5 text-accent mx-auto mb-3" aria-hidden="true" />
              <p className="type-body text-sm font-medium">No plans published yet</p>
              <p className="type-body text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Guided journeys are on the way. In the meantime, today's devotional is always ready.
              </p>
              <Button asChild variant="outline" className="mt-4 min-h-11">
                <Link to="/devotional">Read today's devotional</Link>
              </Button>
            </div>
          )}

          {status === "ready" && plans.length > 0 && (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
              {plans.map((p) => {
                const total = p.items.length;
                const pct = total ? Math.round((p.completed / total) * 100) : 0;
                const state = p.completed === 0 ? "not-started" : p.completed >= total ? "completed" : "in-progress";
                const cta = state === "not-started" ? "Start plan" : state === "completed" ? "Revisit plan" : "Continue";
                return (
                  <li key={p.slug}>
                    <Link
                      to={`/plans/${p.slug}`}
                      className="group h-full flex flex-col rounded-xl border border-border/70 bg-card/40 p-5 interactive press hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-9 h-9 rounded-lg bg-accent/12 flex items-center justify-center shrink-0">
                          {state === "completed" ? (
                            <CheckCircle2 className="w-4 h-4 text-accent" aria-hidden="true" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-accent" aria-hidden="true" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h2 className="type-heading text-lg leading-snug break-words">{p.name}</h2>
                          <p className="type-body text-xs text-muted-foreground mt-1">
                            {total} part{total === 1 ? "" : "s"} ·{" "}
                            {state === "completed"
                              ? `All ${total} completed`
                              : `${p.completed} of ${total} completed`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div
                          className="h-1.5 rounded-full bg-muted overflow-hidden"
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${p.name} progress`}
                        >
                          <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-3">
                          <span className="type-meta shrink-0">{pct}% complete</span>
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-accent shrink-0">
                            {cta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {status === "ready" && plans.length > 0 && !user && (
            <p className="type-body text-xs text-muted-foreground mt-4 px-1">
              Your progress is saved on this device.{" "}
              <Link to="/auth" className="text-accent underline underline-offset-2">
                Sign in
              </Link>{" "}
              to sync it across your devices.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Plans;
