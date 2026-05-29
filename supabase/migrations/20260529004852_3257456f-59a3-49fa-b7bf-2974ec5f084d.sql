-- Replace ALL-command admin policies with INSERT/UPDATE/DELETE-only policies
-- so that anonymous SELECT queries don't trigger has_role() permission errors.

DROP POLICY IF EXISTS "Admins can modify blog" ON public.blog_posts;
CREATE POLICY "Admins can insert blog" ON public.blog_posts
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update blog" ON public.blog_posts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete blog" ON public.blog_posts
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all blog" ON public.blog_posts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage tours" ON public.tours;
CREATE POLICY "Admins can insert tours" ON public.tours
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update tours" ON public.tours
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete tours" ON public.tours
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all tours" ON public.tours
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
