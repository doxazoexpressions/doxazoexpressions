import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type Devotional = {
  id: string;
  title: string;
  scripture_reference: string | null;
  scripture_text: string | null;
  body: string;
  declaration: string | null;
  publish_date: string;
};

const DailyDevotional = () => {
  const [today, setToday] = useState<Devotional | null>(null);
  const [recent, setRecent] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("devotionals")
        .select("*")
        .eq("published", true)
        .order("publish_date", { ascending: false })
        .limit(15);
      const list = data ?? [];
      setToday(list[0] ?? null);
      setRecent(list.slice(1));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="section-padding bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
              <Sun className="w-10 h-10 text-accent mx-auto mb-4" />
              <p className="text-accent font-medium text-sm mb-2 uppercase tracking-wider">Daily Devotional</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Begin Your Day with God</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Fresh devotionals every morning — Scripture, reflection, and a faith declaration to shape your day.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading today's devotional…</p>
            ) : !today ? (
              <Card className="border-border">
                <CardContent className="p-10 text-center">
                  <BookOpen className="w-10 h-10 text-accent/40 mx-auto mb-4" />
                  <h2 className="text-2xl font-serif font-semibold mb-2">No devotional posted yet</h2>
                  <p className="text-muted-foreground">Check back soon — fresh devotionals are coming.</p>
                </CardContent>
              </Card>
            ) : (
              <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-border shadow-lg">
                  <CardContent className="p-8 md:p-12">
                    <p className="text-accent text-sm font-medium uppercase tracking-wider mb-3">
                      {new Date(today.publish_date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 leading-tight">{today.title}</h2>
                    {today.scripture_reference && (
                      <div className="border-l-4 border-accent pl-5 py-2 mb-8 bg-accent/5 rounded-r-md">
                        <p className="text-sm font-semibold text-accent mb-1">{today.scripture_reference}</p>
                        {today.scripture_text && (
                          <p className="italic text-foreground/90 font-serif">"{today.scripture_text}"</p>
                        )}
                      </div>
                    )}
                    <div className="prose prose-lg max-w-none text-foreground/85 leading-relaxed whitespace-pre-wrap">
                      {today.body}
                    </div>
                    {today.declaration && (
                      <div className="mt-10 p-6 rounded-xl bg-primary text-primary-foreground">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-5 h-5 text-accent" />
                          <p className="text-accent font-semibold text-sm uppercase tracking-wider">Faith Declaration</p>
                        </div>
                        <p className="font-serif text-lg italic leading-relaxed">{today.declaration}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.article>
            )}

            {recent.length > 0 && (
              <div className="mt-20">
                <h3 className="text-2xl font-serif font-bold mb-8 text-center">Recent Devotionals</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {recent.map((d) => (
                    <Card key={d.id} className="border-border hover:border-accent/30 transition-colors">
                      <CardContent className="p-6">
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(d.publish_date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                        <h4 className="font-serif font-semibold text-lg mb-2">{d.title}</h4>
                        {d.scripture_reference && <p className="text-xs text-accent font-medium mb-2">{d.scripture_reference}</p>}
                        <p className="text-sm text-muted-foreground line-clamp-3">{d.body}</p>
                      </CardContent>
                    </Card>
                  ))}
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
