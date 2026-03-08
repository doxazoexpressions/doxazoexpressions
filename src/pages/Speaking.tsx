import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mic, Church, Users, Award, Lightbulb, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const topics = [
  { title: "Living with Purpose", desc: "Discovering and walking in God's unique plan for your life." },
  { title: "Overcoming Adversity Through Faith", desc: "Finding strength and hope in scripture during life's toughest moments." },
  { title: "Christian Leadership", desc: "Leading with integrity, humility, and biblical wisdom." },
  { title: "Strengthening Faith in Difficult Seasons", desc: "Building resilience and trust in God when the path is unclear." },
  { title: "Walking in God's Calling", desc: "Recognizing and responding to the specific calling God has placed on your life." },
];

const eventTypes = [
  { icon: Church, label: "Churches" },
  { icon: Users, label: "Conferences" },
  { icon: Award, label: "Youth Gatherings" },
  { icon: Lightbulb, label: "Leadership Events" },
  { icon: Heart, label: "Community Programs" },
  { icon: Mic, label: "Faith-Based Organizations" },
];

const Speaking = () => {
  const [formData, setFormData] = useState({ name: "", email: "", organization: "", eventType: "", date: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Inquiry Received!", description: "Thank you for your interest. I'll respond within 48 hours." });
    setFormData({ name: "", email: "", organization: "", eventType: "", date: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="section-padding bg-primary dark:bg-card text-primary-foreground dark:text-card-foreground">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
              <Mic className="w-10 h-10 text-accent mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Inspirational Speaking</h1>
              <p className="text-lg opacity-80 leading-relaxed">
                Invite me to speak at your church, conference, retreat, or community event. My messages are designed to inspire transformation through the power of God's Word.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Available For</h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-20">
              {eventTypes.map((e, i) => (
                <motion.div key={e.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                    <e.icon className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-foreground">{e.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Speaking Topics</h2>
            </motion.div>
            <div className="space-y-4 max-w-3xl mx-auto mb-20">
              {topics.map((topic, i) => (
                <motion.div key={topic.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className="border-border">
                    <CardContent className="p-5 flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{topic.title}</h3>
                        <p className="text-muted-foreground text-sm">{topic.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Request a Speaking Engagement</h2>
                <p className="text-muted-foreground">Fill out the form and I'll get back to you with availability and details.</p>
              </div>
              <Card className="border-border">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Full name" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="your@email.com" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="org">Organization</Label>
                      <Input id="org" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} placeholder="Church or organization name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="eventType">Event Type</Label>
                        <Input id="eventType" value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })} placeholder="Conference, retreat, etc." />
                      </div>
                      <div>
                        <Label htmlFor="date">Preferred Date</Label>
                        <Input id="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} placeholder="Month/Year" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="message">Tell Me About Your Event</Label>
                      <Textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={4} placeholder="Describe your event, audience, and any specific topics you'd like covered." />
                    </div>
                    <Button type="submit" className="w-full">Submit Speaking Inquiry</Button>
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

export default Speaking;
