## Problema

As imagens dos passeios (e outras imagens do bucket Supabase) somem depois de algum tempo no site — ficam invisíveis, mostrando apenas o fundo cinza do card.

## Causa raiz

Encontrei um bug no fluxo entre `useSiteData` e `OptimizedImage`:

1. `useSiteData` expõe `version = imagesQuery.dataUpdatedAt`. Esse valor **muda toda vez** que o react-query revalida (a cada 5 min via `staleTime`, ou quando a janela ganha foco / reconecta).
2. `OptimizedImage` tem um `useEffect` que, quando `version` muda, executa `setIsLoaded(false)` — assumindo que o `<img src>` também vai mudar e disparar `onLoad` de novo.
3. Mas para URLs do Supabase, `getOptimizedImage` retorna a URL **inalterada** (sem `?v=`, já que a API de transformação não está ativa). Resultado: o `src` do `<img>` é exatamente o mesmo de antes → o browser não dispara `onLoad` de novo → `isLoaded` fica `false` para sempre → `opacity-0 invisible` → **imagem some**.

Isto bate exatamente com o sintoma "depois de certo tempo, as imagens somem" (5 min de staleTime ou a primeira vez que o usuário troca de aba e volta).

## Correção

Quebrar a dependência espúria entre `version` e `isLoaded` em `src/components/OptimizedImage.tsx`:

1. **Inicializar `isLoaded` como `true` quando a imagem não é optimizable** (Supabase / local), porque nesse caso o `src` nunca muda em função do `version` — só precisamos do efeito de fade-in na primeira vez.
2. **Não resetar `isLoaded` quando apenas `version` muda.** O reset deve acontecer apenas quando o `src` real (URL final usada no `<img>`) muda. Vou comparar a URL final entre renders e só resetar nesse caso.
3. **Fallback de segurança**: usar `onError` para também marcar como "loaded" (evita ficar invisível se a imagem falhar) e usar `img.complete` no primeiro mount para cobrir imagens já em cache (algumas vezes o `onLoad` não dispara para imagens vindo do disk cache).

## Arquivo a alterar

- `src/components/OptimizedImage.tsx` — ajustar lógica do `useEffect` / estado inicial / handlers.

## Fora do escopo

- Não vou mexer em `useSiteData` nem em `getOptimizedImage` — a correção fica isolada no componente que renderiza a imagem.
- Sem mudanças visuais, de design ou de comportamento de cache.
