# Plano: Simplificar código e melhorar desempenho (sem mudar funções)

Hoje o site funciona, mas todo o `node_modules` vira **um único `vendor.js`** (veja `vite.config.ts` — `manualChunks: () => 'vendor'`). Isso significa que a home baixa e parseia bibliotecas que só são usadas em páginas internas/admin (recharts, react-quill, framer-motion, embla, canvas-confetti, dompurify, date-fns inteiro, etc.). Esse é o maior ganho de performance disponível sem mexer em features.

## O que muda

### 1. Quebrar o vendor chunk em grupos coerentes
Em `vite.config.ts`, substituir o `manualChunks` atual por agrupamentos por uso real:

- `react-vendor` → react, react-dom, react-router-dom, react-helmet-async
- `query` → @tanstack/react-query, @supabase/supabase-js
- `radix-core` → radix usados na home (tooltip, dialog, dropdown, toast, slot, label)
- `radix-extra` → demais radix (usados em admin/forms)
- `charts` → recharts (só admin/analytics)
- `editor` → react-quill-new + quill-image-resize-module-react + dompurify (só admin/blog)
- `motion` → framer-motion (poucos lugares)
- `carousel` → embla-carousel-react
- `confetti` → canvas-confetti
- `forms` → react-hook-form, @hookform/resolvers, zod
- `icons` → lucide-react
- demais `node_modules` → `vendor`

Resultado esperado: a home deixa de baixar ~300–500 KB de JS que não usa.

### 2. Lazy-load de provedores que só servem páginas internas
Em `src/App.tsx`, `CartProvider`, `CurrencyProvider` e `LocaleProvider` são montados sempre, mas só são realmente consumidos por páginas/checkout/admin. Manter os providers no topo (para não quebrar nada), mas:
- garantir que seus arquivos não importem bibliotecas pesadas no escopo top-level (auditar `src/contexts/*` e mover qualquer import pesado para dentro de funções/handlers).
- mover `useAnalytics` para dentro do `requestIdleCallback` que já existe no `index.html`, deixando `AnalyticsTracker` apenas como hook condicional após `ready`.

### 3. Limpeza de dependências desnecessárias
- Remover `express` do `dependencies` (SPA estática, não é usado em runtime — apenas inflar `bun.lock` / análises).
- Confirmar com `rg` se `canvas-confetti`, `framer-motion`, `react-resizable-panels`, `vaul`, `input-otp`, `react-day-picker`, `next-themes` ainda têm uso. Remover os sem nenhuma referência. (Apenas remoção de imports órfãos; nada que esteja em uso é tocado.)

### 4. Index.tsx: dividir Suspense da dobra
Hoje `ToursSection`, `WhyChooseUs`, `Reviews`, `Weather`, `About`, `Contact`, `Gallery`, `BlogCarousel`, `Footer` ficam todos sob **um único `<Suspense>`** — qualquer chunk lento atrasa todos. Trocar por um `<Suspense>` por bloco lazy (ou agrupar só os 2 primeiros above-the-fold). Isso permite que o navegador pinte cada seção assim que seu chunk chega.

### 5. CSS e fontes
- Confirmar que `scripts/inline-critical-css.js` está realmente sendo executado no deploy (`postbuild` atual não chama `inline:critical`; só o workflow do GitHub chama). Mover `inline:critical` para o `postbuild` para que rode também em previews/Lovable, eliminando o CSS render-blocking citado no relatório.
- Verificar duplicidade entre fontes auto-hospedadas (`/fonts/*.woff2`) e qualquer `@import` de Google Fonts em `src/index.css`. Se houver `@import`, removê-lo.

### 6. Service Worker
O `public/service-worker.js` apenas se desregistra e o `index.html` também desregistra qualquer SW. Manter o `index.html` e remover o arquivo `service-worker.js` (e a referência no `manifest.json` se houver) — simplifica e evita um request 200 desnecessário.

### 7. Pequenas simplificações de código (sem mudar comportamento)
- Em `src/hooks/useSiteData.ts`, o `useSiteData` combinado faz 5 hooks e re-memoiza um objeto enorme com 12 dependências. Manter a API pública, mas o `version` pode passar a ser só `imagesQuery.dataUpdatedAt` (settings raramente muda a UI visual) — reduz re-renders globais a cada refetch de settings.
- `OptimizedImage`: a função `getSrcSet` é recriada a cada render; mover para fora do componente (puro) — micro-otimização e leitura mais simples.

## Detalhes técnicos

Arquivos tocados:
- `vite.config.ts` — novo `manualChunks` mapeado por id.
- `package.json` — remover deps órfãs; mover `inline:critical` para `postbuild`.
- `src/App.tsx` — auditoria de imports top-level; analytics 100% deferido.
- `src/pages/Index.tsx` — múltiplos `<Suspense>` em vez de um só.
- `src/index.css` — remover `@import` de Google Fonts se existir.
- `src/hooks/useSiteData.ts` — simplificar `version` e dependências do `useMemo`.
- `src/components/OptimizedImage.tsx` — extrair helpers puros.
- `public/service-worker.js` — apagar.

Não tocados (fora de escopo): lógica de tours, checkout, admin, Supabase schema, RLS, edge functions, conteúdo, SEO tags.

## Ganhos esperados (relatório PageSpeed)
- **Render-blocking requests** resolvido pelo critical CSS inlined rodando em todo build.
- **JS na home** cai significativamente (split do vendor).
- **LCP/FCP** melhora porque o thread principal fica livre antes (menos parse/eval de libs não usadas).
- **Cache eficiente** já foi tratado anteriormente (uploads com `cacheControl: 31536000`); a recompressão do bucket continua disponível via `npm run recompress:bucket`.

Nenhuma rota, formulário, pagamento, e-mail ou comportamento muda — só a forma como o código é empacotado e entregue.