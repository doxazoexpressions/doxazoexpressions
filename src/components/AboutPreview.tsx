import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import bibleImg from "@/assets/devotional-bible.jpg";

const AboutPreview = () => {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8 leading-tight">
              Daily Encounters That Build Champions
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              Doxazo Expressions exists to help believers grow spiritually, gain clarity in life decisions,
              and walk in the fullness of God's purpose — through fresh devotionals, fervent prayers, and
              Spirit-led teachings rooted in the Word.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10">
              Drawing inspiration from Apostle Joshua Selman's kingdom-centered teachings, we equip you to
              engage Prayer, the Word, Worship, Obedience, and Sacrifice — the five platforms that build a
              life of impact and divine fulfillment.
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
