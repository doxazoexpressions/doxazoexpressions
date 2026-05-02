import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sun, Heart, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsla(38,60%,56%,0.08)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsla(213,52%,24%,0.04)_0%,_transparent_40%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="section-divider mb-12" />

          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-8 leading-tight">
            Start each day with God, grow in wisdom, walk boldly in your <span className="text-gradient">purpose</span>
          </h2>

          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Make morning encounter a lifestyle. Receive daily devotionals, prayer points, and teachings
            that anchor your soul and prepare you for every season.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button asChild size="lg" className="gap-2 px-8 py-6 text-base shadow-lg hover:shadow-xl transition-shadow">
              <Link to="/devotional">
                <Sun className="w-5 h-5" />
                Start Today's Devotional
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 px-8 py-6 text-base">
              <Link to="/prayers">
                <Heart className="w-5 h-5" />
                Join Morning Prayers
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="gap-2 px-6 py-6 text-base">
              <Link to="/teachings">
                <BookOpen className="w-5 h-5" />
                Explore Teachings
              </Link>
            </Button>
          </div>

          <blockquote className="text-muted-foreground italic font-serif text-lg max-w-md mx-auto border-l-2 border-accent pl-6 text-left">
            "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness."
            <cite className="block mt-3 text-sm not-italic text-accent font-sans font-medium">
              — Lamentations 3:22-23
            </cite>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
