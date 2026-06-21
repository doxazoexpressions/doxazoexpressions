import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sun, Sparkles, Compass } from "lucide-react";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-sunrise.jpg";
import { track } from "@/lib/analytics";

const Hero = () => {
  return (
    <section className="relative flex items-center justify-center pt-20 pb-10 md:min-h-screen md:pt-20 md:pb-16 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Golden sunrise breaking through clouds over peaceful mountains"
          className="w-full h-full object-cover"
          width={1920}
          height={1280}
          {...({ fetchpriority: "high" } as any)}
        />
        {/* Strong overlay — heavier on mobile for headline contrast */}
        <div className="absolute inset-0 bg-background/80 md:hidden" />
        <div className="absolute inset-0 hidden md:block bg-gradient-to-b from-background/85 via-background/85 to-background" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/90 backdrop-blur border border-accent/30 mb-8 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs sm:text-sm text-foreground font-medium">
              Your Daily Discipleship Companion
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[2.25rem] leading-[1.1] sm:text-5xl lg:text-7xl font-serif font-bold mb-6 sm:mb-8 text-foreground drop-shadow-sm"
          >
            A fresh <span className="text-gradient">devotional</span> every morning to anchor your{" "}
            <span className="text-gradient">walk with God</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Move from sporadic inspiration to disciplined spiritual growth. Scripture-rooted devotionals
            built for a consistent morning rhythm.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6"
          >
            <Button
              asChild
              size="lg"
              className="gap-2 px-7 py-6 text-base shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
              onClick={() => track("cta_today_devotional", { from: "hero" })}
            >
              <Link to="/devotional">
                <Sun className="w-5 h-5" />
                Read Today's Devotional
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2 px-7 py-6 text-base w-full sm:w-auto"
              onClick={() => track("cta_browse_archive", { from: "hero" })}
            >
              <Link to="/archive">
                Browse Archive
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mb-12"
          >
            <Link
              to="/categories"
              onClick={() => track("cta_explore_categories", { from: "hero" })}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <Compass className="w-4 h-4" />
              Explore by theme
              <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <div className="section-divider mb-6" />
            <blockquote className="text-muted-foreground italic font-serif text-base sm:text-lg border-l-2 border-accent pl-5 sm:pl-6 text-left">
              "The path of the righteous is like the morning sun, shining ever brighter till the full light of day."
              <cite className="block mt-3 text-sm not-italic text-accent font-sans font-medium">
                — Proverbs 4:18
              </cite>
            </blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
