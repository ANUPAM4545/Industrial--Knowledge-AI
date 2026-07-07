const puppeteer = require('puppeteer');

(async () => {
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });
  
  page.on('response', response => {
    if (!response.ok()) {
      console.log('BAD RESPONSE:', response.url(), response.status());
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('BROWSER PAGE ERROR:', error.message);
  });

  try {
    await wait(4000);
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    const content = await page.evaluate(() => document.body.innerHTML);
    if (content.includes('vite-error-overlay')) {
       console.log('VITE ERROR OVERLAY DETECTED!');
    } else {
       console.log('PAGE LOADED. DOM LENGTH:', content.length);
    }
  } catch (e) {
    console.log('NAVIGATION ERROR:', e.message);
  }
  
  await browser.close();
})();
