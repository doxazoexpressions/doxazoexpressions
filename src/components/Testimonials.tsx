import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type Testimony = {
  id: string;
  name: string;
  location: string | null;
  message: string;
};

const fallback: Testimony[] = [
  {
    id: "1",
    name: "Grace O.",
    location: "Lagos",
    message:
      "The morning devotional has become the anchor of my day. I open it before anything else and the rest of my hours feel ordered.",
  },
  {
    id: "2",
    name: "Daniel & Ruth M.",
    location: "Accra",
    message:
      "We read it together over coffee every morning. It's grown our faith and our marriage at the same time.",
  },
  {
    id: "3",
    name: "Sarah K.",
    location: "London",
    message:
      "After years of inconsistent quiet times, I finally have a rhythm. The Word feels alive again.",
  },
];

const Testimonials = () => {
  const [items, setItems] = useState<Testimony[]>(fallback);

  useEffect(() => {
    supabase
      .from("testimonies")
      .select("id,name,location,message")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data);
      });
  }, []);

  return (
    <section id="testimonials" className="section-padding relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsla(38,60%,56%,0.05)_0%,_transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <p className="text-accent font-medium text-sm mb-3 uppercase tracking-wider">Testimonies</p>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Mornings Transformed by the Word
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hear from readers whose daily walk has been shaped by sitting with the devotional each morning.
          </p>
        </motion.div>

        <div className="section-divider mb-16" />

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {items.slice(0, 3).map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-border bg-card p-8 hover:border-accent/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
            >
              <Quote className="w-8 h-8 text-accent/15 absolute top-6 right-6" />
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground mb-8 leading-relaxed text-[15px]">"{t.message}"</p>
              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold font-serif ring-2 ring-accent/10">
                  {t.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{t.name}</div>
                  {t.location && <div className="text-sm text-muted-foreground">{t.location}</div>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
