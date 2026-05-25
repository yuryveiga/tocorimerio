
-- 1. Harden function search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Enable RLS on tables missing it
ALTER TABLE public.blog_posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles    ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES — own row + admins only
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. USER_ROLES — admins only
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. BLOG_POSTS — keep existing public read; admin manage already exists. RLS enable above suffices.

-- 6. PAGES — restrict writes to admin
DROP POLICY IF EXISTS "Authenticated can delete pages" ON public.pages;
DROP POLICY IF EXISTS "Authenticated can insert pages" ON public.pages;
DROP POLICY IF EXISTS "Authenticated can update pages" ON public.pages;
DROP POLICY IF EXISTS "Admins can manage pages" ON public.pages;
CREATE POLICY "Admins can manage pages" ON public.pages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. MATCHES — drop anon write
DROP POLICY IF EXISTS "Allow anon insert" ON public.matches;
DROP POLICY IF EXISTS "Allow anon update" ON public.matches;
DROP POLICY IF EXISTS "Allow anon select" ON public.matches;
DROP POLICY IF EXISTS "Admins can manage matches" ON public.matches;
CREATE POLICY "Admins can manage matches" ON public.matches
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. REVIEWS — drop public write
DROP POLICY IF EXISTS "Allow public delete" ON public.reviews;
DROP POLICY IF EXISTS "Allow public insert" ON public.reviews;
DROP POLICY IF EXISTS "Allow public update" ON public.reviews;

-- 9. SALES — drop "Allow all"; allow public insert, admin manage
DROP POLICY IF EXISTS "Allow all" ON public.sales;
DROP POLICY IF EXISTS "Anyone can submit booking" ON public.sales;
DROP POLICY IF EXISTS "Admins can manage sales" ON public.sales;
CREATE POLICY "Anyone can submit booking" ON public.sales
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage sales" ON public.sales
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 10. SITE_IMAGES — admin-only write
DROP POLICY IF EXISTS "Authenticated can delete site_images" ON public.site_images;
DROP POLICY IF EXISTS "Authenticated can insert site_images" ON public.site_images;
DROP POLICY IF EXISTS "Authenticated can update site_images" ON public.site_images;
DROP POLICY IF EXISTS "Admins can manage site_images" ON public.site_images;
CREATE POLICY "Admins can manage site_images" ON public.site_images
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 11. SITE_SETTINGS — admin-only write
DROP POLICY IF EXISTS "public_delete" ON public.site_settings;
DROP POLICY IF EXISTS "public_insert" ON public.site_settings;
DROP POLICY IF EXISTS "public_update" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated can manage site_settings" ON public.site_settings;

-- 12. SOCIAL_MEDIA — admin-only write
DROP POLICY IF EXISTS "Anyone can delete social" ON public.social_media;
DROP POLICY IF EXISTS "Anyone can insert social" ON public.social_media;
DROP POLICY IF EXISTS "Anyone can update social" ON public.social_media;
DROP POLICY IF EXISTS "Authenticated can delete social_media" ON public.social_media;
DROP POLICY IF EXISTS "Authenticated can insert social_media" ON public.social_media;
DROP POLICY IF EXISTS "Authenticated can update social_media" ON public.social_media;
DROP POLICY IF EXISTS "Admins can manage social_media" ON public.social_media;
CREATE POLICY "Admins can manage social_media" ON public.social_media
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 13. TOURS — admin-only write
DROP POLICY IF EXISTS "Admins or authenticated can update tours" ON public.tours;
DROP POLICY IF EXISTS "Authenticated can delete tours" ON public.tours;
DROP POLICY IF EXISTS "Authenticated can insert tours" ON public.tours;
DROP POLICY IF EXISTS "Authenticated can update tours" ON public.tours;
DROP POLICY IF EXISTS "Admins can manage tours" ON public.tours;
CREATE POLICY "Admins can manage tours" ON public.tours
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 14. STORAGE — drop anon write/read-all; keep public read of site-images bucket
DROP POLICY IF EXISTS "Allow all uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow all deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow all reads" ON storage.objects;
