import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class PdfEditorPage extends BasePage {
  readonly uploadInput: Locator;
  readonly toolbar: Locator;
  readonly downloadButton: Locator;

  constructor(page: Page) {
    super(page);
    // Based on the provided screenshots and standards for this app
    this.uploadInput = page.locator('input[type="file"]').first();
    this.toolbar = page.locator('text=Toolbar').locator('..').first(); // Container with 'Toolbar' text
    this.downloadButton = page.getByRole('button', { name: /download/i }).last();
  }

  async uploadPdf(filePath: string) {
    // Wait for the input to be attached to the DOM
    await this.uploadInput.waitFor({ state: 'attached' });
    await this.uploadInput.setInputFiles(filePath);
  }

  async verifyUploadSuccess() {
    // According to the image, the text "No file chosen" is visible when empty. 
    // It should change to the file name or disappear.
    const noFileText = this.page.locator('text=No file chosen');
    await expect(noFileText).toBeHidden({ timeout: 10000 });
  }

  async verifyUploadFailure() {
    // If invalid file upload, the state remains or validation appears
    const noFileText = this.page.locator('text=No file chosen');
    await expect(noFileText).toBeVisible({ timeout: 5000 });
  }
}
