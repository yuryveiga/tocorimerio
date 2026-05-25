## Objetivo

Reduzir o payload do site de ~58 MiB para ~10–15 MiB redimensionando as imagens do bucket `site-images` para no máximo 1920px de largura (mantendo aspect ratio), recodificadas em WebP q=72. Manter cópia das originais em `originals/` dentro do mesmo bucket antes de sobrescrever.

## Diagnóstico

- As imagens do bucket têm 1–2 MB cada porque estão em resolução cheia (3000–4000px).
- O componente `OptimizedImage` chama `getOptimizedImage`, mas para URLs do Supabase ele retorna a URL original sem transformação (Image Transformation API não está habilitada neste projeto — comentário explícito em `src/utils/imageOptimization.ts`).
- A recompactação anterior (q=65) só reduziu marginalmente porque o problema dominante é a **resolução**, não a qualidade.

## Plano de execução

### 1. Atualizar `scripts/recompress-bucket.js`

Transformar em script de **resize + backup**:

- Para cada arquivo na raiz do bucket (ignorar o que já estiver em `originals/`):
  1. Baixar o arquivo.
  2. Se ainda não existir cópia em `originals/<nome>`, fazer upload da versão original para lá (backup idempotente).
  3. Usar `sharp` com `.rotate().resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true }).webp({ quality: 72, effort: 6, smartSubsample: true })`.
  4. Reupload no caminho original com `Cache-Control: public, max-age=31536000, immutable` e `contentType: image/webp`.
  5. Pular se o arquivo já é ≤1920px e a recompressão não economiza ≥5% / ≥5 KiB.
- Manter log de progresso `[i/N]`, total economizado, falhas.
- Idempotente: rodar de novo não mexe em quem já foi processado.

### 2. Executar o script

```
SUPABASE_URL=$SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  node scripts/recompress-bucket.js
```

Roda em background (`nohup`) com log em `/tmp/resize.log`. ~742 arquivos, esperado 10–20 min.

### 3. Verificar

- Conferir 3–5 imagens grandes (as listadas no Lighthouse) via `curl -sI` para confirmar novo tamanho.
- Abrir o site em preview e checar que as imagens continuam exibindo normalmente (URLs não mudam — só o conteúdo).

## Notas técnicas

- **URLs continuam idênticas** — nada muda no frontend, nenhum cache do navegador precisa ser invalidado manualmente (mas o `Cache-Control: immutable` faz com que clientes que já baixaram a versão antiga continuem com ela; isso é aceitável porque a próxima visita pega a nova).
- **Backups em `originals/`**: ocupam o mesmo espaço das atuais (~+1 GB temporário). Posso adicionar um comando de limpeza depois que você validar visualmente.
- **Sem alteração no código do app** (`OptimizedImage`, rotas, etc.).
- 1920px é o maior `srcset` que `OptimizedImage` usaria (`SRCSET_WIDTHS = [400, 800, 1200, 1600]`), então não há perda visível mesmo em telas 4K.

## Ganho esperado

- Imagens de 1–2 MB → 150–400 KB cada.
- Payload total: 58 MiB → ~12–15 MiB.
- LCP mobile: melhora significativa (a hero atual de ~800 KB cai para ~150 KB).
