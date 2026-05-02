import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sun, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-sunrise.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Golden sunrise breaking through clouds over peaceful mountains"
          className="w-full h-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/80 backdrop-blur border border-accent/30 mb-10 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-foreground font-medium">
              Daily Devotionals · Morning Prayers · Spiritual Teachings
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold leading-[1.1] mb-8"
          >
            Discover <span className="text-gradient">purpose</span>, strengthen your{" "}
            <span className="text-gradient">faith</span>, walk boldly in God's plan
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Start each morning with God through fresh devotionals, early-morning prayers, and Spirit-led
            teachings that build champions and equip believers for kingdom living.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Button asChild size="lg" className="gap-2 px-8 py-6 text-base shadow-lg hover:shadow-xl transition-shadow">
              <Link to="/devotional">
                <Sun className="w-5 h-5" />
                Read Today's Devotional
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
                Explore Teachings
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
