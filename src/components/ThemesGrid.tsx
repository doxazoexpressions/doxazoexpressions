import { Link } from "react-router-dom";
import { THEMES, themeHref } from "@/lib/themes";
import { hapticLight } from "@/lib/haptics";

/** 8 spiritually resonant themes surfaced as tappable chips. Mobile-first. */
const ThemesGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
    {THEMES.map((t) => (
      <Link
        key={t.slug}
        to={themeHref(t)}
        onClick={() => hapticLight()}
        className={`rounded-xl border border-border bg-gradient-to-br ${t.gradient} p-4 min-h-16 flex items-center justify-center text-center active:scale-[0.98] transition`}
      >
        <span className="font-serif font-semibold text-base text-foreground">{t.label}</span>
      </Link>
    ))}
  </div>
);

export default ThemesGrid;
