ALTER TABLE public.fin_vendas
  ADD COLUMN quantidade integer NOT NULL DEFAULT 1,
  ADD COLUMN contato text;

ALTER TABLE public.fin_vendas
  ADD CONSTRAINT fin_vendas_quantidade_positiva CHECK (quantidade > 0);

COMMENT ON COLUMN public.fin_vendas.quantidade IS 'Quantidade de passageiros da venda.';
COMMENT ON COLUMN public.fin_vendas.contato IS 'Telefone ou WhatsApp do cliente.';