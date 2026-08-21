import { Link } from "react-router-dom";
import { categoryBySlug } from "@/lib/categories";

const CategoryBadge = ({ slug, asLink = true }: { slug?: string | null; asLink?: boolean }) => {
  const meta = categoryBySlug(slug);
  if (!meta) return null;
  const content = (
    <span className="type-meta inline-flex max-w-full items-center whitespace-nowrap rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] tracking-[0.04em] sm:px-2 sm:text-[11px] sm:tracking-[0.08em]">
      {meta.label}
    </span>
  );
  if (!asLink) return content;
  return (
    <Link to={`/categories/${meta.slug}`} className="interactive hover:opacity-80">
      {content}
    </Link>
  );
};

export default CategoryBadge;
