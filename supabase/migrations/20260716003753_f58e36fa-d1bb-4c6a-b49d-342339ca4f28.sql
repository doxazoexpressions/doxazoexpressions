
DROP POLICY IF EXISTS "Authenticated can view groups" ON public.groups;

CREATE POLICY "Members or creator can view groups"
ON public.groups
FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by
  OR public.is_group_member(id, auth.uid())
);

CREATE OR REPLACE FUNCTION public.join_group_by_code(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _group_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO _group_id
  FROM public.groups
  WHERE invite_code = upper(trim(_code))
  LIMIT 1;

  IF _group_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.group_members (group_id, user_id)
  VALUES (_group_id, auth.uid())
  ON CONFLICT DO NOTHING;

  RETURN _group_id;
END;
$$;

REVOKE ALL ON FUNCTION public.join_group_by_code(text) FROM public;
GRANT EXECUTE ON FUNCTION public.join_group_by_code(text) TO authenticated;
