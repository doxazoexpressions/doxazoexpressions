import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
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
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { track } from "@/lib/analytics";

const SUPPORT_EMAIL = "doxazoexpressions@gmail.com";

const TYPE_OPTIONS = [
  { value: "general", label: "General Inquiry" },
  { value: "partnership", label: "Partnership" },
  { value: "testimony", label: "Share a Testimony" },
  { value: "prayer_request", label: "Prayer Request" },
] as const;

type ContactType = (typeof TYPE_OPTIONS)[number]["value"];

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100, "Name must be under 100 characters"),
  email: z.string().trim().min(1, "Please enter your email").email("Enter a valid email address").max(255),
  subject: z.string().trim().max(150, "Subject must be under 150 characters").optional(),
  message: z
    .string()
    .trim()
    .min(1, "Please write a message")
    .max(5000, "Message must be under 5000 characters"),
  type: z.enum(["general", "partnership", "testimony", "prayer_request"]),
});

type FieldErrors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

const Contact = () => {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    subject: string;
    message: string;
    type: ContactType;
  }>({ name: "", email: "", subject: "", message: "", type: "general" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "failed">("idle");
  // A ref, not state: two clicks in the same tick would both read a stale `busy`.
  const inFlight = useRef(false);

  const set = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    if (status !== "idle") setStatus("idle");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return; // guard against duplicate submissions

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setStatus("idle");
      toast({ title: "Check your details", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }

    inFlight.current = true;
    setBusy(true);
    setStatus("idle");
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      subject: parsed.data.subject ?? null,
      type: parsed.data.type,
    });
    setBusy(false);
    inFlight.current = false;

    if (error) {
      // Never surface raw backend errors to the reader.
      setStatus("failed");
      toast({
        title: "Message not sent",
        description: `Something went wrong on our side. Please try again, or email ${SUPPORT_EMAIL}.`,
        variant: "destructive",
      });
      return;
    }

    track("contact_submit", { type: form.type });
    setStatus("sent");
    toast({ title: "Message received", description: "Thank you — we'll respond as soon as we can." });
    // Only clear on success; a failed send keeps everything the user typed.
    setForm({ name: "", email: "", subject: "", message: "", type: "general" });
    setErrors({});
  };

  const fieldClass = (key: keyof FieldErrors) =>
    `h-11 ${errors[key] ? "border-destructive focus-visible:ring-destructive" : ""}`;

  return (
    <div className="min-h-dvh bg-background">
      <SEO
        title="Contact Doxazo Expressions"
        description="Reach out to Doxazo Expressions for prayer, partnership, to share a testimony, or for any general question."
        path="/contact"
      />
      <Navbar />
      <main className="pt-16">
        <section className="pt-9 pb-8 md:pt-14 md:pb-12 bg-secondary/30">
          <div className="container mx-auto page-x max-w-2xl text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <MessageSquare className="w-7 h-7 md:w-8 md:h-8 text-accent mx-auto mb-3" aria-hidden="true" />
              <p className="type-meta text-accent mb-2">Contact</p>
              <h1 className="type-display text-[26px] md:text-4xl text-foreground mb-3 break-words">Let's Connect</h1>
              <p className="type-body text-sm md:text-base text-muted-foreground max-w-md mx-auto">
                Reach out for prayer, partnership, to share a testimony, or for any general question. We read every
                message.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto page-x">
            <div className="max-w-xl mx-auto">
              <motion.form
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                onSubmit={submit}
                noValidate
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="type">Reason for contacting</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ContactType })}>
                    <SelectTrigger id="type" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => set("name")(e.target.value)}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      className={fieldClass("name")}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-xs text-destructive">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => set("email")(e.target.value)}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={fieldClass("email")}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-xs text-destructive">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Subject <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(e) => set("subject")(e.target.value)}
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? "subject-error" : undefined}
                    className={fieldClass("subject")}
                  />
                  {errors.subject && (
                    <p id="subject-error" className="text-xs text-destructive">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => set("message")(e.target.value)}
                    rows={6}
                    maxLength={5000}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : "message-hint"}
                    className={`min-h-[150px] resize-y ${errors.message ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors.message ? (
                    <p id="message-error" className="text-xs text-destructive">
                      {errors.message}
                    </p>
                  ) : (
                    <p id="message-hint" className="text-xs text-muted-foreground">
                      Share as much or as little as you'd like — up to 5000 characters.
                    </p>
                  )}
                </div>

                <Button type="submit" size="lg" className="w-full gap-2 min-h-11" disabled={busy}>
                  <Send className="w-4 h-4" aria-hidden="true" />
                  {busy ? "Sending…" : "Send Message"}
                </Button>

                {/* Screen-reader-friendly submission feedback. */}
                <div aria-live="polite" className="min-h-[20px]">
                  {status === "sent" && (
                    <p className="flex items-start gap-2 text-sm text-accent">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                      Your message has been received. We'll respond as soon as we can.
                    </p>
                  )}
                  {status === "failed" && (
                    <p className="flex items-start gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                      We couldn't send your message. Your text is still here — please try again.
                    </p>
                  )}
                </div>
              </motion.form>

              <div className="section-divider my-8 md:my-10" aria-hidden="true" />

              <div className="text-center">
                <p className="type-meta text-accent mb-2">Prefer Email?</p>
                <p className="type-body text-sm text-muted-foreground mb-2">
                  You can also write to us directly and we'll reply within a few business days.
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="inline-flex items-center gap-2 min-h-11 text-sm font-medium text-foreground hover:text-accent interactive break-all"
                >
                  <Mail className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
