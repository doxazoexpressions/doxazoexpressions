ALTER TABLE public.devotionals ADD COLUMN IF NOT EXISTS day integer;
CREATE UNIQUE INDEX IF NOT EXISTS devotionals_day_unique ON public.devotionals(day) WHERE day IS NOT NULL;
CREATE INDEX IF NOT EXISTS devotionals_day_idx ON public.devotionals(day);
CREATE UNIQUE INDEX IF NOT EXISTS devotionals_slug_unique ON public.devotionals(slug) WHERE slug IS NOT NULL;