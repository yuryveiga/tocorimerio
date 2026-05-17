## 1. Status do Prerender

Rodei `npm run build` + `npm run prerender` no sandbox:

- **Build:** sucesso (saída `dist/` gerada, sitemap com 17 tours + 7 jogos + 53 posts, fallback SPA com 98 rotas).
- **Conversão WebP/WOFF2 do postbuild:** OK, todos os arquivos já existem.
- **Prerender:** iniciou normalmente, salvou diretórios `dist/match/*`, `dist/passeio/*`, `dist/blog/*` etc. Não encontrei erros — apenas estourou o limite de 10 min do sandbox por causa do volume (~100 rotas × Playwright). Em produção (GitHub Actions, sem timeout agressivo) **deve concluir sem falhas**.

Recomendação: nenhum fix necessário no prerender agora. Se quiser, adiciono no relatório final um aviso para monitorar a aba **Actions** do GitHub no próximo deploy e te avisar se alguma rota cair em `failed` ou `emptySelector`.

---

## 2. Acelerar carregamento de imagens (sem resize)

Hoje o site já converte os assets locais para WebP e usa `<picture>` com AVIF/WebP para Unsplash. O gargalo são as **imagens do Supabase Storage** (`site-images`), que hoje são servidas **as-is** (JPG/PNG original, sem cache longo controlado e sem formato moderno) — confirmado em `src/utils/imageOptimization.ts` (retorna a URL crua para `*.supabase.co`).

Vou aplicar 5 otimizações que **não fazem resize** e não mexem na espinha dorsal:

### 2.1 Preload do LCP da home
Adicionar no `index.html`:
```html
<link rel="preload" as="image" href="/maracana-hero.webp" fetchpriority="high" type="image/webp">
```
Ganho típico: LCP −300 a −800 ms.

### 2.2 Priority hints corretos no Hero
No `HeroSection.tsx` garantir `loading="eager"` + `fetchPriority="high"` + `decoding="sync"` apenas na imagem do hero, e `loading="lazy"` em todo o resto (já é o default, mas há componentes que não passam o prop).

### 2.3 Cache-Control agressivo + servir WebP do Supabase
No `OptimizedImage.tsx`, para URLs do bucket `site-images`, tentar primeiro a versão `.webp` co-localizada (quando existir) via `<source type="image/webp">` e cair para o original como fallback. Não faz resize, só troca de container.

Em paralelo, adicionar no `getOptimizedImage` um `?cache=max` (parâmetro inócuo) que serve como cache-buster apenas quando muda a `version`, deixando o navegador reaproveitar entre páginas.

### 2.4 `width` + `height` em todos os `<img>` para evitar CLS
Várias chamadas a `OptimizedImage` usam `fill` sem dimensões intrínsecas. Vou passar `width`/`height` (mesmo que apenas para o atributo HTML, sem redimensionar de fato) nos cards de tour, blog e match — reduz reflow e melhora INP/CLS, sinais que o Google usa para ranking.

### 2.5 `<link rel="preconnect">` para o CDN de imagens
Já existe preconnect para Supabase principal. Adicionar também para o bucket público (`ogzasprtfgimjqrtcseg.storage.supabase.co`) e para o domínio R2 do OG image — evita handshakes redundantes no primeiro paint.

### Bônus (opcional, sem código novo)
Posso estender `scripts/convert-images.js` para também processar imagens em `src/assets/**` que ainda não estão na lista `TARGETS`, garantindo que toda imagem bundled vire WebP no build (sem resize, qualidade 82 = visualmente sem perda).

---

## Arquivos que serão alterados

- `index.html` — preload do hero + preconnect extra
- `src/components/HeroSection.tsx` — fetchPriority correto
- `src/components/OptimizedImage.tsx` — fallback WebP para URLs Supabase
- `src/utils/imageOptimization.ts` — helper para detectar `.webp` co-localizado
- `src/components/TourItem.tsx`, `src/components/BlogCarousel.tsx`, cards de match — adicionar `width`/`height`
- `scripts/convert-images.js` — varrer `src/assets` automaticamente (opcional)

**Sem mudanças** em: rotas, banco, layout, design system, lógica de negócio, sistema de pagamentos.

Aprove o plano para eu implementar.