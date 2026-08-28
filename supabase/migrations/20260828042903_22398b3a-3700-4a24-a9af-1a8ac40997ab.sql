ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS meta_title_pt text,
  ADD COLUMN IF NOT EXISTS meta_description_pt text,
  ADD COLUMN IF NOT EXISTS meta_title_es text,
  ADD COLUMN IF NOT EXISTS meta_description_es text;