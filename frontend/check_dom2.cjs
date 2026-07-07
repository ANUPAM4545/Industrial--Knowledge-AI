const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
  const content = await page.evaluate(() => document.body.innerHTML);
  if (content.includes('vite-error-overlay')) {
     console.log('VITE ERROR OVERLAY DETECTED!');
  } else {
     console.log('NO VITE ERROR OVERLAY');
  }
  
  await browser.close();
})();
