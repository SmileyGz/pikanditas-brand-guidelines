import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', exception => console.log('PAGE ERROR:', exception));

  // Navigate to seller home
  await page.goto('http://localhost:5173/seller/home', { waitUntil: 'networkidle0', timeout: 10000 });
  
  // Inject script to mock zustand auth store to simulate logged in seller
  await page.evaluate(() => {
    window.useAuthStore = window.__zustand_stores__?.find(s => s.name === 'pikanditas-auth');
    // It's hard to mock zustand directly from outside without exposing it.
    // Let's modify local storage instead.
    localStorage.setItem('pikanditas-auth', JSON.stringify({
      state: { role: 'seller', entityId: 'store_123', tier: 'tiendita_12' },
      version: 0
    }));
  });

  // Reload to apply localstorage
  await page.goto('http://localhost:5173/seller/home', { waitUntil: 'networkidle0', timeout: 10000 });

  const content = await page.content();
  console.log("ROOT HTML:");
  console.log(content.substring(content.indexOf('<div id="root">'), content.indexOf('</div>', content.indexOf('<div id="root">')) + 300));
  
  await browser.close();
})();
