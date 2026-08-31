const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://maracanamatchday.com/match/flamengo-vs-mirassol-sp-2026-09-02', { waitUntil: 'networkidle' });
  
  // Wait for the sectors to load (assuming it has some recognizable class or text, like "Sector" or "$")
  await page.waitForTimeout(3000); // just wait a bit for react to render
  
  const text = await page.evaluate(() => document.body.innerText);
  
  fs.writeFileSync('C:\\Users\\veiga\\.gemini\\antigravity\\brain\\c4246d7b-8db5-45ec-8b30-fcf44eca4e77\\scrape.txt', text);
  
  await browser.close();
})();
