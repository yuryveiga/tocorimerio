CREATE OR REPLACE FUNCTION public.get_checkout_sales(_session_id text)
RETURNS TABLE(id uuid, tour_title text, selected_date text, selected_period text, quantity integer, total_price numeric, is_paid boolean, is_archived boolean, customer_name text, currency text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
 SELECT s.id, s.tour_title, s.selected_date, s.selected_period, s.quantity, s.total_price, s.is_paid, s.is_archived, s.customer_name, s.currency
 FROM public.sales s JOIN public.pending_stripe_checks q ON q.sale_id = s.id
 WHERE _session_id LIKE 'cs\_%' AND length(_session_id) BETWEEN 20 AND 255 AND q.session_id = _session_id
 LIMIT 50;
$$;

CREATE OR REPLACE FUNCTION public.set_checkout_passengers(_session_id text, _sale_id uuid, _passengers jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
 IF jsonb_typeof(_passengers) <> 'array' OR jsonb_array_length(_passengers) > 100 OR length(_passengers::text) > 20000 THEN
  RAISE EXCEPTION 'Invalid passengers';
 END IF;
 UPDATE public.sales s SET passengers_json = _passengers
 WHERE s.id = _sale_id AND s.is_cancelled IS NOT TRUE
   AND EXISTS (SELECT 1 FROM public.pending_stripe_checks q WHERE q.sale_id = _sale_id AND q.session_id = _session_id AND _session_id LIKE 'cs\_%');
 IF NOT FOUND THEN RAISE EXCEPTION 'Reservation unavailable'; END IF;
END; $$;

REVOKE ALL ON FUNCTION public.get_checkout_sales(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_checkout_passengers(text, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_checkout_sales(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_checkout_passengers(text, uuid, jsonb) TO anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_sales_by_ids(uuid[]) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_sale_passengers(uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_by_ids(uuid[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_sale_passengers(uuid, jsonb) TO service_role;