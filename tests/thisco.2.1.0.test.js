import { test, expect } from '@playwright/test';

const THIS_TESTS = "2.1.0";
const THIS_SURVEY_URL = require('./thisco_testing_config.json')['test_surveys'][THIS_TESTS];

test('test', async ({ page }) => {

  // open page
  await page.goto(THIS_SURVEY_URL);

  // clear HubSpot
  await page.locator('text=Accept').click();

  // frontispiece
  // * check for alert-warning panel
  const panel = page.locator('div.alert-warning');
  await expect(panel).toBeVisible();
  
});