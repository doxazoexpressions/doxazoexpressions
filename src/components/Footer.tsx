import { Link } from "react-router-dom";
import BrandMark from "./BrandMark";
import { useAuth } from "@/hooks/useAuth";
import {
  Archive as ArchiveIcon,
  Heart,
  Highlighter,
  Info,
  Settings as SettingsIcon,
  LogIn,
  LogOut,
  User,
  Mail,
  Shield,
  FileText,
  ChevronRight,
} from "lucide-react";

type Row = {
  name: string;
  to: string;
  icon: typeof Info;
};

const Footer = () => {
  const { user, loading, signOut } = useAuth();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Daily Devotional", href: "/devotional" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const discover: Row[] = [
    { name: "Devotional Archive", to: "/archive", icon: ArchiveIcon },
    { name: "Favourites", to: "/favorites", icon: Heart },
    { name: "Highlights", to: "/highlights", icon: Highlighter },
    { name: "About Doxazo", to: "/about", icon: Info },
  ];

  const support: Row[] = [
    { name: "Contact", to: "/contact", icon: Mail },
    { name: "Privacy Policy", to: "/privacy", icon: Shield },
    { name: "Terms of Use", to: "/terms", icon: FileText },
  ];

  const NavRow = ({ name, to, icon: Icon }: Row) => (
    <li>
      <Link
        to={to}
        className="flex items-center gap-3 min-h-[48px] py-2.5 text-sm text-foreground active:bg-muted/40 transition-colors"
      >
        <Icon className="w-4 h-4 text-accent shrink-0" />
        <span className="flex-1 min-w-0 truncate">{name}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
      </Link>
    </li>
  );

  const GroupLabel = ({ children }: { children: string }) => (
    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-semibold mb-1">
      {children}
    </p>
  );

  return (
    <footer className="border-t border-border">
      {/* Mobile: purpose-built app menu */}
      <div className="lg:hidden px-4 pt-6 pb-6">
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Spirit-led devotionals each morning — build a consistent rhythm and walk boldly in
          God's plan.
        </p>

        <div className="space-y-5">
          <div>
            <GroupLabel>Discover</GroupLabel>
            <ul className="divide-y divide-border/60">
              {discover.map((r) => (
                <NavRow key={r.to} {...r} />
              ))}
            </ul>
          </div>

          <div>
            <GroupLabel>Account</GroupLabel>
            <ul className="divide-y divide-border/60">
              {loading ? null : user ? (
                <>
                  <li>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 min-h-[48px] py-2.5 text-sm text-foreground active:bg-muted/40 transition-colors"
                    >
                      <User className="w-4 h-4 text-accent shrink-0" />
                      <span className="flex-1 min-w-0 truncate">{user.email ?? "Account"}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                    </Link>
                  </li>
                  <NavRow name="Settings" to="/settings" icon={SettingsIcon} />
                  <li>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 min-h-[48px] py-2.5 text-sm text-foreground text-left active:bg-muted/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-accent shrink-0" />
                      <span className="flex-1">Sign Out</span>
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <NavRow name="Sign In" to="/auth" icon={LogIn} />
                  <NavRow name="Settings" to="/settings" icon={SettingsIcon} />
                </>
              )}
            </ul>
          </div>

          <div>
            <GroupLabel>Support &amp; Legal</GroupLabel>
            <ul className="divide-y divide-border/60">
              {support.map((r) => (
                <NavRow key={r.to} {...r} />
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-[11px] text-muted-foreground/60 text-center">
          © {new Date().getFullYear()} Doxazo Expressions
        </p>
      </div>

      {/* Desktop: unchanged website footer */}
      <div className="hidden lg:block pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-5">
                <BrandMark size={40} />
                <span className="text-lg font-serif font-bold text-foreground leading-tight">
                  Doxazo<span className="text-accent"> Expressions</span>
                </span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your daily discipleship companion — Spirit-led devotionals delivered each morning
                to help you build a consistent rhythm and walk boldly in God's plan.
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
              <h4 className="font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">Account & Legal</h4>
              <ul className="space-y-3">
                {loading ? null : user ? (
                  <>
                    <li>
                      <Link to="/settings" className="text-muted-foreground hover:text-accent transition-colors text-sm break-all">
                        {user.email ?? "Account"}
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => signOut()}
                        className="text-muted-foreground hover:text-accent transition-colors text-sm text-left"
                      >
                        Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <li><Link to="/auth" className="text-muted-foreground hover:text-accent transition-colors text-sm">Sign In</Link></li>
                )}
                <li><Link to="/settings" className="text-muted-foreground hover:text-accent transition-colors text-sm">Settings</Link></li>
                <li><Link to="/privacy" className="text-muted-foreground hover:text-accent transition-colors text-sm">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-accent transition-colors text-sm">Terms of Use</Link></li>
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
      </div>
    </footer>
  );
};

export default Footer;
