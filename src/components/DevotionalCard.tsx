import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import CategoryBadge from "./CategoryBadge";

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
  return src.length > 180 ? src.slice(0, 180).trim() + "…" : src;
};

const DevotionalCard = ({ d }: { d: DevotionalCardData }) => {
  return (
    <Link to={`/devotional/${d.id}`} className="group block h-full">
      <Card className="h-full border-border group-hover:border-accent/40 group-hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {new Date(d.publish_date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <CategoryBadge slug={d.category} asLink={false} />
          </div>
          <h3 className="font-serif font-semibold text-lg text-foreground mb-2 leading-snug group-hover:text-accent transition-colors">
            {d.title}
          </h3>
          {d.scripture_reference && (
            <p className="text-xs text-accent font-medium mb-3">{d.scripture_reference}</p>
          )}
          {d.series && (
            <p className="text-xs text-muted-foreground italic mb-3">Series · {d.series}</p>
          )}
          <p className="text-sm text-muted-foreground line-clamp-3 mt-auto">{buildExcerpt(d)}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default DevotionalCard;
