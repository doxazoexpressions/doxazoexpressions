// Spiritually resonant themes surfaced in the native app. These map to search
// queries so devotionals matching the keyword (in title/body/scripture) appear
// even when they aren't tagged with an explicit category.
export type Theme = {
  slug: string;
  label: string;
  keyword: string;
  gradient: string; // tailwind gradient utility classes
};

export const THEMES: Theme[] = [
  { slug: "mercy",     label: "Mercy",     keyword: "mercy",     gradient: "from-amber-500/20 to-rose-500/20" },
  { slug: "faith",     label: "Faith",     keyword: "faith",     gradient: "from-blue-500/20 to-indigo-500/20" },
  { slug: "glory",     label: "Glory",     keyword: "glory",     gradient: "from-yellow-500/25 to-amber-600/25" },
  { slug: "obedience", label: "Obedience", keyword: "obedience", gradient: "from-emerald-500/20 to-teal-500/20" },
  { slug: "wisdom",    label: "Wisdom",    keyword: "wisdom",    gradient: "from-violet-500/20 to-purple-500/20" },
  { slug: "grace",     label: "Grace",     keyword: "grace",     gradient: "from-pink-500/20 to-rose-500/20" },
  { slug: "peace",     label: "Peace",     keyword: "peace",     gradient: "from-sky-500/20 to-cyan-500/20" },
  { slug: "prayer",    label: "Prayer",    keyword: "prayer",    gradient: "from-orange-500/20 to-amber-500/20" },
];

export const themeHref = (t: Theme) => `/search?q=${encodeURIComponent(t.keyword)}`;
