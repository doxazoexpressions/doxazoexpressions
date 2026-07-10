
ALTER TABLE public.devotionals
  ADD COLUMN IF NOT EXISTS audio_male_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_female_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_default_voice TEXT CHECK (audio_default_voice IN ('male','female')),
  ADD COLUMN IF NOT EXISTS audio_duration_seconds_male INTEGER,
  ADD COLUMN IF NOT EXISTS audio_duration_seconds_female INTEGER,
  ADD COLUMN IF NOT EXISTS audio_male_status TEXT DEFAULT 'none' CHECK (audio_male_status IN ('none','generated','approved','published')),
  ADD COLUMN IF NOT EXISTS audio_female_status TEXT DEFAULT 'none' CHECK (audio_female_status IN ('none','generated','approved','published'));
