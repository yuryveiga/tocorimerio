CREATE TABLE public.short_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  label TEXT,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_short_links_code ON public.short_links(code);

GRANT SELECT ON public.short_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.short_links TO authenticated;
GRANT ALL ON public.short_links TO service_role;

ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can resolve short links" ON public.short_links FOR SELECT USING (true);
CREATE POLICY "Authenticated can create short links" ON public.short_links FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can manage short links" ON public.short_links FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete short links" ON public.short_links FOR DELETE TO authenticated USING (true);

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