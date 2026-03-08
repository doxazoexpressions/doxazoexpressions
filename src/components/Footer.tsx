import { Link } from "react-router-dom";
import { Cross } from "lucide-react";

const Footer = () => {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Coaching", href: "/coaching" },
    { name: "Speaking", href: "/speaking" },
    { name: "Wisdom", href: "/wisdom" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "#" },
  ];

  return (
    <footer className="border-t border-border pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Cross className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-lg font-serif font-bold text-foreground leading-tight">
                Grace<span className="text-accent">Path</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              GracePath exists to encourage, guide, and inspire individuals to walk confidently in God's purpose for their lives.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="section-divider mb-8" />

        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} GracePath. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
