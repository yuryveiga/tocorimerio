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
  const routes = ['/', '/blog', '/carrinho', '/maracanã-calendário', '/Fluminense-bolivar-libertadores'];

  console.log('Fetching dynamic routes from Supabase...');
  
  // Fetch blog posts
  const { data: posts } = await supabase.from('blog_posts').select('slug').eq('is_published', true);
  if (posts) {
    posts.forEach(post => routes.push(`/blog/${post.slug}`));
  }

  // Fetch tours
  const { data: tours } = await supabase.from('tours').select('id, slug');
  if (tours) {
    tours.forEach(tour => {
      routes.push(`/passeio/${tour.id}`);
      if (tour.slug) routes.push(`/passeio/${tour.slug}`);
    });
  }

  // Fetch pages
  const { data: pages } = await supabase.from('pages').select('href').eq('is_visible', true);
  if (pages) {
    pages.forEach(page => {
        if (!routes.includes(page.href)) routes.push(page.href);
    });
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

  for (let i = 0; i < routes.length; i += CONCURRENCY) {
    const batch = routes.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (route) => {
      const page = await browser.newPage();
      // Block images/fonts/analytics to speed up rendering
      await page.route('**/*.{png,jpg,jpeg,svg,gif,webp,woff2,google-analytics,doubleclick,facebook}', r => r.fulfill({status: 200, body: ''}));
      
      console.log(`Prerendering ${route}...`);
      try {
        // Use 'load' instead of 'networkidle' for better compatibility with external scripts
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'load', timeout: 60000 });
        // Give time for hydration/React to finish rendering
        await page.waitForTimeout(3000); 

        let content = await page.content();
        
        const savePath = route === '/' 
          ? path.join(distPath, 'index.html')
          : path.join(distPath, decodeURI(route), 'index.html');
        
        const dirPath = path.dirname(savePath);
        await fs.mkdir(dirPath, { recursive: true });
        
        await fs.writeFile(savePath, content);
        console.log(`✓ Saved ${savePath}`);
      } catch (e) {
        console.error(`✗ Error prerendering ${route}:`, e.message);
      } finally {
        await page.close();
      }
    }));
  }

  await browser.close();
  server.close();
  console.log('Prerendering complete!');
}

prerender().catch(console.error);
