import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, MapPin, Send, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { track } from "@/lib/analytics";

const TYPE_OPTIONS = [
  { value: "general", label: "General Inquiry" },
  { value: "partnership", label: "Partnership" },
  { value: "testimony", label: "Share a Testimony" },
  { value: "prayer_request", label: "Prayer Request" },
] as const;

type ContactType = (typeof TYPE_OPTIONS)[number]["value"];

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(1, "Message is required").max(5000),
  type: z.enum(["general", "partnership", "testimony", "prayer_request"]),
});

const Contact = () => {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    subject: string;
    message: string;
    type: ContactType;
  }>({ name: "", email: "", subject: "", message: "", type: "general" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Check your input", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      subject: parsed.data.subject ?? null,
      type: parsed.data.type,
    });
    setBusy(false);
    if (error) {
      toast({ title: "Could not send", description: error.message, variant: "destructive" });
      return;
    }
    track("contact_submit", { type: form.type });
    toast({ title: "Message sent", description: "We'll respond as soon as possible." });
    setForm({ name: "", email: "", subject: "", message: "", type: "general" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
              <p className="text-accent font-medium text-sm mb-2 uppercase tracking-wider">Contact</p>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">Let's Connect</h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Reach out for prayer, partnership, to share a testimony, or for any general question.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-foreground mb-3">Get in Touch</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    We read every message. Choose the right type below so it reaches the right hands.
                  </p>
                </div>
                {[
                  { icon: Mail, label: "Email", value: "hello@doxazoexpressions.com" },
                  { icon: MessageSquare, label: "Prayer & Testimony", value: "Use the form to the right" },
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
                      <div>
                        <Label htmlFor="type">What's this about?</Label>
                        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ContactType })}>
                          <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {TYPE_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                      </div>
                      <div><Label htmlFor="subject">Subject (optional)</Label><Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
                      <div><Label htmlFor="message">Message</Label><Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={6} required /></div>
                      <Button type="submit" className="w-full gap-2" disabled={busy}>
                        <Send className="w-4 h-4" />{busy ? "Sending…" : "Send Message"}
                      </Button>
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
