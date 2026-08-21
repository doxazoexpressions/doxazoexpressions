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
      className="group flex items-center gap-3 min-h-[48px] lg:min-h-0 py-2.5 lg:py-2 text-sm text-foreground hover:text-accent active:bg-muted/40 lg:active:bg-transparent transition-colors"
    >
      <Icon className="w-4 h-4 text-accent shrink-0" />
      <span className="flex-1 min-w-0 truncate">{name}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 lg:transition-opacity" />
    </Link>
  </li>
);


const GroupLabel = ({ children }: { children: string }) => (
  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-semibold mb-1 lg:mb-3">
    {children}
  </p>
);

const Footer = () => {
  const { user, loading, signOut } = useAuth();

  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 pt-6 pb-6 lg:pt-16 lg:pb-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-1">
            <Link to="/" className="hidden lg:flex items-center gap-2 mb-5">
              <BrandMark size={40} />
              <span className="text-lg font-serif font-bold text-foreground leading-tight">
                Doxazo<span className="text-accent"> Expressions</span>
              </span>
            </Link>
            <h2 className="lg:hidden text-[13px] font-serif font-semibold text-foreground uppercase tracking-[0.14em] mb-1.5">
              More
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 lg:mb-0">
              Spirit-led devotionals each morning — build a consistent rhythm and walk boldly in
              God's plan.
            </p>
          </div>


          <div className="space-y-5 lg:space-y-0 lg:col-span-3 lg:grid lg:grid-cols-3 lg:gap-10">
            <div>
              <GroupLabel>Discover</GroupLabel>
              <ul className="divide-y divide-border/60 lg:divide-y-0">
                {discover.map((r) => (
                  <NavRow key={r.to} {...r} />
                ))}
              </ul>
            </div>

            <div>
              <GroupLabel>Account</GroupLabel>
              <ul className="divide-y divide-border/60 lg:divide-y-0">
                {loading ? null : user ? (
                  <>
                    <li>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 min-h-[48px] lg:min-h-0 py-2.5 lg:py-2 text-sm text-foreground lg:text-muted-foreground hover:text-accent transition-colors"
                      >
                        <User className="w-4 h-4 text-accent shrink-0" />
                        <span className="flex-1 min-w-0 truncate">{user.email ?? "Account"}</span>
                      </Link>
                    </li>
                    <NavRow name="Settings" to="/settings" icon={SettingsIcon} />
                    <li>
                      <button
                        type="button"
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 min-h-[48px] lg:min-h-0 py-2.5 lg:py-2 text-sm text-foreground lg:text-muted-foreground hover:text-accent text-left active:bg-muted/40 lg:active:bg-transparent transition-colors"
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
              <ul className="divide-y divide-border/60 lg:divide-y-0">
                {support.map((r) => (
                  <NavRow key={r.to} {...r} />
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="section-divider hidden lg:block my-8" />

        <p className="mt-6 lg:mt-0 text-[11px] lg:text-sm text-muted-foreground/60 lg:text-muted-foreground text-center">
          © {new Date().getFullYear()} Doxazo Expressions. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
