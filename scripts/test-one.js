import express from 'express';
import path from 'path';
import { chromium } from 'playwright';

const distPath = path.resolve('/dev-server/dist');
const app = express();
app.use(express.static(distPath));
app.use((req, res) => res.sendFile(path.join(distPath, 'index.html')));
const server = app.listen(0);
const port = server.address().port;
const route = process.argv[2] || '/our-tours';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', msg => console.log(`  [browser ${msg.type()}]`, msg.text().slice(0, 200)));
page.on('pageerror', err => console.log(`  [pageerror]`, err.message));

await page.route('**/*', (route) => {
  const url = route.request().url();
  const type = route.request().resourceType();
  if (type === 'image' || type === 'font' || type === 'media') return route.fulfill({ status: 200, body: '' });
  if (/google-analytics|googletagmanager|doubleclick|facebook\.net|hotjar|clarity/.test(url)) return route.fulfill({ status: 200, body: '' });
  return route.continue();
});

console.log('Goto', `http://localhost:${port}${route}`);
await page.goto(`http://localhost:${port}${route}`, { waitUntil: 'load', timeout: 60000 });
await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => console.log('  networkidle timeout'));

const cards = await page.$$eval('[data-tour-card]', els => els.length).catch(() => -1);
console.log('data-tour-card count:', cards);
const h1 = await page.$eval('h1', el => el.innerText).catch(() => 'no h1');
console.log('h1:', h1);
const bodyTextLen = await page.evaluate(() => document.body.innerText.length);
console.log('body text length:', bodyTextLen);

await browser.close();
server.close();
