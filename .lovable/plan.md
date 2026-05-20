## 1) Centralizar seções em `/brasil-x-panama-maio-maracana`

**Causa raiz:** o markup usa `<div className="container">` dentro de cada `<section>`, mas a classe `.container` **não existe** no CSS scoped da página. Sem `max-width` + `margin: 0 auto`, o conteúdo encosta nas bordas (a 24 px do padding da `.section`) e o "centramento visual" depende só dos grids internos, o que dá a sensação de desalinhamento nas seções **Official Tickets, What's Included, Simple Process e Real Reviews**.

**Correção (1 regra CSS):** adicionar ao bloco `<style>` da página:

```css
.brasil-panama-page .container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
```

Isso centraliza os 4 blocos sem alterar nenhum outro layout (hero, ticker, nav, info-strip e final-cta não usam `.container`).

---

## 2) Item 1 — Recompactar imagens do bucket `site-images`

O script `scripts/recompress-bucket.js` já existe e faz:
- baixa cada arquivo do bucket
- recodifica em WebP q=78 com `sharp`
- só reenviar se economizar ≥ 5 KB e ≥ 5%
- adiciona `Cache-Control: public, max-age=31536000, immutable`

**Bloqueio:** o script exige `SUPABASE_SERVICE_ROLE_KEY` e esse secret **não está configurado** no projeto (só temos `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`). A anon key não tem permissão para sobrescrever objetos do bucket.

**O que precisa ser feito:**
1. Você adiciona o `SUPABASE_SERVICE_ROLE_KEY` via Connectors → Lovable Cloud (Settings → API → `service_role` key — **nunca** colocar no código do frontend).
2. Eu rodo o script uma vez no sandbox:
   ```bash
   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/recompress-bucket.js
   ```
3. Mostro o relatório (quantos arquivos, MB economizados, %).

Ganho esperado segundo a análise anterior: **LCP mobile cai de ~13,5 s para ~5–7 s** (a imagem do hero hoje tem 794 KB; deve cair para ~150 KB).

---

## 3) Item 2 — Lazy-load do widget Elfsight (TripAdvisor)

**Status:** já está implementado em `src/components/ReviewsSection.tsx` — o `<script src="elfsightcdn.com/platform.js">` só é injetado quando a seção entra no viewport (margem de 400 px), via `IntersectionObserver`.

**Verificação no plano:** abrir o site em produção, confirmar via DevTools → Network que `platform.js` (~633 KB) **não baixa no load inicial** e só é requisitado ao rolar até a seção de reviews. Se ainda baixar no load, investigar se outro componente injeta o script.

**Extra (opcional, mesma família):** adiar o GTM (303 KB) para o primeiro `scroll`/`click` — reduz mais ~100 ms de TBT. Posso incluir se aprovado.

---

## Detalhes técnicos

- Arquivo único alterado para o item de centralização: `src/pages/BrasilPanamaMaracana.tsx` (apenas adição de uma regra CSS dentro do `<style>` existente).
- Nenhuma alteração em `vite.config.ts`, lazy loading, rotas ou lógica de negócio.
- Recompactação do bucket é idempotente — pode rodar várias vezes sem risco.

## Pergunta

Você consegue adicionar o `SUPABASE_SERVICE_ROLE_KEY` agora (Lovable Cloud → API → service_role)? Sem ele eu consigo entregar a correção de centralização e a verificação do Elfsight, mas a recompactação real do bucket fica pendente.