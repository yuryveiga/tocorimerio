import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');

// Supabase setup
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials. Did you run with --env-file=.env?");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Partner project for Maracanã matches (same as src/hooks/useMatches.ts)
const PARTNER_URL = "https://mwxbskzggzznxvkwgrnz.supabase.co";
const PARTNER_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eGJza3pnZ3p6bnh2a3dncm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjE5OTUsImV4cCI6MjA4ODkzNzk5NX0.EFfaaN79uifOMgFdIZlQ5C8c-HQH-YodNGWf0MEcf9o";
const partnerSupabase = createClient(PARTNER_URL, PARTNER_KEY);

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

async function startServer() {
  const app = express();
  
  // Serve static files from dist
  app.use(express.static(distPath));

  // Fallback to index.html for SPA routing
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve({ server, port: server.address().port });
    });
  });
}

async function fetchDynamicRoutes() {
  const routes = [
    '/', 
    '/blog', 
    '/passeio', 
    '/our-tours',
    '/maracana-calendario', 
    '/flamengo-x-vasco-maracana',
    '/fluminense-bolivar-libertadores',
    '/brasil-x-panama-maio-maracana'
  ];

  console.log('Fetching dynamic routes from Supabase...');
  
  // Fetch blog posts
  const { data: posts } = await supabase.from('blog_posts').select('slug').eq('is_published', true);
  if (posts) {
    posts.forEach(post => routes.push(`/blog/${post.slug}`));
  }

  // Fetch tours
  const { data: tours } = await supabase.from('tours').select('id, slug, category, is_active');
  if (tours) {
    const activeTours = tours.filter(t => t.is_active !== false);
    activeTours.forEach(tour => {
      let slug = tour.slug || tour.id;
      if (slug.includes('niter-i') || slug.includes('niteroi')) {
        slug = 'um-dia-em-niteroi';
      }
      routes.push(`/passeio/${slug}`);
    });
    // Category landing pages
    const cats = new Set();
    activeTours.forEach((t) => {
      const s = slugify(t.category);
      if (s) cats.add(s);
    });
    cats.forEach((c) => routes.push(`/passeios/${c}`));
  }

  // Fetch pages
  const { data: pages } = await supabase.from('pages').select('href').eq('is_visible', true);
  if (pages) {
    pages.forEach(page => {
        if (!routes.includes(page.href)) routes.push(page.href);
    });
  }

  // Fetch Maracanã matches from partner project
  try {
    const { data: matches } = await partnerSupabase
      .from('matches')
      .select('id, slug, hidden, home_team, away_team');
    if (matches) {
      const visible = matches.filter(m => !m.hidden);
      visible.forEach((m) => {
        let key = slugify(m.slug || `${m.home_team || ''}-vs-${m.away_team || ''}`) || m.id;
        if (key) routes.push(`/match/${key}`);
      });
      console.log(`Added ${visible.length} match landing pages.`);
    }
  } catch (e) {
    console.warn('Could not fetch matches from partner:', e.message);
  }

  return routes;
}

async function prerender() {
  console.log('Starting prerender process...');
  const { server, port } = await startServer();
  const baseUrl = `http://localhost:${port}`;
  
  const routes = await fetchDynamicRoutes();
  console.log(`Found ${routes.length} routes to prerender.`);

  const browser = await chromium.launch({ headless: true });
  const CONCURRENCY = 3; // Reduced concurrency to save resources
  const results = { ok: 0, fail: 0, failed: [] };

  for (let i = 0; i < routes.length; i += CONCURRENCY) {
    const batch = routes.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (route) => {
      const page = await browser.newPage();
      // Block heavy assets and trackers to speed up rendering (keep CSS/JS!)
      await page.route('**/*', (route) => {
        const url = route.request().url();
        const type = route.request().resourceType();
        if (type === 'image' || type === 'font' || type === 'media') {
          return route.fulfill({ status: 200, body: '' });
        }
        if (/google-analytics|googletagmanager|doubleclick|facebook\.net|hotjar|clarity/.test(url)) {
          return route.fulfill({ status: 200, body: '' });
        }
        return route.continue();
      });
      
      console.log(`Prerendering ${route}...`);
      try {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'load', timeout: 60000 });
        // Wait for React to render real content (root must have children) and network to settle
        await page.waitForFunction(
          () => {
            const root = document.getElementById('root');
            return root && root.children.length > 0 && root.innerText.trim().length > 50;
          },
          { timeout: 30000 }
        ).catch(() => console.warn(`  ⚠ ${route}: content wait timeout, saving anyway`));
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        // Extra settle for Helmet to flush meta tags
        await page.waitForTimeout(500);

        // Tag the output so we can verify in production
        await page.evaluate(() => {
          const m = document.createElement('meta');
          m.name = 'prerendered';
          m.content = new Date().toISOString();
          document.head.appendChild(m);
        });

        let content = await page.content();
        
        const savePath = route === '/' 
          ? path.join(distPath, 'index.html')
          : path.join(distPath, decodeURI(route), 'index.html');
        
        const dirPath = path.dirname(savePath);
        await fs.mkdir(dirPath, { recursive: true });
        
        await fs.writeFile(savePath, content);
        console.log(`✓ Saved ${savePath}`);
        results.ok++;
      } catch (e) {
        console.error(`✗ Error prerendering ${route}:`, e.message);
        results.fail++;
        results.failed.push(route);
      } finally {
        await page.close();
      }
    }));
  }

  await browser.close();
  server.close();
  console.log(`\nPrerendering complete! ✓ ${results.ok} ok, ✗ ${results.fail} failed`);
  if (results.failed.length) console.log('Failed routes:', results.failed);
}

prerender().catch(console.error);
