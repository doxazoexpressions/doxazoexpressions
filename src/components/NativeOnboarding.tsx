import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sun, Bell, Sparkles, ChevronRight, Check, Heart, Compass, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isNative } from "@/lib/native";
import { enableNativePush, isNativePush } from "@/lib/nativePush";
import { toast } from "sonner";
import { CATEGORIES, type CategorySlug } from "@/lib/categories";
import { setPrefs, hasOnboarded, type ReadingTime } from "@/lib/prefs";
import type { VoiceKind } from "@/lib/devotionalAudio";

const LEGACY_KEY = "doxazo.onboarding.completed.v1";

type IntroSlide = {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  body: string;
};

const introSlides: IntroSlide[] = [
  {
    icon: Sun,
    eyebrow: "Welcome to Doxazo",
    title: "A fresh word every morning",
    body: "One devotional a day — Scripture, a short reflection, a prayer, and a declaration to anchor your walk with God.",
  },
  {
    icon: BookOpen,
    eyebrow: "Built for daily rhythm",
    title: "Read, reflect, declare",
    body: "Every entry follows the same disciplined pattern so your mornings become a habit of faith, not a scroll of content.",
  },
];

const READING_TIMES: { key: ReadingTime; label: string; note: string }[] = [
  { key: "morning", label: "Morning", note: "Before the day begins" },
  { key: "midday", label: "Midday", note: "A pause at noon" },
  { key: "evening", label: "Evening", note: "After work winds down" },
  { key: "night", label: "Night", note: "Before you sleep" },
];

/**
 * First-launch onboarding shown ONLY inside the native iOS/Android app.
 * Collects personalization preferences (themes, voice, reading time) that
 * power the "For You" rail, then asks for the notification permission.
 */
const NativeOnboarding = () => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [enabling, setEnabling] = useState(false);

  // Preference draft
  const [themes, setThemes] = useState<CategorySlug[]>([]);
  const [voice, setVoice] = useState<VoiceKind>("female");
  const [readingTime, setReadingTime] = useState<ReadingTime>("morning");

  useEffect(() => {
    if (!isNative()) return;
    try {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy || hasOnboarded()) return;
      setVisible(true);
    } catch {}
  }, []);

  const finish = () => {
    try {
      setPrefs({
        categories: themes,
        voice,
        readingTime,
        onboardedAt: new Date().toISOString(),
      });
      localStorage.setItem(LEGACY_KEY, new Date().toISOString());
      // Keep the standalone voice preference in sync so the audio player picks it up.
      localStorage.setItem("doxazo:voice-preference", voice);
    } catch {}
    setVisible(false);
  };

  const enableNotifications = async () => {
    if (!isNativePush()) { finish(); return; }
    setEnabling(true);
    try {
      const result = await enableNativePush();
      if (result === "granted") {
        toast.success("Daily nudge enabled");
      } else {
        toast("Notifications not enabled — you can turn them on later in Settings.");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't enable notifications");
    } finally {
      setEnabling(false);
      finish();
    }
  };

  const toggleTheme = (slug: CategorySlug) => {
    setThemes((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  };

  if (!visible) return null;

  // Step map:
  //   0..1  intro slides
  //   2     pick themes
  //   3     pick voice + reading time
  //   4     notifications
  const TOTAL_STEPS = introSlides.length + 3; // 2 intro + themes + voice/time + notif
  const isThemes = step === introSlides.length;
  const isVoice = step === introSlides.length + 1;
  const isNotif = step === introSlides.length + 2;
  const isIntro = step < introSlides.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex flex-col h-full">
          {/* progress dots */}
          <div className="flex items-center justify-center gap-2 pt-6 pb-4">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-8 bg-accent" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto">
            <AnimatePresence mode="wait">
              {isIntro && (
                <motion.div
                  key={"intro-" + step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-sm"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 mx-auto mb-8 flex items-center justify-center">
                    {(() => {
                      const Icon = introSlides[step].icon;
                      return <Icon className="w-9 h-9 text-accent" />;
                    })()}
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-3">
                    {introSlides[step].eyebrow}
                  </p>
                  <h2 className="text-3xl font-serif font-bold mb-4 leading-tight">
                    {introSlides[step].title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {introSlides[step].body}
                  </p>
                </motion.div>
              )}

              {isThemes && (
                <motion.div
                  key="themes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-md w-full"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 mx-auto mb-6 flex items-center justify-center">
                    <Compass className="w-9 h-9 text-accent" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-3">
                    Personalize your feed
                  </p>
                  <h2 className="text-2xl font-serif font-bold mb-2 leading-tight">
                    What draws you closer to God?
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Pick the themes that matter most — we'll highlight matching devotionals on your home screen.
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-left">
                    {CATEGORIES.map((c) => {
                      const on = themes.includes(c.slug);
                      return (
                        <button
                          key={c.slug}
                          onClick={() => toggleTheme(c.slug)}
                          className={`rounded-xl border p-3 flex items-start gap-3 transition ${
                            on ? "border-accent bg-accent/10" : "border-border bg-card"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${on ? "bg-accent border-accent" : "border-border"}`}>
                            {on && <Check className="w-3 h-3 text-accent-foreground" />}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{c.label}</p>
                            <p className="text-xs text-muted-foreground">{c.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {isVoice && (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-md w-full"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 mx-auto mb-6 flex items-center justify-center">
                    <Volume2 className="w-9 h-9 text-accent" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-3">
                    Your daily rhythm
                  </p>
                  <h2 className="text-2xl font-serif font-bold mb-4 leading-tight">
                    Choose your narrator & time
                  </h2>

                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 text-left">Narrator</p>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {(["female", "male"] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => setVoice(k)}
                        className={`rounded-xl border p-3 text-left transition ${
                          voice === k ? "border-accent bg-accent/10" : "border-border bg-card"
                        }`}
                      >
                        <p className="font-semibold text-sm">{k === "female" ? "Joy" : "Wisdom"}</p>
                        <p className="text-xs text-muted-foreground">{k === "female" ? "Warm, encouraging" : "Grounded, steady"}</p>
                      </button>
                    ))}
                  </div>

                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 text-left">Preferred reading time</p>
                  <div className="grid grid-cols-2 gap-2">
                    {READING_TIMES.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setReadingTime(t.key)}
                        className={`rounded-xl border p-3 text-left transition ${
                          readingTime === t.key ? "border-accent bg-accent/10" : "border-border bg-card"
                        }`}
                      >
                        <p className="font-semibold text-sm">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.note}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {isNotif && (
                <motion.div
                  key="notif"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-sm"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 mx-auto mb-8 flex items-center justify-center">
                    <Bell className="w-9 h-9 text-accent" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-3">
                    Build the habit
                  </p>
                  <h2 className="text-3xl font-serif font-bold mb-4 leading-tight">
                    A gentle morning nudge
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    Get a quiet notification when a new devotional is ready. No promos, no clutter — just today's word.
                  </p>
                  <ul className="text-sm text-muted-foreground/90 mt-6 space-y-2 text-left mx-auto max-w-xs">
                    <li className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0 mt-0.5" /> Only for new devotionals</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0 mt-0.5" /> No marketing messages, ever</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-accent shrink-0 mt-0.5" /> You can turn it off in Settings</li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-6 pb-8 pt-4 space-y-3">
            {!isNotif ? (
              <>
                <Button
                  className="w-full h-12 text-base gap-2"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={isThemes && themes.length === 0}
                >
                  {isThemes && themes.length === 0
                    ? "Pick at least one theme"
                    : "Continue"}
                  {!(isThemes && themes.length === 0) && <ChevronRight className="w-4 h-4" />}
                </Button>
                <button
                  className="w-full text-sm text-muted-foreground py-2"
                  onClick={finish}
                >
                  Skip intro
                </button>
              </>
            ) : (
              <>
                <Button
                  className="w-full h-12 text-base gap-2"
                  onClick={enableNotifications}
                  disabled={enabling}
                >
                  <Bell className="w-4 h-4" />
                  {enabling ? "Enabling…" : "Enable daily nudge"}
                </Button>
                <button
                  className="w-full text-sm text-muted-foreground py-2"
                  onClick={finish}
                  disabled={enabling}
                >
                  Maybe later
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NativeOnboarding;
