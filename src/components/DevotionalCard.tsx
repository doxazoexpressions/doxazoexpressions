import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import CategoryBadge from "./CategoryBadge";
import { preview } from "@/lib/textPreview";
import FavoriteButton from "./FavoriteButton";
import { formatDevotionalDate, formatScripture, formatSeries } from "@/lib/devotionalFormat";

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
  const scripture = formatScripture(d.scripture_reference);
  const series = formatSeries(d.series);

  return (
    <div className="relative h-full group min-w-0">
      {/* 44px tap target, visually a small heart */}
      <div className="absolute top-1 right-1 z-10">
        <FavoriteButton devotionalId={d.id} variant="ghost" size="icon" showLabel={false} />
      </div>
      <Link to={`/devotional/${d.id}`} className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <Card className="h-full border-border press group-hover:shadow-lg group-hover:border-accent/30">
          <CardContent className="p-4 md:p-6 flex flex-col h-full">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 pr-11 min-w-0">
              <span className="type-meta whitespace-nowrap shrink-0">{formatDevotionalDate(d.publish_date)}</span>
              <span className="text-muted-foreground/30 shrink-0" aria-hidden="true">·</span>
              <span className="min-w-0">
                <CategoryBadge slug={d.category} asLink={false} />
              </span>
            </div>


            <h3 className="type-heading text-[17px] md:text-lg text-foreground mb-1.5 break-words line-clamp-3">
              {d.title}
            </h3>

            {/* Fixed-height meta block: content length can't change card geometry */}
            <div className="min-h-[2.25rem]">
              {scripture && <p className="type-scripture break-words line-clamp-1">{scripture}</p>}
              {series && (
                <p className="text-[11px] leading-tight text-muted-foreground/80 italic mt-1 truncate">
                  {series}
                </p>
              )}
            </div>

            <p className="type-body text-sm text-muted-foreground line-clamp-3 mt-2">
              {buildExcerpt(d)}
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default DevotionalCard;
