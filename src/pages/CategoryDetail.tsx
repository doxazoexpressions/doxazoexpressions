import { Navigate, useParams } from "react-router-dom";
import Archive from "./Archive";
import { categoryBySlug } from "@/lib/categories";
import { useEffect } from "react";

// CategoryDetail simply pre-fills the Archive page with a category filter via URL search param.
const CategoryDetail = () => {
  const { slug } = useParams();
  const meta = categoryBySlug(slug);

  useEffect(() => {
    if (meta && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("category") !== meta.slug) {
        url.searchParams.set("category", meta.slug);
        window.history.replaceState({}, "", `/archive?${url.searchParams.toString()}`);
      }
    }
  }, [meta]);

  if (!meta) return <Navigate to="/categories" replace />;
  // Redirect-style render: render Archive (it reads ?category=) but ensure URL reflects archive view.
  return <Archive />;
};

export default CategoryDetail;
