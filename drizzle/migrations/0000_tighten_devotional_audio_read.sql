DROP POLICY IF EXISTS devotional_audio_public_read ON storage.objects;

CREATE POLICY devotional_audio_published_read ON storage.objects
FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'devotional-audio' AND (
    name = '_music/bed.mp3'
    OR EXISTS (
      SELECT 1 FROM public.devotionals d
      WHERE d.status = 'published'
        AND (d.audio_female_url = storage.objects.name OR d.audio_male_url = storage.objects.name)
    )
  )
);

CREATE POLICY devotional_audio_admin_read ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'devotional-audio' AND public.has_role(auth.uid(), 'admin'));