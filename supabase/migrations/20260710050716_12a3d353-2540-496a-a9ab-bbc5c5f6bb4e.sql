
REVOKE EXECUTE ON FUNCTION public.promote_scheduled_devotionals() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_scheduled_devotionals() TO service_role, postgres;
