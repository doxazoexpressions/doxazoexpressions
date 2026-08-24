CREATE TABLE public.series_normalization_backup (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  devotional_id uuid NOT NULL,
  old_series text,
  new_series text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.series_normalization_backup TO authenticated;
GRANT ALL ON public.series_normalization_backup TO service_role;

ALTER TABLE public.series_normalization_backup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view series backup"
ON public.series_normalization_backup
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));