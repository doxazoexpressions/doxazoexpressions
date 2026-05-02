import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, Church, Users, Award, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

const topics = [
  "Living with Purpose",
  "Spiritual Growth and Discipline",
  "Understanding Prayer",
  "Walking in God's Will",
  "Faith, Obedience, and Sacrifice",
  "Becoming a Champion in Life",
];

const venues = [
  { icon: Church, label: "Churches" },
  { icon: Users, label: "Conferences" },
  { icon: Award, label: "Youth Gatherings" },
  { icon: Lightbulb, label: "Leadership Events" },
];

const SpeakingPreview = () => {
  return (
    <section className="section-padding bg-primary dark:bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsla(38,60%,56%,0.1)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsla(213,52%,40%,0.15)_0%,_transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-primary-foreground dark:text-card-foreground"
          >
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-5 h-5 text-accent" />
              <p className="text-accent font-medium text-sm uppercase tracking-wider">Speaking & Mentorship</p>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8 leading-tight">
              Invite Us to Speak at Your Event
            </h2>
            <p className="opacity-80 leading-relaxed mb-10 text-lg">
              Available to minister at churches, conferences, youth gatherings, leadership events, and
              faith-based organizations. Each session is anointed to inspire, instruct, and ignite
              believers to live as champions in God's kingdom.
            </p>

            <div className="grid grid-cols-2 gap-5 mb-10">
              {venues.map((v) => (
                <div key={v.label} className="flex items-center gap-3 opacity-85">
                  <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                    <v.icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium">{v.label}</span>
                </div>
              ))}
            </div>

            <Button asChild variant="secondary" size="lg" className="gap-2 px-8 py-6 text-base shadow-lg">
              <Link to="/speaking">Request a Speaking Session</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-primary-foreground dark:text-card-foreground"
          >
            <div className="space-y-4">
              <p className="text-accent font-medium text-sm uppercase tracking-wider mb-6">Speaking Topics</p>
              {topics.map((topic, index) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center gap-4 p-5 rounded-xl bg-primary-foreground/5 dark:bg-muted/50 border border-primary-foreground/10 dark:border-border backdrop-blur-sm hover:bg-primary-foreground/8 dark:hover:bg-muted/60 transition-colors"
                >
                  <span className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold shrink-0">
                    {index + 1}
                  </span>
                  <span className="font-medium text-base">{topic}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SpeakingPreview;
