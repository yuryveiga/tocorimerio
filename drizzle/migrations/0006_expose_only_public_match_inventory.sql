ALTER POLICY "Anon can read match overrides" ON public.match_overrides TO authenticated USING (public.has_role(auth.uid(), 'admin'::text));
CREATE OR REPLACE FUNCTION public.get_public_match_inventory(_match_ids uuid[])
RETURNS TABLE(match_id uuid, available_spots integer, max_per_purchase integer, sold_count_local integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
 SELECT m.match_id,m.available_spots,m.max_per_purchase,m.sold_count_local
 FROM public.match_overrides m
 WHERE m.match_id = ANY(_match_ids) AND cardinality(_match_ids) BETWEEN 1 AND 100;
$$;
REVOKE ALL ON FUNCTION public.get_public_match_inventory(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_match_inventory(uuid[]) TO anon, authenticated, service_role;