import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { liveDevotionalOr } from "@/lib/liveDevotional";
import { planSlug, planDisplayName, getPlanCompleted } from "@/lib/planProgress";

type Row = { id: string; title: string; series: string | null; publish_date: string; slug: string | null; day: number | null; scripture_reference: string | null };

const PlanDetail = () => {
  const { slug: planId } = useParams<{ slug: string }>();
  const [items, setItems] = useState<Row[]>([]);
  const [name, setName] = useState("Reading Plan");
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    if (!planId) return;
    (async () => {
      const { data } = await supabase
        .from("devotionals")
        .select("id,title,series,publish_date,slug,day,scripture_reference")
        .or(liveDevotionalOr())
        .not("series", "is", null)
        .order("publish_date", { ascending: true });
      const rows = (data as Row[] | null)?.filter((r) => planSlug(r.series) === planId) ?? [];
      setItems(rows);
      if (rows[0]?.series) setName(planDisplayName(rows[0].series));
      setCompleted(getPlanCompleted(planId));
    })();
  }, [planId]);

  const nextItem = items.find((i) => !completed.includes(i.id)) ?? items[0];
  const pct = items.length ? Math.round((completed.length / items.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={name} description={`Reading plan: ${name}`} path={`/plans/${planId}`} />
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/plans" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground">
            <ChevronLeft className="w-4 h-4" /> All plans
          </Link>
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-2">Reading Plan</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">{name}</h1>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm text-muted-foreground">{completed.length}/{items.length}</span>
          </div>

          {nextItem && (
            <Card className="mb-6 border-accent/40 bg-accent/5">
              <CardContent className="p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-widest text-accent font-semibold">Up next</p>
                  <p className="font-serif font-semibold text-base leading-snug line-clamp-2">{nextItem.title}</p>
                </div>
                <Button asChild size="sm" className="gap-2 shrink-0">
                  <Link to={`/devotional/${nextItem.slug || nextItem.id}`}>Read <ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {items.map((r, i) => {
              const done = completed.includes(r.id);
              return (
                <Link key={r.id} to={`/devotional/${r.slug || r.id}`} className="block">
                  <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3 hover:border-accent/40 transition">
                    {done
                      ? <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Part {r.day ?? i + 1}</p>
                      <p className="font-serif font-semibold text-sm leading-snug line-clamp-2">{r.title}</p>
                      {r.scripture_reference && <p className="text-xs text-accent mt-0.5">{r.scripture_reference}</p>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlanDetail;
