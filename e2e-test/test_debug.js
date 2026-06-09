const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Launching browser (Microsoft Edge)...');
  const browser = await chromium.launch({
    headless: true,
    channel: 'msedge'
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER EXCEPTION:', err.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));
  page.on('request', request => {
    console.log('REQUEST SENT:', request.method(), request.url());
  });
  page.on('response', response => {
    console.log('RESPONSE RCVD:', response.status(), response.url());
  });

  console.log('Logging in...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForSelector('button[type="submit"]:not(:disabled)');
  await page.fill('input[type="email"]', 'student@jeeplatform.com');
  await page.fill('input[type="password"]', 'Student@1234');
  await page.click('button[type="submit"]');

  console.log('Waiting for Dashboard...');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(3000);

  console.log('Switching subject to Physics in the sidebar...');
  await page.click('button:has-text("Physics")');
  await page.waitForTimeout(1000);

  console.log('Clicking on Kinematics chapter in the sidebar...');
  await page.click('button:has-text("Kinematics")');

  console.log('Waiting for Learn page...');
  await page.waitForURL('**/learn/**', { timeout: 15000 });
  await page.waitForTimeout(3000);

  console.log('Clicking "Test Now" button...');
  await page.click('text="Test Now"');

  console.log('Waiting for Test page...');
  await page.waitForURL('**/test/**', { timeout: 15000 });
  await page.waitForTimeout(3000);

  console.log('Entering answer to the first question...');
  const answer = "Projectile motion is a form of motion experienced by an object or particle that is thrown near the Earth's surface and moves along a curved path under the action of gravity only. The formula for the maximum height (H) attained is H = (u^2 * sin^2(theta)) / (2g).";
  await page.fill('textarea', answer);

  console.log('Submitting answer...');
  await page.click('button:has-text("Submit Answer")');

  console.log('Waiting for response (or 20 seconds)...');
  await page.waitForTimeout(20000);

  console.log('Current URL:', page.url());
  await browser.close();
  console.log('Debug workflow complete.');
})();
