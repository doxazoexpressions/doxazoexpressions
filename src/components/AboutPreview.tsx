import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, User } from "lucide-react";
import { motion } from "framer-motion";

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
            <div className="aspect-[4/5] rounded-2xl bg-card border border-border overflow-hidden relative shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsla(38,60%,56%,0.06)_0%,_transparent_70%)]" />
              <div className="absolute inset-6 rounded-xl border-2 border-accent/20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-accent/10 flex items-center justify-center mb-5 ring-4 ring-accent/10 ring-offset-4 ring-offset-card">
                  <User className="w-14 h-14 text-accent/40" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">Coach Profile Photo</p>
                <p className="text-muted-foreground/50 text-xs mt-1">Upload your photo here</p>
              </div>
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-accent/30 rounded-tl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-accent/30 rounded-br-lg" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <p className="text-accent font-medium text-sm mb-3 uppercase tracking-wider">About Me</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8 leading-tight">
              A Passion for Helping Others Grow in Faith
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              With years of experience in ministry and life coaching, I am deeply committed to
              helping individuals discover their God-given purpose and navigate life's challenges
              with biblical wisdom and grace.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10">
              My mission is to inspire, encourage, and equip people to live boldly in their faith,
              make confident decisions, and build lives that honor God and impact their communities.
            </p>
            <Button asChild variant="outline" className="gap-2 px-6">
              <Link to="/about">
                Learn More About Me
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
