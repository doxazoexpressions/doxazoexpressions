import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type Teaching = {
  id: string;
  title: string;
  scripture_reference: string | null;
  excerpt: string | null;
  body: string;
  category: string | null;
  image_url: string | null;
  publish_date: string;
};

const Teachings = () => {
  const [items, setItems] = useState<Teaching[]>([]);
  const [active, setActive] = useState<Teaching | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("teachings")
      .select("*")
      .eq("published", true)
      .order("publish_date", { ascending: false })
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="section-padding bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
              <BookOpen className="w-10 h-10 text-accent mx-auto mb-4" />
              <p className="text-accent font-medium text-sm mb-2 uppercase tracking-wider">Teachings & Wisdom</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Inspirational Teachings & Insights</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Biblical wisdom, kingdom principles, and life-transforming insights to help you grow in faith,
                purpose, and destiny.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading teachings…</p>
            ) : items.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-10 text-center">
                  <BookOpen className="w-10 h-10 text-accent/40 mx-auto mb-4" />
                  <h2 className="text-2xl font-serif font-semibold mb-2">No teachings posted yet</h2>
                  <p className="text-muted-foreground">New teachings are coming soon.</p>
                </CardContent>
              </Card>
            ) : active ? (
              <article className="max-w-3xl mx-auto">
                <button onClick={() => setActive(null)} className="text-sm text-accent hover:underline mb-6">← Back to all teachings</button>
                <Card className="border-border">
                  <CardContent className="p-8 md:p-12">
                    {active.category && <p className="text-accent text-sm font-semibold mb-3 uppercase tracking-wider">{active.category}</p>}
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight">{active.title}</h2>
                    {active.scripture_reference && (
                      <p className="text-accent font-medium mb-6">{active.scripture_reference}</p>
                    )}
                    {active.image_url && (
                      <img src={active.image_url} alt={active.title} className="w-full rounded-xl mb-8" loading="lazy" />
                    )}
                    <div className="text-foreground/85 leading-relaxed whitespace-pre-wrap">{active.body}</div>
                  </CardContent>
                </Card>
              </article>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <Card className="h-full border-border hover:border-accent/30 transition-colors hover:shadow-lg cursor-pointer group" onClick={() => setActive(t)}>
                      <CardContent className="p-0">
                        <div className="h-44 bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                          {t.image_url ? (
                            <img src={t.image_url} alt={t.title} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <BookOpen className="w-10 h-10 text-accent/30" />
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {t.category && <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">{t.category}</span>}
                            <span className="text-xs text-muted-foreground">{new Date(t.publish_date).toLocaleDateString()}</span>
                          </div>
                          <h3 className="font-serif font-semibold text-lg mb-2 group-hover:text-accent transition-colors">{t.title}</h3>
                          {t.scripture_reference && <p className="text-xs text-accent mb-2">{t.scripture_reference}</p>}
                          <p className="text-sm text-muted-foreground line-clamp-3">{t.excerpt || t.body}</p>
                          <p className="mt-4 text-sm text-accent font-medium">Read more →</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Teachings;
