import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, Quote as QuoteIcon, Sparkles } from "lucide-react";
import {
  dayWindow,
  faithEssentialDays,
  formatDayDate,
  resolveTodayDay,
} from "@/data/faithEssentials";
import type { DevotionalDay } from "@/data/types";

const DayCard = ({ day, fallback }: { day: DevotionalDay; fallback?: boolean }) => (
  <article className="rounded-lg border border-border bg-card p-5 md:p-6 space-y-5">
    <header className="flex items-baseline justify-between gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold">
          {fallback ? "Day 1" : `Day ${day.day_number}`} · {formatDayDate(day.date)}
        </p>
        <h3 className="font-serif text-xl md:text-2xl font-bold mt-1">{day.title}</h3>
      </div>
    </header>

    <blockquote className="border-l-2 border-accent/60 pl-4">
      <p className="font-serif italic text-base leading-relaxed">“{day.quote.text}”</p>
      <footer className="text-xs text-muted-foreground mt-1.5">— {day.quote.author}</footer>
    </blockquote>

    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold mb-1.5 flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" /> Passage
      </p>
      <p className="font-serif leading-relaxed">{day.passage.body}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {day.passage.reference} · {day.passage.translation}
      </p>
    </div>

    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold mb-1.5 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" /> Devotional
      </p>
      <p className="leading-relaxed text-left whitespace-pre-line">{day.devotional}</p>
    </div>

    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold mb-1.5 flex items-center gap-1.5">
        <QuoteIcon className="w-3.5 h-3.5" /> Prayer
      </p>
      <p className="font-serif italic leading-relaxed">{day.prayer}</p>
    </div>

    <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-3">
      <Headphones className="w-4 h-4 text-accent shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Listen — {day.audio_estimate_minutes} min</p>
        <p className="text-xs text-muted-foreground">Coming soon</p>
      </div>
      <Button size="sm" variant="outline" disabled>
        Play
      </Button>
    </div>
  </article>
);

const FaithEssentials = () => {
  const [showEarlier, setShowEarlier] = useState(false);
  const { day: today, isFallback } = useMemo(() => resolveTodayDay(), []);
  const startIndex = faithEssentialDays.findIndex((d) => d.day_id === today.day_id);
  const week = useMemo(() => dayWindow(Math.max(startIndex, 0)), [startIndex]);
  const earlier = useMemo(
    () => faithEssentialDays.filter((d) => !week.some((w) => w.day_id === d.day_id)),
    [week],
  );

  return (
    <section aria-labelledby="faith-essentials-title" className="mt-10">
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold">
          Original to Doxazo
        </p>
        <h2 id="faith-essentials-title" className="text-2xl md:text-3xl font-serif font-bold">
          Faith Essentials
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          A seven-day window of quote, passage, devotional and prayer — written for Doxazo Expressions.
        </p>
      </div>

      <div className="space-y-4">
        <DayCard day={week[0]} fallback={isFallback} />
        {week.slice(1).map((d) => (
          <DayCard key={d.day_id} day={d} />
        ))}
      </div>

      <div className="mt-5">
        <Button variant="outline" onClick={() => setShowEarlier((v) => !v)}>
          {showEarlier ? "Hide earlier days" : "View earlier"}
        </Button>
      </div>

      {showEarlier && (
        <div className="mt-4 space-y-4">
          {earlier.map((d) => (
            <DayCard key={d.day_id} day={d} />
          ))}
        </div>
      )}

      {!showEarlier && (
        <Card className="mt-4">
          <CardContent className="p-4 text-xs text-muted-foreground">
            {faithEssentialDays.length} authored days available.
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default FaithEssentials;
