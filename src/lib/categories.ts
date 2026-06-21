export type CategorySlug =
  | "series"
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
  { slug: "series", label: "Series", description: "Multi-part teaching arcs that go deeper." },
  { slug: "divine_relationship", label: "Divine Relationship", description: "Drawing closer to the heart of God." },
  { slug: "destiny_purpose", label: "Destiny & Purpose", description: "Walking in your God-given assignment." },
  { slug: "blessings", label: "Blessings", description: "Receiving and stewarding God's favor." },
  { slug: "prayers", label: "Prayers", description: "Devotionals built around fervent prayer." },
  { slug: "life_relationships", label: "Life & Relationships", description: "Faith lived out with the people around you." },
];

export const categoryBySlug = (slug?: string | null): CategoryMeta | undefined =>
  CATEGORIES.find((c) => c.slug === slug);

export const categoryLabel = (slug?: string | null) => categoryBySlug(slug)?.label ?? "Devotional";
