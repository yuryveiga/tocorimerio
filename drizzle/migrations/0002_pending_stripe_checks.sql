-- lovable-cron-fallback-reviewed: no enabled delay-until provider; wake on server-created checkout enqueue, check at 15-16 minutes, three bounded transport attempts, unschedule on queue drain; at most 1440 ticks/day only with pending work.
CREATE TABLE public.pending_stripe_check_config (id boolean PRIMARY KEY DEFAULT true, endpoint text NOT NULL);
GRANT ALL ON public.pending_stripe_check_config TO service_role;
ALTER TABLE public.pending_stripe_check_config ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.pending_stripe_checks (
 sale_id uuid PRIMARY KEY REFERENCES public.sales(id) ON DELETE CASCADE,
 session_id text NOT NULL, token uuid NOT NULL DEFAULT gen_random_uuid(),
 due_at timestamptz NOT NULL, next_attempt_at timestamptz NOT NULL,
 attempts integer NOT NULL DEFAULT 0, locked_until timestamptz,
 completed_at timestamptz, outcome text, last_error text
);
GRANT ALL ON public.pending_stripe_checks TO service_role;
ALTER TABLE public.pending_stripe_checks ENABLE ROW LEVEL SECURITY;
CREATE INDEX pending_stripe_checks_due_idx ON public.pending_stripe_checks(next_attempt_at) WHERE completed_at IS NULL AND attempts < 3;
CREATE OR REPLACE FUNCTION public.dispatch_pending_stripe_checks() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d record; endpoint_url text;
BEGIN
 PERFORM pg_advisory_xact_lock(78291503);
 UPDATE public.pending_stripe_checks q SET completed_at = now(), locked_until = NULL, outcome = 'already_resolved'
 FROM public.sales s WHERE q.sale_id = s.id AND q.completed_at IS NULL AND (s.is_paid = true OR s.is_cancelled = true);
 SELECT endpoint INTO endpoint_url FROM public.pending_stripe_check_config WHERE id = true;
 IF endpoint_url IS NULL THEN RETURN; END IF;
 FOR d IN SELECT sale_id,token FROM public.pending_stripe_checks WHERE completed_at IS NULL AND attempts < 3 AND next_attempt_at <= now() AND (locked_until IS NULL OR locked_until < now()) ORDER BY next_attempt_at LIMIT 20 LOOP
  PERFORM net.http_post(url := endpoint_url, headers := '{"Content-Type":"application/json"}'::jsonb, body := jsonb_build_object('saleId', d.sale_id, 'token', d.token), timeout_milliseconds := 10000);
 END LOOP;
 IF EXISTS(SELECT 1 FROM public.pending_stripe_checks WHERE completed_at IS NULL AND attempts < 3) THEN
  IF NOT EXISTS(SELECT 1 FROM cron.job WHERE jobname = 'pending-stripe-check') THEN
   PERFORM cron.schedule('pending-stripe-check', '* * * * *', 'SELECT public.dispatch_pending_stripe_checks()');
  END IF;
 ELSE
  IF EXISTS(SELECT 1 FROM cron.job WHERE jobname = 'pending-stripe-check') THEN PERFORM cron.unschedule('pending-stripe-check'); END IF;
 END IF;
END; $$;
CREATE OR REPLACE FUNCTION public.enqueue_pending_stripe_check(_session_id text, _sale_ids uuid[], _customer_email text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF _session_id NOT LIKE 'cs_%' OR cardinality(_sale_ids) > 50 THEN RAISE EXCEPTION 'Invalid checkout'; END IF;
 INSERT INTO public.pending_stripe_checks(sale_id, session_id, due_at, next_attempt_at)
 SELECT id, _session_id, COALESCE(created_at,now()) + interval '15 minutes', COALESCE(created_at,now()) + interval '15 minutes'
 FROM public.sales WHERE id = ANY(_sale_ids) AND lower(customer_email) = lower(_customer_email) AND is_paid IS NOT TRUE AND is_cancelled IS NOT TRUE
 ON CONFLICT(sale_id) DO UPDATE SET session_id = EXCLUDED.session_id WHERE pending_stripe_checks.completed_at IS NULL AND pending_stripe_checks.attempts = 0;
 PERFORM public.dispatch_pending_stripe_checks();
END; $$;
CREATE OR REPLACE FUNCTION public.claim_pending_stripe_check(_sale_id uuid, _token uuid) RETURNS SETOF public.pending_stripe_checks LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
 UPDATE public.pending_stripe_checks SET locked_until = now() + interval '3 minutes', attempts = attempts + 1, next_attempt_at = now() + interval '5 minutes'
 WHERE sale_id = _sale_id AND token = _token AND completed_at IS NULL AND attempts < 3 AND due_at <= now() AND next_attempt_at <= now() AND (locked_until IS NULL OR locked_until < now()) RETURNING *;
$$;
CREATE OR REPLACE FUNCTION public.on_pending_stripe_resolved() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NEW.is_paid = true OR NEW.is_cancelled = true THEN
  UPDATE public.pending_stripe_checks SET completed_at = now(), locked_until = NULL, outcome = 'already_resolved' WHERE sale_id = NEW.id AND completed_at IS NULL;
  PERFORM public.dispatch_pending_stripe_checks();
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER pending_stripe_resolved AFTER UPDATE OF is_paid,is_cancelled ON public.sales FOR EACH ROW EXECUTE FUNCTION public.on_pending_stripe_resolved();
REVOKE ALL ON FUNCTION public.dispatch_pending_stripe_checks(),public.enqueue_pending_stripe_check(text,uuid[],text),public.claim_pending_stripe_check(uuid,uuid),public.on_pending_stripe_resolved() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.dispatch_pending_stripe_checks(),public.enqueue_pending_stripe_check(text,uuid[],text),public.claim_pending_stripe_check(uuid,uuid) TO service_role;