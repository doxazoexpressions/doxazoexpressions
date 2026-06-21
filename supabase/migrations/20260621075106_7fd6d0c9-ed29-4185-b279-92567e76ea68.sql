
-- Devotional category enum
DO $$ BEGIN
  CREATE TYPE public.devotional_category AS ENUM (
    'series',
    'divine_relationship',
    'destiny_purpose',
    'blessings',
    'prayers',
    'life_relationships'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Contact message type enum
DO $$ BEGIN
  CREATE TYPE public.contact_message_type AS ENUM (
    'general',
    'partnership',
    'testimony',
    'prayer_request'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Extend devotionals
ALTER TABLE public.devotionals
  ADD COLUMN IF NOT EXISTS category public.devotional_category,
  ADD COLUMN IF NOT EXISTS series text,
  ADD COLUMN IF NOT EXISTS excerpt text,
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;

CREATE INDEX IF NOT EXISTS devotionals_published_date_idx
  ON public.devotionals (published, publish_date DESC);

CREATE INDEX IF NOT EXISTS devotionals_category_idx
  ON public.devotionals (category);

-- Extend contact_messages
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS type public.contact_message_type NOT NULL DEFAULT 'general';
