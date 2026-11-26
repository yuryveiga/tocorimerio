CREATE TABLE public.fin_despesas_fixas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mes text NOT NULL CHECK (mes ~ '^\d{4}-\d{2}$'),
  descricao text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fin_despesas_fixas_mes_idx ON public.fin_despesas_fixas(mes);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_despesas_fixas TO authenticated;
GRANT ALL ON public.fin_despesas_fixas TO service_role;
ALTER TABLE public.fin_despesas_fixas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins fin_despesas_fixas" ON public.fin_despesas_fixas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::text)) WITH CHECK (public.has_role(auth.uid(),'admin'::text));