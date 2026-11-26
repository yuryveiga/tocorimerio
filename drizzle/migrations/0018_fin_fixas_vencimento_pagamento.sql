ALTER TABLE public.fin_despesas_fixas ADD COLUMN vencimento date, ADD COLUMN data_pagamento date;
CREATE INDEX fin_despesas_fixas_vencimento_idx ON public.fin_despesas_fixas(vencimento);