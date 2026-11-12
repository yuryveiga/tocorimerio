ALTER POLICY "Authenticated can delete short links" ON public.short_links USING (public.has_role(auth.uid(), 'admin'::text));
ALTER POLICY "Authenticated can manage short links" ON public.short_links USING (public.has_role(auth.uid(), 'admin'::text)) WITH CHECK (public.has_role(auth.uid(), 'admin'::text));
ALTER POLICY "Authenticated can create short links" ON public.short_links WITH CHECK (public.has_role(auth.uid(), 'admin'::text));
ALTER POLICY "Authenticated can read short links" ON public.short_links USING (public.has_role(auth.uid(), 'admin'::text));
ALTER POLICY "Anyone can create sales" ON public.sales WITH CHECK (
 public.has_role(auth.uid(), 'admin'::text) OR (
 is_paid IS FALSE AND is_cancelled IS FALSE AND is_archived IS FALSE AND emails_sent IS FALSE
 AND payment_link IS NULL AND created_at BETWEEN now() - interval '5 minutes' AND now() + interval '1 minute'
 AND quantity BETWEEN 1 AND 100 AND total_price > 0 AND total_price <= 1000000
 AND length(trim(customer_name)) BETWEEN 1 AND 200
 AND length(customer_email) <= 254 AND customer_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 AND length(COALESCE(customer_phone,'')) <= 100
 AND length(tour_id) BETWEEN 1 AND 200 AND length(COALESCE(tour_title,'')) <= 500
 AND length(COALESCE(tour_slug,'')) <= 300 AND length(COALESCE(selected_date,'')) <= 50
 AND length(COALESCE(selected_period,'')) <= 200
 AND currency IN ('BRL','USD','EUR','CNY') AND provider IN ('tour','matchday')
 AND passengers_json = '[]'::jsonb
 ));
ALTER POLICY "Anyone can view pages" ON public.pages USING (is_visible IS TRUE);
ALTER POLICY "Anyone can view active tours" ON public.tours USING (is_active IS TRUE);
ALTER POLICY "Anyone can read social" ON public.social_media USING (is_active IS TRUE);
ALTER POLICY "Anyone can view social media" ON public.social_media USING (is_active IS TRUE);
DROP POLICY "Anyone can insert visits" ON public.site_visitors;
GRANT ALL ON public.site_visitors TO service_role;
DROP POLICY "Enable insert for everyone" ON public.site_visits;
GRANT ALL ON public.site_visits TO service_role;
ALTER POLICY "Anyone can read ratings" ON public.blog_post_ratings TO authenticated USING (public.has_role(auth.uid(), 'admin'::text));
CREATE OR REPLACE FUNCTION public.get_blog_rating_summary(_post_id uuid)
RETURNS TABLE(average_stars numeric, rating_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
 SELECT avg(r.stars)::numeric, count(*) FROM public.blog_post_ratings r
 WHERE r.post_id = _post_id AND EXISTS (
 SELECT 1 FROM public.blog_posts p WHERE p.id = _post_id AND p.is_published IS TRUE
 );
$$;
REVOKE ALL ON FUNCTION public.get_blog_rating_summary(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_blog_rating_summary(uuid) TO anon, authenticated, service_role;