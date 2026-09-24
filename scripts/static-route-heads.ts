// Gera dist/<rota>/index.html com título, descrição, canonical e conteúdo
// inicial corretos, sem precisar de navegador. Assim ferramentas que não
// executam JavaScript (Ubersuggest, redes sociais) leem os dados certos.
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const SITE = "https://tocorimerio.com";

type RouteHead = {
  path: string;
  lang: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
};

const ROUTES: RouteHead[] = [
  {
    path: "/maracana-calendario",
    lang: "pt-BR",
    title: "Próximos Jogos no Maracanã: Programação e Ingressos 2026 | Tocorime",
    description:
      "Veja a programação do Maracanã e os próximos jogos confirmados, com datas, horários e preços. Consulte o próximo jogo no Maracanã e reserve online.",
    h1: "Próximos Jogos no Maracanã: Programação e Ingressos",
    intro:
      "Confira os próximos jogos no Maracanã, incluindo partidas do Flamengo e do Fluminense, com datas, horários e preços atualizados. Reserve seu ingresso oficial com transporte e guia bilíngue.",
  },
  {
    path: "/football-experiences-in-rio-de-janeiro",
    lang: "en",
    title: "Football Experiences in Rio de Janeiro | Tocorime Rio",
    description:
      "Plan a football experience in Rio de Janeiro: upcoming matches at Maracanã and other stadiums, official tickets, hotel transport and a bilingual local guide.",
    h1: "Football Experiences in Rio de Janeiro",
    intro:
      "Plan your matchday in Rio with upcoming games, official tickets, hotel transport and a bilingual local guide.",
  },
];

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function buildHtml(base: string, r: RouteHead) {
  const url = `${SITE}${r.path}`;
  const t = esc(r.title);
  const d = esc(r.description);
  let html = base
    .replace(/<html([^>]*)lang="[^"]*"/, `<html$1lang="${r.lang}"`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${d}">`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${t}">`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${t}">`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${d}">`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${d}">`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}">`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}">`);
  if (!/rel="canonical"/.test(html)) {
    html = html.replace("</head>", `<link rel="canonical" href="${url}">\n</head>`);
  }
  // Conteúdo inicial; o React substitui ao carregar.
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"><main><h1>${esc(r.h1)}</h1><p>${esc(r.intro)}</p></main></div>`,
  );
  return html;
}

export function staticRouteHeads(): Plugin {
  let outDir = "dist";
  return {
    name: "static-route-heads",
    apply: "build",
    configResolved(c) {
      outDir = path.resolve(c.root, c.build.outDir);
    },
    closeBundle() {
      const indexPath = path.join(outDir, "index.html");
      if (!fs.existsSync(indexPath)) return;
      const base = fs.readFileSync(indexPath, "utf8");
      for (const r of ROUTES) {
        const dir = path.join(outDir, r.path.replace(/^\//, ""));
        fs.mkdirSync(dir, { recursive: true });
        const html = buildHtml(base, r);
        fs.writeFileSync(path.join(dir, "index.html"), html);
        fs.writeFileSync(path.join(outDir, `${r.path.replace(/^\//, "")}.html`), html);
      }
    },
  };
}
