ALTER TABLE public.fin_vendas
  ADD COLUMN data_tour date,
  ADD COLUMN google_event_id text;

UPDATE public.fin_vendas
SET data_tour = data
WHERE data_tour IS NULL;

COMMENT ON COLUMN public.fin_vendas.data_tour IS 'Data do passeio: igual à data da venda ou data agendada.';
COMMENT ON COLUMN public.fin_vendas.google_event_id IS 'Identificador do evento na Google Agenda para atualização sem duplicação.';