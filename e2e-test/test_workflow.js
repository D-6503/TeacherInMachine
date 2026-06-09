const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\mdars\\.gemini\\antigravity\\brain\\377fffe9-aa4d-482c-b9f7-7d57f43c0bfc';
  const learnPath = path.join(artifactDir, 'learn_page.png');
  const testPath = path.join(artifactDir, 'test_page.png');
  const resultPath = path.join(artifactDir, 'result_page.png');

  console.log('Launching browser (Microsoft Edge)...');
  const browser = await chromium.launch({
    headless: true,
    channel: 'msedge'
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

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
  console.log('Currently at:', page.url());

  console.log('Taking screenshot of Learn Page...');
  await page.screenshot({ path: learnPath });
  console.log(`Saved learn screenshot to ${learnPath}`);

  console.log('Clicking "Test Now" button...');
  await page.click('text="Test Now"');

  console.log('Waiting for Test page...');
  await page.waitForURL('**/test/**', { timeout: 15000 });
  await page.waitForTimeout(3000);
  console.log('Currently at:', page.url());

  console.log('Taking screenshot of Test Page...');
  await page.screenshot({ path: testPath });
  console.log(`Saved test screenshot to ${testPath}`);

  console.log('Entering answer to the first question...');
  const answer = "Projectile motion is a form of motion experienced by an object or particle that is thrown near the Earth's surface and moves along a curved path under the action of gravity only. The formula for the maximum height (H) attained is H = (u^2 * sin^2(theta)) / (2g).";
  await page.fill('textarea', answer);

  console.log('Submitting answer...');
  await page.click('button:has-text("Submit Answer")');

  console.log('Waiting for AI evaluation...');
  // Let's wait for either the "Next Question" or "Result" panel details to load.
  await page.waitForSelector('text="AI Feedback"', { timeout: 90000 });
  await page.waitForTimeout(2000);

  console.log('Taking screenshot of Evaluation Result...');
  await page.screenshot({ path: resultPath });
  console.log(`Saved result screenshot to ${resultPath}`);

  await browser.close();
  console.log('Full workflow test complete.');
})();
