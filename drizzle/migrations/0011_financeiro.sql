CREATE TYPE public.fin_origem AS ENUM ('site','manual');
CREATE TABLE public.fin_vendas (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 data date NOT NULL DEFAULT CURRENT_DATE,
 hotel text, nome_pax text NOT NULL DEFAULT '', tour text NOT NULL DEFAULT '',
 valor numeric(12,2) NOT NULL DEFAULT 0, valor_cobrado numeric(12,2) NOT NULL DEFAULT 0,
 guia_responsavel text, comissao numeric(12,2), despesas numeric(12,2) NOT NULL DEFAULT 0,
 modo_pagamento text NOT NULL DEFAULT 'Pix', origem public.fin_origem NOT NULL DEFAULT 'manual',
 id_externo text UNIQUE, observacoes text, campos_editados text[] NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid DEFAULT auth.uid()
);
CREATE TABLE public.fin_despesas (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 venda_id uuid NOT NULL REFERENCES public.fin_vendas(id) ON DELETE CASCADE,
 descricao text NOT NULL DEFAULT '', valor numeric(12,2) NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_vendas, public.fin_despesas TO authenticated;
GRANT ALL ON public.fin_vendas, public.fin_despesas TO service_role;
ALTER TABLE public.fin_vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_despesas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins fin_vendas" ON public.fin_vendas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::text)) WITH CHECK (public.has_role(auth.uid(),'admin'::text));
CREATE POLICY "admins fin_despesas" ON public.fin_despesas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::text)) WITH CHECK (public.has_role(auth.uid(),'admin'::text));
CREATE INDEX fin_vendas_data_idx ON public.fin_vendas(data);
CREATE TRIGGER fin_vendas_updated BEFORE UPDATE ON public.fin_vendas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.fin_is_football(s public.sales) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
 SELECT s.provider = 'matchday' OR s.selected_period = 'match_time'
  OR (coalesce(s.tour_title,'')||' '||coalesce(s.tour_slug,'')) ~* '(match ?-?day|football|futebol|soccer|nfl|\mjogos?\M|\mmatch(es)?\M|[- ](vs|versus|x)[- ])';
$$;

CREATE OR REPLACE FUNCTION public.fin_upsert_from_sale(s public.sales) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rate numeric := 1; r jsonb; brl numeric; d date; ed text[];
BEGIN
 IF s.is_paid IS NOT TRUE OR s.is_cancelled IS TRUE OR public.fin_is_football(s) THEN RETURN; END IF;
 IF upper(coalesce(s.currency,'BRL')) <> 'BRL' THEN
  SELECT value::jsonb INTO r FROM site_settings WHERE key='fallback_exchange_rates';
  IF r ? upper(s.currency) AND (r->>upper(s.currency))::numeric > 0 THEN rate := 1/(r->>upper(s.currency))::numeric; END IF;
 END IF;
 brl := round(coalesce(s.total_price,0)*rate,2);
 BEGIN d := s.selected_date::date; EXCEPTION WHEN others THEN d := coalesce(s.created_at,now())::date; END;
 d := coalesce(d, coalesce(s.created_at,now())::date);
 SELECT campos_editados INTO ed FROM fin_vendas WHERE id_externo = s.id::text;
 IF NOT FOUND THEN
  INSERT INTO fin_vendas(data,nome_pax,tour,valor,valor_cobrado,modo_pagamento,origem,id_externo,created_by)
  VALUES (d, coalesce(s.customer_name,''), coalesce(s.tour_title,''), brl, brl, 'Stripe', 'site', s.id::text, NULL);
 ELSE
  UPDATE fin_vendas SET
   data = CASE WHEN 'data' = ANY(ed) THEN data ELSE d END,
   nome_pax = CASE WHEN 'nome_pax' = ANY(ed) THEN nome_pax ELSE coalesce(s.customer_name,'') END,
   tour = CASE WHEN 'tour' = ANY(ed) THEN tour ELSE coalesce(s.tour_title,'') END,
   valor = CASE WHEN 'valor' = ANY(ed) THEN valor ELSE brl END,
   valor_cobrado = CASE WHEN 'valor_cobrado' = ANY(ed) THEN valor_cobrado ELSE brl END
  WHERE id_externo = s.id::text;
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.fin_upsert_from_sale(public.sales) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.on_sale_fin() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NEW.is_paid IS TRUE AND (TG_OP='INSERT' OR OLD.is_paid IS NOT TRUE) THEN
  BEGIN PERFORM public.fin_upsert_from_sale(NEW); EXCEPTION WHEN others THEN RAISE WARNING 'fin import failed %', SQLERRM; END;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER sales_to_financeiro AFTER INSERT OR UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.on_sale_fin();

CREATE OR REPLACE FUNCTION public.fin_sync_site_sales() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.sales; n int := 0;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin'::text) THEN RAISE EXCEPTION 'forbidden'; END IF;
 FOR s IN SELECT * FROM sales WHERE is_paid IS TRUE AND is_cancelled IS NOT TRUE LOOP
  IF NOT public.fin_is_football(s) THEN PERFORM public.fin_upsert_from_sale(s); n := n+1; END IF;
 END LOOP;
 RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.fin_sync_site_sales() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fin_sync_site_sales() TO authenticated;