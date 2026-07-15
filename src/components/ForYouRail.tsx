import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPrefs } from "@/lib/prefs";
import { liveDevotionalOr } from "@/lib/liveDevotional";
import CategoryBadge from "@/components/CategoryBadge";

type Devotional = {
  id: string;
  title: string;
  scripture_reference: string | null;
  excerpt: string | null;
  category: string | null;
  slug: string | null;
  publish_date: string;
};

const href = (d: Devotional) => `/devotional/${d.slug || d.id}`;

/**
 * "For You" rail — surfaces devotionals matching the categories the user
 * picked during onboarding. Only renders when preferences exist AND we find
 * matching entries; otherwise stays out of the way.
 */
const ForYouRail = () => {
  const [items, setItems] = useState<Devotional[]>([]);
  const [prefs] = useState(() => getPrefs());

  useEffect(() => {
    if (!prefs.categories.length) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("devotionals")
          .select("id,title,scripture_reference,excerpt,category,slug,publish_date")
          .or(liveDevotionalOr())
          .in("category", prefs.categories)
          .order("publish_date", { ascending: false })
          .limit(8);
        if (!cancelled && data) setItems(data as Devotional[]);
      } catch { /* offline */ }
    })();
    return () => { cancelled = true; };
  }, [prefs.categories]);

  if (!prefs.categories.length || items.length === 0) return null;

  return (
    <section className="px-5 mt-8" aria-label="For you">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            For you
          </h3>
        </div>
        <Link to="/settings" className="text-xs text-accent inline-flex items-center gap-1">
          Adjust <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x">
        {items.map((d) => (
          <Link
            key={d.id}
            to={href(d)}
            className="snap-start shrink-0 w-64 rounded-xl border border-accent/30 bg-gradient-to-br from-accent/5 to-transparent p-4 active:scale-[0.99] transition"
          >
            {d.category && (
              <div className="mb-2">
                <CategoryBadge category={d.category} />
              </div>
            )}
            <p className="font-serif font-semibold text-sm leading-snug line-clamp-2">
              {d.title}
            </p>
            {d.scripture_reference && (
              <p className="text-xs text-accent mt-1">{d.scripture_reference}</p>
            )}
            {d.excerpt && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{d.excerpt}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ForYouRail;
