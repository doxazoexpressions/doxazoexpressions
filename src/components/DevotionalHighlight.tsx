import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Only show skeleton if loading takes longer than 200ms — avoids flash on fast networks
    const skeletonTimer = setTimeout(() => setShowSkeleton(true), 200);
    supabase
      .from("devotionals")
      .select("id,title,scripture_reference,scripture_text,body,excerpt,category,publish_date")
      .or(liveDevotionalOr())
      .order("publish_date", { ascending: false })
      .limit(4)
      .then(({ data, error }) => {
        clearTimeout(skeletonTimer);
        setLoading(false);
        if (error) {
          setError(true);
          return;
        }
        if (!data || data.length === 0) return;
        setToday(data[0] as Devotional);
        setRecent(data.slice(1) as Devotional[]);
      });
    return () => clearTimeout(skeletonTimer);
  }, []);

  const previewText =
    today?.excerpt?.trim() ||
    (today?.body ? (today.body.length > 280 ? today.body.slice(0, 280).trim() + "…" : today.body) : "");

  const isToday = today
    ? new Date(today.publish_date).toDateString() === new Date().toDateString()
    : false;
  const eyebrow = isToday ? "Today's Devotional" : "Latest Devotional";
  const heading = isToday
    ? "Begin Your Morning in God's Presence"
    : "Your Latest Devotional Is Ready";
  const subheading = isToday
    ? "A fresh word, scripture, and reflection prepared for today."
    : "Read the most recent word, scripture, and reflection — available now.";

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
            <p className="text-accent font-medium text-sm uppercase tracking-wider">{eyebrow}</p>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-5">
            {heading}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            {subheading}
          </p>
        </motion.div>

        <div className="section-divider mb-12" />

        {loading && showSkeleton ? (
          <div className="max-w-3xl mx-auto mb-16">
            <Card className="border-border shadow-xl">
              <CardContent className="p-6 sm:p-8 md:p-12 space-y-4">
                <div className="flex justify-between"><Skeleton className="h-4 w-40" /><Skeleton className="h-5 w-20" /></div>
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-10 w-44 mt-2" />
              </CardContent>
            </Card>
          </div>
        ) : loading ? (
          <div className="max-w-3xl mx-auto mb-16 min-h-[20rem]" aria-hidden="true" />
        ) : error ? (
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
                    {new Date().toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <CategoryBadge slug="daily" />
                </div>
                <h3 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-5 leading-tight">
                  A Fresh Word Is Being Prepared
                </h3>
                <p className="text-accent font-medium mb-6">Psalm 119:105 — "Your word is a lamp to my feet and a light to my path."</p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  While today's devotional is being prepared, take a moment to reflect on this truth: God's Word is always a lamp for our path. Browse the archive for past devotionals filled with Scripture, reflection, and faith declarations to anchor your day.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button asChild onClick={() => track("devotional_open", { from: "home_highlight_fallback" })}>
                    <Link to="/devotional">
                      Read Today's Devotional
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/archive">Browse Archive</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : today ? (
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
                    Read Today's Devotional
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto mb-16"
          >
            <Card className="border-border shadow-xl">
              <CardContent className="p-6 sm:p-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sun className="w-5 h-5 text-accent" />
                  <p className="text-accent font-medium text-xs uppercase tracking-wider">Devotional Schedule</p>
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4 leading-tight">
                  The first devotional arrives at sunrise
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Every morning, a fresh Scripture, reflection, and declaration is published here.
                  Subscribe below to be the first to read it.
                </p>
                <Button asChild className="gap-2">
                  <Link to="/archive">
                    Explore Devotional Archive
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
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
