import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, ArrowRight, Flame, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import CategoryBadge from "./CategoryBadge";
import { track } from "@/lib/analytics";

type Devotional = {
  id: string;
  title: string;
  scripture_reference: string | null;
  scripture_text: string | null;
  body: string;
  excerpt: string | null;
  category: string | null;
  publish_date: string;
};

const DevotionalHighlight = () => {
  const [today, setToday] = useState<Devotional | null>(null);
  const [recent, setRecent] = useState<Devotional[]>([]);

  useEffect(() => {
    const nowIso = new Date().toISOString();
    supabase
      .from("devotionals")
      .select("id,title,scripture_reference,scripture_text,body,excerpt,category,publish_date")
      .eq("published", true)
      .or(`scheduled_for.is.null,scheduled_for.lte.${nowIso}`)
      .order("publish_date", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        setToday(data[0] as Devotional);
        setRecent(data.slice(1) as Devotional[]);
      });
  }, []);

  const previewText =
    today?.excerpt?.trim() ||
    (today?.body ? (today.body.length > 280 ? today.body.slice(0, 280).trim() + "…" : today.body) : "");

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sun className="w-5 h-5 text-accent" />
            <p className="text-accent font-medium text-sm uppercase tracking-wider">Today's Devotional</p>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-5">
            Begin Your Morning in God's Presence
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            A fresh word, scripture, and reflection prepared for today.
          </p>
        </motion.div>

        <div className="section-divider mb-12" />

        {today ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mb-16"
          >
            <Card className="border-border shadow-xl">
              <CardContent className="p-6 sm:p-8 md:p-12">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {new Date(today.publish_date).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <CategoryBadge slug={today.category} />
                </div>
                <h3 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-5 leading-tight">
                  {today.title}
                </h3>
                {today.scripture_reference && (
                  <p className="text-accent font-medium mb-6">{today.scripture_reference}</p>
                )}
                {today.scripture_text && (
                  <blockquote className="border-l-2 border-accent pl-5 italic font-serif text-foreground/80 mb-6 leading-relaxed">
                    "{today.scripture_text}"
                  </blockquote>
                )}
                <p className="text-muted-foreground leading-relaxed mb-8">{previewText}</p>
                <Button asChild className="gap-2" onClick={() => track("devotional_open", { from: "home_highlight" })}>
                  <Link to="/devotional">
                    Read Full Devotional
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="text-center mb-16 max-w-xl mx-auto">
            <p className="text-muted-foreground mb-4">
              Today's devotional will publish at sunrise. In the meantime, explore the archive.
            </p>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/archive">
                Browse Devotional Archive
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-3 mb-16 text-sm text-muted-foreground text-center px-4"
        >
          <Flame className="w-4 h-4 text-accent shrink-0" />
          <span>Daily devotionals, published every morning without fail.</span>
        </motion.div>

        {recent.length > 0 && (
          <>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-accent" />
                <p className="text-accent font-medium text-sm uppercase tracking-wider">From the Archive</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              {recent.map((post) => (
                <Link key={post.id} to="/archive" className="group block h-full">
                  <Card className="h-full border-border group-hover:border-accent/40 transition-all duration-300 group-hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {new Date(post.publish_date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <CategoryBadge slug={post.category} asLink={false} />
                      </div>
                      <h4 className="font-serif font-semibold text-foreground mb-2 leading-snug group-hover:text-accent transition-colors">
                        {post.title}
                      </h4>
                      {post.scripture_reference && (
                        <p className="text-xs text-accent font-medium">{post.scripture_reference}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Button asChild variant="outline" className="gap-2" onClick={() => track("cta_browse_archive", { from: "home_archive" })}>
                <Link to="/archive">
                  View Devotional Archive
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default DevotionalHighlight;
