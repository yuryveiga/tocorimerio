# Otimizações PageSpeed (cache + imagens + CSS bloqueante)

Site hospedado no GitHub Pages com domínio custom `tocorimerio.com`. Algumas limitações de cache vêm do GH Pages (não permite headers custom), então as ações abaixo focam no que dá para controlar de fato.

## 1. Ciclos de vida de cache (~44 KiB)

O PageSpeed reclama porque o GH Pages serve quase tudo com `Cache-Control: max-age=600` (10 min). Não dá para mudar headers no GH Pages, mas podemos:

- **Reduzir o que precisa ser revalidado** trocando `manifest.json`, `favicon.png`, `cadastur-logo.png`, `robots.txt` e outros estáticos para nomes versionados ou referenciá-los com `?v=hash` controlado pelo Vite.
- **Servir imagens do Storage (Supabase) com `Cache-Control: public, max-age=31536000, immutable`** no upload. Hoje o bucket `site-images` usa o default (3600s). Atualizar:
  - Os uploads novos no admin (`src/pages/AdminImages.tsx`, `AdminHero.tsx`, `AdminGallery.tsx`, `tours/TourGalleryTab.tsx`, `AdminBlog.tsx`) passam `cacheControl: '31536000'` ao chamar `supabase.storage.from(...).upload(...)`.
  - Rodar um script único (`scripts/refresh-cache-headers.ts`) que faz `update` em todos os arquivos atuais do bucket aplicando `cacheControl: '31536000'`.
- **Aumentar o cache do sitemap edge function** (já é dinâmico) adicionando `Cache-Control: public, max-age=3600` na resposta.

> Observação: para ir além disso seria preciso migrar de GH Pages para Cloudflare Pages/Netlify (suportam `_headers`). Posso preparar isso depois se quiser.

## 2. Entrega de imagens (~4 MiB)

Imagens do bucket são servidas no tamanho/qualidade original (sem Image Transformation API). Vamos reduzir o peso bruto sem mexer em resize visual:

- **Recompressão em massa** do bucket `site-images`: um script Node (`scripts/recompress-bucket.ts`) baixa cada imagem, recomprime com `sharp` em WebP qualidade 78 (perto de visualmente lossless, ~40–55% menor), e faz upload de volta com o mesmo path + `cacheControl: '31536000'`. Não altera dimensões, então os layouts continuam idênticos.
- **Hero LCP**: a `maracana-hero.webp` local (public/) e a versão do Storage também passam pelo mesmo passo.
- Garantir que o `<link rel="preload">` da hero use exatamente a URL renderizada (já está alinhado).
- Adicionar `width`/`height` intrínsecos no `<img>` da hero (evita CLS, melhora INP).

## 3. CSS bloqueante (`index-*.css` 19 KiB + `vendor-*.css` 4 KiB)

São os 2 CSS gerados pelo Vite que travam o first paint. Plano:

- **Inline do CSS crítico**: adicionar o plugin `vite-plugin-critical` (ou `beasties`) no `vite.config.ts` para extrair o CSS above-the-fold de cada rota e injetar inline em `<style>` no HTML pré-renderizado. O CSS completo continua carregando de forma assíncrona (`rel="preload" as="style" onload="this.rel='stylesheet'"`).
- Como o site já roda `npm run prerender` (Playwright) no deploy, o inline pode acontecer como pós-processamento: script `scripts/inline-critical-css.js` que, depois do prerender, percorre cada `dist/**/*.html`, extrai o CSS usado por aquele HTML (via `beasties` ou `critters`) e re-escreve o arquivo.
- Adicionar passo `node scripts/inline-critical-css.js` no `.github/workflows/deploy.yml` logo depois do prerender.

## Arquivos a tocar

- `src/pages/AdminImages.tsx`, `AdminHero.tsx`, `AdminGallery.tsx`, `tours/TourGalleryTab.tsx`, `AdminBlog.tsx` — passar `cacheControl` no upload.
- `supabase/functions/sitemap/index.ts` — header de cache.
- Novos: `scripts/recompress-bucket.ts`, `scripts/refresh-cache-headers.ts`, `scripts/inline-critical-css.js`.
- `vite.config.ts` — plugin de critical CSS (se optarmos pela versão integrada) **ou** só usar `beasties` no pós-build.
- `.github/workflows/deploy.yml` — passo extra para inline de CSS crítico.
- `src/components/HeroSection.tsx` — `width`/`height` no `<img>` da hero.

## Ganhos esperados

- Cache: economia ~44 KiB em visitas repetidas + imagens do Storage com 1 ano de cache.
- Imagens: redução ~30–50% no peso total (~2 MiB a menos no primeiro load).
- CSS bloqueante: −150 a −350 ms no FCP/LCP no mobile 4G.

## Fora de escopo

- Migração de hosting (GH Pages → Cloudflare/Netlify) para poder definir headers HTTP. Posso planejar separadamente se quiser ir mais fundo no cache.
- Mudanças de layout, design ou regras de negócio.
