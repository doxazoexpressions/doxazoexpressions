import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import bibleImg from "@/assets/devotional-bible.jpg";

const AboutPreview = () => {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border border-border">
              <img
                src={bibleImg}
                alt="Open Bible bathed in golden morning light"
                className="w-full h-full object-cover"
                loading="lazy"
                width={1280}
                height={896}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <p className="text-accent font-medium text-sm mb-3 uppercase tracking-wider">Our Mission</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 md:mb-8 leading-tight">
              A Daily Devotional That Builds Disciplined Faith
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              Doxazo Expressions is built around one daily practice: opening the Word every morning with a
              fresh devotional, a scripture to anchor it, and a reflection that shapes the rest of your day.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10">
              No noise. No clutter. Just a consistent, Spirit-led companion for the believer who wants to
              grow steadily — one morning, one passage, one truth at a time.
            </p>
            <Button asChild variant="outline" className="gap-2 px-6">
              <Link to="/about">
                Learn More About Us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
