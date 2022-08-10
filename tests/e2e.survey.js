import { test, expect, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 11'],
});

test('test', async ({ page }) => {

  // Go to https://thisinstitute.fra1.qualtrics.com/jfe/form/SV_0kAu2Hthu9RWxpQ
  await page.goto('https://thisinstitute.fra1.qualtrics.com/jfe/form/SV_0kAu2Hthu9RWxpQ');

  // Click text=Accept
  await page.locator('text=Accept').click();

  // Click text=Next
  await page.locator('text=Next').click();

  // Click text=Option one
  await page.locator('text=Option one').click();

  // Click text=Option two - longer text in label
  await page.locator('text=Option two - longer text in label').click();

  // Click text=Option three - much longer text in label by way of testing of formatting
  await page.locator('text=Option three - much longer text in label by way of testing of formatting').click();

  await expect(page).toHaveScreenshot();

  // Click [aria-label="Next"]
  await page.locator('[aria-label="Next"]').click();

  // Click text=Option four
  await page.locator('text=Option four').click();

  // Click text=Option three - much longer text in label by way of testing of formatting
  await page.locator('text=Option three - much longer text in label by way of testing of formatting').click();

  // Click text=Option two - longer text in label
  await page.locator('text=Option two - longer text in label').click();

  // Click text=Option one
  await page.locator('text=Option one').click();

  // Click [aria-label="Next"]
  await page.locator('[aria-label="Next"]').click();

  // Select 1
  await page.locator('select[name="QR\\~QID4"]').selectOption('1');

  // Click [aria-label="Next"]
  await page.locator('[aria-label="Next"]').click();

  // Click [aria-label="Next"]
  await page.locator('[aria-label="Next"]').click();

  // Click [aria-label="Next"]
  await page.locator('[aria-label="Next"]').click();

  // Click [aria-label="Next"]
  await page.locator('[aria-label="Next"]').click();

});