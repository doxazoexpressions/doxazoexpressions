import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sun, Bell, Sparkles, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isNative } from "@/lib/native";
import { enableNativePush, isNativePush } from "@/lib/nativePush";
import { toast } from "sonner";

const KEY = "doxazo.onboarding.completed.v1";

type Slide = {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  body: string;
};

const slides: Slide[] = [
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
  {
    icon: Sparkles,
    eyebrow: "Save & return anywhere",
    title: "Your library, in your pocket",
    body: "Favorites, recent reads, and today's devotional are saved on your device so you can pick up right where you left off — even offline.",
  },
];

/**
 * First-launch onboarding shown ONLY inside the native iOS/Android app.
 * Ends with a native push permission prompt tied to the devotional habit.
 */
const NativeOnboarding = () => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (!isNative()) return;
    try {
      const done = localStorage.getItem(KEY);
      if (!done) setVisible(true);
    } catch {}
  }, []);

  const finish = () => {
    try { localStorage.setItem(KEY, new Date().toISOString()); } catch {}
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

  if (!visible) return null;

  const isLast = step === slides.length;

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
            {Array.from({ length: slides.length + 1 }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-8 bg-accent" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <AnimatePresence mode="wait">
              {!isLast ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className="max-w-sm"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 mx-auto mb-8 flex items-center justify-center">
                    {(() => {
                      const Icon = slides[step].icon;
                      return <Icon className="w-9 h-9 text-accent" />;
                    })()}
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-3">
                    {slides[step].eyebrow}
                  </p>
                  <h2 className="text-3xl font-serif font-bold mb-4 leading-tight">
                    {slides[step].title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {slides[step].body}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="notif"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
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
            {!isLast ? (
              <>
                <Button
                  className="w-full h-12 text-base gap-2"
                  onClick={() => setStep((s) => s + 1)}
                >
                  Continue <ChevronRight className="w-4 h-4" />
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
