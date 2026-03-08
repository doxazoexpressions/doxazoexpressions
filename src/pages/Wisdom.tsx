import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const articles = [
  { title: "Finding Peace in the Storm: A Devotional on Psalm 46", category: "Devotional", excerpt: "When life feels overwhelming, God invites us to be still and know that He is God. Discover how to anchor your heart in His peace even in the most turbulent times.", date: "March 5, 2026" },
  { title: "5 Biblical Principles for Making Life Decisions", category: "Life Guidance", excerpt: "Facing a crossroads? These five principles from Scripture will help you discern God's direction with confidence and clarity.", date: "February 28, 2026" },
  { title: "The Power of Gratitude: Transforming Your Perspective", category: "Encouragement", excerpt: "Learn how cultivating a heart of gratitude can shift your focus from worry to worship and bring lasting joy to your daily life.", date: "February 20, 2026" },
  { title: "When God Says Wait: Trusting His Timing", category: "Devotional", excerpt: "Waiting seasons can feel frustrating, but God is always at work behind the scenes. Here's how to trust His perfect timing.", date: "February 15, 2026" },
  { title: "Building a Life of Purpose: Lessons from Nehemiah", category: "Biblical Reflection", excerpt: "Nehemiah rebuilt walls and restored hope. Discover how his example can inspire you to build a purpose-driven life.", date: "February 8, 2026" },
  { title: "Overcoming Fear with Faith: What Scripture Teaches", category: "Encouragement", excerpt: "Fear is a natural human response, but God's Word offers powerful truths that can help you face every challenge with courage.", date: "February 1, 2026" },
  { title: "The Armor of God: Daily Spiritual Preparation", category: "Devotional", excerpt: "Ephesians 6 describes the spiritual armor God provides. Learn how to put it on each day and stand firm in your faith.", date: "January 25, 2026" },
  { title: "Forgiveness: The Key to Freedom and Healing", category: "Life Guidance", excerpt: "Unforgiveness can hold us captive. Discover the transformative power of forgiveness through biblical wisdom and practical steps.", date: "January 18, 2026" },
];

const Wisdom = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="section-padding bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
              <BookOpen className="w-10 h-10 text-accent mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Wisdom & Insights</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Explore devotionals, biblical reflections, encouragement, and life lessons rooted in scripture. Come back often for fresh inspiration.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {articles.map((article, index) => (
                <motion.div key={article.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                  <Card className="h-full border-border hover:border-accent/30 transition-all duration-300 hover:shadow-lg group cursor-pointer">
                    <CardContent className="p-0">
                      <div className="h-40 bg-muted rounded-t-lg flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-accent/30" />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">{article.category}</span>
                          <span className="text-xs text-muted-foreground">{article.date}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary dark:group-hover:text-accent transition-colors">{article.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{article.excerpt}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Wisdom;
