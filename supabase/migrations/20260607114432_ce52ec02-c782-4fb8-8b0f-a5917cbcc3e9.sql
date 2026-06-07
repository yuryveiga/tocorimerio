
-- 1. Remove duplicate public read on reviews that bypassed is_published filter
DROP POLICY IF EXISTS "Allow public read" ON public.reviews;

-- 2. Restrict admin write policy on site_settings to authenticated role
DROP POLICY IF EXISTS "Admins can modify settings" ON public.site_settings;
CREATE POLICY "Admins can modify settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Restrict site_visits SELECT to admins only
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.site_visits;
CREATE POLICY "Admins can view site visits"
ON public.site_visits
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::text));
