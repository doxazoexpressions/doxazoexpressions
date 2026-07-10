
CREATE POLICY "devotional_audio_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'devotional-audio');

CREATE POLICY "devotional_audio_admin_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'devotional-audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "devotional_audio_admin_update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'devotional-audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "devotional_audio_admin_delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'devotional-audio' AND public.has_role(auth.uid(), 'admin'));
