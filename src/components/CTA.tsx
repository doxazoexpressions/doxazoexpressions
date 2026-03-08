import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Mic } from "lucide-react";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsla(38,60%,56%,0.08)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsla(213,52%,24%,0.04)_0%,_transparent_40%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="section-divider mb-12" />
          
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-8 leading-tight">
            Ready to Walk Confidently in God's <span className="text-gradient">Purpose</span>?
          </h2>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Receive biblical guidance, spiritual encouragement, and practical wisdom to help you move forward with faith and clarity. Your journey toward purpose, faith, and transformation begins today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button asChild size="lg" className="gap-2 px-8 py-6 text-base shadow-lg hover:shadow-xl transition-shadow">
              <Link to="/coaching">
                <BookOpen className="w-5 h-5" />
                Book a Coaching Session
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 px-8 py-6 text-base">
              <Link to="/speaking">
                <Mic className="w-5 h-5" />
                Invite Me to Speak
              </Link>
            </Button>
          </div>

          <blockquote className="text-muted-foreground italic font-serif text-lg max-w-md mx-auto border-l-2 border-accent pl-6 text-left">
            "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future."
            <cite className="block mt-3 text-sm not-italic text-accent font-sans font-medium">
              — Jeremiah 29:11
            </cite>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
