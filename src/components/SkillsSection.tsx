const skills = [
  { name: "React", level: 95 },
  { name: "TypeScript", level: 90 },
  { name: "Node.js", level: 85 },
  { name: "UI/UX Design", level: 88 },
  { name: "Next.js", level: 82 },
  { name: "Python", level: 75 },
];

const technologies = [
  "React", "Vue", "Angular", "Next.js", "TypeScript", "Node.js",
  "Python", "PostgreSQL", "MongoDB", "AWS", "Docker", "Figma",
  "Tailwind CSS", "GraphQL", "Redis", "Git"
];

const SkillsSection = () => {
  return (
    <section id="skills" className="py-32 relative bg-secondary/30">
      <div className="geometric-shape w-64 h-64 bg-accent right-0 bottom-0 animate-pulse-slow" />
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-primary font-medium mb-4">Skills</p>
          <h2 className="text-headline text-foreground">
            My <span className="text-gradient">Expertise</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Skill Bars */}
          <div className="space-y-8">
            <h3 className="text-xl font-semibold text-foreground mb-6">Core Skills</h3>
            {skills.map((skill, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-foreground font-medium">{skill.name}</span>
                  <span className="text-muted-foreground">{skill.level}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Technology Tags */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-6">Technologies</h3>
            <div className="flex flex-wrap gap-3">
              {technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-card border border-border rounded-full text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-300 cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
