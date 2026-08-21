import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import CategoryBadge from "./CategoryBadge";
import { preview } from "@/lib/textPreview";
import FavoriteButton from "./FavoriteButton";

export type DevotionalCardData = {
  id: string;
  title: string;
  publish_date: string;
  scripture_reference: string | null;
  excerpt: string | null;
  body?: string | null;
  category?: string | null;
  series?: string | null;
};

const buildExcerpt = (d: DevotionalCardData) => {
  if (d.excerpt && d.excerpt.trim()) return d.excerpt;
  const src = d.body ?? "";
  return preview(src, 180);
};

const DevotionalCard = ({ d }: { d: DevotionalCardData }) => {
  return (
    <div className="relative h-full group">
      <div className="absolute top-2.5 right-2.5 z-10">
        <FavoriteButton devotionalId={d.id} variant="ghost" size="icon" showLabel={false} />
      </div>
      <Link to={`/devotional/${d.id}`} className="block h-full">
        <Card className="h-full border-border group-hover:border-accent/40 group-hover:shadow-lg transition-all duration-300">
          <CardContent className="p-5 md:p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2.5 pr-9 min-w-0">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                {new Date(d.publish_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <span className="text-muted-foreground/30 shrink-0">·</span>
              <CategoryBadge slug={d.category} asLink={false} />
            </div>
            <h3 className="font-serif font-semibold text-[17px] md:text-lg text-foreground mb-2 leading-snug break-words group-hover:text-accent transition-colors">
              {d.title}
            </h3>
            {d.scripture_reference && (
              <p className="text-xs text-accent font-medium mb-1.5 break-words">{d.scripture_reference}</p>
            )}
            {d.series && (
              <p className="text-[11px] text-muted-foreground italic mb-1.5 truncate">Series · {d.series}</p>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mt-3">{buildExcerpt(d)}</p>
          </CardContent>
        </Card>
      </Link>
    </div>

  );
};

export default DevotionalCard;
