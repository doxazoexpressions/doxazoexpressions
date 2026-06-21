import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { track } from "@/lib/analytics";

const CategoriesPreview = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Compass className="w-5 h-5 text-accent" />
            <p className="text-accent font-medium text-sm uppercase tracking-wider">Explore by Theme</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Find a Devotional for This Season
          </h2>
          <p className="text-muted-foreground text-lg">
            Browse devotionals grouped by the themes that shape a believer's walk.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/categories/${c.slug}`}
              onClick={() => track("category_open", { slug: c.slug, from: "home_preview" })}
              className="group rounded-xl border border-border bg-card p-6 hover:border-accent/50 hover:shadow-md transition-all"
            >
              <h3 className="font-serif font-semibold text-lg text-foreground mb-2 group-hover:text-accent transition-colors">
                {c.label}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
              <span className="inline-flex items-center gap-1 mt-4 text-xs text-accent font-medium uppercase tracking-wider">
                Explore <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesPreview;
