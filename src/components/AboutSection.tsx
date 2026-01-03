const AboutSection = () => {
  return (
    <section id="about" className="py-32 relative">
      <div className="geometric-shape w-72 h-72 bg-accent -right-20 top-20 animate-pulse-slow" />
      
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image/Visual */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-secondary to-muted overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20" />
              <div className="absolute inset-4 border-2 border-primary/30 rounded-xl" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="h-2 bg-primary/40 rounded mb-3" />
                <div className="h-2 bg-primary/30 rounded w-3/4 mb-3" />
                <div className="h-2 bg-primary/20 rounded w-1/2" />
              </div>
            </div>
            
            {/* Floating accent card */}
            <div className="absolute -bottom-8 -right-8 bg-card border border-border rounded-xl p-6 shadow-xl">
              <p className="text-4xl font-bold text-gradient mb-1">5+</p>
              <p className="text-sm text-muted-foreground">Years Experience</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-primary font-medium mb-4">About Me</p>
            <h2 className="text-headline text-foreground mb-8">
              Passionate about creating <span className="text-gradient">impactful</span> digital experiences
            </h2>
            
            <div className="space-y-6 text-muted-foreground">
              <p>
                I'm a full-stack developer and designer based in San Francisco, 
                specializing in building exceptional digital experiences. With a 
                background in both design and development, I bridge the gap between 
                aesthetics and functionality.
              </p>
              <p>
                My journey started with a curiosity for how things work on the web. 
                Today, I've had the privilege of working with startups, agencies, 
                and established companies to bring their visions to life.
              </p>
              <p>
                When I'm not coding, you'll find me exploring new design trends, 
                contributing to open source, or hiking in the mountains.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12">
              <div>
                <p className="text-3xl font-bold text-foreground">50+</p>
                <p className="text-sm text-muted-foreground">Projects Completed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">30+</p>
                <p className="text-sm text-muted-foreground">Happy Clients</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">15+</p>
                <p className="text-sm text-muted-foreground">Awards Won</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
