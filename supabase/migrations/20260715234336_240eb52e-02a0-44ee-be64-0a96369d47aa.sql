
CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  devotional_id uuid REFERENCES public.devotionals(id) ON DELETE SET NULL,
  devotional_title text,
  content text NOT NULL,
  mood text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own journal select" ON public.journal_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own journal insert" ON public.journal_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own journal update" ON public.journal_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own journal delete" ON public.journal_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER journal_entries_set_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX journal_entries_user_created_idx ON public.journal_entries(user_id, created_at DESC);

CREATE TABLE public.verse_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  devotional_id uuid REFERENCES public.devotionals(id) ON DELETE SET NULL,
  devotional_title text,
  reference text,
  verse_text text NOT NULL,
  color text NOT NULL DEFAULT 'gold',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.verse_highlights TO authenticated;
GRANT ALL ON public.verse_highlights TO service_role;
ALTER TABLE public.verse_highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own hl select" ON public.verse_highlights FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own hl insert" ON public.verse_highlights FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own hl update" ON public.verse_highlights FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own hl delete" ON public.verse_highlights FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX verse_highlights_user_created_idx ON public.verse_highlights(user_id, created_at DESC);

CREATE TABLE public.plan_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_slug text NOT NULL,
  devotional_id uuid NOT NULL REFERENCES public.devotionals(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, plan_slug, devotional_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_progress TO authenticated;
GRANT ALL ON public.plan_progress TO service_role;
ALTER TABLE public.plan_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plan select" ON public.plan_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own plan insert" ON public.plan_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own plan delete" ON public.plan_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX plan_progress_user_plan_idx ON public.plan_progress(user_id, plan_slug);
