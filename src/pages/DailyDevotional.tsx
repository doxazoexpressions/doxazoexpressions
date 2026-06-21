import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, BookOpen, Sparkles, Heart, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import CategoryBadge from "@/components/CategoryBadge";
import ShareButton from "@/components/ShareButton";
import DevotionalCard, { DevotionalCardData } from "@/components/DevotionalCard";
import { track } from "@/lib/analytics";

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
  excerpt: string | null;
};

const DailyDevotional = () => {
  const [params] = useSearchParams();
  const requestedId = params.get("id");
  const [current, setCurrent] = useState<Devotional | null>(null);
  const [recent, setRecent] = useState<DevotionalCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const nowIso = new Date().toISOString();
      const base = supabase
        .from("devotionals")
        .select("*")
        .eq("published", true)
        .or(`scheduled_for.is.null,scheduled_for.lte.${nowIso}`);

      if (requestedId) {
        const { data } = await base.eq("id", requestedId).maybeSingle();
        setCurrent((data as Devotional) ?? null);
      } else {
        const { data } = await base.order("publish_date", { ascending: false }).limit(1).maybeSingle();
        setCurrent((data as Devotional) ?? null);
      }

      const { data: recentData } = await supabase
        .from("devotionals")
        .select("id,title,scripture_reference,excerpt,body,category,series,publish_date")
        .eq("published", true)
        .or(`scheduled_for.is.null,scheduled_for.lte.${nowIso}`)
        .order("publish_date", { ascending: false })
        .limit(7);
      const filtered = (recentData ?? []).filter((d) => d.id !== requestedId);
      setRecent(filtered.slice(0, 6) as DevotionalCardData[]);

      setLoading(false);
    })();
  }, [requestedId]);

  useEffect(() => {
    if (current) track("devotional_open", { id: current.id, from: "devotional_page" });
  }, [current?.id]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
              <Sun className="w-10 h-10 text-accent mx-auto mb-4" />
              <p className="text-accent font-medium text-sm mb-2 uppercase tracking-wider">Daily Devotional</p>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">Begin Your Day with God</h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Scripture, reflection, and a faith declaration to shape your day.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            {loading ? (
              <p className="text-center text-muted-foreground py-12">Loading devotional…</p>
            ) : !current ? (
              <Card className="border-border">
                <CardContent className="p-10 text-center">
                  <BookOpen className="w-10 h-10 text-accent/40 mx-auto mb-4" />
                  <h2 className="text-2xl font-serif font-semibold mb-2">No devotional posted yet</h2>
                  <p className="text-muted-foreground mb-6">Check back soon — a fresh word is on its way.</p>
                  <Button asChild variant="outline">
                    <Link to="/archive">Browse Archive</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-border shadow-lg">
                  <CardContent className="p-6 sm:p-8 md:p-12">
                    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                      <p className="text-accent text-xs sm:text-sm font-medium uppercase tracking-wider">
                        {new Date(current.publish_date).toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <CategoryBadge slug={current.category} />
                    </div>
                    {current.series && (
                      <p className="text-xs text-muted-foreground italic mb-2">Part of series · {current.series}</p>
                    )}
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 leading-tight">{current.title}</h2>

                    {current.scripture_reference && (
                      <div className="border-l-4 border-accent pl-5 py-3 mb-8 bg-accent/5 rounded-r-md">
                        <p className="text-sm font-semibold text-accent mb-1">{current.scripture_reference}</p>
                        {current.scripture_text && (
                          <p className="italic text-foreground/90 font-serif leading-relaxed">"{current.scripture_text}"</p>
                        )}
                      </div>
                    )}

                    {current.audio_url && (
                      <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2 text-sm font-medium text-foreground">
                          <Play className="w-4 h-4 text-accent" />
                          Listen to today's devotional
                        </div>
                        <audio controls src={current.audio_url} className="w-full" preload="none">
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    )}

                    <div className="prose prose-lg max-w-none text-foreground/85 leading-[1.85] whitespace-pre-wrap font-light text-[1.0625rem]">
                      {current.body}
                    </div>

                    {current.declaration && (
                      <div className="mt-10 p-6 rounded-xl bg-primary text-primary-foreground">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-5 h-5 text-accent" />
                          <p className="text-accent font-semibold text-sm uppercase tracking-wider">Faith Declaration</p>
                        </div>
                        <p className="font-serif text-lg italic leading-relaxed">{current.declaration}</p>
                      </div>
                    )}

                    <div className="mt-8 p-6 rounded-xl border border-accent/30 bg-accent/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-5 h-5 text-accent" />
                        <p className="text-accent font-semibold text-sm uppercase tracking-wider">Prayer Point</p>
                      </div>
                      <p className="text-foreground/85 leading-relaxed font-serif italic">
                        Father, let the truth of Your Word take root in my heart today. Strengthen my faith,
                        order my steps, and let every word from this devotional become a living reality in my life,
                        in Jesus' name. Amen.
                      </p>
                    </div>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                      <ShareButton title={current.title} text={current.scripture_reference ?? undefined} />
                      <Button asChild variant="outline" className="gap-2">
                        <Link to="/archive">
                          Browse Archive <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.article>
            )}

            {recent.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-serif font-bold mb-8 text-center">Recent Devotionals</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {recent.map((d) => (
                    <DevotionalCard key={d.id} d={d} />
                  ))}
                </div>
                <div className="text-center mt-10">
                  <Button asChild variant="outline">
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
