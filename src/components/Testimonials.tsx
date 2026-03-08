import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Grace Okonkwo",
    role: "Women's Ministry Leader",
    content: "Through coaching, I finally found clarity about the calling God placed on my heart. The sessions helped me overcome doubt and step boldly into the purpose He designed for me.",
    avatar: "GO",
    rating: 5
  },
  {
    name: "David & Rachel Mensah",
    role: "Marriage & Family",
    content: "We were going through one of the hardest seasons in our marriage. The biblical wisdom and compassionate guidance we received helped us rebuild our foundation on faith and trust.",
    avatar: "DM",
    rating: 5
  },
  {
    name: "Pastor James Adeyemi",
    role: "Community Church Fellowship",
    content: "Having this coach speak at our annual conference was a blessing. The message on walking in God's calling deeply moved our congregation and sparked real transformation.",
    avatar: "JA",
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="section-padding relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsla(38,60%,56%,0.05)_0%,_transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <p className="text-accent font-medium text-sm mb-3 uppercase tracking-wider">Testimonials</p>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Lives Encouraged, Faith Strengthened
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hear from individuals and communities who have been inspired through coaching and speaking.
          </p>
        </motion.div>

        <div className="section-divider mb-16" />

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-border bg-card p-8 hover:border-accent/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
            >
              <Quote className="w-8 h-8 text-accent/15 absolute top-6 right-6" />
              
              <div className="flex gap-1 mb-5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              <p className="text-muted-foreground mb-8 leading-relaxed text-[15px]">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold font-serif ring-2 ring-accent/10">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
