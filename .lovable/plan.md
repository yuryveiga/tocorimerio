# Plano de Melhorias de SEO — Indexação no Google

## Diagnóstico Atual
O site já tem uma base sólida: sitemap dinâmico, schema markup em passeios, canonical URLs, PWA, e Google Analytics. O foco deste plano são ajustes pontuais e de baixo risco que aceleram a indexação e melhoram a aparência nos resultados de busca.

---

## Ações Propostas (não-radicais)

### 1. Adicionar Hreflang para todos os idiomas
**Impacto:** Alto para SEO internacional. O Google entende que o mesmo conteúdo existe em PT, EN e ES.
**Onde:** `<head>` de todas as páginas públicas (Index, PasseioDetalhe, BlogPost, Blog, GenericPage).
**Implementação:** Incluir tags `<link rel="alternate" hreflang="...">` apontando para as versões em cada idioma, mais a versão `x-default`.

### 2. Schema "Article" nos posts do blog
**Impacto:** Alto — habilita rich snippets (data de publicação, autor, imagem destacada) no Google.
**Onde:** Página `BlogPost.tsx`.
**Implementação:** Adicionar JSON-LD do tipo `Article` com `headline`, `image`, `datePublished`, `dateModified`, `author`, `publisher`.

### 3. Breadcrumb visual + schema em Blog e páginas de conteúdo
**Impacto:** Médio — melhora navegação e aparece nos SERPs como breadcrumbs.
**Onde:** `BlogPost.tsx`, `Blog.tsx`, `FluminenseBolivarLibertadores.tsx`.
**Implementação:** Adicionar componente visual de breadcrumbs no topo + JSON-LD `BreadcrumbList`.

### 4. Open Graph e Twitter Cards completos nas páginas internas
**Impacto:** Médio — melhora o compartilhamento social e sinais de engajamento.
**Onde:** `BlogPost.tsx`, `PasseioDetalhe.tsx`, `FluminenseBolivarLibertadores.tsx`.
**Implementação:** Garantir que todas tenham `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.

### 5. Schema "SportsEvent" na página Fluminense vs Bolívar
**Impacto:** Médio — pode aparecer no painel de eventos do Google.
**Onde:** `FluminenseBolivarLibertadores.tsx`.
**Implementação:** JSON-LD do tipo `SportsEvent` com nome, data/hora, local (Maracanã), oferta de ingressos (link para o site), e times participantes.

### 6. Corrigir/verificar URLs com caracteres especiais no sitemap
**Impacto:** Baixo a Médio — URLs codificadas incorretamente no sitemap XML dificultam o rastreamento.
**Onde:** `public/sitemap.xml` e/ou script gerador.
**Implementação:** Verificar slugs com hifens, acentos, ou caracteres especiais que possam estar quebrados no XML (ex: `experi-ncias`, `n-o-podeperder`).

### 7. Meta descriptions únicas e otimizadas em todas as rotas
**Impacto:** Médio — CTR nos resultados de busca.
**Onde:** Todas as páginas públicas (MaracanaCalendar, Blog, FlamengoVascoMaracana, etc.).
**Implementação:** Garantir que nenhuma página reutilize a mesma description da home. Usar `generateOptimizedMetaDescription` já existente.

### 8. Atributo `loading="lazy"` e `fetchpriority` em imagens abaixo da dobra
**Impacto:** Médio — Core Web Vitals (LCP).
**Onde:** Componentes `OptimizedImage` e imagens nas páginas de conteúdo.
**Implementação:** Aplicar `fetchpriority="high"` apenas na imagem hero; `loading="lazy"` nas demais.

---

## Técnico

### Arquivos a modificar
- `src/pages/BlogPost.tsx` — Article schema, OG tags, breadcrumbs
- `src/pages/PasseioDetalhe.tsx` — hreflang, OG tags audit
- `src/pages/FluminenseBolivarLibertadores.tsx` — SportsEvent schema, OG tags, canonical, breadcrumb
- `src/pages/Index.tsx` — hreflang
- `src/pages/Blog.tsx` — breadcrumb, hreflang, OG tags
- `src/utils/seo.ts` — helpers para hreflang e Article schema
- `scripts/generate-sitemap.js` — sanitização de slugs
- `public/robots.txt` — já está OK

### O que NÃO será alterado
- Estrutura de rotas ou URLs existentes
- Design visual (exceto breadcrumbs discretos)
- Backend ou banco de dados
- Conteúdo textual existente

---

## Resultado Esperado
- Melhor sinalização de idioma para o Google (hreflang)
- Rich snippets em posts do blog (Article schema)
- Maior chance de aparecer no painel de eventos Google (SportsEvent)
- Melhor aparência nos resultados de busca (OG images, descriptions únicas)
- CRAWL mais eficiente (sitemap limpo, breadcrumbs como sinal de estrutura)
