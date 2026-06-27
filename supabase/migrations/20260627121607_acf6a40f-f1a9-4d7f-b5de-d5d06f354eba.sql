DROP INDEX IF EXISTS public.devotionals_day_unique;
DROP INDEX IF EXISTS public.devotionals_slug_unique;
ALTER TABLE public.devotionals ADD CONSTRAINT devotionals_day_unique UNIQUE (day);
ALTER TABLE public.devotionals ADD CONSTRAINT devotionals_slug_unique UNIQUE (slug);