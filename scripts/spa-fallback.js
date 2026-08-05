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

function writeRoute(route, html) {
  if (!route || route === '/') return;
  const dir = path.join(distPath, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html || indexHtml);
}

async function run() {
  const postMeta = new Map();
  const routes = new Set([
    '/blog',
    '/passeio',
    '/our-tours',
    '/maracana-calendario',
    '/flamengo-x-vasco-maracana',
    '/fluminense-bolivar-libertadores',
    '/brasil-x-panama-maio-maracana',
    '/fluminense-indenpediente-rivadavia-libertadores-maracana',
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
      const [{ data: tours }, { data: posts }, { data: pages }] = await Promise.all([
        supabase.from('tours').select('id, slug, category, is_active'),
        supabase.from('blog_posts').select('slug, title, title_en, excerpt, excerpt_en, image_url, featured_image_alt').eq('is_published', true),
        supabase.from('pages').select('href').eq('is_visible', true),
      ]);
      (tours || []).filter(t => t.is_active !== false).forEach(t => {
        let s = slugify(t.slug || t.id);
        if (s.includes('niter-i') || s.includes('niteroi')) s = 'um-dia-em-niteroi';
        routes.add(`/passeio/${s}`);
      });
      const cats = new Set();
      (tours || []).forEach(t => { const s = slugify(t.category); if (s) cats.add(s); });
      cats.forEach(c => routes.add(`/passeios/${c}`));
      (posts || []).forEach(p => {
        const route = `/blog/${slugify(p.slug)}`;
        routes.add(route);
        const title = p.title_en || p.title || 'Tocorime Rio';
        postMeta.set(route, {
          title: `${title} | Tocorime Rio`,
          description: p.excerpt_en || p.excerpt || title,
          url: `${SITE}${route}`,
          image: ogImage(p.image_url),
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
  routes.forEach(r => {
    const meta = postMeta.get(r);
    writeRoute(r, meta ? withMeta(indexHtml, meta) : undefined);
    count++;
  });
  console.log(`[spa-fallback] ${count} rotas com index.html escritas em dist/`);
}

run();