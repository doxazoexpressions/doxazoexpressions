-- Fix has_role permissions: authenticated users need EXECUTE so RLS policies that reference it don't fail with "permission denied for function has_role"
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Ensure core tables are readable by authenticated users (some may already have default grants, this makes it explicit)
GRANT SELECT ON public.devotionals TO authenticated;
GRANT SELECT ON public.prayers TO authenticated;
GRANT SELECT ON public.teachings TO authenticated;
GRANT SELECT ON public.testimonies TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;