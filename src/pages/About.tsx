import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { BookOpen, Flame, Heart, Users, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import bibleImg from "@/assets/devotional-bible.jpg";

const rhythm = [
  { icon: BookOpen, title: "Scripture", desc: "A passage to anchor your thoughts and frame the day in truth." },
  { icon: Flame, title: "Reflection", desc: "A short, Spirit-led reading that draws meaning from the Word." },
  { icon: Heart, title: "Prayer", desc: "A prayer you can speak — agreeing with God over your day." },
  { icon: Users, title: "Consistency", desc: "Published every morning. One rhythm. One Word. One walk." },
];

const About = () => {
  return (
    <div className="min-h-dvh bg-background">
      <SEO
        title="About Doxazo Expressions"
        description="Doxazo Expressions publishes a daily devotional — Scripture, reflection, and prayer — to help believers begin every morning anchored in the Word of God."
        path="/about"
      />
      <Navbar />
      <main className="pt-16">
        {/* Restrained hero, matched to Categories / Archive scale. */}
        <section className="pt-9 pb-8 md:pt-14 md:pb-12 bg-secondary/30">
          <div className="container mx-auto page-x max-w-2xl text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-accent mx-auto mb-3" aria-hidden="true" />
              <p className="type-meta text-accent mb-2">About Doxazo</p>
              <h1 className="type-display text-[26px] md:text-4xl text-foreground mb-3 break-words">
                A Daily Devotional for the Disciplined Believer
              </h1>
              <p className="type-body text-sm md:text-base text-muted-foreground max-w-md mx-auto">
                One fresh devotional every morning — Scripture, reflection, and prayer — so your day begins anchored
                in the Word of God.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Editorial body — controlled reading width, no decorative cards. */}
        <section className="py-10 md:py-14">
          <div className="container mx-auto page-x">
            <div className="max-w-2xl mx-auto space-y-10 md:space-y-14">
              <motion.article
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="type-heading text-[21px] md:text-2xl text-foreground mb-3">The Vision</h2>
                <div className="space-y-4 type-body text-[15px] md:text-base text-muted-foreground">
                  <p>
                    We exist to help believers begin every morning with God — opening the Word, sitting with a short
                    reflection, and stepping into the day with clarity and conviction.
                  </p>
                  <p>
                    Each devotional is rooted in Scripture and built for a consistent morning rhythm. No noise, no
                    clutter — just the Word, a thought to carry, and a prayer to declare.
                  </p>
                </div>
              </motion.article>

              <div className="section-divider" aria-hidden="true" />

              <motion.article
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="type-heading text-[21px] md:text-2xl text-foreground mb-3">Why Doxazo</h2>
                <div className="space-y-4 type-body text-[15px] md:text-base text-muted-foreground">
                  <p>
                    Whether you are seeking encouragement in a difficult season, clarity in a major decision, or
                    deeper intimacy with God, Doxazo Expressions is your daily companion.
                  </p>
                  <p>
                    Devotionals are gathered by theme — divine relationship, destiny and purpose, blessings, prayer,
                    and life and relationships — so you can grow where you need it most.
                  </p>
                </div>
              </motion.article>

              <motion.figure
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
                className="m-0"
              >
                <div className="aspect-[16/10] rounded-xl overflow-hidden ring-1 ring-border">
                  <img
                    src={bibleImg}
                    alt="An open Bible resting in early morning light"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={1280}
                    height={800}
                  />
                </div>
              </motion.figure>
            </div>
          </div>
        </section>

        {/* Daily rhythm — restrained, typographic, not bordered cards. */}
        <section className="py-10 md:py-14 bg-secondary/30">
          <div className="container mx-auto page-x">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8 md:mb-10">
                <p className="type-meta text-accent mb-2">Daily Discipleship</p>
                <h2 className="type-display text-[22px] md:text-3xl text-foreground mb-3">
                  What Every Devotional Holds
                </h2>
                <p className="type-body text-sm md:text-base text-muted-foreground max-w-md mx-auto">
                  A simple, repeatable rhythm — designed to be read in under five minutes.
                </p>
              </div>
              <ul className="grid gap-6 sm:grid-cols-2 sm:gap-8">
                {rhythm.map((v, i) => (
                  <motion.li
                    key={v.title}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="min-w-0 flex gap-4"
                  >
                    <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <v.icon className="h-[18px] w-[18px] text-accent" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="type-heading text-[17px] md:text-lg text-foreground mb-1.5">{v.title}</h3>
                      <p className="type-body text-sm text-muted-foreground">{v.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Single closing CTA. */}
        <section className="py-10 md:py-16">
          <div className="container mx-auto page-x max-w-2xl text-center">
            <h2 className="type-display text-[22px] md:text-3xl text-foreground mb-3">Begin Your Morning Here</h2>
            <p className="type-body text-sm md:text-base text-muted-foreground mb-6 max-w-md mx-auto">
              Today's devotional is ready — Scripture, reflection, and a prayer to carry into your day.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link to="/devotional">
                Read Today's Devotional
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
