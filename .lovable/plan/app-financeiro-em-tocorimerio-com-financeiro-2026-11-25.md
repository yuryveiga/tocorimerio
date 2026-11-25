# App Financeiro em tocorimerio.com/financeiro

Construir o financeiro **dentro deste mesmo site**, em `/financeiro`, usando o login de administrador que já existe. Assim não é preciso webhook, chave de API nem segundo app: as reservas de passeios pagas já estão no banco e entram direto no financeiro.

## O que você vai ver
- **Início**: dois botões grandes (Cadastrar venda / Consultar venda) + resumo do mês (bruto e líquido).
- **Cadastrar venda**: data (hoje), hotel, pax, tour (sugestões dos passeios), valor, valor cobrado, guia (sugestões dos guias), comissão, várias despesas com descrição e valor, modo de pagamento, observações. Botões "Salvar" e "Salvar e cadastrar outra".
- **Consultar venda**: seletor de mês com anterior/próximo; cards Bruto, Comissões, Despesas, Líquido (destaque), Nº de vendas; lista com selo "site"/"manual" e líquido por venda; busca e filtros por guia, tour e pagamento; detalhe com Editar e Excluir (com confirmação).
- **Relatórios**: mês ou intervalo de datas, geral ou por guia; PDF com nome Tocorime Rio, tabela, totais e resumos por guia e por pagamento; exportar CSV.
- **Admins**: reaproveita a tela de usuários do painel atual (adicionar/remover admins).
- Navegação inferior no celular, menu lateral no computador, modo escuro, instalável na tela inicial do celular (sem modo offline).

## Importação das vendas do site
- Toda reserva de **passeio** paga vira automaticamente uma venda "site" (futebol é ignorado), preenchendo data, pax, tour, valor, valor cobrado e pagamento (Stripe).
- Guia, comissão, despesas e hotel ficam marcados "pendente de preenchimento".
- Importa na hora em que a reserva é paga, mais botão "Sincronizar agora" para buscar antigas. Sem rotina de hora em hora (não é necessária e gastaria recursos).
- A sincronização nunca sobrescreve campos que você já editou.
- Valores em US$/€ são convertidos para R$ pela cotação salva no momento da importação.

## Etapas
1. Banco + acesso admin + Cadastrar e Consultar.
2. Importação automática + Sincronizar agora.
3. Relatórios PDF/CSV + instalação no celular.

## Detalhes técnicos
- Rotas `/financeiro/*` no app React atual, protegidas por `has_role(auth.uid(),'admin')` (mesmo guard do AdminLayout); sem base path separado.
- Tabelas `fin_vendas` (numeric(12,2), origem enum site/manual, id_externo único = sales.id, campos_editados text[]) e `fin_despesas` (venda_id, descricao, valor); totais calculados. RLS admin-only + GRANTs para authenticated/service_role.
- Trigger em `sales` quando `is_paid` vira true e não é futebol (`footballReservation` rule) → upsert em `fin_vendas` respeitando `campos_editados`. RPC admin-only `fin_sync_site_sales()` para o botão.
- PDF com jsPDF + autotable no navegador; CSV seguro contra fórmulas (padrão já usado).
- Manifest próprio para instalação; sem service worker.
- Testes unitários para bruto/líquido e filtro de futebol.
