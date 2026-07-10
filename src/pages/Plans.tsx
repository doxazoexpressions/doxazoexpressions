import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { liveDevotionalOr } from "@/lib/liveDevotional";
import { planSlug, planDisplayName, getPlanCompleted } from "@/lib/planProgress";

type Row = { id: string; title: string; series: string | null; publish_date: string; slug: string | null; day: number | null };
type Plan = { slug: string; name: string; items: Row[]; completed: number };

const Plans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("devotionals")
        .select("id,title,series,publish_date,slug,day")
        .or(liveDevotionalOr())
        .not("series", "is", null)
        .order("publish_date", { ascending: true });
      const grouped = new Map<string, Plan>();
      (data as Row[] | null)?.forEach((r) => {
        const slug = planSlug(r.series);
        if (!slug) return;
        const name = planDisplayName(r.series || "");
        const existing = grouped.get(slug) ?? { slug, name, items: [], completed: 0 };
        existing.items.push(r);
        grouped.set(slug, existing);
      });
      const list = Array.from(grouped.values()).map((p) => ({
        ...p,
        completed: p.items.filter((i) => getPlanCompleted(p.slug).includes(i.id)).length,
      }));
      list.sort((a, b) => b.items.length - a.items.length);
      setPlans(list);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Reading Plans & Series" description="Walk through devotional series and reading plans from Doxazo Expressions." path="/plans" />
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-2">Reading Plans</p>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Journey through Scripture together</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Multi-part devotional series. Track your progress and pick up where you left off.
            </p>
          </div>
          {loading ? (
            <p className="text-muted-foreground">Loading plans…</p>
          ) : plans.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No series yet — check back soon.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {plans.map((p) => {
                const pct = p.items.length ? Math.round((p.completed / p.items.length) * 100) : 0;
                return (
                  <Link key={p.slug} to={`/plans/${p.slug}`} className="block">
                    <Card className="hover:border-accent/50 transition">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="font-serif font-semibold text-lg leading-snug">{p.name}</h2>
                            <p className="text-xs text-muted-foreground mt-1">{p.items.length} part{p.items.length === 1 ? "" : "s"} · {p.completed} read</p>
                            <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Plans;
