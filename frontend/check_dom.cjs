const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
  const content = await page.evaluate(() => document.body.innerHTML);
  console.log('DOM LENGTH:', content.length);
  if (content.length < 500) {
     console.log('DOM CONTENT:', content);
  }
  
  await browser.close();
})();
