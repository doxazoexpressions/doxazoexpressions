import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Send, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(1).max(5000),
});

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast({ title: "Check your input", description: parsed.error.issues[0].message, variant: "destructive" }); return; }
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert(form);
    setBusy(false);
    if (error) { toast({ title: "Could not send", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Message sent!", description: "We'll respond as soon as possible." });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="section-padding bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
              <p className="text-accent font-medium text-sm mb-2 uppercase tracking-wider">Contact</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Let's Connect</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Reach out for prayer, partnership, mentorship, or to share what God is doing in your life.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
                <div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-4">Get in Touch</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">We're here to walk with you on your journey.</p>
                </div>
                {[
                  { icon: Mail, label: "Email", value: "hello@doxazoexpressions.com" },
                  { icon: MessageSquare, label: "Prayer Requests", value: "Submit through this form" },
                  { icon: MapPin, label: "Reach", value: "Available Worldwide" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-2">
                <Card className="border-border">
                  <CardContent className="p-6">
                    <form onSubmit={submit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                      </div>
                      <div><Label htmlFor="subject">Subject</Label><Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Prayer request, speaking, partnership..." /></div>
                      <div><Label htmlFor="message">Message</Label><Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} required /></div>
                      <Button type="submit" className="w-full gap-2" disabled={busy}><Send className="w-4 h-4" />{busy ? "Sending…" : "Send Message"}</Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
