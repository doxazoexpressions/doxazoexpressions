import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Sun,
  BookOpen,
  NotebookPen,
  Menu,
  Book,
  HeartHandshake,
  Highlighter,
  Target,
  Users,
  Archive as ArchiveIcon,
  Info,
  Settings as SettingsIcon,
  LogIn,
  LogOut,
  User,
  Download,
  Heart,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { isNative } from "@/lib/native";


export const MOBILE_MENU_EVENT = "doxazo:open-mobile-menu";
export const openMobileMenu = () =>
  window.dispatchEvent(new CustomEvent(MOBILE_MENU_EVENT));

const primaryTabs = [
  { name: "Home", to: "/", icon: Home, match: (p: string) => p === "/" },
  { name: "Today", to: "/devotional", icon: Sun, match: (p: string) => p.startsWith("/devotional") },
  { name: "Plans", to: "/plans", icon: BookOpen, match: (p: string) => p.startsWith("/plans") },
  { name: "Journal", to: "/journal", icon: NotebookPen, match: (p: string) => p.startsWith("/journal") },
];

const moreGroups: { label: string; links: { name: string; to: string; icon: typeof Book }[] }[] = [
  {
    label: "Spiritual tools",
    links: [
      { name: "Scripture", to: "/scripture", icon: Book },
      { name: "Prayers", to: "/prayers", icon: HeartHandshake },
      { name: "Highlights", to: "/highlights", icon: Highlighter },
    ],
  },
  {
    label: "Growth",
    links: [
      { name: "Goals", to: "/goals", icon: Target },
      { name: "Groups", to: "/groups", icon: Users },
    ],
  },
  {
    label: "Library",
    links: [
      { name: "Favorites", to: "/favorites", icon: Heart },
      { name: "Downloads", to: "/downloads", icon: Download },
      { name: "Archive", to: "/archive", icon: ArchiveIcon },
    ],
  },
  {
    label: "App",
    links: [
      { name: "About", to: "/about", icon: Info },
      { name: "Settings", to: "/settings", icon: SettingsIcon },
    ],
  },
];

const webGroups: { label: string; links: { name: string; to: string; icon: typeof Book }[] }[] = [
  {
    label: "Read",
    links: [
      { name: "Home", to: "/", icon: Home },
      { name: "Today's Devotional", to: "/devotional", icon: Sun },
      { name: "Plans", to: "/plans", icon: BookOpen },
      { name: "Archive", to: "/archive", icon: ArchiveIcon },
    ],
  },
  {
    label: "About",
    links: [
      { name: "About", to: "/about", icon: Info },
      { name: "Contact", to: "/contact", icon: HeartHandshake },
    ],
  },
];

const MobileNav = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [native, setNative] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => { setNative(isNative()); }, []);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(MOBILE_MENU_EVENT, handler);
    return () => window.removeEventListener(MOBILE_MENU_EVENT, handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isMoreActive = ![...primaryTabs].some((t) => t.match(pathname));
  const groups = native ? moreGroups : webGroups;


  return (
    <>
      {native && (
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          aria-label="Primary"
        >
          <ul className="grid grid-cols-5">
            {primaryTabs.map((tab) => {
              const active = tab.match(pathname);
              const Icon = tab.icon;
              return (
                <li key={tab.name}>
                  <Link
                    to={tab.to}
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium tracking-wide transition-colors ${
                      active ? "text-accent" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className={`w-5 h-5 ${active ? "text-accent" : ""}`} />
                    {tab.name}
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                onClick={() => setOpen(true)}
                className={`w-full flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium tracking-wide transition-colors ${
                  isMoreActive && open ? "text-accent" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Open more menu"
              >
                <Menu className="w-5 h-5" />
                More
              </button>
            </li>
          </ul>
        </nav>
      )}


      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[85vw] sm:w-96 p-0 flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
            <SheetTitle className="font-serif text-xl">
              Doxazo<span className="text-accent"> Expressions</span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-2">
            {groups.map((group) => (
              <div key={group.label} className="mb-2">
                <p className="px-5 pt-3 pb-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-semibold">
                  {group.label}
                </p>
                <ul>
                  {group.links.map((l) => {
                    const active = pathname.startsWith(l.to) && l.to !== "/";
                    const Icon = l.icon;
                    return (
                      <li key={l.to}>
                        <Link
                          to={l.to}
                          className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                            active
                              ? "text-accent bg-accent/5"
                              : "text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {l.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>


          <div className="border-t border-border p-4" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
            {user ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                  <User className="w-3 h-3" /> {user.email}
                </p>
                <Button onClick={() => signOut()} variant="outline" className="w-full gap-1.5">
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild className="w-full gap-1.5">
                <Link to="/auth">
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileNav;
