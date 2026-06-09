const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const artifactDir = 'C:\\Users\\mdars\\.gemini\\antigravity\\brain\\377fffe9-aa4d-482c-b9f7-7d57f43c0bfc';
  const adminPagePath = path.join(artifactDir, 'admin_page.png');
  const adminSelectPath = path.join(artifactDir, 'admin_selected.png');
  const adminUploadPath = path.join(artifactDir, 'admin_uploaded.png');

  console.log('Launching browser (Microsoft Edge)...');
  const browser = await chromium.launch({
    headless: true,
    channel: 'msedge'
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log('Logging in as Admin...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForSelector('button[type="submit"]:not(:disabled)');
  await page.fill('input[type="email"]', 'admin@jeeplatform.com');
  await page.fill('input[type="password"]', 'Admin@1234');
  await page.click('button[type="submit"]');

  console.log('Waiting for Dashboard...');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(3000);

  console.log('Navigating to Topics & PDFs page...');
  await page.goto('http://localhost:3000/admin/topics');
  await page.waitForTimeout(3500);

  console.log('Taking screenshot of Admin page...');
  await page.screenshot({ path: adminPagePath });
  console.log(`Saved admin page screenshot to ${adminPagePath}`);

  // Create a dummy PDF to upload
  const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
  fs.writeFileSync(dummyPdfPath, '%PDF-1.4 ... dummy content ...');

  // Select Physics subject
  console.log('Selecting Subject...');
  const selects = await page.$$('select');
  if (selects.length >= 1) {
    // Select first non-empty option
    const options = await selects[0].$$('option');
    if (options.length > 1) {
      const val = await options[1].getAttribute('value');
      await selects[0].selectOption(val);
    }
  }
  await page.waitForTimeout(2000);

  // Select Topic
  console.log('Selecting Topic...');
  if (selects.length >= 2) {
    const options = await selects[1].$$('option');
    if (options.length > 1) {
      const val = await options[1].getAttribute('value');
      await selects[1].selectOption(val);
    }
  }
  await page.waitForTimeout(3000);

  console.log('Taking screenshot after selection...');
  await page.screenshot({ path: adminSelectPath });
  console.log(`Saved selected screenshot to ${adminSelectPath}`);

  // Upload dummy.pdf
  console.log('Uploading dummy.pdf...');
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.setInputFiles(dummyPdfPath);
    await page.waitForTimeout(1000);

    console.log('Clicking upload...');
    await page.click('button:has-text("Upload PDF")');
    await page.waitForTimeout(6000);
  } else {
    console.log('No file input found!');
  }

  console.log('Taking screenshot after upload...');
  await page.screenshot({ path: adminUploadPath });
  console.log(`Saved uploaded screenshot to ${adminUploadPath}`);

  await browser.close();
  // Cleanup dummy pdf
  if (fs.existsSync(dummyPdfPath)) {
    fs.unlinkSync(dummyPdfPath);
  }
  console.log('Admin test complete.');
})();
