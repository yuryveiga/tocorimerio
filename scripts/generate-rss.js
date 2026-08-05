// Gera public/rss.xml (e dist/rss.xml, se existir) com os posts publicados do blog.
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './load-env.js';

await loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://tocorimerio.com';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.warn('[rss] credenciais Supabase ausentes — pulando.');
  process.exit(0);
}

const esc = (s) =>
  String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const supabase = createClient(url, key);
const { data, error } = await supabase
  .from('blog_posts')
  .select('slug,title,title_en,excerpt,excerpt_en,image_url,created_at,updated_at')
  .eq('is_published', true)
  .order('created_at', { ascending: false })
  .limit(100);

if (error) {
  console.warn('[rss] erro ao buscar posts:', error.message);
  process.exit(0);
}

const items = (data || [])
  .filter((p) => p.slug)
  .map((p) => {
    const link = `${SITE}/blog/${String(p.slug).replace(/^\/?blog\//, '')}`;
    const date = new Date(p.created_at || Date.now()).toUTCString();
    return [
      '    <item>',
      `      <title>${esc(p.title_en || p.title)}</title>`,
      `      <link>${link}</link>`,
      `      <guid isPermaLink="true">${link}</guid>`,
      `      <pubDate>${date}</pubDate>`,
      `      <description>${esc(p.excerpt_en || p.excerpt)}</description>`,
      p.image_url ? `      <enclosure url="${esc(p.image_url)}" type="image/jpeg" />` : null,
      '    </item>',
    ]
      .filter(Boolean)
      .join('\n');
  });

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
  '  <channel>',
  '    <title>Blog Tocorime Rio</title>',
  `    <link>${SITE}/blog</link>`,
  '    <description>Dicas, roteiros e guias sobre passeios no Rio de Janeiro.</description>',
  '    <language>en</language>',
  `    <lastBuildDate>${new Date(data?.[0]?.created_at || Date.now()).toUTCString()}</lastBuildDate>`,
  `    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />`,
  ...items,
  '  </channel>',
  '</rss>',
].join('\n');

fs.writeFileSync(path.resolve(__dirname, '../public/rss.xml'), xml);
const dist = path.resolve(__dirname, '../dist');
if (fs.existsSync(dist)) fs.writeFileSync(path.join(dist, 'rss.xml'), xml);
console.log(`[rss] rss.xml escrito com ${items.length} posts.`);
