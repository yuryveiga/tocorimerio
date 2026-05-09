# Plano: Página índice de passeios indexável

## Objetivo
- Criar a rota `/passeio` listando todos os passeios ativos do Supabase.
- Garantir que essa página seja gerada como HTML estático no deploy (indexável pelo Google).
- Ao clicar em um passeio, abrir a página de detalhe já existente (`/passeio/:slug` ou `/passeio/:id`).
- Confirmar que `/maracanã-calendário` continua sendo prerenderizada (sem mudanças além de garantir presença no sitemap).

## O que será feito

### 1. Nova página `src/pages/PasseiosIndex.tsx`
- Busca todos os tours ativos via Supabase (`tours` onde `is_active = true`, ordenados por `sort_order`).
- Layout em grid reaproveitando o componente `TourItem` que já é usado na home (consistência visual + zero retrabalho).
- Cada card linka para `/passeio/{slug || id}` — a página de detalhe atual `PasseioDetalhe.tsx`.
- Header e Footer padrão do site.
- Suporte aos 3 idiomas (pt/en/es) via `useLocale`.

### 2. SEO completo
- `<title>`: "Todos os Passeios no Rio de Janeiro | Tocorime Rio"
- Meta description, canonical, hreflang (pt/en/es).
- H1 único: "Passeios no Rio de Janeiro".
- JSON-LD `ItemList` com todos os passeios (nome, imagem, URL, preço).
- Open Graph + Twitter card.

### 3. Registrar rota no React Router
- Adicionar `<Route path="/passeio" element={<PasseiosIndex />} />` em `src/App.tsx`, antes da rota `/passeio/:id`.

### 4. Incluir no prerender
- Adicionar `/passeio` à lista de rotas em `scripts/prerender.js`.
- Resultado: `dist/passeio/index.html` com HTML completo + dados de todos os tours já renderizados.

### 5. Sitemap
- Adicionar `/passeio` ao `public/sitemap.xml` (ou ao gerador `scripts/generate-sitemap.js` se for dinâmico).

### 6. Calendário do Maracanã
- Não criar HTML separado. A página `/maracanã-calendário` já é prerenderizada pelo `scripts/prerender.js` no deploy do GitHub Actions.
- Apenas verificar se está listada no `sitemap.xml`; se não estiver, adicionar.

## Detalhes técnicos

- **Stack**: React + Vite + Supabase + React Router (sem mudanças de stack).
- **Data fetching**: hook similar ao já existente para tours (provavelmente `useSiteData` ou consulta direta com `supabase.from('tours')`).
- **Prerender**: o Playwright já espera o React renderizar conteúdo real antes de salvar, então a lista de tours estará no HTML final.
- **Links internos**: `<Link to={...}>` do React Router — ao clicar, navegação SPA normal abre a página de detalhe.

## Arquivos afetados

- `src/pages/PasseiosIndex.tsx` (novo)
- `src/App.tsx` (adicionar rota)
- `scripts/prerender.js` (adicionar `/passeio` à lista de rotas)
- `public/sitemap.xml` (adicionar URL)

## Fora do escopo
- Filtros, ordenação por preço ou busca (pode ser adicionado depois se quiser).
- Mudanças nas páginas de detalhe `/passeio/:id`.
- Criar HTML "puro" separado para o calendário do Maracanã.
