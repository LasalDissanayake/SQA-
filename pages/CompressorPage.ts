import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CompressorPage extends BasePage {
  readonly uploadInput: Locator;
  readonly compressActionBtn: Locator;
  readonly downloadButton: Locator;

  constructor(page: Page) {
    super(page);
    this.uploadInput = page.locator('input[type="file"]').first();
    // Safely grabbing action buttons avoiding header mismatches implicitly since header has no "Download" or "Action Compress"
    this.compressActionBtn = page.getByRole('button').filter({ hasText: /^Compress$/i }).first();
    this.downloadButton = page.getByRole('button', { name: /download/i }).last();
  }

  async uploadImage(filePath: string) {
    await this.uploadInput.waitFor({ state: 'attached' });
    await this.uploadInput.setInputFiles(filePath);
  }

  async triggerCompression() {
    if (await this.compressActionBtn.isVisible()) {
        await this.compressActionBtn.click();
    }
  }

  async verifySuccessfulCompression() {
    // Typical compressor updates UI to show download or reduction %
    // Many apps auto-compress so we wait for download button up to 25s
    await expect(this.downloadButton).toBeVisible({ timeout: 25000 });
  }

  async testFileDownload() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadButton.click()
    ]);
    return download;
  }
}
