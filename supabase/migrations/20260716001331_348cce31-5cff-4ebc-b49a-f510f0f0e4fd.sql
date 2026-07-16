
-- Prayer Requests: user-owned prayer list with answered state and reminders
CREATE TABLE public.prayer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  category TEXT,
  scripture_reference TEXT,
  devotional_id UUID REFERENCES public.devotionals(id) ON DELETE SET NULL,
  is_answered BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMPTZ,
  answered_note TEXT,
  remind_at TIMESTAMPTZ,
  remind_frequency TEXT,           -- 'once' | 'daily' | 'weekly' | null
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prayer_requests TO authenticated;
GRANT ALL ON public.prayer_requests TO service_role;

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own prayer requests"
  ON public.prayer_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own prayer requests"
  ON public.prayer_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own prayer requests"
  ON public.prayer_requests FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own prayer requests"
  ON public.prayer_requests FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX prayer_requests_user_idx ON public.prayer_requests (user_id, created_at DESC);
CREATE INDEX prayer_requests_remind_idx ON public.prayer_requests (remind_at) WHERE remind_at IS NOT NULL AND is_answered = false;

CREATE TRIGGER prayer_requests_set_updated_at
  BEFORE UPDATE ON public.prayer_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
