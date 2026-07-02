import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', exception => console.log('PAGE ERROR:', exception));

  // We are not authenticated in puppeteer, so if we go to /seller/home, 
  // RequireSeller should redirect us to /seller
  await page.goto('http://localhost:5173/seller/home', { waitUntil: 'networkidle0', timeout: 10000 });
  const content = await page.content();
  console.log("ROOT HTML:");
  console.log(content.substring(content.indexOf('<div id="root">')));
  
  await browser.close();
})();
