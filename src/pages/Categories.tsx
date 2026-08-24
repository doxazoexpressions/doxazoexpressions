import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import {
  Compass,
  ChevronRight,
  HeartHandshake,
  Sparkles,
  Sun,
  HandHeart,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORIES, CategorySlug } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { liveDevotionalOr } from "@/lib/liveDevotional";
import { track } from "@/lib/analytics";

const ICONS: Record<CategorySlug, LucideIcon> = {
  divine_relationship: HeartHandshake,
  destiny_purpose: Sparkles,
  blessings: Sun,
  prayers: HandHeart,
  life_relationships: Users,
};

type CountState = Record<CategorySlug, number> | null;

const Categories = () => {
  const [counts, setCounts] = useState<CountState>(null);

  // One request for every count — tally client-side to avoid 5 parallel round trips.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("devotionals")
        .select("category")
        .or(liveDevotionalOr());
      if (cancelled) return;
      if (error || !data) {
        setCounts(null);
        return;
      }
      const tally = Object.fromEntries(CATEGORIES.map((c) => [c.slug, 0])) as Record<CategorySlug, number>;
      for (const row of data) {
        const slug = row.category as CategorySlug | null;
        if (slug && slug in tally) tally[slug] += 1;
      }
      setCounts(tally);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <SEO
        title="Devotionals by Theme"
        description="Explore devotionals by theme — divine relationship, destiny and purpose, blessings, prayer, and life and relationships."
        path="/categories"
      />
      <Navbar />
      <main className="pt-16">
        {/* Restrained hero — deliberately quieter than the homepage hero. */}
        <section className="pt-9 pb-8 md:pt-14 md:pb-12 bg-secondary/30">
          <div className="container mx-auto page-x max-w-2xl text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Compass className="w-7 h-7 md:w-8 md:h-8 text-accent mx-auto mb-3" aria-hidden="true" />
              <p className="type-meta text-accent mb-2">Categories</p>
              <h1 className="type-display text-[26px] md:text-4xl text-foreground mb-3 break-words">
                Explore by Theme
              </h1>
              <p className="type-body text-sm md:text-base text-muted-foreground max-w-md mx-auto">
                Devotionals gathered around the themes that shape a believer's walk — so you can grow where you need it
                most.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-8 md:py-12 md:pb-10">
          <div className="container mx-auto page-x">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 md:gap-5 max-w-5xl mx-auto">
              {CATEGORIES.map((c) => {
                const Icon = ICONS[c.slug];
                const count = counts?.[c.slug];
                const comingSoon = counts !== null && count === 0;

                const inner = (
                  <>
                    <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                      <Icon className="h-[18px] w-[18px] text-accent" aria-hidden="true" />
                    </span>

                    <h2 className="type-heading text-[17px] md:text-lg text-foreground mb-1.5 break-words">
                      {c.label}
                    </h2>
                    <p className="type-body text-sm text-muted-foreground leading-relaxed">{c.description}</p>

                    <span className="mt-auto flex items-center justify-between gap-3 pt-5">
                      <span className="type-meta text-muted-foreground tabular-nums">
                        {counts === null
                          ? "\u00A0"
                          : comingSoon
                            ? "Coming soon"
                            : `${count} ${count === 1 ? "devotional" : "devotionals"}`}
                      </span>
                      {!comingSoon && (
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-accent transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </>
                );

                const base =
                  "group flex h-full flex-col rounded-xl bg-card p-5 sm:p-6 ring-1 ring-border";

                return (
                  <li key={c.slug} className="min-w-0">
                    {comingSoon ? (
                      <div
                        aria-disabled="true"
                        className={`${base} cursor-default opacity-70`}
                      >
                        {inner}
                      </div>
                    ) : (
                      <Link
                        to={`/categories/${c.slug}`}
                        onClick={() => track("category_open", { slug: c.slug, from: "categories_hub" })}
                        className={`${base} interactive hover:ring-accent/40 hover:shadow-md active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
                      >
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Categories;
