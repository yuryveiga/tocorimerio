ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.sales FROM anon;
GRANT INSERT ON public.sales TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;

DROP POLICY IF EXISTS "Anyone can create sales" ON public.sales;
DROP POLICY IF EXISTS "Admins manage sales" ON public.sales;

CREATE POLICY "Anyone can create sales"
  ON public.sales FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins manage sales"
  ON public.sales FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Página de sucesso: cliente só acessa as vendas cujos IDs (UUID) recebeu.
CREATE OR REPLACE FUNCTION public.get_sales_by_ids(_ids uuid[])
RETURNS SETOF public.sales
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.sales
  WHERE id = ANY(_ids)
  LIMIT 50;
$$;

CREATE OR REPLACE FUNCTION public.set_sale_passengers(_id uuid, _passengers jsonb)
RETURNS void
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.sales
  SET passengers_json = _passengers
  WHERE id = _id;
$$;

-- Prova social: apenas contagem e primeiro nome, sem PII.
CREATE OR REPLACE FUNCTION public.count_recent_bookings(_tour_id text, _days integer DEFAULT 7)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM public.sales
  WHERE tour_id = _tour_id
    AND is_cancelled = false
    AND created_at >= now() - (_days || ' days')::interval;
$$;

CREATE OR REPLACE FUNCTION public.recent_sales_public(_tour_id text, _hours integer DEFAULT 48)
RETURNS TABLE(customer_name text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT split_part(trim(s.customer_name), ' ', 1), s.created_at
  FROM public.sales s
  WHERE s.tour_id = _tour_id
    AND s.is_cancelled = false
    AND s.created_at >= now() - (_hours || ' hours')::interval
  ORDER BY s.created_at DESC
  LIMIT 5;
$$;

GRANT EXECUTE ON FUNCTION public.get_sales_by_ids(uuid[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_sale_passengers(uuid, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.count_recent_bookings(text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recent_sales_public(text, integer) TO anon, authenticated;