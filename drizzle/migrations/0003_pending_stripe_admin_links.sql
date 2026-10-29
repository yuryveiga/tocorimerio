CREATE OR REPLACE FUNCTION public.enqueue_pending_stripe_check(_session_id text, _sale_ids uuid[], _customer_email text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF _session_id NOT LIKE 'cs_%' OR cardinality(_sale_ids) > 50 THEN RAISE EXCEPTION 'Invalid checkout'; END IF;
 INSERT INTO public.pending_stripe_checks(sale_id, session_id, due_at, next_attempt_at)
 SELECT id, _session_id, COALESCE(created_at,now()) + interval '15 minutes', COALESCE(created_at,now()) + interval '15 minutes'
 FROM public.sales WHERE id = ANY(_sale_ids) AND (_customer_email IS NULL OR lower(customer_email) = lower(_customer_email)) AND is_paid IS NOT TRUE AND is_cancelled IS NOT TRUE
 ON CONFLICT(sale_id) DO UPDATE SET session_id = EXCLUDED.session_id WHERE pending_stripe_checks.completed_at IS NULL AND pending_stripe_checks.attempts = 0;
 PERFORM public.dispatch_pending_stripe_checks();
END; $$;
REVOKE ALL ON FUNCTION public.enqueue_pending_stripe_check(text,uuid[],text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_pending_stripe_check(text,uuid[],text) TO service_role;