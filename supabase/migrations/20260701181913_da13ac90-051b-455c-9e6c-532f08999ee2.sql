CREATE TABLE public.blog_post_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  stars SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,
  visitor_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, visitor_key)
);

CREATE INDEX idx_blog_post_ratings_post ON public.blog_post_ratings(post_id);

GRANT SELECT, INSERT ON public.blog_post_ratings TO anon;
GRANT SELECT, INSERT ON public.blog_post_ratings TO authenticated;
GRANT ALL ON public.blog_post_ratings TO service_role;

ALTER TABLE public.blog_post_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ratings"
  ON public.blog_post_ratings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert ratings"
  ON public.blog_post_ratings FOR INSERT
  WITH CHECK (
    stars BETWEEN 1 AND 5
    AND length(coalesce(comment, '')) <= 1000
    AND length(visitor_key) BETWEEN 8 AND 128
  );

CREATE POLICY "Admins can delete ratings"
  ON public.blog_post_ratings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));