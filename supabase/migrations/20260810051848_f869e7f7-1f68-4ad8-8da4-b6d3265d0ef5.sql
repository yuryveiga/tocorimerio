ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS meta_keywords_pt text,
  ADD COLUMN IF NOT EXISTS meta_keywords_es text;

ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS meta_keywords_pt text,
  ADD COLUMN IF NOT EXISTS meta_keywords_es text;