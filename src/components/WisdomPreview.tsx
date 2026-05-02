import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type Teaching = {
  id: string;
  title: string;
  category: string | null;
  excerpt: string | null;
  publish_date: string;
};

const WisdomPreview = () => {
  const [posts, setPosts] = useState<Teaching[]>([]);

  useEffect(() => {
    supabase
      .from("teachings")
      .select("id,title,category,excerpt,publish_date")
      .eq("published", true)
      .order("publish_date", { ascending: false })
      .limit(3)
      .then(({ data }) => setPosts(data ?? []));
  }, []);

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
            <BookOpen className="w-5 h-5 text-accent" />
            <p className="text-accent font-medium text-sm uppercase tracking-wider">Inspirational Teachings</p>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-5">
            Wisdom for Faith, Purpose & Destiny
          </h2>
          <p className="text-muted-foreground text-lg">
            Spirit-led teachings on kingdom principles, prayer, worship, and walking in God's plan.
          </p>
        </motion.div>

        <div className="section-divider mb-16" />

        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground">New teachings coming soon.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-border hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                  <CardContent className="p-0">
                    <div className="h-44 bg-muted rounded-t-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsla(38,60%,56%,0.08)_0%,_transparent_70%)]" />
                      <BookOpen className="w-10 h-10 text-accent/25" />
                    </div>
                    <div className="p-7">
                      <div className="flex items-center gap-2 mb-4">
                        {post.category && (
                          <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                            {post.category}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.publish_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <h3 className="font-serif font-semibold text-foreground mb-3 group-hover:text-primary dark:group-hover:text-accent transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{post.excerpt}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Button asChild variant="outline" className="gap-2 px-6">
            <Link to="/teachings">
              View All Teachings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default WisdomPreview;
