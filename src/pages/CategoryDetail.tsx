import { Navigate, useParams } from "react-router-dom";
import Archive from "./Archive";
import { categoryBySlug } from "@/lib/categories";

/**
 * Theme results view. Reuses the approved Archive card system and layout,
 * locked to a single category so the URL (/categories/:slug) stays intentional
 * and back navigation returns to /categories.
 */
const CategoryDetail = () => {
  const { slug } = useParams();
  const meta = categoryBySlug(slug);

  if (!meta) return <Navigate to="/categories" replace />;
  return <Archive key={meta.slug} lockedCategory={meta.slug} />;
};

export default CategoryDetail;
