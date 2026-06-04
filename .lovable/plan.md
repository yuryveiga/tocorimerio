
# Elevação "Awwwards-tier" — alterações cirúrgicas

Objetivo: deixar o site digno de prêmio (Awwwards / CSS Design Awards / SiteInspire) **sem mexer no layout**. Apenas micro-animações, transições e detalhes de polimento que a concorrência (operadoras de turismo no Rio) não tem.

## Princípios

- Layout intocado. Só adicionar camadas de movimento, textura e refinamento.
- Performance first: tudo `transform`/`opacity`, `will-change` controlado, `prefers-reduced-motion` respeitado.
- Identidade visual mantida: verde imperial + laranja sunset, Playfair + Poppins.

---

## 1. Hero — primeira impressão "wow"

- **Ken Burns sutil** nas imagens do slideshow (zoom 1.0 → 1.08 em 6s sincronizado com o fade já existente).
- **Parallax leve** no conteúdo do hero ao rolar (translateY/opacity baseado em scroll, máx. 40px).
- **Reveal escalonado** do título: cada palavra do `<h1>` entra com blur→0 + translateY (stagger 60ms). Usar split por palavras, não letras (mantém SEO e performance).
- **Cursor magnético** no CTA principal "Tour Personalizado" (deslocamento de 4–6px em direção ao cursor, só desktop).
- **Brilho sutil** atravessando o botão accent a cada ~6s (shimmer já existe no CSS Copa, reutilizar com cor accent).

## 2. Cards de passeios — interação premium

- **Tilt 3D leve** no hover (rotateX/Y máx. 4°, perspective 1000px). Só pointer:fine.
- **Imagem com zoom + parallax interno**: imagem escala 1.06 e desliza 2% na direção oposta ao mouse.
- **Overlay gradiente animado** revelando preço/CTA de baixo para cima no hover.
- **Borda accent** que "desenha" ao redor do card no hover (clip-path animado ou border-beam do MagicUI).

## 3. Scroll storytelling

- **Reveal on scroll refinado**: substituir o `ViewFadeIn` atual (já existe) por variante com blur 8px→0 + translateY 24px→0, easing `cubic-bezier(.2,.8,.2,1)`, stagger automático entre filhos.
- **Section anchors com "smooth + offset + highlight"**: ao chegar numa seção, um traço accent breve aparece sob o título (300ms).
- **Marquee sutil** de selos de confiança (TripAdvisor 5.0, Cadastur, anos de operação) — uma faixa fininha entre hero e tours.

## 4. Tipografia viva

- **Text-balance** já está; adicionar **kerning animado** nos h1/h2 quando entram em viewport (letter-spacing -0.04em → -0.02em em 600ms). Cria sensação de "respiração".
- **Underline desenhada à mão** nos links de navegação (já existe `.story-link`, aplicar consistentemente no header e footer).

## 5. Quote de categoria (city-tour, hiking, one-day)

- Substituir o blockquote estático por:
  - Aspa decorativa enorme (Playfair, opacity 0.08) no canto.
  - Texto entra com **typewriter sutil de primeira frase** (60ms/palavra, só uma vez por sessão).
  - Botão "Ler mais" com chevron que **ricocheia** suavemente.

## 6. Footer & detalhes finais

- **Logo no header** com **micro-pulse** quando volta ao topo.
- **WhatsApp flutuante**: já existe; adicionar **ping ring** (anel verde expandindo) a cada 8s para sinalizar disponibilidade.
- **Cursor custom** discreto (ponto + ring) em desktop — opcional, ativável por flag.
- **Page transitions** entre rotas: fade + slide 12px (300ms) usando wrapper no `<Outlet/>`.

## 7. Detalhes "premiáveis"

- **Noise overlay** (8% opacity) global — dá textura cinematográfica.
- **Cor de seleção customizada** (`::selection` com accent).
- **Scrollbar fina** verde imperial.
- **Favicon animado** quando aba está inativa ("Volte! 🌴" no title).

---

## Como vamos executar

Sugestão de pacote inicial **mínimo viável** (3 mudanças, ~baixo risco):

1. Hero: Ken Burns + reveal escalonado do título + shimmer no CTA.
2. Cards: tilt 3D + zoom de imagem + border-beam no hover.
3. Global: ViewFadeIn com blur + noise overlay + ::selection + scrollbar.

Se gostar, depois aplicamos o pacote 2 (parallax, marquee de selos, typewriter da quote) e o pacote 3 (page transitions, cursor magnético, ping no WhatsApp).

## Pergunta antes de implementar

Qual pacote você quer começar?
- **A)** Só o pacote 1 (hero + cards + globais) — mais seguro.
- **B)** Pacotes 1 + 2 — equilíbrio.
- **C)** Tudo (1 + 2 + 3) — máximo impacto.
- **D)** Escolher itens específicos da lista (me diga os números).
