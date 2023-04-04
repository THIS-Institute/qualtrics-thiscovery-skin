import { test, expect } from '@playwright/test';
import wait from 'wait';

const THIS_TESTS = "2.1.0";
const THIS_SURVEY_URL = require('./thisco_testing_config.json')['test_surveys'][THIS_TESTS];

test.use({viewport: {
  width : 1000,
  height: 750
}});

test('test', async ({ page }) => {

  let result;

  // open page
  await page.goto(THIS_SURVEY_URL);

  // clear HubSpot [1]
  try {
    await page.locator('text=Accept').click({timeout:10 * 1000});
  } catch (error) {
    // do nothing otherwise, 3rd-party so can't rely on it
    console.warn("Unable to find HubSpot button");
  }

  // frontispiece [2]
  // * check for alert-warning panel
  const panel = page.locator('div.alert-warning');
  await expect(panel).toBeVisible();

  // Click text=Next
  await page.locator('text=Next').click();
  // Click text=Option one
  await page.locator('text=Option one').click();
  // Click text=Option two - longer text in label
  await page.locator('text=Option two - longer text in label').click();
  await expect(page).toHaveScreenshot();

  // Click input[name="QR\~QID2\~4\~TEXT"]
  await page.locator('input[name="QR\\~QID2\\~4\\~TEXT"]').click();
  // Fill input[name="QR\~QID2\~4\~TEXT"]
  await page.locator('input[name="QR\\~QID2\\~4\\~TEXT"]').fill('Test');
  await expect(page).toHaveScreenshot();

  // Fill input[name="QR\~QID2\~4\~TEXT"]
  await page.locator('input[name="QR\\~QID2\\~4\\~TEXT"]').fill('');
  // Click text=Option three - much longer text in label by way of testing of formatting
  await page.locator('text=Option three - much longer text in label by way of testing of formatting').click();
  await wait(1000);
  await expect(page).toHaveScreenshot();

  // Click [aria-label="Next"]
  await page.locator('[aria-label="Next"]').click();
  // Click text=Option one
  await page.locator('text=Option one').click();
  // Click text=Option three - much longer text in label by way of testing of formatting
  await page.locator('text=Option three - much longer text in label by way of testing of formatting').click();
  await expect(page).toHaveScreenshot();

  // Click [aria-label="Next"]
  await page.locator('[aria-label="Next"]').click();
  // Select 5
  await page.locator('select[name="QR\\~QID4"]').selectOption('5');
  await expect(page).toHaveScreenshot();

  // Click [aria-label="Next"]
  await page.locator('[aria-label="Next"]').click();
  // Click input[name="QR\~QID5\~TEXT"]
  await page.locator('input[name="QR\\~QID5\\~TEXT"]').click();
  // Fill input[name="QR\~QID5\~TEXT"]
  await page.locator('input[name="QR\\~QID5\\~TEXT"]').fill('Barbados');
  // Click textarea[name="QR\~QID6\~TEXT"]
  await page.locator('textarea[name="QR\\~QID6\\~TEXT"]').click();
  // Fill textarea[name="QR\~QID6\~TEXT"]
  await page.locator('textarea[name="QR\\~QID6\\~TEXT"]').fill('Our infinitely reconfigurable feature set is second to none, but our strategic angel investors and user-proof configuration is always considered a terrific achievement. If all of this comes off as mixed-up to you, that\'s because it is! A company that can streamline elegantly will (at some unspecified point in the future) be able to orchestrate correctly. What does the industry jargon \'60/24/7/365\' really mean?');
  // Press Tab
  await page.locator('textarea[name="QR\\~QID6\\~TEXT"]').press('Tab');
  await wait(1000);
  await expect(page).toHaveScreenshot();

  // Click [aria-label="Next"]
  await page.locator('[aria-label="Next"]').click();
  // Click input[name="QR\~QID7\~1\~TEXT"]
  await page.locator('input[name="QR\\~QID7\\~1\\~TEXT"]').click();
  // Fill input[name="QR\~QID7\~1\~TEXT"]
  await page.locator('input[name="QR\\~QID7\\~1\\~TEXT"]').fill('Blue');
  // Press Tab
  await page.locator('input[name="QR\\~QID7\\~1\\~TEXT"]').press('Tab');
  // Fill input[name="QR\~QID7\~2\~TEXT"]
  await page.locator('input[name="QR\\~QID7\\~2\\~TEXT"]').fill('Mint');
  // Press Tab
  await page.locator('input[name="QR\\~QID7\\~2\\~TEXT"]').press('Tab');
  // Fill input[name="QR\~QID7\~3\~TEXT"]
  await page.locator('input[name="QR\\~QID7\\~3\\~TEXT"]').fill('Mr Jones');
  // Press Tab
  await page.locator('input[name="QR\\~QID7\\~3\\~TEXT"]').press('Tab');
  await wait(1000);
  await expect(page).toHaveScreenshot();

  // Click [aria-label="Next"]
  await page.locator('[aria-label="Next"]').click();
  // Click text=I am happy to continue.YesNo
  await page.locator('text=I am happy to continue.YesNo').click();
  // Click text=I am happy to agree to this statement.YesNo
  await page.locator('text=I am happy to agree to this statement.YesNo').click();
  // Click text=This statement is an accurate and fair representation of my beliefs and opinions
  await page.locator('text=This statement is an accurate and fair representation of my beliefs and opinions').click();
  await expect(page).toHaveScreenshot();
  
  // Click [aria-label="Next"]
  await page.locator('[aria-label="Next"]').click();
  // Check [id="QR\~QID9\~4"]
  await page.locator('[id="QR\\~QID9\\~4"]').check();
  await wait(1000);
  await expect(page).toHaveScreenshot();

  // Click [aria-label="Next"]
  await page.locator('[aria-label="Next"]').click();
  // Click div:nth-child(9) > div > .input-number-wrapper > .button-increment
  await wait(1000); 
  await page.locator('div:nth-child(9) > div > .input-number-wrapper > .button-increment').click();
  // Click div:nth-child(9) > div > .input-number-wrapper > .button-increment
  await wait(1000);
  await page.locator('div:nth-child(9) > div > .input-number-wrapper > .button-increment').click();
  // Click div:nth-child(6) > div > .input-number-wrapper > .button-increment
  await wait(1000);
  await page.locator('div:nth-child(6) > div > .input-number-wrapper > .button-increment').click();
  // Click input[name="QR\~QID10\~7"]
  await wait(1000);
  await page.locator('input[name="QR\\~QID10\\~7"]').click();
  // Fill input[name="QR\~QID10\~7"]
  await wait(1000);
  await page.locator('input[name="QR\\~QID10\\~7"]').fill('1');
  // Click #SkinContent
  await page.locator('#SkinContent').click();
  await page.locator('div:nth-child(9) > div > .input-number-wrapper > .button-increment').scrollIntoViewIfNeeded();
  await wait(1000);
  await expect(page).toHaveScreenshot();

  // Click [aria-label="Next"]
  await page.locator('[aria-label="Next"]').click();
  await wait(500); // give script time to clear the hyperlink
  // Click text=This should be the correctly styled button that opens the modal.
  await page.locator('text=This should be the correctly styled button that opens the modal.').click();
  // Click text=× Close
  await wait(1000);
  await expect(page).toHaveScreenshot();
  await page.locator('text=× Close').click();

  // Click [aria-label="Next"]
  await wait(1000);
  await expect(page).toHaveScreenshot();
  await page.locator('[aria-label="Next"]').click();

  // Results
  // Click [aria-label="Next"] 
  await wait(1000);
  await expect(page).toHaveScreenshot();
  await page.locator('[aria-label="Next"]').click();

  // [3]
  // await page.locator("text=Next").click();

  // // Multi-choice select one [4]
  // const choices = page.locator(".ChoiceStructure li");
  // await choices.locator(':scope',{hasText:'Option one'}).click();
  // result = await page.locator('.ChoiceStructure li input:checked').count();
  // expect(result).toBe(1);

  // // [5]
  // await choices.locator(':scope',{hasText:'Option two'}).click();
  // // SCREENSHOT [6]

  // // [7] [8]
  // await page.locator('input[type="text"]').fill("Test");
  // result  = await page.locator('input[type="text"]').elementHandle()
  // const radio = result.closest("li").querySelector("input[type='radio']");
  // expect(radio.checked).toBe(true);

  // // await expect(page).toHaveScreenshot();
  // await page.locator('input[type="text"]').fill("");
  // await page.locator('text=/^Option three.*/').click(); // no screenshot - should affect final answers screen
  // // await expect(page).toHaveScreenshot();
  // await page.locator("input[value='Next']").click();

  // await wait(5000);

  // Checkboxes
  // Select first and third

  // await page.locator("body").click();
  // let checked = await page.locator("input:checked").count();
  // expect(checked).toBe(0);
  // await page.locator("text=/^Option one.*/").click();
  // checked = await page.locator("input:checked").count();
  // expect(checked).toBe(1);
  // await page.locator('text=/^Option three.*/').click();
  // checked = await page.locator("input:checked").count();
  // expect(checked).toBe(2);

  // await expect(page).toHaveScreenshot();
  // await page.locator("input[value='Next']").click();

  // await expect(page).toHaveScreenshot();


});


// test('test_project_task_pages', async ({ page }) => {

//   // Should not be behind login page
//   await page.goto('https://www.thiscovery.org/project/care-homes-primary-care/');
//   await expect(page).toHaveScreenshot();

//   // Should be behind login page
//   await page.goto('https://www.thiscovery.org/task/care-homes-primary-care-interview/');
//   await expect(page).toHaveScreenshot();

//   // Bug puts this behind login page
//   await page.goto('https://www.thiscovery.org/project/care-homes-primary-care/');
//   await expect(page).toHaveScreenshot();

// });


// test('test_project_task_pages_staging', async ({ page }) => {

//   // Should not be behind login page
//   await page.goto('https://staging.thiscovery.org/project/remote-mental-healthcare/');
//   await expect(page).toHaveScreenshot();

//   // Should be behind login page
//   await page.goto('https://staging.thiscovery.org/task/demo-learning-from-intensive-caffeine-experiences/');
//   await expect(page).toHaveScreenshot();

//   // Should not be behind login page
//   await page.goto('https://staging.thiscovery.org/project/remote-mental-healthcare/');
//   await expect(page).toHaveScreenshot();

// });
