import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from './load-env.js';

await loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');

// Supabase setup
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: Credenciais do Supabase não encontradas (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY).");
  console.error("Possíveis causas e soluções:");
  console.error("  • Local: crie um arquivo .env na raiz do projeto com:");
  console.error("      VITE_SUPABASE_URL=https://...");
  console.error("      VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...");
  console.error("  • GitHub Actions: configure os Secrets do repositório:");
  console.error("      VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY");
  console.error("      em Settings > Secrets and variables > Actions");
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

// Seletores específicos por rota: o prerender só salva o HTML quando
// esse elemento estiver visível na página, garantindo que os dados
// do Supabase já carregaram antes do snapshot.
const ROUTE_SELECTORS = {
  '/our-tours': '[data-tour-card]',
  '/passeio': '[data-tour-card]',
  '/blog': '[data-blog-card]',
  '/maracana-calendario': '[data-match-card]',
  '/football-experiences-in-rio-de-janeiro': '[data-football-experiences]',
};

// Rotas de categoria e passeio individuais também esperam pelo card de tour
const ROUTE_SELECTOR_PATTERNS = [
  { pattern: /^\/passeios\//, selector: '[data-tour-card]' },
  { pattern: /^\/passeio\//, selector: '[data-tour-detail]' },
  { pattern: /^\/blog\//, selector: '[data-blog-post]' },
  { pattern: /^\/match\//, selector: '[data-match-detail]' },
];

function getSelectorForRoute(route) {
  if (ROUTE_SELECTORS[route]) return ROUTE_SELECTORS[route];
  for (const { pattern, selector } of ROUTE_SELECTOR_PATTERNS) {
    if (pattern.test(route)) return selector;
  }
  return null;
}

async function startServer() {
  const app = express();

  // Fix MIME type for .js files on Windows
  app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
      res.type('application/javascript');
    }
    next();
  });

  // Always serve index.html for any request that looks like a route (doesn't have an extension)
  // this ensures we always start from a clean shell during prerender.
  app.use((req, res, next) => {
    if (!req.url.includes('.') || req.url.endsWith('.html')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });

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
    '/sitemap',
    '/experiences',
    '/your-private-guide-in-rio',
    '/things-to-do-in-rio-de-janeiro',
    '/private-tours-rio-de-janeiro',
    '/custom-private-tour-rio-de-janeiro',
    '/football-experiences-in-rio-de-janeiro',
    '/city-tour',
    '/hiking',
    '/one-day',
    '/flamengo-x-vasco-maracana',
    '/fluminense-bolivar-libertadores',
    '/brasil-x-panama-maio-maracana',
    '/fluminense-indenpediente-rivadavia-libertadores-maracana',
    '/flamengo-x-mirassol-maracana-tickets-02-09'
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
      if (slugify(slug) === 'maracana-matchday') return;
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
      if (page.href && page.href.startsWith('/') && !page.href.includes('#') && !routes.includes(page.href)) {
        routes.push(page.href);
      }
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
  const CONCURRENCY = 3;
  const results = { ok: 0, fail: 0, failed: [], emptySelector: [] };

  for (let i = 0; i < routes.length; i += CONCURRENCY) {
    const batch = routes.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (route) => {
      const page = await browser.newPage();
      
      // Log browser console messages
      page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') console.error(`  [BROWSER ERROR] ${route}: ${text}`);
        else if (type === 'warning') console.warn(`  [BROWSER WARN] ${route}: ${text}`);
        // else console.log(`  [BROWSER LOG] ${route}: ${text}`);
      });

      page.on('pageerror', err => {
        console.error(`  [BROWSER CRASH] ${route}: ${err.stack || err.message}`);
      });

      // Strict sandbox isolation: allow only localhost and Supabase, block/mock everything else
      await page.route('**/*', (route) => {
        const url = route.request().url();
        const type = route.request().resourceType();
        
        // Always allow local dev server requests
        if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
          // Block local heavy assets to speed up load time
          if (type === 'image' || type === 'font' || type === 'media') {
            return route.fulfill({ status: 204, body: '' });
          }
          return route.continue();
        }

        // Always allow Supabase API requests so dynamic database fetches succeed
        if (url.includes('supabase.co')) {
          return route.continue();
        }

        // Mock currency exchange rates API response to avoid fetch/parse errors
        if (url.includes('open.er-api.com')) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              result: 'success',
              base_code: 'BRL',
              rates: { BRL: 1.0, USD: 0.20, EUR: 0.18 }
            })
          });
        }

        // Mock Open-Meteo Weather forecast APIs to avoid fetch/parse errors
        if (url.includes('api.open-meteo.com')) {
          // Daily forecast API (PasseioDetalhe.tsx)
          if (url.includes('daily=')) {
            const times = [];
            const tempsMax = [];
            const tempsMin = [];
            const codes = [];
            const today = new Date();
            for (let i = 0; i < 20; i++) {
              const d = new Date(today);
              d.setDate(today.getDate() + i - 2);
              times.push(d.toISOString().split('T')[0]);
              tempsMax.push(28.0);
              tempsMin.push(20.0);
              codes.push(0); // clear sky
            }
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                daily: {
                  time: times,
                  temperature_2m_max: tempsMax,
                  temperature_2m_min: tempsMin,
                  weathercode: codes
                }
              })
            });
          }
          // Hourly forecast API (WeatherSection.tsx)
          if (url.includes('hourly=')) {
            const times = [];
            const temps = [];
            const codes = [];
            const winds = [];
            const humidities = [];
            const today = new Date();
            for (let day = -2; day < 10; day++) {
              const d = new Date(today);
              d.setDate(today.getDate() + day);
              const dateStr = d.toISOString().split('T')[0];
              for (let hour = 0; hour < 24; hour++) {
                const hourStr = hour.toString().padStart(2, '0');
                times.push(`${dateStr}T${hourStr}:00`);
                temps.push(25.0);
                codes.push(0);
                winds.push(12.0);
                humidities.push(70);
              }
            }
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                hourly: {
                  time: times,
                  temperature_2m: temps,
                  weather_code: codes,
                  wind_speed_10m: winds,
                  relative_humidity_2m: humidities
                }
              })
            });
          }
        }

        // Fulfill external stylesheets with empty body to avoid CSS network/parse errors
        if (type === 'stylesheet' || url.includes('fonts.googleapis.com')) {
          return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
        }

        // Block all other external requests (YouTube iframes, trackers, CDNs) with 204
        return route.fulfill({ status: 204, body: '' });
      });

      console.log(`Prerendering ${route}...`);
      try {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'load', timeout: 60000 });

        // Wait for React to render real content
        await page.waitForFunction(
          () => {
            const root = document.getElementById('root');
            return root && root.children.length > 0 && root.innerText.trim().length > 50;
          },
          { timeout: 30000 }
        ).catch(() => console.warn(`  ⚠ ${route}: content wait timeout, saving anyway`));

        // Wait for network to settle
        await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => { });

        // Global Wait: Ensure useSiteData has finished so Header/Footer have contact info
        try {
          await page.waitForSelector('body[data-site-data-ready="true"]', { timeout: 20000 });
        } catch {
          console.warn(`  ⚠ ${route}: global data-site-data-ready not found in 20s. Header might be missing contact info.`);
        }

        // Wait for route-specific selector (garante que dados da página carregaram)
        const selector = getSelectorForRoute(route);
        let selectorOk = !selector;
        if (selector) {
          console.log(`  ⏳ ${route}: aguardando seletor "${selector}"...`);
          try {
            await page.waitForSelector(selector, { timeout: 30000 });
            console.log(`  ✓ ${route}: seletor encontrado`);
            selectorOk = true;
          } catch {
            console.warn(`  ⚠ ${route}: seletor "${selector}" NÃO encontrado em 30s — pulando para evitar salvar HTML vazio`);
            results.emptySelector.push(route);
          }
        }



        // Se a rota exigia um seletor e ele não apareceu, NÃO sobrescreve
        // o index.html da rota (evita publicar página em branco).
        if (!selectorOk) {
          await page.close();
          return;
        }

        // Extra settle for Helmet to flush meta tags
        await page.waitForTimeout(500);

        // Tag the output so we can verify in production
        await page.evaluate(() => {
          const m = document.createElement('meta');
          m.name = 'prerendered';
          m.content = new Date().toISOString();
          document.head.appendChild(m);
        });

        // LCP boost: extract the hero image URL rendered by React and inject
        // a <link rel="preload" as="image" fetchpriority="high"> into <head>.
        // The browser's preload scanner sees this while parsing HTML and starts
        // downloading the LCP image BEFORE React hydrates — saves ~500–1500ms
        // of LCP on mobile because it removes the JS-execution dependency.
        // Only applied to routes that render a hero background (home, marketing).
        try {
          const heroUrl = await page.evaluate(() => {
            // 1) Prefer the hidden <img fetchpriority="high"> that HeroSection
            //    already emits for the preload scanner. That's the LCP element.
            const heroImg = document.querySelector(
              'section img[fetchpriority="high"], main > section:first-of-type img'
            );
            if (heroImg && heroImg.src && !heroImg.src.startsWith('data:')) {
              return heroImg.src;
            }
            // 2) Fallback: parse the first section's inline background-image.
            const bg = document.querySelector('main > section:first-of-type [style*="background-image"]');
            if (bg) {
              const m = /url\((['"]?)(.*?)\1\)/.exec(bg.getAttribute('style') || '');
              if (m && m[2]) return m[2];
            }
            return null;
          });
          if (heroUrl) {
            await page.evaluate((url) => {
              // Avoid duplicating an existing preload for the same URL.
              const existing = document.querySelector(
                `link[rel="preload"][as="image"][href="${url}"]`
              );
              if (existing) return;
              const link = document.createElement('link');
              link.rel = 'preload';
              link.as = 'image';
              link.href = url;
              link.setAttribute('fetchpriority', 'high');
              // Insert as early as possible in <head> so the preload scanner
              // encounters it before any script or stylesheet.
              document.head.insertBefore(link, document.head.firstChild);
            }, heroUrl);
          }
        } catch (e) {
          console.warn(`  ⚠ ${route}: could not inject hero preload:`, e.message);
        }

        // Multilingual SEO: garante hreflang (en / pt-BR / es / x-default) em
        // todas as páginas pré-renderizadas, para o Google entender que a
        // mesma URL tem versões em 3 idiomas via ?lang=.
        try {
          await page.evaluate((r) => {
            const SITE = 'https://tocorimerio.com';
            const clean = r === '/' ? '/' : r.replace(/\/$/, '');
            const base = `${SITE}${clean === '/' ? '/' : clean}`;
            const alternates = [
              ['en', base],
              ['pt-BR', `${base}?lang=pt`],
              ['es', `${base}?lang=es`],
              ['x-default', base],
            ];
            document
              .querySelectorAll('link[rel="alternate"][hreflang]')
              .forEach((el) => el.remove());
            for (const [lang, href] of alternates) {
              const link = document.createElement('link');
              link.rel = 'alternate';
              link.setAttribute('hreflang', lang);
              link.href = href;
              document.head.appendChild(link);
            }
            // Canonical auto-referente (sem parâmetros) quando ausente
            if (!document.querySelector('link[rel="canonical"]')) {
              const c = document.createElement('link');
              c.rel = 'canonical';
              c.href = base;
              document.head.appendChild(c);
            }
          }, route);
        } catch (e) {
          console.warn(`  ⚠ ${route}: could not inject hreflang:`, e.message);
        }

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
  if (results.emptySelector.length) {
    console.warn(`\n⚠ ${results.emptySelector.length} rotas pularam o save (seletor não apareceu):`);
    results.emptySelector.forEach(r => console.warn(`   - ${r}`));
  }
}

prerender().catch(console.error);