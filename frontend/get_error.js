const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    }
  });
  page.on('pageerror', error => {
    console.log('PAGE ERROR OBJECT:', error.message);
  });
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(2000);
  await browser.close();
})();
