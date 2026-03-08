import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const posts = [
  {
    title: "Finding Peace in the Storm: A Devotional on Psalm 46",
    category: "Devotional",
    excerpt: "When life feels overwhelming, God invites us to be still and know that He is God. Discover how to anchor your heart in His peace.",
    date: "March 5, 2026",
  },
  {
    title: "5 Biblical Principles for Making Life Decisions",
    category: "Life Guidance",
    excerpt: "Facing a crossroads? These five principles from Scripture will help you discern God's direction with confidence.",
    date: "February 28, 2026",
  },
  {
    title: "The Power of Gratitude: Transforming Your Perspective",
    category: "Encouragement",
    excerpt: "Learn how cultivating a heart of gratitude can shift your focus from worry to worship and bring lasting joy.",
    date: "February 20, 2026",
  },
];

const WisdomPreview = () => {
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
            <p className="text-accent font-medium text-sm uppercase tracking-wider">Wisdom & Insights</p>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-5">
            Faith-Based Teachings & Encouragement
          </h2>
          <p className="text-muted-foreground text-lg">
            Explore devotionals, biblical reflections, and life lessons to inspire and encourage your journey.
          </p>
        </motion.div>

        <div className="section-divider mb-16" />

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {posts.map((post, index) => (
            <motion.div
              key={post.title}
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
                      <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Button asChild variant="outline" className="gap-2 px-6">
            <Link to="/wisdom">
              View All Insights
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default WisdomPreview;
