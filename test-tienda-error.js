import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', exception => console.log('PAGE ERROR:', exception));

  console.log("Navigating to /tienda...");
  await page.goto('http://localhost:5173/tienda', { waitUntil: 'networkidle0' });
  
  const content = await page.evaluate(() => document.body.innerText);
  console.log("Body text:");
  console.log(content.slice(0, 500));
  
  await browser.close();
})();
