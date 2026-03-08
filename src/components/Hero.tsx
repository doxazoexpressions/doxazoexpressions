import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Mic, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsla(38,60%,56%,0.08)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsla(213,52%,24%,0.06)_0%,_transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_hsla(38,60%,56%,0.04)_0%,_transparent_30%)]" />
      
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/[0.03] rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-primary/[0.04] rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary border border-border mb-10"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground font-medium">
              Faith-Centered Life Coaching & Inspirational Speaking
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold leading-[1.1] mb-8"
          >
            Helping you discover{" "}
            <span className="text-gradient">purpose</span>, strengthen your{" "}
            <span className="text-gradient">faith</span>, and walk confidently
            in God's plan
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Biblical wisdom, life guidance, and inspirational speaking to help
            individuals and communities grow spiritually, gain clarity, and live
            with purpose.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Button asChild size="lg" className="gap-2 px-8 py-6 text-base shadow-lg hover:shadow-xl transition-shadow">
              <Link to="/coaching">
                <BookOpen className="w-5 h-5" />
                Book a Coaching Session
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 px-8 py-6 text-base">
              <Link to="/speaking">
                <Mic className="w-5 h-5" />
                Invite Me to Speak
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="gap-2 px-6 py-6 text-base">
              <Link to="/wisdom">
                Explore Wisdom & Insights
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <div className="section-divider mb-8" />
            <blockquote className="text-muted-foreground italic font-serif text-lg border-l-2 border-accent pl-6">
              "Trust in the Lord with all your heart and lean not on your own understanding."
              <cite className="block mt-3 text-sm not-italic text-accent font-sans font-medium">
                — Proverbs 3:5
              </cite>
            </blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
