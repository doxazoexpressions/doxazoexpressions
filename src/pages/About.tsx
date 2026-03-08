import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, BookOpen, Users, User } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="section-padding bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <p className="text-accent font-medium text-sm mb-3 uppercase tracking-wider">About</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-8 leading-tight">
                A Heart for Faith, Purpose & Transformation
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                My journey in life coaching began with a deep calling to help others discover the abundant life God promises. Every session, every message, is rooted in scripture and delivered with compassion.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="aspect-square rounded-2xl bg-card border border-border flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsla(38,60%,56%,0.06)_0%,_transparent_70%)]" />
                  <div className="absolute inset-8 rounded-xl border-2 border-accent/15" />
                  <div className="flex flex-col items-center justify-center relative z-10">
                    <div className="w-36 h-36 rounded-full bg-accent/10 flex items-center justify-center ring-4 ring-accent/10 ring-offset-4 ring-offset-card mb-5">
                      <User className="w-16 h-16 text-accent/35" />
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">Coach Profile Photo</p>
                    <p className="text-muted-foreground/50 text-xs mt-1">Your photo here</p>
                  </div>
                  <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-accent/25 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-accent/25 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-accent/25 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-accent/25 rounded-br-lg" />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8">My Story</h2>
                <div className="space-y-5 text-muted-foreground leading-relaxed">
                  <p>
                    From a young age, I felt drawn to ministry and helping others navigate life's most challenging moments. After years of personal spiritual growth, theological study, and mentoring, I answered God's call to become a life coach.
                  </p>
                  <p>
                    I believe that every person has a unique, God-given purpose. My role is to walk alongside you — providing biblical wisdom, practical strategies, and heartfelt encouragement to help you step into the fullness of who God created you to be.
                  </p>
                  <p>
                    Whether through one-on-one coaching or speaking to large audiences, my goal remains the same: to inspire transformative faith and purposeful living.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-6"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-5">Core Values</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">The principles that guide every coaching session and speaking engagement.</p>
            </motion.div>
            <div className="section-divider mb-16" />
            <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
              {[
                { icon: BookOpen, title: "Biblical Foundation", desc: "Everything I teach and share is rooted in God's Word — the ultimate source of truth and wisdom." },
                { icon: Heart, title: "Compassionate Guidance", desc: "I meet people where they are with empathy, patience, and genuine care for their well-being." },
                { icon: Users, title: "Community Impact", desc: "I believe in building up not just individuals, but entire communities through faith and service." },
              ].map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
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
