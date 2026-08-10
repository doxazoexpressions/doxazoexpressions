import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BrandMark from "@/components/BrandMark";

const SEEN_KEY = "doxazo.brandintro.session.v1";

/**
 * Premium brand reveal shown once per app launch, layered over the static
 * native splash so the handoff feels continuous rather than a hard cut:
 * gold glow blooms, the mark settles in with a soft scale, the wordmark and
 * hairline rule draw in, then the whole thing fades out.
 *
 * Deliberately short (≈1.6s total) and non-blocking — it never gates content
 * and is skipped on reduced-motion or on in-session route changes.
 */
const BrandIntro = ({ duration = 1600 }: { duration?: number }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), duration);
    return () => window.clearTimeout(t);
  }, [duration]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background pointer-events-none"
        >
          {/* gold bloom */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.55, scale: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="absolute w-[420px] h-[420px] rounded-full blur-3xl bg-accent/25"
          />

          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              <BrandMark size={92} rounded="rounded-2xl" className="shadow-2xl" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.6, ease: "easeOut" }}
              className="mt-5 font-serif text-2xl font-bold tracking-tight text-foreground"
            >
              Doxazo Expressions
            </motion.p>

            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              className="mt-3 block h-px w-24 origin-center bg-accent/70"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground"
            >
              Glory · Word · Daily
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrandIntro;
