-- 1) group_members: self-insert only for the group's creator; all other joins go
-- through public.join_group_by_code(), which validates the invite code.
DROP POLICY IF EXISTS "Users can join groups themselves" ON public.group_members;

CREATE POLICY "Creator is added to own group"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.groups g
    WHERE g.id = group_members.group_id
      AND g.created_by = auth.uid()
  )
);

-- 2) devotional-audio: public read only for shared assets (music bed) or files
-- whose owning devotional (first path segment = devotional id) is published.
DROP POLICY IF EXISTS "devotional_audio_public_read" ON storage.objects;

CREATE POLICY "devotional_audio_public_read"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'devotional-audio'
  AND (
    name LIKE '\_music/%'
    OR EXISTS (
      SELECT 1 FROM public.devotionals d
      WHERE d.status = 'published'
        AND storage.objects.name LIKE d.id::text || '/%'
    )
  )
);