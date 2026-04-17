import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class GifCompressorPage extends BasePage {
  readonly uploadArea: Locator;
  readonly selectFilesButton: Locator;
  readonly fileInput: Locator;
  readonly clearButton: Locator;
  readonly downloadButton: Locator;
  readonly originalSizeText: Locator;
  readonly previewSection: Locator;
  readonly animationPreview: Locator;

  constructor(page: Page) {
    super(page);
    this.uploadArea = page.locator('text=Drag and drop your file here').first();
    this.selectFilesButton = page.getByRole('button', { name: /select files/i });
    this.fileInput = page.locator('input[type="file"]').first();
    this.clearButton = page.getByRole('button', { name: /clear/i });
    this.downloadButton = page.getByRole('button', { name: /download gif/i });
    this.originalSizeText = page.locator('text=/Size|Original/i');
    this.previewSection = page.locator('text=Preview').first();
    this.animationPreview = page.locator('img[src*=".gif"], img[src*="blob"]').first();
  }

  async navigateToGifCompressor() {
    await this.goto('/gif-compressor');
  }

  async uploadGif(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(2000); // GIF processing may take longer
  }

  async verifyUploadSuccess() {
    // After successful upload, the download button should be visible
    await this.downloadButton.waitFor({ state: 'visible', timeout: 15000 });
  }

  async verifyUploadFailure() {
    // Upload area should still show the initial state
    await this.uploadArea.waitFor({ state: 'visible', timeout: 3000 });
  }

  async clickDownload() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadButton.click()
    ]);
    return download;
  }

  async clickClear() {
    await this.clearButton.click();
    await this.page.waitForTimeout(500);
  }

  async verifyPreviewVisible() {
    await this.previewSection.waitFor({ state: 'visible', timeout: 5000 });
  }

  async verifyAnimationPreview() {
    // Check if the animated GIF preview is visible
    await this.animationPreview.waitFor({ state: 'visible', timeout: 5000 });
  }
}
