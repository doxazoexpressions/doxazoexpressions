import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sun, Sparkles, Compass } from "lucide-react";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-sunrise.jpg";
import { track } from "@/lib/analytics";

const Hero = () => {
  return (
    <section className="relative flex items-center justify-center pt-[calc(env(safe-area-inset-top)+3.5rem)] pb-6 md:min-h-screen md:pt-20 md:pb-16 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Golden sunrise breaking through clouds over peaceful mountains"
          className="w-full h-full object-cover object-center brightness-[0.45] md:brightness-[0.55]"
          width={1920}
          height={1280}
          {...({ fetchpriority: "high" } as any)}
        />
        {/* Base wash so the page surface tone carries through */}
        <div className="absolute inset-0 bg-background/90 md:bg-background/85" />
        {/* Top-to-bottom gradient drives focus to copy area */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/90 to-background" />
        {/* Strong vignette behind the headline block for instant readability */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--background)/0.75)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-accent/40 mb-3 sm:mb-8 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs sm:text-sm text-primary font-semibold">
              Your Daily Discipleship Companion
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[1.875rem] leading-[1.15] sm:text-5xl lg:text-7xl font-serif font-bold mb-4 sm:mb-8 text-primary"
          >
            A fresh <span className="text-accent">devotional</span> every morning to anchor your{" "}
            <span className="text-accent">walk with God</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-lg md:text-xl text-foreground max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed font-medium"
          >
            Move from sporadic inspiration to disciplined spiritual growth. Scripture-rooted devotionals
            built for a consistent morning rhythm.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8"
          >
            <Button
              asChild
              size="lg"
              className="gap-2 px-8 min-h-[3.25rem] py-6 text-base font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              onClick={() => track("cta_today_devotional", { from: "hero" })}
            >
              <Link to="/devotional">
                <Sun className="w-5 h-5" />
                Read Today's Devotional
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="gap-2 px-5 min-h-[3rem] py-5 text-sm sm:text-base text-foreground/80 hover:text-primary hover:bg-transparent underline-offset-4 hover:underline w-full sm:w-auto"
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
            className="mb-6 md:mb-12"
          >
            <Link
              to="/categories"
              onClick={() => track("cta_explore_categories", { from: "hero" })}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors py-2"
            >
              <Compass className="w-3.5 h-3.5" />
              Explore by theme
              <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="max-w-lg mx-auto hidden sm:block"
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
