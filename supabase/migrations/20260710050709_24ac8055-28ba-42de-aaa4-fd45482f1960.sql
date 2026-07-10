
-- Auto-promote scheduled devotionals when their publish_at has arrived
CREATE OR REPLACE FUNCTION public.promote_scheduled_devotionals()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.devotionals
     SET status = 'published',
         published = true
   WHERE status = 'scheduled'
     AND publish_at IS NOT NULL
     AND publish_at <= now();
END;
$$;

-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- (Re)schedule the promotion job to run every minute
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'promote-scheduled-devotionals') THEN
    PERFORM cron.unschedule('promote-scheduled-devotionals');
  END IF;
  PERFORM cron.schedule(
    'promote-scheduled-devotionals',
    '* * * * *',
    $cron$ SELECT public.promote_scheduled_devotionals(); $cron$
  );
END $$;

-- Run once immediately so any already-due items promote right away
SELECT public.promote_scheduled_devotionals();
