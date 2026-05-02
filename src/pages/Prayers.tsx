import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import prayerImg from "@/assets/prayer-hands.jpg";

type Prayer = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  scripture_reference: string | null;
  publish_date: string;
};

const Prayers = () => {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("prayers")
      .select("*")
      .eq("published", true)
      .order("publish_date", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setPrayers(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <img src={prayerImg} alt="Hands clasped in prayer at sunrise" className="w-full h-full object-cover opacity-30" loading="lazy" width={1280} height={896} />
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
              <Heart className="w-10 h-10 text-accent mx-auto mb-4" />
              <p className="text-accent font-medium text-sm mb-2 uppercase tracking-wider">Morning Prayers</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Pray, and You Shall Receive</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Early-morning prayers, prayer points, and Spirit-led declarations to anchor your day in God's presence.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading prayers…</p>
            ) : prayers.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-10 text-center">
                  <Heart className="w-10 h-10 text-accent/40 mx-auto mb-4" />
                  <h2 className="text-2xl font-serif font-semibold mb-2">No prayers posted yet</h2>
                  <p className="text-muted-foreground">Fresh morning prayers are coming soon.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {prayers.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-border hover:border-accent/30 transition-colors">
                      <CardContent className="p-8">
                        <div className="flex items-start justify-between mb-3 gap-4 flex-wrap">
                          <h3 className="text-xl font-serif font-semibold">{p.title}</h3>
                          {p.category && (
                            <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full whitespace-nowrap">{p.category}</span>
                          )}
                        </div>
                        {p.scripture_reference && <p className="text-xs text-accent mb-4 font-medium">{p.scripture_reference}</p>}
                        <p className="text-foreground/85 leading-relaxed whitespace-pre-wrap">{p.body}</p>
                        <p className="text-xs text-muted-foreground mt-5">
                          {new Date(p.publish_date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                        </p>
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

export default Prayers;
