const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1200 }
  });
  
  // Go to the landing page
  await page.goto('http://localhost:4173/flamengo-x-mirassol-maracana-tickets-02-09', { waitUntil: 'networkidle' });
  
  // Take a full page screenshot
  await page.screenshot({ 
    path: 'C:\\Users\\veiga\\.gemini\\antigravity\\brain\\c4246d7b-8db5-45ec-8b30-fcf44eca4e77\\preview.png',
    fullPage: false
  });
  
  await browser.close();
})();
