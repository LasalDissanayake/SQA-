import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('PixelsSuite Website Tool Availability Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
  });

  test('Verify all supported tools are visibly accessible from HomePage', async ({ page }) => {
    // Assert that the page has loaded properly
    await expect(page).toHaveTitle(/PixelsSuite/i);

    // Group assertions under a test step for standard QA reporting
    await test.step('Check visibility of all required tool headers and core links', async () => {
      await homePage.verifyAllSupportedToolsVisible();
    });

    // Capture screenshot manually as an artifact of success
    await page.screenshot({ path: 'test-results/success-supported-tools.png', fullPage: true });
  });

  test('Skip unsupported tool: Transliteration', async ({ page }) => {
    await test.step('Ensure Transliteration logic is intentionally skipped or just verified to exist without deep feature testing', async () => {
      // The requirement states "except Transliteration". We might just confirm it's not interacted with,
      // or realistically just show we recognize its existence but do not drill into it.
      await expect(homePage.transliterationHeader).toBeVisible();
    });
  });

  test('Validate navigation flow for a specific tool: Open Editor', async ({ page, baseURL }) => {
    // This is an example of an actionable test
    await homePage.openEditorLink.click();
    
    // In automation, we usually wait for url changes or a specific element to load.
    // For this assignment, we check if the URL changed or a canvas/editor element appears.
    // Given the target is unknown, let's verify url changes from base.
    await expect(page).not.toHaveURL(baseURL || '/');
    
    // Take screenshot of the new page
    await page.screenshot({ path: 'test-results/pdf-editor-opened.png', fullPage: true });
  });

});
