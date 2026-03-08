import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Compass, ShieldCheck, Crown, Mountain, Sprout } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    icon: Sprout,
    title: "Faith & Spiritual Growth",
    description: "Deepen your relationship with God and strengthen your spiritual foundation through guided biblical study and prayer.",
  },
  {
    icon: Compass,
    title: "Life Purpose & Calling",
    description: "Discover your God-given purpose and gain clarity on the unique path He has designed for your life.",
  },
  {
    icon: Crown,
    title: "Leadership & Decision Making",
    description: "Lead with confidence and wisdom by applying biblical principles to leadership challenges and life decisions.",
  },
  {
    icon: Mountain,
    title: "Overcoming Challenges Through Faith",
    description: "Find strength and perseverance through scripture-based strategies to overcome life's toughest seasons.",
  },
  {
    icon: ShieldCheck,
    title: "Personal Growth & Biblical Guidance",
    description: "Cultivate healthy habits, mindset shifts, and personal disciplines grounded in God's Word.",
  },
];

const Services = () => {
  return (
    <section id="services" className="section-padding">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-6"
        >
          <p className="text-accent font-medium text-sm mb-3 uppercase tracking-wider">Services</p>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-5">
            Coaching Rooted in Biblical Wisdom
          </h2>
          <p className="text-muted-foreground text-lg">
            Each coaching journey is tailored to help you grow spiritually, gain clarity, and live with confidence in God's plan.
          </p>
        </motion.div>

        <div className="section-divider mb-16" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-border hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                    <service.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{service.description}</p>
                  <Button asChild variant="ghost" size="sm" className="p-0 h-auto text-accent hover:text-accent/80 font-medium">
                    <Link to="/coaching">Book Session →</Link>
                  </Button>
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
