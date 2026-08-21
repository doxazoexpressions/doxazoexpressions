import { useEffect, useRef } from "react";
import { CATEGORIES, CategorySlug } from "@/lib/categories";
import { cn } from "@/lib/utils";

type Props = {
  active: CategorySlug | null;
  onChange: (slug: CategorySlug | null) => void;
  className?: string;
};

/**
 * Shared horizontally-swipeable category rail.
 * Scrolling is isolated to this element — the page never scrolls sideways.
 */
const CategoryRail = ({ active, onChange, className }: Props) => {
  const railRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Keep the selected chip in view (e.g. arriving with ?category= in the URL).
  useEffect(() => {
    const rail = railRef.current;
    const chip = activeRef.current;
    if (!rail || !chip) return;
    if (rail.scrollWidth <= rail.clientWidth) return;
    const left = chip.offsetLeft - rail.clientWidth / 2 + chip.offsetWidth / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  const chipClass = (selected: boolean) =>
    cn(
      "shrink-0 snap-start whitespace-nowrap rounded-full border interactive",
      "h-9 md:h-10 inline-flex items-center px-3.5 md:px-4 text-[13px] md:text-sm font-medium",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      selected
        ? "bg-accent text-accent-foreground border-accent"
        : "bg-transparent border-border text-muted-foreground hover:border-accent/50 hover:text-foreground",
    );

  return (
    <div
      ref={railRef}
      className={cn(
        "flex gap-2 overflow-x-auto no-scrollbar rail-fade -mx-4 px-4 scroll-px-4 snap-x pb-1",
        "md:mx-0 md:px-0 md:overflow-visible md:flex-wrap md:justify-center md:snap-none",
        className,
      )}
      role="group"
      aria-label="Filter by category"
    >
      <button
        type="button"
        ref={active === null ? activeRef : undefined}
        onClick={() => onChange(null)}
        aria-pressed={active === null}
        className={chipClass(active === null)}
      >
        All
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.slug}
          type="button"
          ref={active === c.slug ? activeRef : undefined}
          onClick={() => onChange(c.slug)}
          aria-pressed={active === c.slug}
          className={chipClass(active === c.slug)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryRail;
