-- lovable-cron-fallback-reviewed: wake on paid-sale enqueue; retry only pending deliveries every five minutes and unschedule immediately after drain, with twelve bounded attempts.
CREATE TABLE public.paid_sale_email_config (id boolean PRIMARY KEY DEFAULT true, endpoint text NOT NULL);
GRANT ALL ON public.paid_sale_email_config TO service_role;
ALTER TABLE public.paid_sale_email_config ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.paid_sale_email_deliveries (
 sale_id uuid PRIMARY KEY REFERENCES public.sales(id) ON DELETE CASCADE,
 token uuid NOT NULL DEFAULT gen_random_uuid(),
 admin_sent_at timestamptz, customer_sent_at timestamptz, completed_at timestamptz,
 attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(),
 locked_until timestamptz, last_error text, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.paid_sale_email_deliveries TO service_role;
ALTER TABLE public.paid_sale_email_deliveries ENABLE ROW LEVEL SECURITY;
CREATE INDEX paid_sale_email_pending_idx ON public.paid_sale_email_deliveries(next_attempt_at) WHERE completed_at IS NULL AND attempts < 12;
CREATE OR REPLACE FUNCTION public.dispatch_pending_paid_sale_emails() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d record; endpoint_url text;
BEGIN
 SELECT endpoint INTO endpoint_url FROM public.paid_sale_email_config WHERE id = true;
 IF endpoint_url IS NULL THEN RETURN; END IF;
 FOR d IN SELECT sale_id,token FROM public.paid_sale_email_deliveries WHERE completed_at IS NULL AND attempts < 12 AND next_attempt_at <= now() AND (locked_until IS NULL OR locked_until < now()) ORDER BY next_attempt_at LIMIT 10 LOOP
  PERFORM net.http_post(url := endpoint_url, headers := '{"Content-Type":"application/json"}'::jsonb, body := jsonb_build_object('saleId',d.sale_id,'token',d.token), timeout_milliseconds := 10000);
 END LOOP;
 IF EXISTS(SELECT 1 FROM public.paid_sale_email_deliveries WHERE completed_at IS NULL AND attempts < 12) THEN
  IF NOT EXISTS(SELECT 1 FROM cron.job WHERE jobname = 'paid-sale-email-retry') THEN
   PERFORM cron.schedule('paid-sale-email-retry', '*/5 * * * *', 'SELECT public.dispatch_pending_paid_sale_emails()');
  END IF;
 ELSE
  IF EXISTS(SELECT 1 FROM cron.job WHERE jobname = 'paid-sale-email-retry') THEN PERFORM cron.unschedule('paid-sale-email-retry'); END IF;
 END IF;
END; $$;
CREATE OR REPLACE FUNCTION public.enqueue_paid_sale_email(_sale_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.paid_sale_email_deliveries(sale_id)
 SELECT id FROM public.sales WHERE id = _sale_id AND is_paid = true AND is_cancelled IS NOT TRUE AND emails_sent = false
 ON CONFLICT(sale_id) DO NOTHING;
 PERFORM public.dispatch_pending_paid_sale_emails();
END; $$;
CREATE OR REPLACE FUNCTION public.claim_paid_sale_email(_sale_id uuid, _token uuid) RETURNS SETOF public.paid_sale_email_deliveries LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
 UPDATE public.paid_sale_email_deliveries SET locked_until = now() + interval '3 minutes', attempts = attempts + 1, next_attempt_at = now() + interval '5 minutes'
 WHERE sale_id = _sale_id AND token = _token AND completed_at IS NULL AND attempts < 12 AND next_attempt_at <= now() AND (locked_until IS NULL OR locked_until < now()) RETURNING *;
$$;
CREATE OR REPLACE FUNCTION public.complete_paid_sale_email(_sale_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 UPDATE public.paid_sale_email_deliveries SET completed_at = now(), locked_until = NULL, last_error = NULL WHERE sale_id = _sale_id AND admin_sent_at IS NOT NULL AND customer_sent_at IS NOT NULL;
 UPDATE public.sales SET emails_sent = true WHERE id = _sale_id AND EXISTS(SELECT 1 FROM public.paid_sale_email_deliveries WHERE sale_id = _sale_id AND completed_at IS NOT NULL);
 PERFORM public.dispatch_pending_paid_sale_emails();
END; $$;
CREATE OR REPLACE FUNCTION public.on_paid_sale_email() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NEW.is_paid = true AND NEW.emails_sent = false AND NEW.is_cancelled IS NOT TRUE THEN PERFORM public.enqueue_paid_sale_email(NEW.id); END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER paid_sale_email_on_change AFTER INSERT OR UPDATE OF is_paid ON public.sales FOR EACH ROW EXECUTE FUNCTION public.on_paid_sale_email();
REVOKE ALL ON FUNCTION public.dispatch_pending_paid_sale_emails(), public.enqueue_paid_sale_email(uuid), public.claim_paid_sale_email(uuid,uuid), public.complete_paid_sale_email(uuid), public.on_paid_sale_email() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.dispatch_pending_paid_sale_emails(), public.enqueue_paid_sale_email(uuid), public.claim_paid_sale_email(uuid,uuid), public.complete_paid_sale_email(uuid) TO service_role;