import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.toString()));
  page.on('requestfailed', req => console.error('FAILED REQUEST:', req.url()));

  try {
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('Login page loaded. Typing credentials...');
    
    // Type credentials
    await page.type('input[type="email"]', 'oviya03852@gmail.com');
    await page.type('input[type="password"]', '123456789');
    
    // Click submit
    console.log('Submitting login form...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);
    
    console.log('Navigated to:', page.url());
    
    // Check if body is empty or loader is present
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log('Body length after login:', bodyHTML.length);
    
    if (bodyHTML.includes('animate-spin')) {
      console.log('Loader is visible.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }

  await browser.close();
})();
