# Otimização SEO das 20 URLs existentes

## Objetivo
Associar cada termo fornecido à página canônica já existente, sem criar páginas, trocar URLs, remover conteúdo, mudar o visual ou tocar nas jornadas de reserva.

## Implementação
- Confirmar o endereço canônico real de cada item, incluindo os prefixos existentes `/blog`, `/passeio` e `/match`.
- Ajustar título SEO, descrição, H1/título editorial e trechos introdutórios apenas quando o termo ainda não estiver semanticamente bem coberto.
- Preservar o idioma de cada versão: termos em português entram na versão portuguesa; `rio coffee`, `horto waterfalls`, `little africa rio de janeiro` e `indoor activities` entram somente nas versões inglesas correspondentes.
- Manter as duas páginas de café separadas por intenção: uma para `rio coffee` em inglês e outra para cafeterias no Centro em português.
- Otimizar páginas de passeios e artigos nos campos multilíngues já usados pelo site; otimizar calendário e páginas de partidas nos componentes existentes.
- Não adicionar `meta keywords`, não alterar canonicals/hreflang, slugs, design, CTAs, formulários, WhatsApp, booking ou checkout.

## Tratamento de casos especiais
- `/o-que-fazer-no-rj-com-chuva` já é um alias que redireciona para o artigo canônico existente. A intenção `indoor activities` será fortalecida na versão inglesa desse artigo, sem criar uma página concorrente.
- A Pequena África será vinculada ao passeio existente encontrado no banco, usando seu canonical atual.
- Os slugs parciais de ingressos do Maracanã e preço de city tour serão resolvidos para os slugs completos já publicados.

## Validação
- Conferir título, descrição, H1 e presença natural do termo em cada página-alvo.
- Confirmar que os canonicals e URLs permanecem iguais.
- Gerar sitemap/prerender e validar o projeto sem alterar layout ou funcionalidades.
