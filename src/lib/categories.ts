export type CategorySlug =
  | "divine_relationship"
  | "destiny_purpose"
  | "blessings"
  | "prayers"
  | "life_relationships";

export type CategoryMeta = {
  slug: CategorySlug;
  label: string;
  description: string;
};

export const CATEGORIES: CategoryMeta[] = [
  { slug: "divine_relationship", label: "Divine Relationship", description: "Drawing closer to the heart of God." },
  { slug: "destiny_purpose", label: "Destiny & Purpose", description: "Walking in your God-given assignment." },
  { slug: "blessings", label: "Blessings", description: "Receiving and stewarding God's favor." },
  { slug: "prayers", label: "Prayers", description: "Devotionals built around fervent prayer." },
  { slug: "life_relationships", label: "Life & Relationships", description: "Faith lived out with the people around you." },
];

export const categoryBySlug = (slug?: string | null): CategoryMeta | undefined =>
  CATEGORIES.find((c) => c.slug === slug);

export const categoryLabel = (slug?: string | null) => categoryBySlug(slug)?.label ?? "Devotional";

/**
 * Resolve any user-entered category string (slug, label, or close variant) to a known slug.
 * Returns null for unknown / blank values so the caller can flag them.
 */
export function resolveCategory(value?: string | null): CategorySlug | null {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  if (!v || v === "none" || v === "n/a") return null;
  // direct slug match
  const bySlug = CATEGORIES.find((c) => c.slug === v);
  if (bySlug) return bySlug.slug;
  // label match (case-insensitive, ignore & and punctuation)
  const norm = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
  const target = norm(v);
  const byLabel = CATEGORIES.find((c) => norm(c.label) === target);
  if (byLabel) return byLabel.slug;
  // common aliases
  const aliases: Record<string, CategorySlug> = {
    "relationship": "divine_relationship",
    "divine": "divine_relationship",
    "destiny": "destiny_purpose",
    "purpose": "destiny_purpose",
    "blessing": "blessings",
    "prayer": "prayers",
    "life": "life_relationships",
    "relationships": "life_relationships",
  };
  return aliases[target] ?? null;
}
