import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    title: "E-Commerce Platform",
    category: "Web Development",
    description: "A modern shopping experience with seamless checkout and real-time inventory.",
    color: "from-primary/20 to-primary/5",
  },
  {
    title: "Finance Dashboard",
    category: "UI/UX Design",
    description: "Data visualization dashboard for tracking investments and market trends.",
    color: "from-accent/20 to-accent/5",
  },
  {
    title: "Social Media App",
    category: "Mobile Development",
    description: "Connect with friends through stories, reels, and real-time messaging.",
    color: "from-primary/20 to-accent/10",
  },
  {
    title: "Brand Identity",
    category: "Branding",
    description: "Complete visual identity system for a tech startup disrupting the industry.",
    color: "from-accent/20 to-primary/10",
  },
];

const WorkSection = () => {
  return (
    <section id="work" className="py-32 relative">
      <div className="geometric-shape w-96 h-96 bg-primary -left-40 top-1/2 animate-float" />
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-primary font-medium mb-4">My Work</p>
          <h2 className="text-headline text-foreground">
            Featured <span className="text-gradient">Projects</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group relative rounded-2xl bg-card border border-border overflow-hidden hover-lift cursor-pointer"
            >
              {/* Project Preview */}
              <div className={`aspect-[4/3] bg-gradient-to-br ${project.color} relative`}>
                <div className="absolute inset-8 border border-foreground/10 rounded-lg" />
                <div className="absolute bottom-6 left-6 right-6 space-y-2">
                  <div className="h-3 bg-foreground/10 rounded" />
                  <div className="h-3 bg-foreground/10 rounded w-3/4" />
                </div>
              </div>

              {/* Project Info */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-primary mb-2">{project.category}</p>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-gradient transition-all duration-300">
                      {project.title}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                    <ArrowUpRight size={18} className="text-muted-foreground group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                </div>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkSection;
