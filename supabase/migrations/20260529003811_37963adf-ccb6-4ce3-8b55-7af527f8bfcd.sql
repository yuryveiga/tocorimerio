
-- 1) Revoke EXECUTE on SECURITY DEFINER functions from anon/public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_archive_sales() FROM anon, authenticated, PUBLIC;

-- 2) Tighten storage.objects policies for site-images bucket (admin only for writes)
DROP POLICY IF EXISTS "Authenticated can upload site-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update site-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete site-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

CREATE POLICY "Admins can upload site-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site-images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site-images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

-- 3) Restrict site_visitors: anon can only INSERT; admins can read/update/delete
DROP POLICY IF EXISTS "Allow all" ON public.site_visitors;

CREATE POLICY "Anyone can insert visits"
ON public.site_visitors FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view visits"
ON public.site_visitors FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update visits"
ON public.site_visitors FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete visits"
ON public.site_visitors FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4) Realtime authorization: restrict realtime channel subscriptions to admins
-- (sales is the only table in supabase_realtime publication and carries PII)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins only realtime read" ON realtime.messages;
DROP POLICY IF EXISTS "Admins only realtime write" ON realtime.messages;

CREATE POLICY "Admins only realtime read"
ON realtime.messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins only realtime write"
ON realtime.messages FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
