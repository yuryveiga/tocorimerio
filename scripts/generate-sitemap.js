import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnv } from './load-env.js';

await loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const siteUrl = 'https://tocorimerio.com'; // Definitive production URL

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY).');
  console.error('Possíveis causas e soluções:');
  console.error('  • Local: crie um arquivo .env na raiz do projeto com:');
  console.error('      VITE_SUPABASE_URL=https://...');
  console.error('      VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...');
  console.error('  • GitHub Actions: configure os Secrets do repositório:');
  console.error('      VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY');
  console.error('      em Settings > Secrets and variables > Actions');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Partner project for Maracanã matches
const PARTNER_URL = 'https://mwxbskzggzznxvkwgrnz.supabase.co';
const PARTNER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eGJza3pnZ3p6bnh2a3dncm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjE5OTUsImV4cCI6MjA4ODkzNzk5NX0.EFfaaN79uifOMgFdIZlQ5C8c-HQH-YodNGWf0MEcf9o';
const partnerSupabase = createClient(PARTNER_URL, PARTNER_KEY);

const slugify = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\x00-\x7F]/g, '')   // Remove qualquer caracter no-ASCII restante
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');



async function generateSitemap() {
  console.log('Generating dynamic sitemap...');

  try {
    // Fetch Tours
    const { data: tours, error: toursError } = await supabase
      .from('tours')
      .select('id, slug, title, updated_at, category, image_url, carousel_images_json, images_json')
      .eq('is_active', true);

    if (toursError) {
      console.warn('Could not fetch tours for sitemap (likely Invalid API Key):', toursError.message);
      return; // Stop gracefully
    }

    // Fetch Blog Posts
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('slug, title, excerpt, updated_at, image_url')
      .eq('is_published', true);

    if (postsError) {
      console.warn('Could not fetch posts for sitemap (likely Invalid API Key):', postsError.message);
      return; // Stop gracefully
    }

    const staticPages = [
      { url: '', priority: 1.0, changefreq: 'daily' },
      { url: '/blog', priority: 0.9, changefreq: 'weekly' },
      { url: '/sobre', priority: 0.7, changefreq: 'monthly' },
      { url: '/contato', priority: 0.7, changefreq: 'monthly' },
      { url: '/passeio', priority: 0.8, changefreq: 'weekly' },
      { url: '/our-tours', priority: 0.9, changefreq: 'weekly' },
      { url: '/maracana-calendario', priority: 0.9, changefreq: 'daily' },
      { url: '/flamengo-x-vasco-maracana', priority: 0.8, changefreq: 'daily' },
      { url: '/fluminense-bolivar-libertadores', priority: 0.8, changefreq: 'daily' },
      { url: '/brasil-x-panama-maio-maracana', priority: 0.8, changefreq: 'daily' },
    ];

    const escapeXml = (s) => String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const collectImages = (...sources) => {
      const urls = new Set();
      for (const src of sources) {
        if (!src) continue;
        if (typeof src === 'string') {
          if (src.startsWith('http')) urls.add(src);
        } else if (Array.isArray(src)) {
          src.forEach((item) => {
            if (typeof item === 'string' && item.startsWith('http')) urls.add(item);
            else if (item && typeof item === 'object') {
              const u = item.url || item.src || item.image_url || item.image;
              if (typeof u === 'string' && u.startsWith('http')) urls.add(u);
            }
          });
        }
      }
      return [...urls];
    };

    const imageBlock = (urls, caption) => urls.slice(0, 1000).map((u) =>
      `    <image:image>\n      <image:loc>${escapeXml(u)}</image:loc>\n` +
      (caption ? `      <image:caption>${escapeXml(caption)}</image:caption>\n` : '') +
      `    </image:image>\n`
    ).join('');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Static Pages
    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}${page.url.toLowerCase()}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Tours
    tours.forEach(tour => {
      let slug = slugify(tour.slug || tour.id);
      if (slug.includes('niter-i') || slug.includes('niteroi')) {
        slug = 'um-dia-em-niteroi';
      }
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/passeio/${slug}</loc>\n`;
      xml += `    <lastmod>${(tour.updated_at || new Date().toISOString()).split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      const tourImages = collectImages(tour.image_url, tour.carousel_images_json, tour.images_json);
      xml += imageBlock(tourImages, tour.title);
      xml += `  </url>\n`;
    });

    // Category landing pages
    const cats = new Set();
    tours.forEach(t => {
      const s = slugify(t.category);
      if (s) cats.add(s);
    });
    cats.forEach(c => {
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/passeios/${c}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    // Maracanã matches from partner
    let matchesCount = 0;
    try {
      const { data: matches } = await partnerSupabase
        .from('matches')
        .select('id, slug, updated_at, hidden, home_team, away_team');
      const visible = (matches || []).filter(m => !m.hidden);
      visible.forEach(m => {
        let key = slugify(m.slug || `${m.home_team || ''}-vs-${m.away_team || ''}`) || m.id;

        if (!key) return;
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/match/${key}</loc>\n`;
        xml += `    <lastmod>${(m.updated_at || new Date().toISOString()).split('T')[0]}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
      });
      matchesCount = visible.length;
    } catch (e) {
      console.warn('Could not fetch matches:', e.message);
    }

    // Blog Posts
    posts.forEach(post => {
      const slug = slugify(post.slug);
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/blog/${slug}</loc>\n`;
      xml += `    <lastmod>${(post.updated_at || new Date().toISOString()).split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      const postImages = collectImages(post.image_url);
      xml += imageBlock(postImages, post.title || post.excerpt);
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    const publicPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(publicPath, xml);

    // Dedicated image sitemap (alternative submission format that GSC understands directly)
    let imgXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    imgXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
    let imgCount = 0;
    tours.forEach((tour) => {
      let slug = slugify(tour.slug || tour.id);
      if (slug.includes('niter-i') || slug.includes('niteroi')) slug = 'um-dia-em-niteroi';
      const urls = collectImages(tour.image_url, tour.carousel_images_json, tour.images_json);
      if (!urls.length) return;
      imgXml += `  <url>\n    <loc>${siteUrl}/passeio/${slug}</loc>\n${imageBlock(urls, tour.title)}  </url>\n`;
      imgCount += urls.length;
    });
    posts.forEach((post) => {
      const slug = slugify(post.slug);
      const urls = collectImages(post.image_url);
      if (!urls.length) return;
      imgXml += `  <url>\n    <loc>${siteUrl}/blog/${slug}</loc>\n${imageBlock(urls, post.title || post.excerpt)}  </url>\n`;
      imgCount += urls.length;
    });
    imgXml += `</urlset>`;
    const imgPath = path.join(__dirname, '../public/sitemap-images.xml');
    fs.writeFileSync(imgPath, imgXml);

    // Sitemap index pointing to both
    const today = new Date().toISOString().split('T')[0];
    const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${siteUrl}/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>\n  <sitemap><loc>${siteUrl}/sitemap-images.xml</loc><lastmod>${today}</lastmod></sitemap>\n</sitemapindex>\n`;
    fs.writeFileSync(path.join(__dirname, '../public/sitemap-index.xml'), indexXml);

    console.log(`Sitemap generated at ${publicPath}`);
    console.log(`Image sitemap generated at ${imgPath} (${imgCount} images)`);
    console.log(`Added ${tours.length} tours, ${cats.size} categories, ${matchesCount} matches and ${posts.length} blog posts.`);

  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
