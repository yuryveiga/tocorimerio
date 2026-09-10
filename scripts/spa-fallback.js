// Cria <rota>/index.html em dist/ para todas as rotas SPA conhecidas,
// copiando o dist/index.html (shell React). Isso garante que hosts sem
// fallback automático (ou com cache de HTMLs antigos) sirvam o app
// React em vez de retornar 404 ou conteúdo legado.
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (fs.existsSync('.env')) {
  try {
    if (typeof process.loadEnvFile === 'function') process.loadEnvFile('.env');
  } catch (e) { /* noop */ }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');
const indexHtmlPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('[spa-fallback] dist/index.html não encontrado. Rode `vite build` antes.');
  process.exit(0);
}

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const slugify = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');


const SITE = 'https://tocorimerio.com';

const escAttr = (v) =>
  String(v || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Imagem OG 1200x630 (mesma lógica de src/utils/seo.ts getOgImage)
function ogImage(raw) {
  const u = String(raw || '').trim();
  if (!u) return `${SITE}/og-image.jpg`;
  if (u.startsWith('/')) return `${SITE}${u}`;
  if (!/^https?:\/\//i.test(u)) return `${SITE}/og-image.jpg`;
  if (u.includes('images.unsplash.com')) {
    return `${u.split('?')[0]}?w=1200&h=630&fit=crop&crop=entropy&q=80&fm=jpg`;
  }
  const sb = u.match(/^(https?:\/\/[^/]+)\/storage\/v1\/(?:object|render\/image)\/public\/(.+)$/);
  if (sb) {
    const [, origin, rest] = sb;
    return `${origin}/storage/v1/render/image/public/${rest.split('?')[0]}?width=1200&height=630&resize=cover&quality=80`;
  }
  return u;
}

// Reescreve as meta tags do shell para o conteúdo real do post.
// Crawlers sociais (Facebook, X, WhatsApp, LinkedIn) não executam JS,
// então sem isto eles só veriam o título genérico do site.
function withMeta(html, { title, description, url, image, imageAlt, type = 'article' }) {
  const t = escAttr(title);
  const d = escAttr(description);
  const img = escAttr(image);
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${t}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?>/i, `<meta name="description" content="${d}">`)
    .replace(/<meta\s+property="og:title"[\s\S]*?>/i, `<meta property="og:title" content="${t}">`)
    .replace(/<meta\s+name="twitter:title"[\s\S]*?>/i, `<meta name="twitter:title" content="${t}">`)
    .replace(/<meta\s+property="og:description"[\s\S]*?>/i, `<meta property="og:description" content="${d}">`)
    .replace(/<meta\s+name="twitter:description"[\s\S]*?>/i, `<meta name="twitter:description" content="${d}">`)
    .replace(/<meta\s+property="og:image"[\s\S]*?>/i, `<meta property="og:image" content="${img}">`)
    .replace(/<meta\s+name="twitter:image"[\s\S]*?>/i, `<meta name="twitter:image" content="${img}">`)
    .replace(/<meta\s+property="og:image:alt"[\s\S]*?>/i, `<meta property="og:image:alt" content="${escAttr(imageAlt || title)}">`)
    .replace(/<meta\s+property="og:image:width"[\s\S]*?>/i, `<meta property="og:image:width" content="1200">`)
    .replace(/<meta\s+property="og:image:height"[\s\S]*?>/i, `<meta property="og:image:height" content="630">`)
    .replace(/<meta\s+property="og:type"[\s\S]*?>/i, `<meta property="og:type" content="${type}">`);
  out = out.replace(
    /<\/head>/i,
    `  <meta property="og:url" content="${escAttr(url)}">\n  <link rel="canonical" href="${escAttr(url)}">\n  </head>`
  );
  return out;
}


// ── LCP: preload da imagem principal (hero) ──────────────────────────────────
// O HTML estático não tem conteúdo; sem isto o browser só descobre a imagem
// do passeio/post depois de baixar o JS e consultar o banco (~2s).
// Espelha exatamente o que <OptimizedImage> pede (mesmas larguras/qualidade/
// versão), para o preload casar com o srcset e não baixar duas vezes.
const SRCSET_WIDTHS = [320, 480, 800, 1200, 1600];
const IMG_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

function optimizedUrl(url, width, quality, version) {
  const sb = String(url || '').match(/^(https?:\/\/[^/]+)\/storage\/v1\/object\/public\/(.+)$/);
  if (!sb) return null; // só Supabase Storage (Unsplash troca de URL por formato)
  const [, origin, rest] = sb;
  const [pathPart] = rest.split('?');
  const params = new URLSearchParams();
  params.set('width', String(width));
  params.set('quality', String(quality));
  params.set('resize', 'cover');
  if (version) params.set('v', String(version));
  return `${origin}/storage/v1/render/image/public/${pathPart}?${params.toString()}`;
}

function heroPreload(html, imageUrl, version) {
  if (!optimizedUrl(imageUrl, 800, 60, version)) return html;
  const srcset = SRCSET_WIDTHS
    .map((w) => `${optimizedUrl(imageUrl, w, 60, version)} ${w}w`)
    .join(', ');
  const tag =
    `<link rel="preload" as="image" fetchpriority="high" ` +
    `imagesrcset="${escAttr(srcset)}" imagesizes="${IMG_SIZES}">`;
  return html.replace(/<head>/i, `<head>\n  ${tag}`);
}

function writeRoute(route, html) {
  if (!route || route === '/') return;
  const dir = path.join(distPath, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html || indexHtml);
}

async function run() {
  const postMeta = new Map();
  let imagesVersion = 0;
  const routes = new Set([
    '/blog',
    '/passeio',
    '/our-tours',
    '/things-to-do-in-rio-de-janeiro',
    '/maracana-calendario',
    '/flamengo-x-vasco-maracana',
    '/fluminense-bolivar-libertadores',
    '/brasil-x-panama-maio-maracana',
    '/fluminense-indenpediente-rivadavia-libertadores-maracana',
    '/flamengo-x-mirassol-maracana-tickets-02-09',
    '/Fluminense-x-patense-libertadores-maracana-tickets',
    '/Flamengo-x-Independiente-del-Valle-libertadores-maracana-tickets',
    '/flamengo-x-independiente-del-valle-libertadores-maracana-tickets',
    '/sobre',
    '/contato',
    '/carrinho',
    '/sucesso',
  ]);

  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      const supabase = createClient(url, key);
      const { data: siteImages } = await supabase.from('site_images').select('updated_at');
      imagesVersion = (siteImages || []).reduce((max, i) => {
        const t = Date.parse(i.updated_at || '');
        return Number.isFinite(t) && t > max ? t : max;
      }, 0);

      const [{ data: tours }, { data: posts }, { data: pages }] = await Promise.all([
        supabase.from('tours').select('id, slug, category, is_active, title, title_en, short_description_en, short_description, image_url, meta_title_en, meta_description_en'),
        supabase.from('blog_posts').select('slug, title, title_en, meta_title_en, meta_description, excerpt, excerpt_en, image_url, featured_image_alt').eq('is_published', true),
        supabase.from('pages').select('href').eq('is_visible', true),
      ]);
      (tours || []).filter(t => t.is_active !== false).forEach(t => {
        let s = slugify(t.slug || t.id);
        if (s.includes('niter-i') || s.includes('niteroi')) s = 'um-dia-em-niteroi';
        const route = `/passeio/${s}`;
        routes.add(route);
        const tourTitle = t.title_en || t.title || 'Tocorime Rio';
        postMeta.set(route, {
          title: (t.meta_title_en || '').trim() || `${tourTitle} | Private Tour Rio de Janeiro | Tocorime Rio`,
          description: (t.meta_description_en || '').trim() || t.short_description_en || t.short_description || tourTitle,
          url: `${SITE}${route}`,
          image: ogImage(t.image_url),
          heroImage: t.image_url,
          imageAlt: tourTitle,
          type: 'website',
        });
      });

      const cats = new Set();
      (tours || []).forEach(t => { const s = slugify(t.category); if (s) cats.add(s); });
      cats.forEach(c => routes.add(`/passeios/${c}`));
      (posts || []).forEach(p => {
        const route = `/blog/${slugify(p.slug)}`;
        routes.add(route);
        const title = p.title_en || p.title || 'Tocorime Rio';
        postMeta.set(route, {
          title: (p.meta_title_en || '').trim() || `${title} | Tocorime Rio`,
          description: (p.meta_description || '').trim() || p.excerpt_en || p.excerpt || title,
          url: `${SITE}${route}`,
          image: ogImage(p.image_url),
          heroImage: p.image_url,
          imageAlt: p.featured_image_alt || title,
          type: 'article',
        });
      });
      (pages || []).forEach(p => { if (p.href && p.href.startsWith('/')) routes.add(p.href); });
    } catch (e) {
      console.warn('[spa-fallback] não consegui buscar dados dinâmicos:', e.message);
    }

    // Maracanã matches (partner)
    try {
      const partner = createClient(
        'https://mwxbskzggzznxvkwgrnz.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eGJza3pnZ3p6bnh2a3dncm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjE5OTUsImV4cCI6MjA4ODkzNzk5NX0.EFfaaN79uifOMgFdIZlQ5C8c-HQH-YodNGWf0MEcf9o'
      );
      const { data: matches } = await partner.from('matches').select('id, slug, hidden, home_team, away_team');
      (matches || []).filter(m => !m.hidden).forEach(m => {
        const s = slugify(m.slug || `${m.home_team || ''}-vs-${m.away_team || ''}`) || m.id;
        routes.add(`/match/${s}`);
        routes.add(`/jogo/${s}`);
      });
    } catch (e) {
      console.warn('[spa-fallback] sem matches do parceiro:', e.message);
    }
  } else {
    console.warn('[spa-fallback] VITE_SUPABASE_* ausentes — gerando apenas rotas estáticas.');
  }

  let count = 0;
  // Meta estático para landing pages fixas (crawlers não executam JS)
  postMeta.set('/things-to-do-in-rio-de-janeiro', {
    title: 'Things to Do in Rio de Janeiro: 2026 Local Guide & Tours',
    description: 'What to do in Rio de Janeiro, chosen by local guides: Christ the Redeemer, Sugarloaf, hikes, favela and coffee tours. Book a private English-speaking guide.',
    url: `${SITE}/things-to-do-in-rio-de-janeiro`,
    image: ogImage(null),
    imageAlt: 'Rio de Janeiro seen from a viewpoint',
    type: 'website',
  });
  postMeta.set('/flamengo-x-mirassol-maracana-tickets-02-09', {
    title: 'Flamengo x Mirassol Tickets Maracanã (Sep 2, 2026) | Tocorime Rio',
    description: 'Buy Flamengo vs Mirassol tickets at Maracanã, Sep 2 2026: official ticket + hotel transfer + English-speaking guide. No CPF or biometrics needed. Instant confirmation.',
    url: `${SITE}/flamengo-x-mirassol-maracana-tickets-02-09`,
    image: 'https://lncimg.lance.com.br/cdn-cgi/image/width=1600,quality=80,fit=cover,format=webp/uploads/2016/10/19/5807e137e598d.jpeg',
    imageAlt: 'Maracanã Stadium packed for a Flamengo match',
    type: 'website',
  });

  const idvMeta = {
    title: 'Flamengo vs Independiente del Valle Tickets Maracanã (Sep 17, 2026)',
    description: 'Buy Flamengo vs Independiente del Valle tickets at Maracanã, Sep 17 2026: official ticket + hotel transfer + English-speaking guide. No CPF needed, instant confirmation.',
    url: `${SITE}/Flamengo-x-Independiente-del-Valle-libertadores-maracana-tickets`,
    image: 'https://lncimg.lance.com.br/cdn-cgi/image/width=1600,quality=80,fit=cover,format=webp/uploads/2016/10/19/5807e137e598d.jpeg',
    imageAlt: 'Maracanã Stadium packed for a Flamengo match',
    type: 'website',
  };
  postMeta.set('/Flamengo-x-Independiente-del-Valle-libertadores-maracana-tickets', idvMeta);
  postMeta.set('/flamengo-x-independiente-del-valle-libertadores-maracana-tickets', idvMeta);

  postMeta.set('/Fluminense-x-patense-libertadores-maracana-tickets', {
    title: 'Fluminense vs Platense Tickets Maracanã (Sep 8, 2026) | Tocorime Rio',
    description: 'Buy Fluminense vs Club Atlético Platense tickets at Maracanã, Sep 8 2026: official ticket + hotel transfer + English-speaking guide. No CPF needed, instant confirmation.',
    url: `${SITE}/Fluminense-x-patense-libertadores-maracana-tickets`,
    image: 'https://lncimg.lance.com.br/cdn-cgi/image/width=1600,quality=80,fit=cover,format=webp/uploads/2016/10/19/5807e137e598d.jpeg',
    imageAlt: 'Maracanã Stadium packed for a Fluminense match',
    type: 'website',
  });

  routes.forEach(r => {
    const meta = postMeta.get(r);
    let html = meta ? withMeta(indexHtml, meta) : undefined;
    if (html && meta.heroImage) html = heroPreload(html, meta.heroImage, imagesVersion);
    writeRoute(r, html);
    count++;
  });
  console.log(`[spa-fallback] ${count} rotas com index.html escritas em dist/`);
}

run();