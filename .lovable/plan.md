# Taxonomia comercial dos passeios

## Auditoria (20 passeios ativos)

Hoje existem só 3 categorias: `CITY TOUR` (11), `TRILHA` (7), `UM DIA` (2).
`CITY TOUR` está agrupando coisas que não são city tour: veleiro, café, transfer, futebol.

| Passeio | Hoje | Correto |
|---|---|---|
| City Tour Rio Completo | CITY TOUR | CITY TOURS |
| City Tour Expresso | CITY TOUR | CITY TOURS |
| Nascer-do-Sol no Pão de Açúcar | CITY TOUR | CITY TOURS |
| Rio Historic Centre Walking Tour | CITY TOUR | CULTURE & HISTORY |
| Pequena África Experience | CITY TOUR | CULTURE & HISTORY |
| Favela Rio Tour: Rocinha | CITY TOUR | CULTURE & HISTORY |
| Degustação de Café Brasileiro | CITY TOUR | FOOD & COFFEE |
| Sailing Rio – Baía de Guanabara | CITY TOUR | SAILING & BOAT TOURS |
| Sailing Rio – Ilhas Cagarras | CITY TOUR | SAILING & BOAT TOURS |
| Maracanã MatchDay | CITY TOUR | FOOTBALL & MARACANÃ |
| Transfers (Aeroporto e Cidade) | CITY TOUR | TRANSFERS |
| Pedra da Gávea, Pedra Bonita, Costão do Pão de Açúcar, Pico da Tijuca, Cachoeiras do Horto, Praias Selvagens, Escalada em Rocha | TRILHA | HIKING & NATURE |
| Um dia em Niterói | UM DIA | DAY TRIPS |
| Scuba Diving em Arraial do Cabo | UM DIA | DAY TRIPS |

**PRIVATE TOURS não entra como categoria**: todos os passeios são privativos, então isso é
atributo (já mostrado como badge "Private & Exclusive") e continua sendo o hub
`/private-tours-rio-de-janeiro`. Criar uma categoria com 100% dos produtos só duplicaria o catálogo.

Nenhuma categoria vazia: as 8 categorias acima têm produto ativo.

## URLs (nada indexado muda)

Categoria vira um conceito com slug estável, independente do texto salvo no banco:

| Categoria | URLs |
|---|---|
| CITY TOURS | `/passeios/city-tour` + `/city-tour` (mantidas) |
| HIKING & NATURE | `/passeios/trilha` + `/hiking` (mantidas) |
| DAY TRIPS | `/passeios/um-dia` + `/one-day` (mantidas) |
| CULTURE & HISTORY | `/passeios/culture-history` (nova) |
| SAILING & BOAT TOURS | `/passeios/sailing-boat-tours` (nova) |
| FOOD & COFFEE | `/passeios/food-coffee` (nova) |
| FOOTBALL & MARACANÃ | `/passeios/football-maracana` (nova) |
| TRANSFERS | `/passeios/transfers` (nova) |

As três URLs antigas continuam respondendo 200 com o mesmo canonical; só o rótulo visível de
`trilha` passa a "Hiking & Nature" e o de `um-dia` a "Day Trips".

## Página de categoria = landing comercial

Padrão para as 8 páginas, curto e voltado a comparar → escolher → reservar:

- H1 (ex.: "Hiking Tours in Rio de Janeiro"), 2–3 frases de introdução (sem artigo longo)
- grade de produtos com imagem, nome, duração, dificuldade (quando existir), preço inicial,
  nota e **Check Availability**
- links para o hub `/passeio` e para as demais categorias
- title/description/canonical/hreflang, BreadcrumbList e ItemList já existentes

Os textos longos atuais de city-tour / trilha / um-dia são reduzidos ao formato acima.

## Técnico

- Novo `src/lib/tourCategories.ts`: lista canônica com `slug`, valores aceitos no banco (incluindo
  os antigos como alias), rótulos PT/EN/ES/ZH, intro curta e SEO por categoria.
- Migração de dados: reclassificar os 20 passeios ativos (e os inativos equivalentes) conforme a
  tabela acima, preenchendo `category`, `category_en`, `category_es`.
- `src/pages/PasseiosCategoria.tsx`: resolve a categoria pelo novo módulo (com alias), intro curta,
  cards com duração/dificuldade/preço/nota/CTA.
- `src/App.tsx`: rotas das novas categorias; `/city-tour`, `/hiking`, `/one-day` mantidas.
- `src/pages/PasseiosIndex.tsx`: bloco "Browse by category" com as 8 categorias.
- `src/components/ToursSection.tsx` e `site_settings`: abas da home passam a usar os novos valores.
- `src/components/TourItem.tsx`, `src/pages/PasseioDetalhe.tsx`: rótulo da categoria pelo módulo novo.
- Admin (`AdminTours.tsx`, `TourFormDialog.tsx`): seletor com as 8 categorias.
- `scripts/generate-sitemap.js` e `scripts/prerender.js`: incluir as novas URLs de categoria.
- Sem mexer em robots, canonicals existentes, GA4, checkout, homepage nem CTAs.
- Verificação: typecheck, build e checagem no navegador das 8 categorias (H1, produtos, CTA) e da home.
