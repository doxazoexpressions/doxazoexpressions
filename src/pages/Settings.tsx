import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import PushNotificationToggle from "@/components/PushNotificationToggle";
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
  Info,
  Trash2,
  ChevronRight,
  BookOpen,
  ShieldCheck,
  FileText,
  Mail,
  Loader2,
} from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteOwnAccount,
  isDeleteConfirmed,
  DELETE_CONFIRM_PHRASE,
} from "@/lib/accountDeletion";
import { getVoicePreference, setVoicePreference } from "@/lib/devotionalAudio";
import type { VoiceKind } from "@/lib/devotionalAudio";
import { setPrefs } from "@/lib/prefs";
import {
  getCachedCurrentDevotional,
  getCachedRecentDevotionals,
} from "@/lib/offlineCache";

/* ---------- Shared settings primitives ---------- */

const Group = ({
  title,
  icon: Icon,
  description,
  children,
  id,
}: {
  title: string;
  icon: typeof Info;
  description?: string;
  children: React.ReactNode;
  id?: string;
}) => (
  <section id={id} className="mb-8 last:mb-0">
    <div className="flex items-center gap-2 px-1 mb-2">
      <Icon className="w-3.5 h-3.5 text-accent shrink-0" strokeWidth={2} aria-hidden="true" />
      <h2 className="type-group-label !text-foreground/70">{title}</h2>
    </div>
    <div className="rounded-xl border border-border/70 bg-card/40 overflow-hidden">
      {children}
    </div>
    {description && (
      <p className="type-body text-xs text-muted-foreground mt-2 px-1">{description}</p>
    )}
  </section>
);

const rowFrame =
  "w-full px-4 py-3.5 min-h-[56px] text-left border-b border-border/50 last:border-0 interactive press";
const rowBase = `${rowFrame} flex items-center gap-3`;

const NavRow = ({
  to,
  icon: Icon,
  label,
  description,
  external,
}: {
  to: string;
  icon: typeof Info;
  label: string;
  description?: string;
  external?: boolean;
}) => {
  const inner = (
    <>
      <Icon className="w-4 h-4 text-accent shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span className="flex-1 min-w-0">
        <span className="block type-body text-sm font-medium">{label}</span>
        {description && (
          <span className="block type-body text-xs text-muted-foreground">{description}</span>
        )}
      </span>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
    </>
  );
  return external ? (
    <a href={to} className={`${rowBase} hover:bg-muted/40`}>
      {inner}
    </a>
  ) : (
    <Link to={to} className={`${rowBase} hover:bg-muted/40`}>
      {inner}
    </Link>
  );
};

const StaticRow = ({
  icon: Icon,
  label,
  children,
  iconClass = "text-accent",
}: {
  icon: typeof Info;
  label: string;
  children?: React.ReactNode;
  iconClass?: string;
}) => (
  <div className={`${rowBase} cursor-default`}>
    <Icon className={`w-4 h-4 shrink-0 ${iconClass}`} strokeWidth={1.75} aria-hidden="true" />
    <div className="flex-1 min-w-0">
      <p className="type-body text-sm font-medium">{label}</p>
      {children}
    </div>
  </div>
);

/* ---------- Page ---------- */

const Settings = () => {
  const online = useOnlineStatus();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [cachedInfo, setCachedInfo] = useState({ hasToday: false, recentCount: 0 });
  const [narrator, setNarrator] = useState<VoiceKind>("female");
  const [signingOut, setSigningOut] = useState(false);
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

  // Read the same key the audio player uses, so the UI always reflects reality.
  useEffect(() => {
    setNarrator(getVoicePreference());
  }, []);

  const chooseNarrator = (v: VoiceKind) => {
    setVoicePreference(v);
    // Keep the onboarding prefs object in step (used by the "For You" rail).
    setPrefs({ voice: v });
    setNarrator(getVoicePreference()); // reflect the persisted value, not the click
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      navigate("/");
    } finally {
      setSigningOut(false);
    }
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
    <div className="min-h-dvh bg-background">
      <SEO
        title="Settings"
        description="Manage your account, appearance, audio, notifications and privacy on Doxazo Expressions."
        path="/settings"
      />
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-xl">
          <header className="mb-8">
            <h1 className="type-display text-2xl md:text-3xl">Settings</h1>
            <p className="type-body text-sm text-muted-foreground mt-1">
              Your quiet control centre for Doxazo Expressions.
            </p>
          </header>

          {/* Account */}
          <Group title="Account" icon={User} id="account">
            {loading ? (
              <StaticRow icon={User} label="Checking your account…" />
            ) : user ? (
              <>
                <div className={`${rowBase} cursor-default`}>
                  <User className="w-4 h-4 text-accent shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="type-body text-sm font-medium">
                      {(user.user_metadata?.display_name as string | undefined) ??
                        user.email?.split("@")[0] ??
                        "Friend"}
                    </p>
                    <p className="type-body text-xs text-muted-foreground break-all">
                      {user.email}
                    </p>
                  </div>
                  <span className="type-meta shrink-0 text-accent">Signed in</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className={`${rowBase} hover:bg-muted/40 disabled:opacity-60`}
                >
                  {signingOut ? (
                    <Loader2 className="w-4 h-4 text-muted-foreground shrink-0 animate-spin" aria-hidden="true" />
                  ) : (
                    <LogOut className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  )}
                  <span className="flex-1 min-w-0 type-body text-sm font-medium">
                    {signingOut ? "Signing out…" : "Sign out"}
                  </span>
                </button>
              </>
            ) : (
              <>
                <StaticRow icon={User} label="Not signed in">
                  <p className="type-body text-xs text-muted-foreground">
                    Sign in to sync your journal, highlights, favourites and plan progress.
                  </p>
                </StaticRow>
                <div className="p-4">
                  <Button asChild className="w-full gap-1.5 min-h-11">
                    <Link to="/auth">
                      <LogIn className="w-4 h-4" aria-hidden="true" /> Sign in
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </Group>

          {/* Devotional experience */}
          <Group title="Devotional experience" icon={Headphones}>
            <fieldset className={`${rowFrame} cursor-default`}>
              <legend className="type-body text-sm font-medium mb-2">Narrator voice</legend>
              <RadioGroup
                value={narrator}
                onValueChange={(v) => chooseNarrator(v as VoiceKind)}
                className="space-y-0"
              >
                <div className="flex items-center gap-3 min-h-11">
                  <RadioGroupItem value="female" id="narrator-female" />
                  <Label htmlFor="narrator-female" className="type-body text-sm font-normal flex-1">
                    Joy — female voice
                  </Label>
                </div>
                <div className="flex items-center gap-3 min-h-11">
                  <RadioGroupItem value="male" id="narrator-male" />
                  <Label htmlFor="narrator-male" className="type-body text-sm font-normal flex-1">
                    Wisdom — male voice
                  </Label>
                </div>
              </RadioGroup>
            </fieldset>
            <StaticRow
              icon={online ? Wifi : WifiOff}
              label="Offline reading"
              iconClass={online ? "text-accent" : "text-destructive"}
            >
              <p className="type-body text-xs text-muted-foreground">
                {online ? "Online" : "Offline — showing saved content"} ·{" "}
                {cachedInfo.hasToday ? "today's devotional saved" : "no devotional saved yet"}
                {cachedInfo.recentCount > 0
                  ? ` + ${cachedInfo.recentCount} recent ${
                      cachedInfo.recentCount === 1 ? "entry" : "entries"
                    }`
                  : ""}
              </p>
            </StaticRow>
            <NavRow to="/plans" icon={BookOpen} label="Reading plans" description="Continue a guided journey" />
            <NavRow to="/favorites" icon={Heart} label="Favourites" description="Devotionals you saved" />
            <NavRow to="/settings/bible-versions" icon={FileText} label="Bible versions" />
          </Group>

          {/* Notifications */}
          <Group
            title="Notifications"
            icon={Bell}
            description="Your device's own notification permission always has the final say — if it's blocked, enable it in your system settings first."
          >
            <div className={`${rowFrame} cursor-default`}>
              <p className="type-body text-sm font-medium">Daily devotional nudge</p>
              <p className="type-body text-xs text-muted-foreground mt-0.5 mb-3">
                A gentle reminder when a new devotional is published. Nothing else.
              </p>
              <PushNotificationToggle />
            </div>
            <NavRow to="/settings/notifications" icon={Bell} label="More notification options" />
          </Group>

          {/* Appearance */}
          <Group title="Appearance" icon={Palette}>
            <fieldset className={`${rowFrame} cursor-default`}>
              <legend className="type-body text-sm font-medium mb-2">Theme</legend>
              <RadioGroup value={theme ?? "system"} onValueChange={(v) => setTheme(v)} className="space-y-0">
                {[
                  { v: "dark", label: "Dark" },
                  { v: "light", label: "Light" },
                  { v: "system", label: "Follow system" },
                ].map((o) => (
                  <div key={o.v} className="flex items-center gap-3 min-h-11">
                    <RadioGroupItem value={o.v} id={`theme-${o.v}`} />
                    <Label htmlFor={`theme-${o.v}`} className="type-body text-sm font-normal flex-1">
                      {o.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </fieldset>
          </Group>

          {/* Privacy & data */}
          <Group title="Privacy &amp; data" icon={ShieldCheck}>
            <NavRow to="/privacy" icon={ShieldCheck} label="Privacy policy" />
            <NavRow to="/terms" icon={FileText} label="Terms &amp; conditions" />
          </Group>

          {/* Support */}
          <Group title="Support" icon={Info}>
            <NavRow to="/about" icon={Info} label="About Doxazo Expressions" />
            <NavRow to="/support" icon={Mail} label="Help &amp; support" />
            <NavRow
              to="mailto:doxazoexpressions@gmail.com?subject=Doxazo%20feedback"
              icon={Mail}
              label="Send feedback"
              external
            />
          </Group>

          {/* Danger zone */}
          {user && (
            <section className="mb-2">
              <div className="flex items-center gap-2 px-1 mb-2">
                <Trash2 className="w-3.5 h-3.5 text-destructive shrink-0" strokeWidth={2} aria-hidden="true" />
                <h2 className="type-group-label !text-destructive">Danger zone</h2>
              </div>
              <div className="rounded-xl border border-destructive/40 bg-destructive/[0.04] overflow-hidden">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className={`${rowBase} hover:bg-destructive/10 disabled:opacity-60`}
                      disabled={deleting}
                    >
                      <Trash2 className="w-4 h-4 text-destructive shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span className="flex-1 min-w-0">
                        <span className="block type-body text-sm font-medium text-destructive">
                          {deleting ? "Deleting account…" : "Delete account"}
                        </span>
                        <span className="block type-body text-xs text-muted-foreground">
                          Permanently removes your journal, plans and synced data.
                        </span>
                      </span>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete account</AlertDialogTitle>
                      <AlertDialogDescription>
                        Deleting this account permanently removes all journal entries, plans, and
                        synced data. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                      <Label htmlFor="delete-confirm" className="text-xs">
                        Type{" "}
                        <span className="font-mono font-semibold">{DELETE_CONFIRM_PHRASE}</span> to
                        confirm
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
                      <AlertDialogCancel onClick={() => setDeleteConfirm("")}>Cancel</AlertDialogCancel>
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
              </div>
              {deleteError && (
                <p role="alert" className="type-body text-xs text-destructive mt-2 px-1">
                  {deleteError}
                </p>
              )}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
