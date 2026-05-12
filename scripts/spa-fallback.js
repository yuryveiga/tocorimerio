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

function writeRoute(route) {
  if (!route || route === '/') return;
  const dir = path.join(distPath, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), indexHtml);
}

async function run() {
  const routes = new Set([
    '/blog',
    '/passeio',
    '/our-tours',
    '/maracana-calendario',
    '/flamengo-x-vasco-maracana',
    '/fluminense-bolivar-libertadores',
    '/brasil-x-panama-maio-maracana',
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
        supabase.from('blog_posts').select('slug').eq('is_published', true),
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
      (posts || []).forEach(p => routes.add(`/blog/${slugify(p.slug)}`));
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
  routes.forEach(r => { writeRoute(r); count++; });
  console.log(`[spa-fallback] ${count} rotas com index.html escritas em dist/`);
}

run();