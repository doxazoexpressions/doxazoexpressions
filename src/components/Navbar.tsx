import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, X, Search as SearchIcon, LogIn, LogOut, User } from "lucide-react";
import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [q, setQ] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navLinks = [
    { name: "Today", href: "/devotional" },
    { name: "Plans", href: "/plans" },
    { name: "Prayers", href: "/prayers" },
    { name: "Journal", href: "/journal" },
    { name: "Highlights", href: "/highlights" },
    { name: "Downloads", href: "/downloads" },
    { name: "Archive", href: "/archive" },
    { name: "About", href: "/about" },
  ];

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
      setQ("");
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-18 py-3 sm:py-4 gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <BrandMark size={40} />
            <span className="text-xl font-serif font-bold text-foreground">
              Doxazo<span className="text-accent"> Expressions</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium transition-colors duration-300 ${
                  isActive(link.href)
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <form onSubmit={onSearch} className="relative">
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

          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              className="text-foreground p-2 -mr-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <form onSubmit={onSearch} className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search devotionals…"
                className="pl-9"
                aria-label="Search devotionals"
              />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`block py-3 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Button asChild className="w-full mt-4">
              <Link to="/devotional" onClick={() => setIsOpen(false)}>Today's Devotional</Link>
            </Button>
            {user ? (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground px-1 truncate">Signed in as {user.email}</p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/settings" onClick={() => setIsOpen(false)}>Account Settings</Link>
                </Button>
                <Button onClick={() => { signOut(); setIsOpen(false); }} variant="ghost" className="w-full gap-1.5">
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline" className="w-full mt-3 gap-1.5">
                <Link to="/auth" onClick={() => setIsOpen(false)}><LogIn className="w-4 h-4" /> Sign In</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
