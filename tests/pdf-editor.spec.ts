import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { PdfEditorPage } from '../pages/PdfEditorPage';

test.describe('PDF Editor Tool Validation Tests', () => {
  let homePage: HomePage;
  let pdfEditorPage: PdfEditorPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    pdfEditorPage = new PdfEditorPage(page);
    await homePage.navigate();
  });

  test('TC01: Verify PDF Editor Navigation and Toolbar Elements', async ({ page }) => {
    await test.step('Navigate to PDF Editor', async () => {
      await homePage.openEditorLink.click();
    });

    await test.step('Verify Headers and File Selectors', async () => {
      await expect(pdfEditorPage.header).toBeVisible();
      await expect(pdfEditorPage.toolbarLabel).toBeVisible();
      await expect(pdfEditorPage.chooseFileBtn).toBeVisible();
      await expect(pdfEditorPage.downloadBtn).toBeVisible();
    });

    await test.step('Verify Editor Styling Tools', async () => {
      await expect(pdfEditorPage.fontDropdown).toBeVisible();
      
      // Verification of alignment and styling tools exist
      await expect(pdfEditorPage.boldStyleBtn).toBeVisible();
      await expect(pdfEditorPage.alignLeftBtn).toBeVisible();
      await expect(pdfEditorPage.alignCenterBtn).toBeVisible();
      await expect(pdfEditorPage.alignRightBtn).toBeVisible();
      
      // Verification of zoom configurations
      await expect(pdfEditorPage.zoomLabel).toBeVisible();
    });

    await page.screenshot({ path: 'test-results/TC01-pdf-editor-toolbar.png', fullPage: true });
  });

  test('TC02: Verify PDF Editor Page Container Elements', async ({ page }) => {
    await test.step('Navigate to PDF Editor', async () => {
      await homePage.openEditorLink.click();
    });

    await test.step('Verify Page Controls', async () => {
      await expect(pdfEditorPage.pageSectionLabel).toBeVisible();
      await expect(pdfEditorPage.prevBtn).toBeVisible();
      await expect(pdfEditorPage.nextBtn).toBeVisible();
    });

    await page.screenshot({ path: 'test-results/TC02-pdf-editor-page-controls.png', fullPage: true });
  });
});
