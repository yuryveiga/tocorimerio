## Contexto

Em `src/pages/MatchDetail.tsx` (linha ~420) existe o bloco **"Sobre a Experiência / About the Experience"** que renderiza:

```
match.description_pt/en/es  ||  t('matchday_fallback')
```

Checagem no banco: **todos os 17 jogos ativos têm `description_pt` e `description_en` vazios**. Ou seja, **100% das páginas hoje mostram o mesmo fallback genérico de ~50 palavras** — perda enorme de SEO (conteúdo duplicado entre páginas + texto curto demais).

## Objetivo

Substituir o fallback por um texto **dinâmico de 300–500 palavras por idioma (PT/EN/ES)** que:

- **Personaliza por jogo** (injeta `home_team`, `away_team`, data, estádio, competição) — assim cada página tem texto único, evitando duplicate content.
- Mira palavras-chave reais validadas no Semrush: **maracana tour** (3.600/mês), **maracana tickets**, **flamengo tickets**, **rio de janeiro tours** (140/mês), **private tour rio de janeiro**.
- Estrutura semântica: parágrafo intro + 2–3 `<h3>` (What's included / Why book with us / The Maracanã experience) — Google adora subtítulos.
- Inclui sinais de confiança: CADASTUR, guia bilíngue, transfer executivo, desde 2011.
- CTA natural no final (link interno para `#packages` da própria página).

## Arquivos

**Criar** `src/lib/matchExperienceText.ts` — função pura:

```ts
buildMatchExperienceText({
  homeTeam, awayTeam, matchDate, stadium, competition?, language
}): { intro: string; sections: { heading: string; body: string }[] }
```

Internamente: templates por idioma com placeholders (`{home}`, `{away}`, `{date}`, `{rival_context}` etc.). Total entre 350–450 palavras renderizadas.

**Editar** `src/pages/MatchDetail.tsx` (apenas o bloco "Sobre a Experiência", ~linhas 418–428):

- Se `match.description_xx` existir no banco → usa o do banco (admin pode sobrescrever quando quiser).
- Senão → chama `buildMatchExperienceText(...)` e renderiza intro + h3/parágrafos com classes Tailwind existentes (`prose`/`text-muted-foreground`).

**Editar** `src/translations/index.ts` — remover ou encurtar `matchday_fallback` (não será mais usado como conteúdo principal, vira apenas safety net curto).

## Boost extra de SEO (mesmo escopo, baixo custo)

- Atualizar a `meta description` da página (linha 370) para incluir nome dos times + "Maracanã tickets + transfer + bilingual guide" — hoje é genérica e em PT só.
- Atualizar o `SportsEvent` JSON-LD (`generateSportsEventSchema`) para usar o novo `description` longo (Google usa pra entender contexto do evento).

## Não mexer

- Layout/design do bloco (mesmo container, mesma tipografia).
- Estrutura do banco (descrições manuais continuam funcionando como override).
- Outras páginas estáticas (`BrasilPanamaMaracana`, `FlamengoVascoMaracana`, `FluminenseBolivarLibertadores`) — têm texto próprio e ficam de fora.

## Resultado esperado

17 páginas de jogo passam a ter **350–450 palavras únicas e otimizadas** cada (em 3 idiomas), com keywords de alto volume e estrutura semântica — sem precisar escrever texto manual por jogo nem mudar a espinha dorsal do site.