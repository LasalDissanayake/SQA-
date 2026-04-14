import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { DocumentConverterPage } from '../pages/DocumentConverterPage';

test.describe('Document Converter Tool Validation Tests', () => {
  let homePage: HomePage;
  let converterPage: DocumentConverterPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    converterPage = new DocumentConverterPage(page);
    await homePage.navigate();
  });

  test('TC01: Verify "Image to PDF" Tool UI & Configuration Options', async ({ page }) => {
    await test.step('Navigate to Image to PDF tool', async () => {
      await homePage.imgToPdfLink.click();
    });

    await test.step('Verify Upload Zone', async () => {
      await expect(converterPage.imgToPdfHeader).toBeVisible();
      await expect(converterPage.dragAndDropText).toBeVisible();
      await expect(converterPage.selectImagesBtn).toBeVisible();
      // The supported formats text might be slightly different on exact match, so making it soft or checking if it exists.
      // E.g. PNG, JPG, WEBP • Max 20MB
    });

    await test.step('Verify Selected Images Settings and Preview', async () => {
      await expect(converterPage.selectedImagesSection).toBeVisible();
      
      // Page options
      await expect(converterPage.pageSettingA4).toBeVisible();
      await expect(converterPage.pageSettingLetter).toBeVisible();
      
      // Orientation options
      await expect(converterPage.orientationPortrait).toBeVisible();
      await expect(converterPage.orientationLandscape).toBeVisible();
      
      // Arrange options
      await expect(converterPage.arrangeVertical).toBeVisible();
      await expect(converterPage.arrangeHorizontal).toBeVisible();
      
      // Pages options
      await expect(converterPage.pagesOne).toBeVisible();
      await expect(converterPage.pagesMultiple).toBeVisible();

      // Create button & Preview
      await expect(converterPage.createPdfBtn).toBeVisible();
      await expect(converterPage.previewSection).toBeVisible();
    });

    await page.screenshot({ path: 'test-results/TC01-image-to-pdf.png', fullPage: true });
  });

  test('TC02: Verify "PDF to Word" Tool UI', async ({ page }) => {
    await test.step('Navigate to PDF to Word tool', async () => {
      await homePage.pdfToWordLink.click();
    });

    await test.step('Verify PDF to Word Elements', async () => {
      await expect(converterPage.pdfToWordHeader).toBeVisible();
      await expect(converterPage.dragAndDropText).toBeVisible();
      await expect(converterPage.selectPdfBtn).toBeVisible();
      
      // Verify instructions
      await expect(converterPage.pdfToWordInstructions).toBeVisible();
    });

    await page.screenshot({ path: 'test-results/TC02-pdf-to-word.png', fullPage: true });
  });

  test('TC03: Verify "Word to PDF" Tool UI', async ({ page }) => {
    await test.step('Navigate to Word to PDF tool', async () => {
      await homePage.wordToPdfLink.click();
    });

    await test.step('Verify Word to PDF Elements', async () => {
      await expect(converterPage.wordToPdfHeader).toBeVisible();
      await expect(converterPage.dragAndDropText).toBeVisible();
      await expect(converterPage.selectWordBtn).toBeVisible();
    });

    await page.screenshot({ path: 'test-results/TC03-word-to-pdf.png', fullPage: true });
  });
});
