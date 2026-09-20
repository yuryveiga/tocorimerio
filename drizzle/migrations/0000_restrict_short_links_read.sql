-- Remove public read access to short_links (customer names + Stripe payment URLs)
DROP POLICY IF EXISTS "Anyone can resolve short links" ON public.short_links;
REVOKE SELECT ON public.short_links FROM anon;

CREATE POLICY "Authenticated can read short links"
  ON public.short_links FOR SELECT
  TO authenticated
  USING (true);

-- Public resolution keeps working through this security definer function only
CREATE OR REPLACE FUNCTION public.register_short_link_click(_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url TEXT;
BEGIN
  UPDATE public.short_links
     SET clicks = clicks + 1
   WHERE code = _code
  RETURNING target_url INTO _url;
  RETURN _url;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_short_link_click(TEXT) TO anon, authenticated;