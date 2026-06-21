import { Link } from "react-router-dom";
import { categoryBySlug } from "@/lib/categories";

const CategoryBadge = ({ slug, asLink = true }: { slug?: string | null; asLink?: boolean }) => {
  const meta = categoryBySlug(slug);
  if (!meta) return null;
  const content = (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium uppercase tracking-wider">
      {meta.label}
    </span>
  );
  if (!asLink) return content;
  return (
    <Link to={`/categories/${meta.slug}`} className="hover:opacity-80 transition-opacity">
      {content}
    </Link>
  );
};

export default CategoryBadge;
