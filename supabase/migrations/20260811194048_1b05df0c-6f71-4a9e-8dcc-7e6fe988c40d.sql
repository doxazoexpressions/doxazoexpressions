-- Rolling 3-day live window: promote due scheduled devotionals, and demote
-- anything published with a publish_date older than (today - 2 days) back to draft.
-- Records are never deleted; they remain in admin with Draft status.
CREATE OR REPLACE FUNCTION public.promote_scheduled_devotionals()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.devotionals
     SET status = 'published',
         published = true
   WHERE status = 'scheduled'
     AND publish_at IS NOT NULL
     AND publish_at <= now();

  PERFORM public.archive_stale_devotionals();
END;
$function$;

CREATE OR REPLACE FUNCTION public.archive_stale_devotionals()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  affected integer;
BEGIN
  UPDATE public.devotionals
     SET status = 'draft',
         published = false
   WHERE status = 'published'
     AND publish_date < (CURRENT_DATE - INTERVAL '2 days')::date;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.archive_stale_devotionals() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.archive_stale_devotionals() TO service_role, postgres;

-- Apply immediately so the current backlog collapses to the rolling window.
SELECT public.promote_scheduled_devotionals();