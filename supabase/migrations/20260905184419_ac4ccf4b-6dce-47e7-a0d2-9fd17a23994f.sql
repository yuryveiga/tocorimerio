CREATE TABLE public.match_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  slug text,
  available_spots integer,
  max_per_purchase integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(match_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_overrides TO authenticated;
GRANT SELECT ON public.match_overrides TO anon;
GRANT ALL ON public.match_overrides TO service_role;

ALTER TABLE public.match_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read match overrides"
  ON public.match_overrides FOR SELECT TO anon USING (true);

CREATE POLICY "Admins can manage match overrides"
  ON public.match_overrides FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_match_overrides_updated_at
  BEFORE UPDATE ON public.match_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_match_local_sold_count(_match_id text)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(quantity), 0)::int
  FROM public.sales
  WHERE tour_id = _match_id
    AND (is_cancelled = false OR is_cancelled IS NULL);
$$;

CREATE OR REPLACE FUNCTION public.get_match_local_sold_counts(_match_ids text[])
RETURNS TABLE(match_id text, sold_count integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tour_id::text, COALESCE(SUM(quantity), 0)::int
  FROM public.sales
  WHERE tour_id = ANY(_match_ids)
    AND (is_cancelled = false OR is_cancelled IS NULL)
  GROUP BY tour_id;
$$;