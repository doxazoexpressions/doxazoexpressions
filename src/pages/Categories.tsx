import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Compass, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORIES, CategorySlug } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { liveDevotionalOr } from "@/lib/liveDevotional";
import { track } from "@/lib/analytics";

const Categories = () => {
  const [counts, setCounts] = useState<Record<CategorySlug, number>>({} as Record<CategorySlug, number>);

  useEffect(() => {
    (async () => {
      const orFilter = liveDevotionalOr();
      const results = await Promise.all(
        CATEGORIES.map((c) =>
          supabase
            .from("devotionals")
            .select("id", { count: "exact", head: true })
            .eq("category", c.slug)
            .or(orFilter)
            .then(({ count }) => [c.slug, count ?? 0] as const),
        ),
      );
      setCounts(Object.fromEntries(results) as Record<CategorySlug, number>);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Devotionals by Theme"
        description="Browse devotionals by theme — divine relationship, destiny and purpose, blessings, prayer, and life and relationships."
        path="/categories"
      />
      <Navbar />
      <main className="pt-16">
        <section className="section-padding bg-secondary/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Compass className="w-10 h-10 text-accent mx-auto mb-4" />
              <p className="text-accent font-medium text-sm mb-2 uppercase tracking-wider">Categories</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
                Devotionals by Theme
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Find the word that meets you where you are — relationship with God, purpose, prayer, blessings, or life and people.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  to={`/categories/${c.slug}`}
                  onClick={() => track("category_open", { slug: c.slug, from: "categories_hub" })}
                  className="group rounded-xl border border-border bg-card p-8 hover:border-accent/50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="font-serif font-bold text-xl text-foreground group-hover:text-accent transition-colors">
                      {c.label}
                    </h2>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {counts[c.slug] ?? 0} {counts[c.slug] === 1 ? "post" : "posts"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{c.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-accent font-medium uppercase tracking-wider">
                    Browse <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
