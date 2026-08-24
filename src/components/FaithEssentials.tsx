import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, Quote as QuoteIcon, Sparkles, ChevronDown } from "lucide-react";
import {
  earlierDays,
  formatDayDate,
  recentWindow,
} from "@/data/faithEssentials";
import type { DevotionalDay } from "@/data/types";

const Label = ({ icon: Icon, children }: { icon: typeof BookOpen; children: React.ReactNode }) => (
  <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold mb-1.5 flex items-center gap-1.5">
    <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {children}
  </p>
);

const DayBody = ({ day }: { day: DevotionalDay }) => (
  <div className="space-y-5">
    <blockquote className="border-l-2 border-accent/60 pl-4">
      <p className="font-serif italic text-base leading-relaxed">&ldquo;{day.quote.text}&rdquo;</p>
      <footer className="text-xs text-muted-foreground mt-1.5">— {day.quote.author}</footer>
    </blockquote>

    <div>
      <Label icon={BookOpen}>Passage</Label>
      <p className="font-serif leading-relaxed">{day.passage.body}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {day.passage.reference} · {day.passage.translation}
      </p>
    </div>

    <div>
      <Label icon={Sparkles}>Devotional</Label>
      <p className="leading-relaxed text-left whitespace-pre-line">{day.devotional}</p>
    </div>

    <div>
      <Label icon={QuoteIcon}>Prayer</Label>
      <p className="font-serif italic leading-relaxed">{day.prayer}</p>
    </div>

    {/* Audio for this original set is not produced yet — state it plainly
        rather than showing a player control that cannot work. */}
    <p className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border/60 pt-3">
      <Headphones className="w-3.5 h-3.5 text-accent/70 shrink-0" aria-hidden="true" />
      Narration coming soon · about {day.audio_estimate_minutes} min read
    </p>
  </div>
);

const DayHeading = ({ day, date }: { day: DevotionalDay; date: string }) => (
  <div className="min-w-0 text-left">
    <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold">
      Day {day.day_number} · {formatDayDate(date)}
    </p>
    <h3 className="font-serif text-lg md:text-xl font-bold mt-1 break-words">{day.title}</h3>
  </div>
);

/** Collapsible entry for any day other than today. */
const DayRow = ({ day, date }: { day: DevotionalDay; date: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <article className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 p-4 md:p-5 text-left min-h-11"
      >
        <DayHeading day={day} date={date} />
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="px-4 md:px-5 pb-5 pt-1">
          <DayBody day={day} />
        </div>
      )}
    </article>
  );
};

const FaithEssentials = () => {
  const [showEarlier, setShowEarlier] = useState(false);
  const window7 = useMemo(() => recentWindow(7), []);
  const earlier = useMemo(() => earlierDays(window7), [window7]);
  const today = window7[0];

  return (
    <section aria-labelledby="faith-essentials-title" className="mt-14">
      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-semibold">
          Original to Doxazo
        </p>
        <h2 id="faith-essentials-title" className="text-2xl md:text-3xl font-serif font-bold">
          Faith Essentials
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Quote, passage, devotional and prayer — written for Doxazo Expressions.
          {" "}
          <span className="whitespace-nowrap">{earlier.length + window7.length} days available.</span>
        </p>
      </div>

      <article className="rounded-lg border border-accent/30 bg-card p-5 md:p-6 space-y-5">
        <header className="flex items-start justify-between gap-3">
          <DayHeading day={today.day} date={today.date} />
          <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-accent border border-accent/40 rounded-full px-2 py-1 shrink-0">
            Today
          </span>
        </header>
        <DayBody day={today.day} />
      </article>

      <div className="mt-4 space-y-3">
        {window7.slice(1).map((s) => (
          <DayRow key={s.day.day_id} day={s.day} date={s.date} />
        ))}
      </div>

      <div className="mt-5">
        <Button variant="outline" className="min-h-11" onClick={() => setShowEarlier((v) => !v)}>
          {showEarlier ? "Hide earlier days" : "View earlier days"}
        </Button>
      </div>

      {showEarlier && (
        <div className="mt-4 space-y-3">
          {earlier.map((d) => (
            <article key={d.day_id} className="rounded-lg border border-border bg-card p-4 md:p-5">
              <details>
                <summary className="cursor-pointer list-none min-h-11 flex items-center">
                  <span className="font-serif text-lg font-bold break-words">
                    Day {d.day_number} · {d.title}
                  </span>
                </summary>
                <div className="pt-4">
                  <DayBody day={d} />
                </div>
              </details>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default FaithEssentials;
