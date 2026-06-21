import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Heart, BookOpen, Users, Flame } from "lucide-react";
import { motion } from "framer-motion";
import bibleImg from "@/assets/devotional-bible.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About Doxazo Expressions"
        description="A digital sanctuary publishing daily devotionals rooted in Scripture, prayer, and the leading of the Holy Spirit."
        path="/about"
      />
      <Navbar />
      <main className="pt-16">
        <section className="section-padding bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
              <p className="text-accent font-medium text-sm mb-3 uppercase tracking-wider">About Us</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-8 leading-tight">
                A Daily Devotional for the Disciplined Believer
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Doxazo Expressions publishes one fresh devotional every morning — Scripture, reflection, and a
                faith declaration — so your day begins anchored in the Word of God.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="aspect-square rounded-2xl overflow-hidden shadow-xl border border-border">
                  <img src={bibleImg} alt="Open Bible at sunrise" className="w-full h-full object-cover" loading="lazy" width={1280} height={896} />
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8">Our Vision</h2>
                <div className="space-y-5 text-muted-foreground leading-relaxed">
                  <p>
                    We exist to help believers begin every morning with God — opening the Word, sitting with a
                    short reflection, and stepping into the day with clarity and conviction.
                  </p>
                  <p>
                    Each devotional is rooted in Scripture and built for a consistent morning rhythm. No noise,
                    no clutter — just the Word, a thought to carry, and a prayer to declare.
                  </p>
                  <p>
                    Whether you are seeking encouragement in a difficult season, clarity in a major decision, or
                    deeper intimacy with God, Doxazo Expressions is your daily companion.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-5">What Every Devotional Holds</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">A simple, repeatable rhythm — designed to be read in under five minutes.</p>
            </motion.div>
            <div className="section-divider mb-16" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                { icon: BookOpen, title: "Scripture", desc: "A passage to anchor your thoughts and frame the day in truth." },
                { icon: Flame, title: "Reflection", desc: "A short, Spirit-led teaching that draws meaning from the Word." },
                { icon: Heart, title: "Declaration", desc: "A prayer you can speak — agreeing with God over your day." },
                { icon: Users, title: "Consistency", desc: "Published every morning. One rhythm. One Word. One walk." },
              ].map((v, i) => (
                <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                    <v.icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-3">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
