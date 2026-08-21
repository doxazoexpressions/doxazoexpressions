import { Link } from "react-router-dom";
import { categoryBySlug } from "@/lib/categories";

const CategoryBadge = ({ slug, asLink = true }: { slug?: string | null; asLink?: boolean }) => {
  const meta = categoryBySlug(slug);
  if (!meta) return null;
  const content = (
    <span className="type-meta inline-flex min-w-0 max-w-full items-center px-2 py-0.5 rounded-full bg-muted/60 truncate">
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
