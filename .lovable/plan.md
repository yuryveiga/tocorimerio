## Objetivo

Gerar automaticamente, a cada deploy, uma página HTML estática indexável pelo Google para:
- Cada **jogo** ativo do Maracanã (vindos do Supabase do parceiro)
- Cada **passeio** ativo (já existe — vamos reforçar SEO)
- Cada **categoria** de passeio (ex: `/passeios/city-tour`, `/passeios/maracana`)

Todas as páginas usam o prerender React existente (visual idêntico ao site) e o CTA principal aponta para o anúncio interno (`/match/:slug` ou `/passeio/:slug`).

## O que muda

### 1. Prerender — incluir jogos e categorias

`scripts/prerender.js`:
- Buscar jogos no Supabase do parceiro (mesmo cliente já usado em `useMatches.ts`) e adicionar `/jogo/:slug` à lista de rotas.
- Agrupar passeios por `category` e adicionar `/passeios/:categoria-slug` para cada categoria distinta.
- Manter o pipeline atual (Playwright → `dist/<rota>/index.html`).

### 2. Nova rota e página de landing do jogo

- Adicionar rota `/jogo/:slug` no `src/App.tsx`.
- Criar `src/pages/JogoLanding.tsx`:
  - Busca o jogo via `useMatches` (filtra pelo slug).
  - Renderiza H1, descrição, data, estádio, times, logos, preço, JSON-LD `SportsEvent`.
  - Meta tags via `react-helmet-async` (title, description, canonical, OG, Twitter).
  - CTA grande "Ver disponibilidade e comprar" → `/match/:slug` (página real já existente em `MatchDetail.tsx`).
  - Seções com `included_json`, `bring_json`, etc. para conteúdo rico (bom para SEO).

### 3. Nova rota e página de landing por categoria

- Adicionar rota `/passeios/:categoria` no `src/App.tsx`.
- Criar `src/pages/PasseiosCategoria.tsx`:
  - Busca passeios da categoria e renderiza grid de cards.
  - Title/meta otimizados ("City Tour Rio de Janeiro — Tocorime" etc.).
  - Cada card → `/passeio/:slug`.

### 4. Sitemap

- Atualizar `public/sitemap.xml` (e/ou a edge function `supabase/functions/sitemap/index.ts`) para incluir `/jogo/:slug` e `/passeios/:categoria` dinamicamente.

### 5. Reforço SEO nos passeios já prerenderizados

- Conferir em `PasseioDetalhe.tsx` se `<title>`, meta description, canonical e JSON-LD `TouristTrip`/`Product` estão presentes; se não, adicionar.

## Detalhes técnicos

```text
dist/
├── jogo/
│   ├── flamengo-vs-vasco/index.html
│   └── fluminense-vs-bolivar/index.html
├── passeio/
│   ├── cristo-redentor/index.html      (já existe)
│   └── ...
└── passeios/
    ├── city-tour/index.html
    ├── maracana/index.html
    └── trilhas/index.html
```

- Concorrência do Playwright fica em 3 (igual hoje) para não estourar memória; jogos podem ser dezenas, então o build vai ficar ~1–3 min mais longo.
- Slugs de categoria gerados com `slugify()` (`src/utils/slugify.ts`).
- `JogoLanding` reusa o mesmo `useMatches` para evitar nova lógica de fetch e manter cache.
- Nenhuma mudança de schema, RLS ou edge function obrigatória além do sitemap.

## Não está no escopo

- Páginas HTML 100% estáticas separadas do React (descartado — prerender já entrega isso).
- Mudar destino do CTA para checkout direto (mantém fluxo atual via página de detalhe).
- Tradução automática das landings (ficam em PT inicialmente; i18n pode ser fase 2).
