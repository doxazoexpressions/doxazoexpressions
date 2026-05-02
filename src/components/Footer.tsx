import { Link } from "react-router-dom";
import { Cross } from "lucide-react";

const Footer = () => {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Daily Devotional", href: "/devotional" },
    { name: "Prayers", href: "/prayers" },
    { name: "Teachings", href: "/teachings" },
    { name: "Speaking", href: "/speaking" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
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
                Doxazo<span className="text-accent"> Expressions</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Daily devotionals, morning prayers, and biblical teachings to help believers grow
              spiritually and walk boldly in God's purpose.
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
            <h4 className="font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-3">
              <li><Link to="/auth" className="text-muted-foreground hover:text-accent transition-colors text-sm">Sign In</Link></li>
              <li><Link to="/admin" className="text-muted-foreground hover:text-accent transition-colors text-sm">Admin Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="section-divider mb-8" />

        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Doxazo Expressions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
