# Arquitetura SEO comercial — hubs, categorias e produtos

Nada de novo é criado. Nenhuma URL indexada muda. `/rio-de-janeiro-tours` **não** será criada.

## 1. Intenção definida para cada URL

| URL | Intenção | Papel |
|---|---|---|
| `/` | marca + "private tours Rio" | Topo |
| **`/passeio`** | **rio de janeiro tours, rio tours, guided tours rio de janeiro, rio de janeiro experiences, best rio tours** | **Hub principal do catálogo** |
| `/our-tours` | mesma intenção, versão EN da URL | Alias — já aponta canonical para `/passeio` (mantém como está) |
| `/passeios` | URL antiga | Redirect para `/passeio` (mantém) |
| `/experiences` | hoje disputa a MESMA intenção do hub | Passa a ser página de marca/apresentação, sem competir (ver item 2) |
| `/private-tours-rio-de-janeiro` | private tour rio de janeiro, private guided tour | Hub comercial (serviço privativo) |
| `/custom-private-tour-rio-de-janeiro` | custom / tailor-made tour | Hub comercial (roteiro sob medida) |
| `/your-private-guide-in-rio` | private guide, guia por hora | Hub comercial (guia) |
| `/things-to-do-in-rio-de-janeiro` | o que fazer no Rio (informacional) | Página de apoio → empurra para hubs/produtos |
| `/maracana-calendario` | calendário de jogos Maracanã | Hub comercial (futebol) |
| `/passeios/city-tour`, `/passeios/trilha`, `/city-tour`, `/hiking`, `/one-day` | intenção por categoria | Páginas de categoria |
| `/passeio/:slug` | nome do passeio | Produto |
| `/blog/*` | dúvidas e pesquisa | Apoio, nunca o centro |

## 2. Resolver a canibalização (único conflito real)

`/experiences` e `/passeio` competem hoje pelos mesmos termos em inglês
("Rio de Janeiro Experiences | Private Tours, Hiking & Day Trips").

- `/passeio` assume os termos de catálogo em EN/PT/ES.
- `/experiences` mantém a página e o conteúdo, mas troca title/description/H1 para intenção
  de marca ("Why travel with Tocorime Rio — private experiences with local guides"),
  sem os termos de catálogo, e passa a linkar `/passeio` como próximo passo.
- Nenhuma URL é removida nem redirecionada.

## 3. Fortalecer `/passeio` como hub principal

- Title/description em EN/PT/ES focados na intenção: "Rio de Janeiro Tours — Guided &
  Private Tours with Local Guides"; PT e ES equivalentes.
- Texto de introdução curto acima dos filtros (2–3 frases, sem keyword stuffing).
- Bloco "Browse by category" com links para as categorias existentes
  (`/passeios/city-tour`, `/passeios/trilha`, `/one-day`, e as demais categorias reais dos passeios).
- Bloco "Looking for something specific?" com links para os hubs comerciais
  (private tours, custom tour, private guide, Maracanã).
- FAQ curta e verdadeira + `FAQPage`; `BreadcrumbList` (Home → Tours).
- Mantidos: ItemList, hreflang, canonical, cards, CTAs.

## 4. Amarrar a hierarquia com links internos

- Homepage → `/passeio` (hub) e hubs comerciais.
- Hub → categorias → produtos (já existe nos cards).
- Categoria → volta ao hub no breadcrumb (já existe) + link para os hubs comerciais relacionados.
- Produto → breadcrumb Home → Tours → Categoria → Passeio (já existe) e Related Guides (já existe).
- Blog → tour/hub pelo mapeamento já implementado; nenhuma mudança de conteúdo dos artigos.
- `/things-to-do-in-rio-de-janeiro` ganha CTA claro para `/passeio` no fim.

## 5. Detalhes técnicos

- Arquivos: `src/pages/PasseiosIndex.tsx`, `src/pages/Experiences.tsx`,
  `src/pages/PasseiosCategoria.tsx`, `src/pages/ThingsToDoInRio.tsx`,
  `src/translations/index.ts` (novas chaves para o hub e para `/experiences`), `src/pages/Index.tsx` (links do hub).
- Sem alterações em robots.txt, sitemap técnico, canonicals existentes, noindex, GA4,
  checkout, homepage-conversão ou schemas já validados — apenas os blocos novos citados acima.
- Verificação: typecheck, build e checagem no navegador de title/canonical/H1/links
  em `/passeio`, `/our-tours`, `/experiences` e uma categoria.
