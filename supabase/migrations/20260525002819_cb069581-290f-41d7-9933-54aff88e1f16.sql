
-- Restrict EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_archive_sales() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;

-- Prevent listing of public bucket: replace broad public SELECT policies on storage.objects
DROP POLICY IF EXISTS "Anyone can view site images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view site images storage" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view site-images" ON storage.objects;
-- Public bucket files remain reachable via direct URL (object storage CDN);
-- LIST via storage.objects is restricted to admins.
CREATE POLICY "Admins can list site-images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));
