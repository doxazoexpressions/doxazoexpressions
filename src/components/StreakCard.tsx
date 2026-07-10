import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { getStreak, weekProgress, type StreakState } from "@/lib/streak";

/** Compact streak widget for the native home. Reads state on mount + on focus. */
const StreakCard = () => {
  const [s, setS] = useState<StreakState>(() => getStreak());
  const [week, setWeek] = useState(() => weekProgress());

  useEffect(() => {
    const refresh = () => { setS(getStreak()); setWeek(weekProgress()); };
    window.addEventListener("focus", refresh);
    window.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return (
    <div
      role="status"
      aria-label={`Current streak: ${s.current} day${s.current === 1 ? "" : "s"}`}
      className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-primary/5 p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5 text-accent" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Daily streak
          </p>
          <p className="font-serif text-xl font-bold leading-tight">
            {s.current} day{s.current === 1 ? "" : "s"}
            {s.longest > s.current && (
              <span className="ml-2 text-xs font-sans font-medium text-muted-foreground">
                best {s.longest}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-1.5" aria-hidden="true">
        {week.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full h-1.5 rounded-full ${d.read ? "bg-accent" : "bg-muted"}`}
            />
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreakCard;
