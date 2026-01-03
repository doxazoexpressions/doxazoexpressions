import { ArrowDown } from "lucide-react";
import { Button } from "./ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background geometric shapes */}
      <div className="geometric-shape w-96 h-96 bg-primary -top-20 -right-20 animate-float" />
      <div className="geometric-shape w-64 h-64 bg-accent bottom-20 -left-10 animate-pulse-slow" />
      <div className="geometric-shape w-48 h-48 bg-primary/50 top-1/3 left-1/4 animate-float" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl">
          <p className="text-primary font-medium mb-4 animate-slide-up">
            Hello, I'm
          </p>
          
          <h1 className="text-display mb-6 animate-slide-up-delay-1">
            <span className="text-foreground">John</span>{" "}
            <span className="text-gradient">Doe</span>
          </h1>
          
          <p className="text-headline text-muted-foreground mb-8 animate-slide-up-delay-2">
            Creative Developer & Designer
          </p>
          
          <p className="text-lg text-muted-foreground max-w-xl mb-12 animate-slide-up-delay-3">
            I craft digital experiences that blend stunning visuals with seamless functionality. 
            Let's build something extraordinary together.
          </p>

          <div className="flex flex-wrap gap-4 animate-slide-up-delay-3">
            <Button variant="hero" asChild>
              <a href="#work">View My Work</a>
            </Button>
            <Button variant="heroOutline" asChild>
              <a href="#contact">Get In Touch</a>
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-sm text-muted-foreground">Scroll</span>
          <ArrowDown size={20} className="text-primary" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
