-- Add meta_title_en and meta_description_en columns to tours for per-tour custom SEO overrides.
-- When set, these replace the auto-generated title template and the auto-appended CTA description.
ALTER TABLE public.tours
ADD COLUMN IF NOT EXISTS meta_title_en TEXT,
ADD COLUMN IF NOT EXISTS meta_description_en TEXT;
