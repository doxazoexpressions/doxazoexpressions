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
                Building Champions Through the Word, Prayer & the Spirit
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Doxazo Expressions is a digital sanctuary where believers encounter God daily through devotionals,
                early-morning prayers, and Spirit-led teachings — anchored in Scripture and inspired by the
                kingdom-centered ministry of Apostle Joshua Selman.
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
                    We exist to help believers begin every morning with God — fortifying their spirits with the
                    Word, igniting their prayer life, and equipping them with practical wisdom to navigate every
                    season of life with clarity and confidence.
                  </p>
                  <p>
                    Our content is drawn from sound biblical foundations and the kingdom emphasis Apostle Joshua
                    Selman has carried for years: a believer's life is shaped by their consistency in Prayer, the
                    Word, Worship, Obedience, and Sacrifice — the five spiritual platforms.
                  </p>
                  <p>
                    Whether you are seeking encouragement in a difficult season, clarity in a major decision, or
                    deeper intimacy with God, Doxazo Expressions is a daily companion for your spiritual growth.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-5">Our Foundations</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">The principles that anchor every devotional, prayer, and teaching we share.</p>
            </motion.div>
            <div className="section-divider mb-16" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                { icon: BookOpen, title: "The Word", desc: "Scripture is our highest authority and the lens through which we interpret life." },
                { icon: Heart, title: "Prayer", desc: "We believe consistent prayer shapes destinies and unlocks divine possibilities." },
                { icon: Flame, title: "The Spirit", desc: "We move at the leading of the Holy Spirit — He is teacher, helper, and guide." },
                { icon: Users, title: "Community", desc: "Faith is lived together. We build up believers across nations and ages." },
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
