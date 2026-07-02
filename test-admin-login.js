import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', exception => console.log('PAGE ERROR:', exception));

  console.log("Navigating to /admin...");
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle0' });
  
  console.log("Typing fake credentials...");
  await page.type('#admin-email', 'test@example.com');
  await page.type('#admin-password', 'wrongpassword');
  
  console.log("Clicking submit...");
  await page.click('button[type="submit"]');
  
  console.log("Waiting 3 seconds...");
  await new Promise(r => setTimeout(r, 3000));
  
  const buttonText = await page.evaluate(() => document.querySelector('button[type="submit"]').textContent);
  console.log("Button text after 3 seconds:", buttonText);
  
  const errorText = await page.evaluate(() => document.querySelector('.login-error')?.textContent);
  console.log("Error text:", errorText);
  
  await browser.close();
})();
