CREATE TABLE public.fin_despesas_operacionais (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 descricao text NOT NULL,
 valor numeric NOT NULL DEFAULT 0 CHECK (valor >= 0),
 vencimento date NOT NULL,
 data_pagamento date,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_despesas_operacionais TO authenticated;
GRANT ALL ON public.fin_despesas_operacionais TO service_role;
ALTER TABLE public.fin_despesas_operacionais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage operational expenses" ON public.fin_despesas_operacionais FOR ALL TO authenticated USING ((select public.has_role((select auth.uid()), 'admin'::text))) WITH CHECK ((select public.has_role((select auth.uid()), 'admin'::text)));
CREATE INDEX fin_despesas_operacionais_vencimento_idx ON public.fin_despesas_operacionais(vencimento);