import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "./ui/button";

const ContactSection = () => {
  return (
    <section id="contact" className="py-32 relative">
      <div className="geometric-shape w-80 h-80 bg-primary -left-20 top-20 animate-float" />
      <div className="geometric-shape w-48 h-48 bg-accent right-10 bottom-10 animate-pulse-slow" />
      
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary font-medium mb-4">Contact</p>
            <h2 className="text-headline text-foreground mb-6">
              Let's Work <span className="text-gradient">Together</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Have a project in mind? I'd love to hear about it. Let's discuss how we can bring your ideas to life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card border border-border rounded-2xl p-8 text-center hover-lift">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="text-primary" size={24} />
              </div>
              <h3 className="text-foreground font-semibold mb-2">Email</h3>
              <p className="text-muted-foreground">hello@johndoe.com</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 text-center hover-lift">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="text-primary" size={24} />
              </div>
              <h3 className="text-foreground font-semibold mb-2">Phone</h3>
              <p className="text-muted-foreground">+1 (555) 123-4567</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 text-center hover-lift">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-primary" size={24} />
              </div>
              <h3 className="text-foreground font-semibold mb-2">Location</h3>
              <p className="text-muted-foreground">San Francisco, CA</p>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-card via-secondary to-card border border-border rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-primary opacity-5" />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ready to start your project?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Let's create something amazing together. Drop me a message and I'll get back to you within 24 hours.
              </p>
              <Button variant="hero" asChild>
                <a href="mailto:hello@johndoe.com">Send Message</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
