GRANT SELECT, INSERT ON public.blog_post_ratings TO anon;
GRANT SELECT, INSERT, DELETE ON public.blog_post_ratings TO authenticated;
GRANT ALL ON public.blog_post_ratings TO service_role;