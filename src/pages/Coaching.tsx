import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Users, BookOpen, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const coachingTypes = [
  {
    icon: User,
    title: "One-on-One Coaching",
    description: "Personalized sessions focused on your unique needs, goals, and spiritual growth journey.",
    features: ["Tailored biblical guidance", "Weekly 60-minute sessions", "Personalized action plans", "Email support between sessions"],
  },
  {
    icon: Users,
    title: "Group Coaching",
    description: "Join a small group of like-minded believers for shared growth, accountability, and encouragement.",
    features: ["Community learning", "Bi-weekly 90-minute sessions", "Group discussions & prayer", "Shared resources"],
  },
  {
    icon: BookOpen,
    title: "Faith Guidance Sessions",
    description: "Focused sessions for specific spiritual questions, life transitions, or faith-deepening goals.",
    features: ["Targeted scripture study", "Single or multi-session", "Flexible scheduling", "Practical next steps"],
  },
];

const Coaching = () => {
  const [formData, setFormData] = useState({ name: "", email: "", type: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Request Received!", description: "Thank you for reaching out. I'll be in touch within 24 hours." });
    setFormData({ name: "", email: "", type: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="section-padding bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
              <p className="text-accent font-medium text-sm mb-2 uppercase tracking-wider">Coaching</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
                Walk Confidently in God's Plan
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're seeking clarity, spiritual growth, or guidance through a challenging season, coaching can help you take meaningful steps forward.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
              {coachingTypes.map((type, index) => (
                <motion.div key={type.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                  <Card className="h-full border-border hover:border-accent/30 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <type.icon className="w-6 h-6 text-accent" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{type.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6">{type.description}</p>
                      <ul className="space-y-2">
                        {type.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Book a Session</h2>
                <p className="text-muted-foreground">Fill out the form below and I'll reach out to schedule your coaching session.</p>
              </div>
              <Card className="border-border">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Your name" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="your@email.com" />
                    </div>
                    <div>
                      <Label htmlFor="type">Coaching Type</Label>
                      <Input id="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} placeholder="One-on-One, Group, or Faith Guidance" />
                    </div>
                    <div>
                      <Label htmlFor="message">Tell Me About Your Goals</Label>
                      <Textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={4} placeholder="What are you hoping to achieve through coaching?" />
                    </div>
                    <Button type="submit" className="w-full">Request a Session</Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Coaching;
