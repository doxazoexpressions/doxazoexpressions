import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Target, Award, Trophy, CheckCircle2 } from "lucide-react";
import { getStreak, weekProgress } from "@/lib/streak";
import { getGoal, setGoal, evaluateBadges, ALL_MILESTONES, type Badge } from "@/lib/goals";

const Goals = () => {
  const [streak, setStreak] = useState(() => getStreak());
  const [week, setWeek] = useState(() => weekProgress());
  const [goal, setGoalState] = useState(() => getGoal());
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    setBadges(evaluateBadges());
    const refresh = () => {
      setStreak(getStreak());
      setWeek(weekProgress());
      setBadges(evaluateBadges());
    };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const readThisWeek = useMemo(() => week.filter((d) => d.read).length, [week]);
  const goalPct = Math.min(100, Math.round((readThisWeek / goal.weeklyTarget) * 100));
  const owned = new Set(badges.map((b) => b.id));

  const changeTarget = (n: number) => {
    const next = { weeklyTarget: Math.max(1, Math.min(7, n)) };
    setGoal(next);
    setGoalState(next);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Goals & Streak"
        description="Track your daily devotional streak, weekly goal, and milestone badges."
        path="/goals"
      />
      <Navbar />
      <main className="pt-20 pb-16">
        <section className="container mx-auto px-4 max-w-3xl">
          <header className="mb-8 text-center">
            <Trophy className="w-10 h-10 text-accent mx-auto mb-3" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Your Journey</h1>
            <p className="text-muted-foreground">
              Consistency in the Word is one of the surest paths to transformation.
            </p>
          </header>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="w-6 h-6 text-accent" />
                  <p className="text-xs uppercase tracking-[0.18em] font-semibold text-muted-foreground">
                    Current streak
                  </p>
                </div>
                <p className="font-serif text-4xl font-bold">
                  {streak.current} <span className="text-lg font-sans font-medium text-muted-foreground">day{streak.current === 1 ? "" : "s"}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Longest: {streak.longest} days</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-accent" />
                  <p className="text-xs uppercase tracking-[0.18em] font-semibold text-muted-foreground">
                    Weekly goal
                  </p>
                </div>
                <p className="font-serif text-4xl font-bold">
                  {readThisWeek}<span className="text-muted-foreground">/{goal.weeklyTarget}</span>
                </p>
                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${goalPct}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[3, 4, 5, 6, 7].map((n) => (
                    <Button
                      key={n}
                      size="sm"
                      variant={goal.weeklyTarget === n ? "default" : "outline"}
                      className="h-7 px-2 text-xs"
                      onClick={() => changeTarget(n)}
                    >
                      {n}/wk
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-4">
                This week
              </p>
              <div className="flex items-center justify-between gap-2">
                {week.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${
                        d.read
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {d.read ? <CheckCircle2 className="w-4 h-4" /> : d.label}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-accent" />
              <h2 className="font-serif text-xl font-bold">Milestones</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {ALL_MILESTONES.map((m) => {
                const earned = owned.has(m.id);
                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border p-4 flex items-center gap-3 ${
                      earned ? "border-accent/40 bg-accent/5" : "border-border bg-muted/30 opacity-70"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                        earned ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif font-semibold">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Goals;
