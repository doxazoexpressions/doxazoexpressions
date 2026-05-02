-- Fix search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Tighten public INSERT policies (require non-empty fields)
DROP POLICY "Anyone submits testimony" ON public.testimonies;
CREATE POLICY "Anyone submits testimony" ON public.testimonies FOR INSERT
  WITH CHECK (length(trim(name)) > 0 AND length(trim(message)) > 0 AND length(message) <= 2000);

DROP POLICY "Anyone submits speaking request" ON public.speaking_requests;
CREATE POLICY "Anyone submits speaking request" ON public.speaking_requests FOR INSERT
  WITH CHECK (length(trim(name)) > 0 AND length(trim(email)) > 0 AND email ~ '^[^@]+@[^@]+\.[^@]+$');

DROP POLICY "Anyone submits contact" ON public.contact_messages;
CREATE POLICY "Anyone submits contact" ON public.contact_messages FOR INSERT
  WITH CHECK (length(trim(name)) > 0 AND email ~ '^[^@]+@[^@]+\.[^@]+$' AND length(trim(message)) > 0 AND length(message) <= 5000);