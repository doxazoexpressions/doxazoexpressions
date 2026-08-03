import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import PushNotificationToggle from "@/components/PushNotificationToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Bell,
  Wifi,
  WifiOff,
  Heart,
  User,
  LogIn,
  LogOut,
  Palette,
  Headphones,
  Languages,
  Info,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteOwnAccount,
  isDeleteConfirmed,
  DELETE_CONFIRM_PHRASE,
} from "@/lib/accountDeletion";
import { track } from "@/lib/analytics";
import { getPrefs, setPrefs } from "@/lib/prefs";
import {
  getCachedCurrentDevotional,
  getCachedRecentDevotionals,
} from "@/lib/offlineCache";

const Row = ({
  to,
  label,
  external,
}: { to: string; label: string; external?: boolean }) =>
  external ? (
    <a
      href={to}
      className="flex items-center justify-between py-3 text-sm border-b border-border/60 last:border-0"
    >
      {label}
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </a>
  ) : (
    <Link
      to={to}
      className="flex items-center justify-between py-3 text-sm border-b border-border/60 last:border-0"
    >
      {label}
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </Link>
  );

const Settings = () => {
  const online = useOnlineStatus();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [cachedInfo, setCachedInfo] = useState({ hasToday: false, recentCount: 0 });
  const [narrator, setNarrator] = useState<"female" | "male">("female");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    const refresh = () => {
      setCachedInfo({
        hasToday: !!getCachedCurrentDevotional(),
        recentCount: getCachedRecentDevotionals().length,
      });
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [online]);

  useEffect(() => {
    const p = getPrefs() as unknown as { narrator?: "female" | "male" };
    if (p?.narrator === "male" || p?.narrator === "female") setNarrator(p.narrator);
  }, []);

  const chooseNarrator = (v: "female" | "male") => {
    setNarrator(v);
    setPrefs({ narrator: v } as never);
  };

  // Guideline 5.1.1(v) — in-app account deletion, no second factor required.
  const deleteAccount = async () => {
    if (deleting || !isDeleteConfirmed(deleteConfirm)) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteOwnAccount();
      navigate("/auth?just-deleted=1");
    } catch (e) {
      setDeleteError(
        (e as Error).message || "We couldn't delete your account. Please try again.",
      );
    } finally {
      setDeleting(false);
      setDeleteConfirm("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Settings" description="Manage your account, appearance, audio, notifications and privacy on Doxazo Expressions." path="/settings" />
      <Navbar />
      <main className="pt-16">
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3">Settings</h1>
            <p className="text-muted-foreground">Make Doxazo Expressions feel at home on your device.</p>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4 max-w-3xl space-y-6">
            {/* Account */}
            <Card id="account">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-serif font-semibold">Account</h2>
                </div>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Checking your account…</p>
                ) : user ? (
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium">
                        {(user.user_metadata?.display_name as string | undefined) ??
                          user.email?.split("@")[0] ??
                          "Friend"}
                      </p>
                      <p className="text-muted-foreground break-all">{user.email}</p>
                    </div>
                    <Button onClick={() => signOut()} variant="outline" className="gap-1.5">
                      <LogOut className="w-4 h-4" /> Sign out
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="w-full flex items-center gap-2 text-sm text-destructive py-3 mt-1 border-t border-border/60"
                          disabled={deleting}
                        >
                          <Trash2 className="w-4 h-4" />
                          {deleting ? "Deleting account…" : "Delete account"}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Deleting this account permanently removes all journal entries,
                            plans, and synced data. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2">
                          <Label htmlFor="delete-confirm" className="text-xs">
                            Type{" "}
                            <span className="font-mono font-semibold">
                              {DELETE_CONFIRM_PHRASE}
                            </span>{" "}
                            to confirm
                          </Label>
                          <Input
                            id="delete-confirm"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            placeholder={DELETE_CONFIRM_PHRASE}
                            autoComplete="off"
                            autoCapitalize="characters"
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeleteConfirm("")}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={deleteAccount}
                            disabled={!isDeleteConfirmed(deleteConfirm) || deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {deleteError && (
                      <p className="text-xs text-destructive">{deleteError}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Sign in to sync your journal, highlights, favorites, and progress across devices.
                    </p>
                    <Button asChild className="gap-1.5">
                      <Link to="/auth">
                        <LogIn className="w-4 h-4" /> Sign In
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Palette className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-serif font-semibold">Appearance</h2>
                </div>
                <RadioGroup
                  value={theme ?? "system"}
                  onValueChange={(v) => setTheme(v)}
                  className="space-y-1"
                >
                  {[
                    { v: "dark", label: "Dark mode" },
                    { v: "light", label: "Light theme" },
                    { v: "system", label: "Follow system" },
                  ].map((o) => (
                    <div key={o.v} className="flex items-center gap-3 py-2">
                      <RadioGroupItem value={o.v} id={`theme-${o.v}`} />
                      <Label htmlFor={`theme-${o.v}`} className="text-sm font-normal">{o.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Audio */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Headphones className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-serif font-semibold">Audio</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Narrator voice</p>
                <RadioGroup value={narrator} onValueChange={(v) => chooseNarrator(v as "female" | "male")} className="space-y-1">
                  <div className="flex items-center gap-3 py-2">
                    <RadioGroupItem value="female" id="narrator-female" />
                    <Label htmlFor="narrator-female" className="text-sm font-normal">Female (Joy)</Label>
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <RadioGroupItem value="male" id="narrator-male" />
                    <Label htmlFor="narrator-male" className="text-sm font-normal">Male (Wisdom)</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Language */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Languages className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-serif font-semibold">Language</h2>
                </div>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  defaultValue="en"
                  aria-label="App language"
                >
                  <option value="en">English</option>
                </select>
                <p className="text-xs text-muted-foreground mt-2">More languages are planned.</p>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Bell className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-serif font-semibold">Notifications</h2>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Receive a gentle nudge when a new devotional is published. We never send anything else.
                </p>
                <PushNotificationToggle />
                <div className="mt-3">
                  <Row to="/settings/notifications" label="More notification options" />
                </div>
              </CardContent>
            </Card>

            {/* Offline */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  {online ? (
                    <Wifi className="w-5 h-5 text-accent" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-destructive" />
                  )}
                  <h2 className="text-xl font-serif font-semibold">Offline reading</h2>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    Connection:{" "}
                    <span className={online ? "text-accent font-medium" : "text-destructive font-medium"}>
                      {online ? "Online" : "Offline — showing cached content"}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Saved on this device: {cachedInfo.hasToday ? "today's devotional" : "no devotional yet"}
                    {cachedInfo.recentCount > 0
                      ? ` + ${cachedInfo.recentCount} recent ${cachedInfo.recentCount === 1 ? "entry" : "entries"}`
                      : ""}
                    .
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Favorites */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-serif font-semibold">Favorites</h2>
                </div>
                <Row to="/favorites" label="Open your favorites" />
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Info className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-serif font-semibold">About</h2>
                </div>
                <div>
                  <Row to="/about" label="About us" />
                  <Row to="/settings/bible-versions" label="Bible versions" />
                  <Row to="/terms" label="Terms & Conditions" />
                  <Row to="/privacy" label="Privacy policy" />
                  <Row to="mailto:hello@doxazoexpressions.com?subject=Doxazo%20feedback" label="Give feedback" external />
                  <Row to="mailto:hello@doxazoexpressions.com?subject=Contact%20Doxazo" label="Contact us" external />
                </div>
              </CardContent>
            </Card>

            {user && (
              <Button onClick={() => signOut()} variant="outline" className="w-full gap-1.5">
                <LogOut className="w-4 h-4" /> LOG OUT
              </Button>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
