# Página /vendas (escolha rápida de passeio no celular)

## Minha opinião sobre o pedido
A ideia é boa: um link curto para mandar pelo WhatsApp, com 3 escolhas grandes. Mas sugiro alguns ajustes para ficar melhor e mais rápido:

1. **Sem janela embutida (iframe).** As páginas /city-tour, /hiking e /one-day já existem no próprio site. Abrir o site dentro dele mesmo deixa tudo mais lento, mostra menu e rodapé duplicados e atrapalha o pagamento no celular. Em vez disso, cada categoria em /vendas mostra direto a lista de passeios (os mesmos cards, preços e botão de reserva), sem menu do site. O plano de reserva extra de 6 segundos deixa de ser necessário.
2. **Usar a identidade atual.** O pedido usa verde #2A9D8F e fonte Inter; o site usa o verde tropical com Playfair Display e Poppins. Recomendo manter a marca atual para não parecer outro negócio.
3. **Fotos reais, não Unsplash.** Usar as fotos da galeria do site; ficam configuráveis num único arquivo.
4. **Idiomas.** Usar o seletor que o site já tem (PT/EN/ES/DE/FR/IT), salvo no navegador.
5. **Aviso de cookies.** O pedido diz "sem banner de cookies", mas ele é obrigatório para Europa/Reino Unido por causa das campanhas. Ele continua aparecendo apenas uma vez, como hoje.
6. **Fora do Google.** /vendas fica sem indexação, para não competir com /city-tour, /hiking e /one-day nas buscas.

## O que será construído
- /vendas: título "Escolha seu passeio", subtítulo, 3 cards grandes com foto (City Tour, Trilha, Um Dia), botão fixo "Falar no WhatsApp" e link "Ver site completo".
- /vendas/city-tour, /vendas/trilha, /vendas/um-dia: barra com "Voltar" e nome da categoria, link discreto "Abrir no site" e a lista de passeios da categoria com reserva normal.
- Coluna de no máximo 480px no computador; botões de no mínimo 48px; imagens com carregamento leve.
- Título da aba "Passeios no Rio de Janeiro | Tocorime Rio".

## Detalhes técnicos
- Novo `src/pages/vendas/config.ts` com nome, descrição, foto, categoria e WhatsApp.
- Rotas novas em `App.tsx`; reutiliza o componente de lista de `PasseiosCategoria` em modo compacto (sem Header/Footer).
- `noindex` em /vendas e fora do sitemap.
- Sem tabelas novas, sem mudança em checkout.
