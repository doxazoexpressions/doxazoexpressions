-- Fix: anon users couldn't execute has_role(), which was blocking ALL reads on tables that
-- have admin policies (devotionals, prayers, teachings, testimonies, contact_messages,
-- speaking_requests, etc). Postgres OR's policies but must be able to evaluate each one.
-- Restrict admin policies to authenticated role so anon never tries to evaluate has_role.

-- Also grant EXECUTE on has_role to authenticated explicitly (it's the only role that needs it).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Recreate all admin policies scoped to "authenticated" instead of "public" (which includes anon)
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname='public'
      AND (qual LIKE '%has_role%' OR with_check LIKE '%has_role%')
      AND 'public' = ANY(roles)
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    IF r.cmd = 'SELECT' THEN
      EXECUTE format('CREATE POLICY %I ON %I.%I FOR SELECT TO authenticated USING (%s)', r.policyname, r.schemaname, r.tablename, r.qual);
    ELSIF r.cmd = 'INSERT' THEN
      EXECUTE format('CREATE POLICY %I ON %I.%I FOR INSERT TO authenticated WITH CHECK (%s)', r.policyname, r.schemaname, r.tablename, COALESCE(r.with_check,'true'));
    ELSIF r.cmd = 'UPDATE' THEN
      EXECUTE format('CREATE POLICY %I ON %I.%I FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)', r.policyname, r.schemaname, r.tablename, COALESCE(r.qual,'true'), COALESCE(r.with_check, r.qual, 'true'));
    ELSIF r.cmd = 'DELETE' THEN
      EXECUTE format('CREATE POLICY %I ON %I.%I FOR DELETE TO authenticated USING (%s)', r.policyname, r.schemaname, r.tablename, r.qual);
    ELSIF r.cmd = 'ALL' THEN
      EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL TO authenticated USING (%s) WITH CHECK (%s)', r.policyname, r.schemaname, r.tablename, COALESCE(r.qual,'true'), COALESCE(r.with_check, r.qual, 'true'));
    END IF;
  END LOOP;
END $$;