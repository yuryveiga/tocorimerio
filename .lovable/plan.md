## Problema

A página **Admin → Análise de Visitas** mostra no máximo 1000 visitas e perde tudo antes de ~07/05/2026, mesmo havendo 5.198 registros no banco desde 18/04.

Causa: o PostgREST do Supabase limita cada resposta a 1000 linhas por padrão. A query atual em `src/pages/AdminAnalytics.tsx` pede `.limit(10000)` mas o servidor ignora e devolve só 1000 (as mais recentes, por causa do `order desc`).

## Correção

Trocar a busca única por **paginação em loop** usando `.range(from, to)` até esgotar os dados, respeitando o filtro de período já selecionado pelo usuário (7d / 30d / 90d / Tudo).

Mudanças em `src/pages/AdminAnalytics.tsx`:

1. Mover o fetch para dentro do efeito que depende de `range` (hoje busca tudo de uma vez sem filtro de data no servidor).
2. Aplicar filtro `.gte("created_at", cutoffISO)` quando o range não for "all" — reduz volume e acelera.
3. Paginar em blocos de 1000 com `.range(offset, offset+999)` em loop até a página voltar com menos de 1000 itens.
4. Para o range "all", manter um teto de segurança (ex.: 50.000) para não travar o navegador caso o volume cresça muito.
5. Pequeno indicador de "carregando histórico…" enquanto pagina (opcional, só usar o `loading` existente).

Sem alterações de schema, RLS, edge functions ou outras telas.

## Resultado esperado

- Total de Visitas reflete o número real (hoje ~5.198).
- Visitas anteriores a 07/05 voltam a aparecer nos gráficos de país, páginas, referrers e linha do tempo.
- Filtros 7d/30d/90d/Tudo continuam funcionando, agora batendo no servidor.
