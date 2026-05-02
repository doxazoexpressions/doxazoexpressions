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
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const topics = [
  { title: "Living with Purpose", desc: "Discovering and walking in God's unique plan for your life." },
  { title: "Spiritual Growth and Discipline", desc: "Building rhythms of devotion that produce lasting maturity." },
  { title: "Understanding Prayer", desc: "Foundations and dimensions of an effective prayer life." },
  { title: "Walking in God's Will", desc: "Hearing God clearly and responding to His direction." },
  { title: "Faith, Obedience, and Sacrifice", desc: "The covenant currencies that move God on your behalf." },
  { title: "Becoming a Champion in Life", desc: "Kingdom principles for excellence, dominion, and impact." },
  { title: "Overcoming Challenges Through Faith", desc: "Standing strong and victorious in difficult seasons." },
];

const eventTypes = [
  { icon: Church, label: "Churches" },
  { icon: Users, label: "Conferences" },
  { icon: Award, label: "Youth Gatherings" },
  { icon: Lightbulb, label: "Leadership Events" },
  { icon: Heart, label: "Community Programs" },
  { icon: Mic, label: "Faith-Based Organizations" },
];

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  organization: z.string().trim().max(150).optional(),
  event_type: z.string().trim().max(100).optional(),
  topic: z.string().trim().max(150).optional(),
  message: z.string().trim().max(2000).optional(),
});

const Speaking = () => {
  const [form, setForm] = useState({ name: "", email: "", organization: "", event_type: "", event_date: "", topic: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast({ title: "Check your input", description: parsed.error.issues[0].message, variant: "destructive" }); return; }
    setBusy(true);
    const { error } = await supabase.from("speaking_requests").insert({
      ...form,
      event_date: form.event_date || null,
    });
    setBusy(false);
    if (error) { toast({ title: "Could not submit", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Inquiry received!", description: "We'll respond within 48 hours." });
    setForm({ name: "", email: "", organization: "", event_type: "", event_date: "", topic: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="section-padding bg-primary dark:bg-card text-primary-foreground dark:text-card-foreground">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
              <Mic className="w-10 h-10 text-accent mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Speaking & Mentorship</h1>
              <p className="text-lg opacity-80 leading-relaxed">
                Invite us to minister at your church, conference, retreat, or community event. Each session is
                designed to inspire transformation through the Word and the Spirit.
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
                <motion.div key={topic.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
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
                <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Request a Speaking Session</h2>
                <p className="text-muted-foreground">Share a few details and we'll get back to you with availability.</p>
              </div>
              <Card className="border-border">
                <CardContent className="p-6">
                  <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="name">Your Name</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                      <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                    </div>
                    <div><Label htmlFor="org">Organization</Label><Input id="org" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Church or organization" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="eventType">Event Type</Label><Input id="eventType" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} placeholder="Conference, retreat..." /></div>
                      <div><Label htmlFor="date">Preferred Date</Label><Input id="date" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
                    </div>
                    <div><Label htmlFor="topic">Topic Interest</Label><Input id="topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Becoming a Champion in Life" /></div>
                    <div><Label htmlFor="message">Tell us about your event</Label><Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} /></div>
                    <Button type="submit" className="w-full" disabled={busy}>{busy ? "Sending…" : "Request a Speaking Session"}</Button>
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
