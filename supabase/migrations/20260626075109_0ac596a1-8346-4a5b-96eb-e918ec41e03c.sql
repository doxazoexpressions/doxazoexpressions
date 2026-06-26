
CREATE TABLE public.social_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  devotional_id UUID NOT NULL UNIQUE REFERENCES public.devotionals(id) ON DELETE CASCADE,
  instagram_caption TEXT,
  facebook_caption TEXT,
  x_post TEXT,
  tiktok_script TEXT,
  reel_hook TEXT,
  quote_graphic TEXT,
  story_cta TEXT,
  notification_cta TEXT,
  hashtags_instagram TEXT,
  hashtags_facebook TEXT,
  hashtags_x TEXT,
  hashtags_tiktok TEXT,
  canva_headline TEXT,
  canva_excerpt TEXT,
  canva_scripture TEXT,
  canva_cta TEXT,
  scheduled BOOLEAN NOT NULL DEFAULT false,
  posted_instagram BOOLEAN NOT NULL DEFAULT false,
  posted_facebook BOOLEAN NOT NULL DEFAULT false,
  posted_tiktok BOOLEAN NOT NULL DEFAULT false,
  posted_x BOOLEAN NOT NULL DEFAULT false,
  date_posted DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_packs TO authenticated;
GRANT ALL ON public.social_packs TO service_role;

ALTER TABLE public.social_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view social packs"
  ON public.social_packs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert social packs"
  ON public.social_packs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update social packs"
  ON public.social_packs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete social packs"
  ON public.social_packs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER social_packs_set_updated_at
  BEFORE UPDATE ON public.social_packs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
