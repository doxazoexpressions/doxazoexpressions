import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search as SearchIcon, LogIn, LogOut, User } from "lucide-react";
import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { openMobileMenu } from "./MobileNav";

const Navbar = () => {
  const [q, setQ] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navLinks = [
    { name: "Today", href: "/devotional" },
    { name: "Plans", href: "/plans" },
    { name: "Archive", href: "/archive" },
    { name: "Themes", href: "/categories" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];


  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
      setQ("");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-18 py-2 sm:py-4 gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0 rounded-md interactive">
            <BrandMark size={32} className="sm:hidden shrink-0" />
            <BrandMark size={40} className="hidden sm:block shrink-0" />
            <span className="type-heading text-[17px] sm:text-xl font-bold text-foreground whitespace-nowrap leading-none pt-[1px]">
              Doxazo<span className="text-accent hidden min-[360px]:inline"> Expressions</span>
            </span>
          </Link>



          <div className="hidden lg:flex items-center gap-4 xl:gap-6 min-w-0 overflow-hidden">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                  isActive(link.href)
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0">

            <form onSubmit={onSearch} className="relative hidden xl:block">

              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="pl-8 h-9 w-44"
                aria-label="Search devotionals"
              />
            </form>
            <ThemeToggle />
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm" className="gap-1.5">
                  <Link to="/settings" aria-label="Account"><User className="w-4 h-4" /><span className="hidden xl:inline">Account</span></Link>
                </Button>
                <Button onClick={() => signOut()} variant="outline" size="sm" className="gap-1.5">
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link to="/auth"><LogIn className="w-4 h-4" /> Sign In</Link>
              </Button>
            )}
            <Button asChild className="px-5">
              <Link to="/devotional">Today's Devotional</Link>
            </Button>
          </div>

          {/* No negative margin here: it pushed the tap target past the
              container edge and produced a few px of horizontal overflow. */}
          <div className="flex lg:hidden items-center gap-1 shrink-0">

            <ThemeToggle />
            <button
              type="button"
              className="tap-target inline-flex items-center justify-center rounded-lg text-foreground hover:bg-secondary interactive shrink-0"
              onClick={openMobileMenu}
              aria-label="Open menu"
            >
              <Menu className="w-[22px] h-[22px]" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

        </div>

      </div>
    </nav>
  );
};

export default Navbar;
