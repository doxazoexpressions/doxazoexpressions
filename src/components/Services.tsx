import { Card, CardContent } from "@/components/ui/card";
import { Heart, BookOpen, Music, ShieldCheck, Flame } from "lucide-react";
import { motion } from "framer-motion";

const platforms = [
  {
    icon: Heart,
    title: "Prayer",
    scripture: "1 Thessalonians 5:17",
    description: "Communion with God that opens heaven and shapes destiny.",
    benefit: "Intimacy, breakthrough, and spiritual authority.",
  },
  {
    icon: BookOpen,
    title: "The Word",
    scripture: "Joshua 1:8",
    description: "Daily engagement with Scripture as the believer's life-blueprint.",
    benefit: "Faith, wisdom, and clarity for every season.",
  },
  {
    icon: Music,
    title: "Worship",
    scripture: "John 4:23-24",
    description: "Surrendered adoration that ushers in God's manifest presence.",
    benefit: "Transformation, peace, and divine encounters.",
  },
  {
    icon: ShieldCheck,
    title: "Obedience",
    scripture: "1 Samuel 15:22",
    description: "A consistent yes to God's instructions, even in small matters.",
    benefit: "Favor, alignment, and access to God's promises.",
  },
  {
    icon: Flame,
    title: "Sacrifice",
    scripture: "Romans 12:1",
    description: "Offering time, resources, and self in covenant with God.",
    benefit: "Provision, elevation, and supernatural exchange.",
  },
];

const Services = () => {
  return (
    <section id="platforms" className="section-padding">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-6"
        >
          <p className="text-accent font-medium text-sm mb-3 uppercase tracking-wider">The Five Platforms</p>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-5">
            Five Platforms Every Believer Must Engage
          </h2>
          <p className="text-muted-foreground text-lg">
            Inspired by Apostle Joshua Selman's teachings — these are the foundational platforms that build
            spiritual depth, kingdom impact, and a life of victory.
          </p>
        </motion.div>

        <div className="section-divider mb-16" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {platforms.map((p, index) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="h-full border-border hover:border-accent/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                    <p.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-2xl font-serif font-semibold text-foreground mb-1">{p.title}</h3>
                  <p className="text-xs text-accent font-medium mb-4 uppercase tracking-wider">{p.scripture}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{p.description}</p>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    <span className="font-semibold">Benefit:</span> {p.benefit}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
