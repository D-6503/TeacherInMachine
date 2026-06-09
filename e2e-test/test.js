const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\mdars\\.gemini\\antigravity\\brain\\377fffe9-aa4d-482c-b9f7-7d57f43c0bfc';
  const loginPath = path.join(artifactDir, 'login_page.png');
  const dashboardPath = path.join(artifactDir, 'dashboard_page.png');

  console.log('Launching browser (Microsoft Edge)...');
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      channel: 'msedge'
    });
  } catch (err) {
    console.log('Failed to launch Edge, trying Chrome...', err);
    browser = await chromium.launch({
      headless: true,
      channel: 'chrome'
    });
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/login ...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

  console.log('Taking screenshot of Login Page...');
  await page.screenshot({ path: loginPath });
  console.log(`Saved login screenshot to ${loginPath}`);

  console.log('Entering credentials...');
  await page.waitForSelector('button[type="submit"]:not(:disabled)');
  await page.fill('input[type="email"]', 'student@jeeplatform.com');
  await page.fill('input[type="password"]', 'Student@1234');

  console.log('Submitting login form...');
  await page.click('button[type="submit"]');

  console.log('Waiting for navigation to /dashboard...');
  try {
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('Successfully navigated to /dashboard!');
  } catch (err) {
    console.log('Timeout waiting for navigation, current URL:', page.url());
  }

  // Wait an extra second for data loading
  await page.waitForTimeout(3000);

  console.log('Taking screenshot of Dashboard Page...');
  await page.screenshot({ path: dashboardPath });
  console.log(`Saved dashboard screenshot to ${dashboardPath}`);

  await browser.close();
  console.log('Browser test complete.');
})();
