
-- Add devotional CMS fields
DO $$ BEGIN
  CREATE TYPE public.devotional_status AS ENUM ('draft', 'scheduled', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.devotionals
  ADD COLUMN IF NOT EXISTS status public.devotional_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS prayer_section text,
  ADD COLUMN IF NOT EXISTS decree_and_declare text,
  ADD COLUMN IF NOT EXISTS inspiration_caption text,
  ADD COLUMN IF NOT EXISTS publish_at timestamptz;

-- Backfill: existing published rows -> 'published', else 'draft'
UPDATE public.devotionals
   SET status = CASE WHEN published THEN 'published'::public.devotional_status ELSE 'draft'::public.devotional_status END
 WHERE status IS NULL OR status = 'draft';

-- Backfill publish_at from scheduled_for or publish_date
UPDATE public.devotionals
   SET publish_at = COALESCE(scheduled_for, (publish_date::timestamptz))
 WHERE publish_at IS NULL;

-- Backfill decree_and_declare from legacy `declaration`
UPDATE public.devotionals
   SET decree_and_declare = declaration
 WHERE decree_and_declare IS NULL AND declaration IS NOT NULL;

-- Backfill slug
UPDATE public.devotionals
   SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) || '-' || substr(id::text, 1, 8)
 WHERE slug IS NULL;

-- Unique slug
CREATE UNIQUE INDEX IF NOT EXISTS devotionals_slug_unique ON public.devotionals(slug);
-- Helpful indexes
CREATE INDEX IF NOT EXISTS devotionals_status_publish_at_idx ON public.devotionals(status, publish_at DESC);

-- Replace public read policy: only published AND publish_at <= now()
DROP POLICY IF EXISTS "Anyone reads published devotionals" ON public.devotionals;
CREATE POLICY "Anyone reads published devotionals"
  ON public.devotionals
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND (publish_at IS NULL OR publish_at <= now()));

-- Keep `published` boolean in sync with status (transitional)
CREATE OR REPLACE FUNCTION public.sync_devotional_published()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.published := (NEW.status = 'published');
  IF NEW.publish_at IS NULL AND NEW.status = 'published' THEN
    NEW.publish_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_devotional_published ON public.devotionals;
CREATE TRIGGER trg_sync_devotional_published
  BEFORE INSERT OR UPDATE ON public.devotionals
  FOR EACH ROW EXECUTE FUNCTION public.sync_devotional_published();

-- Favorites table (Milestone 2 schema added now to avoid a second migration)
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  devotional_id uuid NOT NULL REFERENCES public.devotionals(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, devotional_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own favorites" ON public.favorites;
CREATE POLICY "Users manage own favorites"
  ON public.favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
